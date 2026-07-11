"""Enterprise capacity extension tests."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.perf.capacity.benchmark_history import benchmark_history
from app.perf.capacity.calibration import calibrate
from app.perf.capacity.cost_optimizer import optimize_costs
from app.perf.capacity.enterprise_planners import (
    estimate_connector_scaling,
    estimate_ha,
    estimate_kubernetes_platform,
    estimate_rag_benchmark,
)
from app.perf.capacity.estimators import inputs_from_profile
from app.perf.capacity.planner_engine import EnterpriseCapacityPlanner
from app.perf.capacity.scenario_comparison import compare_scenarios
from app.schemas.capacity_planning import (
    CalibrationInput,
    CapacityPlanningInputs,
    EnterprisePlanRequest,
    ScenarioCompareRequest,
)

client = TestClient(app)


def test_kubernetes_platform_plan():
    inp = inputs_from_profile("medium")
    k8s = estimate_kubernetes_platform(inp, {"backend": {"replicas": 3}, "frontend": {"replicas": 2}})
    assert k8s.total_resources > 0
    assert k8s.hpa_count >= 1
    assert len(k8s.namespaces) >= 3


def test_ha_plan_99_9():
    ha = estimate_ha(inputs_from_profile("large"), "99.9", {"backend": {"replicas": 3}})
    assert ha.availability_pct == 99.9
    assert ha.backend_replicas >= 3


def test_connector_scaling_12_connectors():
    conns = estimate_connector_scaling(inputs_from_profile("medium"))
    assert len(conns) == 12
    assert all(c.parallel_workers >= 1 for c in conns)


def test_rag_benchmark():
    rag = estimate_rag_benchmark(CapacityPlanningInputs(documents_per_day=50, embedding_enabled=True))
    assert rag.chunk_count > 0
    assert rag.top_k == 5


def test_cost_optimizer():
    from app.db.session import SessionLocal
    with SessionLocal() as db:
        report = EnterpriseCapacityPlanner(db).plan(
            profile="small", write_reports=False,
            inputs=CapacityPlanningInputs(run_infra_scenarios=False),
        )
    opt = optimize_costs(report.inputs, report)
    assert opt.total_monthly_savings_usd > 0
    assert len(opt.items) >= 5


def test_scenario_comparison():
    from app.db.session import SessionLocal
    with SessionLocal() as db:
        cmp = compare_scenarios(db, ScenarioCompareRequest(profiles=["small", "medium"]))
    assert len(cmp.rows) >= 2
    assert cmp.recommendation


def test_calibration_mock():
    from app.db.session import SessionLocal
    with SessionLocal() as db:
        base = EnterpriseCapacityPlanner(db).plan(
            profile="small", write_reports=False,
            inputs=CapacityPlanningInputs(run_infra_scenarios=False),
        )
    cal = calibrate(base, CalibrationInput(source="mock"))
    assert cal.mock_mode
    assert "cpu_millicores" in cal.accuracy_pct


def test_benchmark_history():
    from app.db.session import SessionLocal
    with SessionLocal() as db:
        planner = EnterpriseCapacityPlanner(db)
        planner.plan_enterprise(EnterprisePlanRequest(
            profile="small", run_scenario_comparison=False, run_calibration=False,
            inputs=CapacityPlanningInputs(run_infra_scenarios=False),
        ), write_reports=False)
        planner.plan_enterprise(EnterprisePlanRequest(
            profile="medium", run_scenario_comparison=False, run_calibration=False,
            inputs=CapacityPlanningInputs(run_infra_scenarios=False),
        ), write_reports=False)
    hist = benchmark_history.report()
    assert len(hist.entries) >= 2


def test_enterprise_plan_api():
    r = client.post("/api/v1/benchmarks/capacity-planning/plan/enterprise", json={
        "profile": "small",
        "run_scenario_comparison": True,
        "run_calibration": True,
        "inputs": {"run_infra_scenarios": False},
    })
    assert r.status_code == 200
    body = r.json()
    assert body["enterprise"]["kubernetes_platform"]["total_resources"] > 0
    assert body["enterprise"]["architect_recommendations"]["overall_status"]


def test_compare_api():
    r = client.post("/api/v1/benchmarks/capacity-planning/compare", json={"profiles": ["small", "medium"]})
    assert r.status_code == 200
    assert len(r.json()["rows"]) >= 2


def test_calibrate_api():
    r = client.post("/api/v1/benchmarks/capacity-planning/calibrate", json={
        "profile": "small",
        "calibration": {"source": "mock"},
    })
    assert r.status_code == 200
    assert r.json()["mock_mode"] is True


def test_history_api():
    client.post("/api/v1/benchmarks/capacity-planning/plan", json={
        "profile": "small", "inputs": {"run_infra_scenarios": False},
    })
    r = client.get("/api/v1/benchmarks/capacity-planning/history")
    assert r.status_code == 200
