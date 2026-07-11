"""Enterprise Capacity Planning Suite tests."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.perf.capacity.estimators import (
    estimate_database_growth,
    estimate_network,
    estimate_object_storage,
    estimate_redis,
    estimate_vector_db,
    forecast_growth,
    inputs_from_profile,
)
from app.perf.capacity.planner_engine import EnterpriseCapacityPlanner
from app.schemas.capacity_planning import CapacityPlanningInputs

client = TestClient(app)


def test_inputs_from_profile():
    inp = inputs_from_profile("small")
    assert inp.users > 0
    assert inp.prompts_per_day > 0


def test_object_storage_estimate():
    inp = inputs_from_profile("medium")
    obj = estimate_object_storage(inp)
    assert obj.uploads_per_day > 0
    assert obj.after_compression_bytes < obj.storage_per_year_bytes
    assert len(obj.breakdown) > 10


def test_database_growth():
    inp = inputs_from_profile("medium")
    db = estimate_database_growth(inp)
    assert db.cloud_sql_gb_year > 0
    assert len(db.tables) >= 10


def test_vector_db_dimensions():
    inp = CapacityPlanningInputs(embedding_enabled=True, documents_per_day=100)
    vec = estimate_vector_db(inp)
    dims = [v.dimensions for v in vec]
    assert dims == [384, 768, 1024, 1536]
    assert vec[0].providers.get("pgvector")


def test_network_estimate():
    net = estimate_network(inputs_from_profile("large"))
    assert net.total_egress_gb_month > 0
    assert net.total_annual_gb > net.total_egress_gb_month


def test_redis_estimate():
    r = estimate_redis(inputs_from_profile("medium"))
    assert r.total_mb > 0


def test_growth_forecast():
    inp = inputs_from_profile("medium")
    obj = estimate_object_storage(inp)
    db = estimate_database_growth(inp)
    forecast = forecast_growth(inp, obj, db)
    periods = [p.period for p in forecast]
    assert "year" in periods
    assert forecast[-1].storage_gb >= forecast[0].storage_gb


def test_full_capacity_plan():
    from app.db.session import SessionLocal
    with SessionLocal() as db:
        report = EnterpriseCapacityPlanner(db).plan(
            profile="small",
            write_reports=False,
            inputs=CapacityPlanningInputs(run_infra_scenarios=False),
        )
    assert report.costs.monthly_total_usd > 0
    assert report.object_storage.storage_per_year_bytes > 0
    assert report.gke.get("node_count_est", 0) >= 2


def test_capacity_api_info():
    r = client.get("/api/v1/benchmarks/capacity-planning")
    assert r.status_code == 200
    assert "medium" in r.json()["profiles"]


def test_capacity_api_plan():
    r = client.post("/api/v1/benchmarks/capacity-planning/plan", json={
        "profile": "small",
        "environment": "development",
        "inputs": {"run_infra_scenarios": False},
    })
    assert r.status_code == 200
    body = r.json()
    assert body["profile"] == "small"
    assert body["costs"]["monthly_total_usd"] > 0


def test_capacity_section_object_storage():
    r = client.get("/api/v1/benchmarks/capacity-planning/sections/object_storage?profile=small")
    assert r.status_code == 200
    assert r.json()["uploads_per_day"] > 0


def test_load_test_api():
    r = client.post("/api/v1/benchmarks/capacity-planning/load-test", json={
        "concurrency": 2,
        "scenarios": ["prompt_execution"],
    })
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["samples"] > 0
