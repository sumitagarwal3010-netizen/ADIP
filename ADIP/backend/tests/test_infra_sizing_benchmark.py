"""Infrastructure sizing benchmark tests."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.perf.infra_sizing_benchmark import (
    PROFILE_ASSUMPTIONS,
    InfraSizingBenchmarkService,
    _estimate_cpu_millicores,
    _storage_estimates,
)
from app.schemas.infra_sizing import SizingProfile

client = TestClient(app)


def test_storage_estimates():
    est = _storage_estimates(total_tokens=1000, artifact_bytes=5000, db_rows=3)
    assert est["db_rows_est"] == 3
    assert est["vector_embedding_bytes_est"] > 0
    assert est["log_storage_bytes_est"] > 0


def test_cpu_estimate_increases_with_tokens():
    low = _estimate_cpu_millicores(50, 100)
    high = _estimate_cpu_millicores(50, 5000)
    assert high > low


def test_profile_assumptions_exist():
    for p in ("small", "medium", "large", "enterprise"):
        assert p in PROFILE_ASSUMPTIONS


def test_run_scenarios_mock():
    from app.db.session import SessionLocal
    with SessionLocal() as db:
        svc = InfraSizingBenchmarkService(db)
        results = svc.run_scenarios(["llm_smoke_test", "rule_engine_execution"])
    assert len(results) == 2
    assert all(r.ok for r in results)
    assert all(r.total_tokens >= 0 for r in results)


def test_gke_sizing_estimate():
    from app.db.session import SessionLocal
    with SessionLocal() as db:
        svc = InfraSizingBenchmarkService(db)
        scenarios = svc.run_scenarios(["llm_smoke_test"])
        gke = svc.estimate_gke("small", scenarios)
    assert gke.backend.replicas >= 2
    assert gke.node_count_est >= 2
    assert gke.cloud_sql_storage_gb >= 0


def test_full_run_medium_profile():
    from app.db.session import SessionLocal
    with SessionLocal() as db:
        report = InfraSizingBenchmarkService(db).run(profile="medium")
    assert report.profile == "medium"
    assert len(report.scenarios) == 7
    assert "GKE sizing" in report.markdown_summary


def test_infra_sizing_api_info():
    r = client.get("/api/v1/benchmarks/infra-sizing")
    assert r.status_code == 200
    assert "medium" in r.json()["profiles"]


def test_infra_sizing_api_run():
    r = client.post("/api/v1/benchmarks/infra-sizing/run", json={"profile": "small", "scenarios": ["llm_smoke_test"]})
    assert r.status_code == 200
    body = r.json()
    assert body["profile"] == "small"
    assert body["gke"]["node_count_est"] >= 2
