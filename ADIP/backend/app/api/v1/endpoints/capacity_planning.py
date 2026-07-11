"""Enterprise Capacity Planning API."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.perf.capacity.benchmark_history import benchmark_history
from app.perf.capacity.calibration import calibrate
from app.perf.capacity.excel_planner import generate_excel
from app.perf.capacity.load_generator import CONCURRENCY_LEVELS, SCENARIOS, run_load_suite, run_load_test
from app.perf.capacity.planner_engine import EnterpriseCapacityPlanner
from app.perf.capacity.scenario_comparison import compare_scenarios
from app.perf.infra_sizing_benchmark import PROFILE_ASSUMPTIONS
from app.schemas.capacity_planning import (
    BenchmarkHistoryReport,
    CalibrationReport,
    CalibrationRequest,
    CapacityPlanRequest,
    CapacityPlanningReport,
    EnterpriseCapacityReport,
    EnterprisePlanRequest,
    LoadTestRequest,
    LoadTestResult,
    CapacityPlanningInputs,
    ScenarioCompareRequest,
    ScenarioComparisonReport,
)

router = APIRouter(prefix="/benchmarks/capacity-planning", tags=["Capacity Planning"])


def _planner(db: Session = Depends(get_db)) -> EnterpriseCapacityPlanner:
    return EnterpriseCapacityPlanner(db)


@router.get("")
def capacity_planning_info():
    return {
        "profiles": list(PROFILE_ASSUMPTIONS.keys()),
        "sections": [
            "object_storage", "database_growth", "vector_db", "network",
            "gpu", "redis", "growth_forecast",
        ],
        "enterprise_sections": [
            "kubernetes_platform", "multi_region", "high_availability",
            "disaster_recovery", "connector_scaling", "ai_workloads",
            "rag_benchmark", "persona_models", "cost_optimization",
        ],
        "load_scenarios": list(SCENARIOS.keys()),
        "concurrency_levels": CONCURRENCY_LEVELS,
        "endpoints": {
            "plan": "POST /api/v1/benchmarks/capacity-planning/plan",
            "plan_enterprise": "POST /api/v1/benchmarks/capacity-planning/plan/enterprise",
            "section": "GET /api/v1/benchmarks/capacity-planning/sections/{section}",
            "compare": "POST /api/v1/benchmarks/capacity-planning/compare",
            "calibrate": "POST /api/v1/benchmarks/capacity-planning/calibrate",
            "history": "GET /api/v1/benchmarks/capacity-planning/history",
            "load_test": "POST /api/v1/benchmarks/capacity-planning/load-test",
            "excel": "POST /api/v1/benchmarks/capacity-planning/excel",
        },
    }


@router.post("/plan", response_model=CapacityPlanningReport)
def run_capacity_plan(body: CapacityPlanRequest, planner: EnterpriseCapacityPlanner = Depends(_planner)):
    return planner.plan(
        profile=body.profile,
        environment=body.environment,
        inputs=body.inputs,
        write_reports=True,
    )


@router.post("/plan/enterprise", response_model=EnterpriseCapacityReport)
def run_enterprise_plan(body: EnterprisePlanRequest, planner: EnterpriseCapacityPlanner = Depends(_planner)):
    return planner.plan_enterprise(body, write_reports=True)


@router.post("/compare", response_model=ScenarioComparisonReport)
def compare_capacity_scenarios(body: ScenarioCompareRequest, db: Session = Depends(get_db)):
    return compare_scenarios(db, body)


@router.post("/calibrate", response_model=CalibrationReport)
def run_calibration(body: CalibrationRequest, planner: EnterpriseCapacityPlanner = Depends(_planner)):
    base = planner.plan(
        profile=body.profile,
        inputs=CapacityPlanningInputs(run_infra_scenarios=False),
        write_reports=False,
    )
    return calibrate(base, body.calibration)


@router.get("/history", response_model=BenchmarkHistoryReport)
def get_benchmark_history():
    return benchmark_history.report()


@router.get("/sections/{section}")
def estimate_section(section: str, profile: str = "medium", planner: EnterpriseCapacityPlanner = Depends(_planner)):
    from app.perf.capacity.estimators import inputs_from_profile
    inp = inputs_from_profile(profile)  # type: ignore[arg-type]
    try:
        return planner.estimate_section(section, inp)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/load-test", response_model=list[LoadTestResult])
def run_load_test_api(body: LoadTestRequest):
    scenarios = body.scenarios or ["prompt_execution"]
    return [run_load_test(s, body.concurrency) for s in scenarios]


@router.post("/load-test/suite", response_model=list[LoadTestResult])
def run_load_suite_api(concurrency: int = 10):
    return run_load_suite(concurrency)


@router.post("/excel")
def generate_excel_api(body: CapacityPlanRequest, planner: EnterpriseCapacityPlanner = Depends(_planner)):
    report = planner.plan(profile=body.profile, environment=body.environment, inputs=body.inputs, write_reports=False)
    path = generate_excel(report)
    if not path:
        return {"status": "skipped", "reason": "openpyxl not installed"}
    return {"status": "ok", "path": str(path)}
