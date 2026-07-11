"""Enterprise Capacity Planner — orchestrates estimators, infra sizing, load tests."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy.orm import Session

from app.perf.capacity.estimators import (
    estimate_costs,
    estimate_database_growth,
    estimate_gpu,
    estimate_network,
    estimate_object_storage,
    estimate_redis,
    estimate_vector_db,
    forecast_growth,
    inputs_from_profile,
)
from app.perf.capacity.benchmark_history import benchmark_history
from app.perf.capacity.calibration import calibrate
from app.perf.capacity.cost_optimizer import optimize_costs
from app.perf.capacity.enterprise_exports import write_enterprise_reports
from app.perf.capacity.enterprise_planners import (
    estimate_ai_workloads,
    estimate_connector_scaling,
    estimate_disaster_recovery,
    estimate_ha,
    estimate_kubernetes_platform,
    estimate_multi_region,
    estimate_persona_models,
    estimate_rag_benchmark,
)
from app.perf.capacity.recommendations import generate_recommendations
from app.perf.capacity.scenario_comparison import compare_scenarios
from app.perf.capacity.load_generator import run_load_suite, run_load_test
from app.perf.capacity.metrics_store import capacity_metrics
from app.perf.capacity.report_generator import write_all_reports
from app.perf.capacity.resource_profiler import profiler
from app.perf.infra_sizing_benchmark import InfraSizingBenchmarkService
from app.schemas.capacity_planning import (
    ArchitectRecommendationReport,
    CalibrationInput,
    CapacityPlanningInputs,
    CapacityPlanningReport,
    EnterpriseCapacityReport,
    EnterpriseExtensions,
    EnterprisePlanRequest,
    Environment,
    ScenarioCompareRequest,
    SizingProfile,
)

_REPO_ROOT = Path(__file__).resolve().parents[4]


class EnterpriseCapacityPlanner:
    """Full enterprise capacity planning suite."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self._infra = InfraSizingBenchmarkService(db)

    def plan(
        self,
        *,
        profile: SizingProfile = "medium",
        environment: Environment = "production",
        inputs: CapacityPlanningInputs | None = None,
        write_reports: bool = True,
        out_dir: Path | None = None,
    ) -> CapacityPlanningReport:
        inp = inputs or inputs_from_profile(profile)
        inp.profile = profile
        inp.environment = environment

        obj = estimate_object_storage(inp)
        db_growth = estimate_database_growth(inp)
        vec = estimate_vector_db(inp)
        network = estimate_network(inp)
        redis = estimate_redis(inp)

        infra_scenarios = None
        avg_latency = 150.0
        resource_profile = None
        load_tests = []

        if inp.run_infra_scenarios:
            infra_report = self._infra.run(profile=profile)
            infra_scenarios = {
                "totals": infra_report.totals,
                "scenarios": [s.model_dump() for s in infra_report.scenarios],
            }
            avg_latency = infra_report.totals.get("duration_ms_avg", 150.0)
            gke = infra_report.gke.model_dump()
            gke_nodes = infra_report.gke.node_count_est
        else:
            gke_report = self._infra.estimate_gke(profile, [])
            gke = gke_report.model_dump()
            gke_nodes = gke_report.node_count_est

        gpu = estimate_gpu(inp, avg_latency_ms=avg_latency)
        costs = estimate_costs(inp, obj, db_growth, vec, network, redis, gke_nodes, environment)
        growth = forecast_growth(inp, obj, db_growth)

        if inp.run_load_test:
            load_tests = run_load_suite(inp.load_concurrency)
            profile_result, _ = profiler.profile(
                lambda: run_load_test("prompt_execution", inp.load_concurrency, samples=5)
            )
            resource_profile = profile_result

        report = CapacityPlanningReport(
            profile=profile,
            environment=environment,
            generated_at=datetime.now(timezone.utc).isoformat(),
            inputs=inp,
            object_storage=obj,
            database_growth=db_growth,
            vector_db=vec,
            network=network,
            gpu=gpu,
            redis=redis,
            costs=costs,
            growth_forecast=growth,
            gke=gke,
            infra_scenarios=infra_scenarios,
            load_tests=load_tests,
            resource_profile=resource_profile,
        )

        if write_reports:
            paths = write_all_reports(report, out_dir or (_REPO_ROOT / "docs" / "examples" / "performance"))
            report.reports = {k: str(v) for k, v in paths.items()}

        vec_gb = vec[0].storage_bytes_year / (1024 ** 3) if vec else 0.0
        rps = load_tests[0].rps if load_tests else 0.0
        capacity_metrics.record_plan(
            object_storage_gb_year=obj.storage_per_year_bytes / 1e9,
            database_gb_year=db_growth.cloud_sql_gb_year,
            monthly_cost_usd=costs.monthly_total_usd,
            gke_nodes=gke_nodes,
            redis_mb=redis.total_mb,
            network_egress_gb_month=network.total_egress_gb_month,
            vector_storage_gb=vec_gb,
            prompt_throughput_rps=rps,
        )

        return report

    def estimate_section(self, section: str, inp: CapacityPlanningInputs) -> dict[str, Any]:
        """Run a single estimator section (for granular API)."""
        def _gpu() -> dict[str, Any]:
            g = estimate_gpu(inp)
            return g.model_dump() if g else {}

        mapping = {
            "object_storage": lambda: estimate_object_storage(inp).model_dump(),
            "database_growth": lambda: estimate_database_growth(inp).model_dump(),
            "vector_db": lambda: [v.model_dump() for v in estimate_vector_db(inp)],
            "network": lambda: estimate_network(inp).model_dump(),
            "gpu": _gpu,
            "redis": lambda: estimate_redis(inp).model_dump(),
            "growth_forecast": lambda: [g.model_dump() for g in forecast_growth(
                inp, estimate_object_storage(inp), estimate_database_growth(inp)
            )],
        }
        fn = mapping.get(section)
        if not fn:
            raise ValueError(f"Unknown section: {section}")
        return fn()

    def plan_enterprise(
        self,
        req: EnterprisePlanRequest,
        *,
        write_reports: bool = True,
        out_dir: Path | None = None,
    ) -> EnterpriseCapacityReport:
        """Full enterprise capacity plan with K8s, HA, DR, connectors, AI, RAG, personas."""
        base = self.plan(
            profile=req.profile,
            environment=req.environment,
            inputs=req.inputs,
            write_reports=write_reports,
            out_dir=out_dir,
        )
        inp = base.inputs
        avg_lat = 150.0
        if base.infra_scenarios:
            avg_lat = base.infra_scenarios.get("totals", {}).get("duration_ms_avg", 150.0)

        k8s = estimate_kubernetes_platform(inp, base.gke)
        multi = estimate_multi_region(inp, req.region_topology, base)
        ha = estimate_ha(inp, req.ha_target, base.gke)
        dr = estimate_disaster_recovery(inp, req.region_topology, base.database_growth.cloud_sql_gb_year)
        connectors = estimate_connector_scaling(inp)
        ai = estimate_ai_workloads(inp, avg_lat)
        rag = estimate_rag_benchmark(inp)
        personas = estimate_persona_models(inp)
        cost_opt = optimize_costs(inp, base)
        scenario_cmp = None
        if req.run_scenario_comparison:
            scenario_cmp = compare_scenarios(
                self.db,
                ScenarioCompareRequest(profiles=[req.profile, "large"] if req.profile != "large" else ["medium", "large"]),
            )
        benchmark_history.record(base)
        history = benchmark_history.report()
        calibration = None
        if req.run_calibration and req.calibration:
            calibration = calibrate(base, req.calibration)
        elif req.run_calibration:
            calibration = calibrate(base, CalibrationInput(source="mock"))

        enterprise = EnterpriseExtensions(
            kubernetes_platform=k8s,
            multi_region=multi,
            high_availability=ha,
            disaster_recovery=dr,
            connector_scaling=connectors,
            ai_workloads=ai,
            rag_benchmark=rag,
            persona_models=personas,
            cost_optimization=cost_opt,
            scenario_comparison=scenario_cmp,
            benchmark_history=history,
            calibration=calibration,
            architect_recommendations=ArchitectRecommendationReport(
                recommendations=[], best_gke_profile=req.profile,
                best_storage_tier="standard", best_ha_topology=req.ha_target,
                best_dr_topology=req.region_topology, overall_status="pending",
            ),
        )
        enterprise.architect_recommendations = generate_recommendations(inp, base, enterprise)

        result = EnterpriseCapacityReport(plan=base, enterprise=enterprise)
        if write_reports:
            ext_paths = write_enterprise_reports(
                result, out_dir or (_REPO_ROOT / "docs" / "examples" / "performance")
            )
            result.extended_reports = {k: str(v) for k, v in ext_paths.items()}
        return result
