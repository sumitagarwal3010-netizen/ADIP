"""Phase 16 tests: production-readiness (metrics, request ids, audit trail)."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_metrics_endpoint():
    # generate some traffic first
    client.get("/health")
    client.get("/api/v1/projects")
    body = client.get("/metrics").json()
    assert "total_requests" in body
    assert body["total_requests"] >= 1
    assert "avg_latency_ms" in body
    assert "top_paths" in body


def test_request_id_and_timing_headers():
    r = client.get("/health")
    assert "x-request-id" in {k.lower() for k in r.headers.keys()}
    assert "x-response-time-ms" in {k.lower() for k in r.headers.keys()}


def test_audit_trail_records_activity():
    from app.db.session import SessionLocal
    from app.services.audit_trail import record_activity
    from sqlalchemy import func, select
    from app.models.platform import ActivityLog

    with SessionLocal() as db:
        before = db.scalar(select(func.count()).select_from(ActivityLog))
        entry = record_activity(
            db, action="test-action", actor="pytest", entity_type="Test",
            entity_reference="T-001", detail="unit test entry",
        )
        assert entry.id is not None
        after = db.scalar(select(func.count()).select_from(ActivityLog))
        assert after == before + 1
