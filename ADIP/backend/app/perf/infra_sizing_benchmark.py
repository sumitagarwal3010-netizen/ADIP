"""Infrastructure sizing benchmark — extends token/perf benchmark framework for GKE/GCP.

Reuses:
- app.llm.tokens.estimate_tokens
- app.services.benchmark_service.BenchmarkService (prompt execution metrics)
- app.perf.harness patterns (TestClient, timing)
- connector artifact, rule engine, regression services

Does NOT replace existing benchmark code.
"""
from __future__ import annotations

import json
import resource
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

from sqlalchemy.orm import Session

from app.llm.tokens import estimate_tokens
from app.schemas.infra_sizing import (
    GkePodSizing,
    GkeSizingEstimate,
    InfraSizingReport,
    ScenarioMetrics,
    SizingProfile,
)
from app.schemas.rules import RuleRunRequest
from app.services.benchmark_service import BenchmarkService
from app.services.rule_engine import rule_engine

_REPO_ROOT = Path(__file__).resolve().parents[3]

# Profile assumptions for capacity planning (prompts/day, users, retention).
PROFILE_ASSUMPTIONS: dict[SizingProfile, dict[str, Any]] = {
    "small": {
        "daily_active_users": 25,
        "prompts_per_user_per_day": 8,
        "connector_syncs_per_day": 24,
        "retention_days": 30,
        "local_llm": False,
        "backend_replicas": 2,
        "frontend_replicas": 2,
    },
    "medium": {
        "daily_active_users": 100,
        "prompts_per_user_per_day": 12,
        "connector_syncs_per_day": 96,
        "retention_days": 90,
        "local_llm": False,
        "backend_replicas": 3,
        "frontend_replicas": 2,
    },
    "large": {
        "daily_active_users": 500,
        "prompts_per_user_per_day": 15,
        "connector_syncs_per_day": 500,
        "retention_days": 180,
        "local_llm": True,
        "backend_replicas": 5,
        "frontend_replicas": 3,
    },
    "enterprise": {
        "daily_active_users": 2000,
        "prompts_per_user_per_day": 20,
        "connector_syncs_per_day": 2000,
        "retention_days": 365,
        "local_llm": True,
        "backend_replicas": 10,
        "frontend_replicas": 4,
    },
}

# Storage heuristics (bytes per unit).
_BYTES_PER_TOKEN_LOG = 0.5
_BYTES_PER_DB_ROW = 2048
_BYTES_PER_EMBEDDING_DIM = 4  # float32
_EMBEDDING_DIMS = 384
_BYTES_PER_ARTIFACT_GCS = 48_000


def _peak_memory_mb() -> float:
    """Best-effort peak RSS; platform-dependent units normalized to MB."""
    try:
        usage = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        # Linux: KB; macOS: bytes
        if sys.platform == "darwin":
            return round(usage / (1024 * 1024), 2)
        return round(usage / 1024, 2)
    except Exception:  # noqa: BLE001
        return 0.0


def _estimate_cpu_millicores(duration_ms: float, total_tokens: int) -> int:
    """Heuristic CPU from duration and token volume (mock-safe)."""
    base = 100
    duration_factor = min(800, int(duration_ms / 5))
    token_factor = min(400, total_tokens // 50)
    return base + duration_factor + token_factor


def _storage_estimates(
    *,
    total_tokens: int,
    artifact_bytes: int,
    db_rows: int,
) -> dict[str, int]:
    log_b = int(total_tokens * _BYTES_PER_TOKEN_LOG) + 512
    db_b = db_rows * _BYTES_PER_DB_ROW
    vec_b = db_rows * _EMBEDDING_DIMS * _BYTES_PER_EMBEDDING_DIM
    obj_b = max(artifact_bytes, _BYTES_PER_ARTIFACT_GCS // 10)
    return {
        "log_storage_bytes_est": log_b,
        "db_rows_est": db_rows,
        "vector_embedding_bytes_est": vec_b,
        "object_storage_bytes_est": obj_b,
    }


class InfraSizingBenchmarkService:
    """Run mock infra sizing scenarios and produce GKE/GCP estimates."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self._client = None

    def _get_client(self):
        if self._client is None:
            from fastapi.testclient import TestClient
            from app.main import app
            self._client = TestClient(app)
        return self._client

    def _run_timed(self, scenario: str, fn: Callable[[], tuple[str, str]], *, db_rows: int = 1) -> ScenarioMetrics:
        t0 = time.perf_counter()
        mem_before = _peak_memory_mb()
        ok = True
        detail = ""
        try:
            req_text, resp_text = fn()
        except Exception as exc:  # noqa: BLE001
            ok = False
            req_text, resp_text, detail = "", "", str(exc)
        duration_ms = (time.perf_counter() - t0) * 1000
        mem_after = _peak_memory_mb()
        inp = estimate_tokens(req_text)
        out = estimate_tokens(resp_text)
        total = inp + out
        storage = _storage_estimates(
            total_tokens=total,
            artifact_bytes=len(resp_text.encode("utf-8")),
            db_rows=db_rows,
        )
        return ScenarioMetrics(
            scenario=scenario,
            input_tokens=inp,
            output_tokens=out,
            total_tokens=total,
            latency_ms=round(duration_ms, 2),
            duration_ms=round(duration_ms, 2),
            peak_memory_mb=max(mem_before, mem_after),
            cpu_millicores_est=_estimate_cpu_millicores(duration_ms, total),
            artifact_output_bytes=len(resp_text.encode("utf-8")),
            mock_mode=True,
            ok=ok,
            detail=detail,
            **storage,
        )

    def _scenario_runners(self) -> dict[str, Callable[[], tuple[str, str]]]:
        client = self._get_client()
        sample_prompt = (
            "Generate a Business Requirements Document for UPI Auto-Reversal with "
            "NPCI compliance, audit trail, and idempotent settlement handling."
        )

        def prompt_execution() -> tuple[str, str]:
            bench = BenchmarkService(self.db)
            entry = bench._evaluate("V1", sample_prompt, "ADIP")  # noqa: SLF001
            resp = json.dumps(entry.model_dump())
            return sample_prompt, resp

        def artifact_generation() -> tuple[str, str]:
            r = client.get("/api/v1/artifact-generation/projects/1/generate", params={"artifact_type": "BRD"})
            return "artifact_type=BRD", r.text

        def connector_artifact() -> tuple[str, str]:
            from app.services.connector_artifact_service import ConnectorArtifactService
            art = ConnectorArtifactService(self.db).generate(
                artifact_type="release_readiness_report",
                connector_types=["jira", "sonarqube"],
            )
            return sample_prompt, json.dumps({
                "title": art["title"],
                "body": art["body"][:2000],
                "quality_score": art["quality_score"],
            })

        def prompt_regression() -> tuple[str, str]:
            r = client.post("/api/v1/prompt-regression/run-golden?limit=3")
            return sample_prompt, r.text

        def llm_smoke() -> tuple[str, str]:
            r = client.post("/api/v1/llm/smoke-test")
            return "smoke-test", r.text

        def rule_engine_run() -> tuple[str, str]:
            report = rule_engine.run(RuleRunRequest(
                artifact_type="BRD",
                artifact_content="# BRD\n## REQ-101\nArchitecture payments-service.",
            ))
            return sample_prompt, json.dumps(report.model_dump())

        def traceability_matrix() -> tuple[str, str]:
            r = client.get("/api/v1/traceability/projects/1/matrix")
            return "traceability matrix", r.text

        return {
            "prompt_execution": prompt_execution,
            "artifact_generation": artifact_generation,
            "connector_artifact_generation": connector_artifact,
            "prompt_regression": prompt_regression,
            "llm_smoke_test": llm_smoke,
            "rule_engine_execution": rule_engine_run,
            "traceability_matrix_generation": traceability_matrix,
        }

    DEFAULT_SCENARIOS = [
        "prompt_execution",
        "artifact_generation",
        "connector_artifact_generation",
        "prompt_regression",
        "llm_smoke_test",
        "rule_engine_execution",
        "traceability_matrix_generation",
    ]

    def run_scenarios(self, scenarios: list[str] | None = None) -> list[ScenarioMetrics]:
        runners = self._scenario_runners()
        names = scenarios or self.DEFAULT_SCENARIOS
        results = []
        for name in names:
            if name not in runners:
                results.append(ScenarioMetrics(scenario=name, ok=False, detail=f"Unknown scenario: {name}"))
                continue
            db_rows = 5 if "connector" in name else 2
            results.append(self._run_timed(name, runners[name], db_rows=db_rows))
        return results

    def estimate_gke(self, profile: SizingProfile, scenarios: list[ScenarioMetrics]) -> GkeSizingEstimate:
        assumptions_cfg = PROFILE_ASSUMPTIONS[profile]
        totals = self._aggregate(scenarios)

        avg_mem = max(128, totals.get("peak_memory_mb_max", 128))
        avg_cpu = max(250, totals.get("cpu_millicores_avg", 250))
        daily_prompts = assumptions_cfg["daily_active_users"] * assumptions_cfg["prompts_per_user_per_day"]

        backend_mem_mi = max(256, int(avg_mem * 1.5 + totals.get("total_tokens", 0) / 200))
        backend_cpu_m = min(2000, max(250, avg_cpu))
        be_replicas = assumptions_cfg["backend_replicas"]

        fe_replicas = assumptions_cfg["frontend_replicas"]
        worker = None
        if assumptions_cfg["connector_syncs_per_day"] > 0:
            worker = GkePodSizing(
                component="connector-worker",
                replicas=1 if profile == "small" else 2,
                cpu_request="250m",
                cpu_limit="1000m",
                memory_request="512Mi",
                memory_limit="1Gi",
                notes="Background connector sync scheduler",
            )

        llm_pod = None
        if assumptions_cfg["local_llm"]:
            llm_mem = "8Gi" if profile == "large" else "16Gi"
            llm_cpu = "2" if profile == "large" else "4"
            llm_pod = GkePodSizing(
                component="llm-ollama",
                replicas=1,
                cpu_request=llm_cpu,
                cpu_limit=llm_cpu,
                memory_request=llm_mem,
                memory_limit=llm_mem,
                notes="Local LLM (Ollama) — GPU node pool recommended",
            )

        # Node pool estimate (70% utilization target)
        def _mi(s: str) -> float:
            if s.endswith("Gi"):
                return float(s[:-2]) * 1024
            if s.endswith("Mi"):
                return float(s[:-2])
            return float(s)

        total_mem_mi = _mi(f"{backend_mem_mi}Mi") * be_replicas + _mi("128Mi") * fe_replicas
        total_cpu = backend_cpu_m * be_replicas / 1000 + 0.25 * fe_replicas
        if worker:
            total_mem_mi += _mi(worker.memory_limit) * worker.replicas
            total_cpu += 0.5 * worker.replicas
        if llm_pod:
            total_mem_mi += _mi(llm_pod.memory_limit) * llm_pod.replicas
            total_cpu += float(llm_pod.cpu_limit) * llm_pod.replicas

        node_mem_gi = round(total_mem_mi / 1024 / 0.7, 1)
        node_vcpu = round(total_cpu / 0.7, 1)
        node_count = max(2, int(node_vcpu // 4) + (1 if node_mem_gi > 16 else 0))

        retention = assumptions_cfg["retention_days"]
        daily_db_bytes = totals.get("db_rows_est", 10) * _BYTES_PER_DB_ROW * daily_prompts / max(len(scenarios), 1)
        daily_gcs_bytes = totals.get("object_storage_bytes_est", 50000) * daily_prompts / max(len(scenarios), 1)
        cloud_sql_gb = round(daily_db_bytes * retention / (1024 ** 3), 2)
        gcs_gb = round(daily_gcs_bytes * retention / (1024 ** 3), 2)
        monthly_growth = round((daily_db_bytes + daily_gcs_bytes) * 30 / (1024 ** 3), 2)

        assumptions = [
            f"Profile {profile}: {assumptions_cfg['daily_active_users']} DAU, {daily_prompts} prompts/day",
            f"Retention {retention} days; token estimate ~4 chars/token",
            "CPU/memory from mock scenario peaks + 50% headroom",
            "Node pool at 70% target utilization",
            "Cloud SQL and GCS sized from daily write heuristics",
        ]

        return GkeSizingEstimate(
            profile=profile,
            backend=GkePodSizing(
                component="adip-backend",
                replicas=be_replicas,
                cpu_request=f"{min(backend_cpu_m, 500)}m",
                cpu_limit=f"{backend_cpu_m}m",
                memory_request=f"{max(256, backend_mem_mi // 2)}Mi",
                memory_limit=f"{backend_mem_mi}Mi",
            ),
            frontend=GkePodSizing(
                component="adip-frontend",
                replicas=fe_replicas,
                cpu_request="50m",
                cpu_limit="250m",
                memory_request="64Mi",
                memory_limit="128Mi",
            ),
            worker=worker,
            llm=llm_pod,
            node_pool_vcpu=node_vcpu,
            node_pool_memory_gi=node_mem_gi,
            node_count_est=node_count,
            cloud_sql_storage_gb=cloud_sql_gb,
            gcs_storage_gb=gcs_gb,
            monthly_storage_growth_gb=monthly_growth,
            assumptions=assumptions,
        )

    def _aggregate(self, scenarios: list[ScenarioMetrics]) -> dict[str, Any]:
        if not scenarios:
            return {}
        return {
            "total_tokens": sum(s.total_tokens for s in scenarios),
            "input_tokens": sum(s.input_tokens for s in scenarios),
            "output_tokens": sum(s.output_tokens for s in scenarios),
            "duration_ms_avg": round(sum(s.duration_ms for s in scenarios) / len(scenarios), 2),
            "peak_memory_mb_max": max(s.peak_memory_mb for s in scenarios),
            "cpu_millicores_avg": int(sum(s.cpu_millicores_est for s in scenarios) / len(scenarios)),
            "artifact_output_bytes": sum(s.artifact_output_bytes for s in scenarios),
            "db_rows_est": sum(s.db_rows_est for s in scenarios),
            "vector_embedding_bytes_est": sum(s.vector_embedding_bytes_est for s in scenarios),
            "object_storage_bytes_est": sum(s.object_storage_bytes_est for s in scenarios),
            "log_storage_bytes_est": sum(s.log_storage_bytes_est for s in scenarios),
            "scenarios_ok": sum(1 for s in scenarios if s.ok),
            "scenarios_total": len(scenarios),
        }

    def run(self, profile: SizingProfile = "medium", scenarios: list[str] | None = None) -> InfraSizingReport:
        scenario_results = self.run_scenarios(scenarios)
        totals = self._aggregate(scenario_results)
        gke = self.estimate_gke(profile, scenario_results)
        md = self._to_markdown(profile, scenario_results, totals, gke)
        return InfraSizingReport(
            profile=profile,
            generated_at=datetime.now(timezone.utc).isoformat(),
            mock_mode=True,
            scenarios=scenario_results,
            totals=totals,
            gke=gke,
            markdown_summary=md,
        )

    def _to_markdown(
        self,
        profile: SizingProfile,
        scenarios: list[ScenarioMetrics],
        totals: dict[str, Any],
        gke: GkeSizingEstimate,
    ) -> str:
        lines = [
            f"# ADIP Infra Sizing Benchmark — {profile}",
            "",
            f"_Generated: {datetime.now(timezone.utc).isoformat()}_",
            "",
            "## Scenario metrics",
            "",
            "| Scenario | In tok | Out tok | Latency ms | Peak MB | CPU m | DB rows | GCS est |",
            "|---|--:|--:|--:|--:|--:|--:|--:|",
        ]
        for s in scenarios:
            lines.append(
                f"| {s.scenario} | {s.input_tokens} | {s.output_tokens} | {s.latency_ms} | "
                f"{s.peak_memory_mb} | {s.cpu_millicores_est} | {s.db_rows_est} | {s.object_storage_bytes_est} |"
            )
        lines += [
            "",
            "## Totals",
            "",
            f"- Total tokens: **{totals.get('total_tokens', 0)}**",
            f"- Avg duration: **{totals.get('duration_ms_avg', 0)} ms**",
            f"- Peak memory (max): **{totals.get('peak_memory_mb_max', 0)} MB**",
            "",
            "## GKE sizing",
            "",
            f"| Component | Replicas | CPU req/limit | Memory req/limit |",
            f"|---|---|---|---|",
            f"| Backend | {gke.backend.replicas} | {gke.backend.cpu_request}/{gke.backend.cpu_limit} | "
            f"{gke.backend.memory_request}/{gke.backend.memory_limit} |",
            f"| Frontend | {gke.frontend.replicas} | {gke.frontend.cpu_request}/{gke.frontend.cpu_limit} | "
            f"{gke.frontend.memory_request}/{gke.frontend.memory_limit} |",
        ]
        if gke.worker:
            lines.append(
                f"| Worker | {gke.worker.replicas} | {gke.worker.cpu_request}/{gke.worker.cpu_limit} | "
                f"{gke.worker.memory_request}/{gke.worker.memory_limit} |"
            )
        if gke.llm:
            lines.append(
                f"| LLM | {gke.llm.replicas} | {gke.llm.cpu_request}/{gke.llm.cpu_limit} | "
                f"{gke.llm.memory_request}/{gke.llm.memory_limit} |"
            )
        lines += [
            "",
            f"- **Node pool:** ~{gke.node_pool_vcpu} vCPU, ~{gke.node_pool_memory_gi} Gi RAM, **{gke.node_count_est} nodes** (est.)",
            f"- **Cloud SQL:** ~{gke.cloud_sql_storage_gb} GB",
            f"- **GCS:** ~{gke.gcs_storage_gb} GB",
            f"- **Monthly storage growth:** ~{gke.monthly_storage_growth_gb} GB",
            "",
            "## Assumptions",
            "",
        ]
        for a in gke.assumptions:
            lines.append(f"- {a}")
        lines.append("")
        return "\n".join(lines)

    def write_reports(self, report: InfraSizingReport, out_dir: Path | None = None) -> tuple[Path, Path]:
        out = out_dir or (_REPO_ROOT / "docs" / "examples" / "performance")
        out.mkdir(parents=True, exist_ok=True)
        json_path = out / f"infra_sizing_{report.profile}.json"
        md_path = out / f"infra_sizing_{report.profile}.md"
        json_path.write_text(report.model_dump_json(indent=2), encoding="utf-8")
        md_path.write_text(report.markdown_summary, encoding="utf-8")
        return json_path, md_path
