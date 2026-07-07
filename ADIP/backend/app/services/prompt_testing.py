"""Prompt Testing Framework (Phase E).

Lets developers execute prompts repeatedly through the EXISTING Prompt Execution
Engine, capturing classification, latency, token estimates, artifacts, errors,
confidence and reasoning. Stores prompt history + results (in-process, bounded),
supports version comparison, benchmark runs and benchmark reports.

Reuses PromptExecutionEngine and the LLM token estimator — no duplication.
"""
from __future__ import annotations

import threading
import time
from collections import deque
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.llm.tokens import estimate_tokens
from app.schemas import prompt_testing as dto
from app.schemas.orchestrator import OrchestrationMetadata, OrchestrationRequest
from app.services.orchestrator_service import PromptExecutionEngine

# Shared, process-wide history (bounded). Survives across requests within a run.
_HISTORY: deque[dto.PromptRunResult] = deque(maxlen=1000)
_LOCK = threading.Lock()


class PromptTestingService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.engine = PromptExecutionEngine(db)

    def run(self, request: dto.PromptRunRequest) -> dto.PromptRunResult:
        meta = OrchestrationMetadata(project=request.project) if request.project else None
        started = time.perf_counter()
        error: str | None = None
        try:
            orch = self.engine.execute(OrchestrationRequest(prompt=request.prompt, metadata=meta))
            latency_ms = (time.perf_counter() - started) * 1000
            result = dto.PromptRunResult(
                run_id=orch.run_id,
                prompt=request.prompt,
                label=request.label,
                scenario=orch.classification.scenario,
                project_name=orch.project.name,
                classification_confidence=orch.classification.confidence,
                prompt_tokens=estimate_tokens(request.prompt),
                completion_tokens=sum(
                    estimate_tokens(a.executive_summary) for a in orch.artifacts
                ),
                artifacts_generated=len(orch.artifacts),
                latency_ms=round(latency_ms, 2),
                execution_time=datetime.now(timezone.utc),
                error=None,
                reasoning=orch.copilots["requirement"].reasoning if "requirement" in orch.copilots else [],
            )
        except Exception as exc:  # noqa: BLE001 - capture as a failed run, don't crash the framework
            latency_ms = (time.perf_counter() - started) * 1000
            error = str(exc)
            result = dto.PromptRunResult(
                run_id=f"ERR-{int(time.time())}",
                prompt=request.prompt,
                label=request.label,
                scenario="error",
                project_name="",
                classification_confidence=0,
                prompt_tokens=estimate_tokens(request.prompt),
                completion_tokens=0,
                artifacts_generated=0,
                latency_ms=round(latency_ms, 2),
                execution_time=datetime.now(timezone.utc),
                error=error,
                reasoning=[],
            )
        with _LOCK:
            _HISTORY.append(result)
        return result

    def history(self, limit: int = 50) -> dto.PromptHistory:
        with _LOCK:
            items = list(_HISTORY)[-limit:][::-1]
        return dto.PromptHistory(total=len(_HISTORY), results=items)

    def get_run(self, run_id: str) -> dto.PromptRunResult:
        with _LOCK:
            for r in _HISTORY:
                if r.run_id == run_id:
                    return r
        raise NotFoundError(f"Prompt run {run_id} not found.")

    def compare(self, run_id_a: str, run_id_b: str) -> dto.PromptComparison:
        a = self.get_run(run_id_a)
        b = self.get_run(run_id_b)
        return dto.PromptComparison(
            run_a=a,
            run_b=b,
            latency_delta_ms=round(b.latency_ms - a.latency_ms, 2),
            confidence_delta=b.classification_confidence - a.classification_confidence,
            artifacts_delta=b.artifacts_generated - a.artifacts_generated,
        )

    def benchmark(self, request: dto.BenchmarkRequest) -> dto.BenchmarkReport:
        results: list[dto.PromptRunResult] = []
        for _ in range(request.iterations):
            for prompt in request.prompts:
                results.append(self.run(dto.PromptRunRequest(prompt=prompt)))
        latencies = sorted(r.latency_ms for r in results)
        errors = sum(1 for r in results if r.error)
        avg_latency = sum(latencies) / len(latencies) if latencies else 0.0
        p95 = latencies[min(len(latencies) - 1, int(len(latencies) * 0.95))] if latencies else 0.0
        avg_conf = sum(r.classification_confidence for r in results) / len(results) if results else 0.0
        return dto.BenchmarkReport(
            total_runs=len(results),
            prompts_tested=len(request.prompts),
            iterations=request.iterations,
            avg_latency_ms=round(avg_latency, 2),
            p95_latency_ms=round(p95, 2),
            avg_confidence=round(avg_conf, 1),
            total_artifacts=sum(r.artifacts_generated for r in results),
            errors=errors,
            results=results,
        )

    def statistics(self) -> dto.PromptStatistics:
        with _LOCK:
            items = list(_HISTORY)
        scenarios: dict[str, int] = {}
        for r in items:
            scenarios[r.scenario] = scenarios.get(r.scenario, 0) + 1
        n = len(items)
        return dto.PromptStatistics(
            total_runs=n,
            unique_prompts=len({r.prompt for r in items}),
            avg_latency_ms=round(sum(r.latency_ms for r in items) / n, 2) if n else 0.0,
            avg_confidence=round(sum(r.classification_confidence for r in items) / n, 1) if n else 0.0,
            total_artifacts=sum(r.artifacts_generated for r in items),
            errors=sum(1 for r in items if r.error),
            scenarios=scenarios,
        )
