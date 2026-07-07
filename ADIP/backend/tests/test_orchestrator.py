"""Tests for the Prompt Execution Engine (orchestration layer)."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
API = "/api/v1"


def _execute(prompt: str, **body) -> dict:
    r = client.post(f"{API}/orchestrator/execute", json={"prompt": prompt, **body})
    assert r.status_code == 200, r.text
    return r.json()


def test_capabilities():
    body = client.get(f"{API}/orchestrator/capabilities").json()
    assert "requirement" in body["copilots"]
    assert "BRD" in body["default_artifacts"]
    assert body["flow"][0] == "classification"


def test_execute_returns_full_orchestration():
    body = _execute("Implement UPI Auto-Reversal for Mobile Banking.")
    # top-level structure
    for key in ("run_id", "prompt", "classification", "requirements", "architecture",
                "development", "testing", "release", "go_live", "audit", "copilots",
                "executive", "dashboard", "artifacts", "traceability", "reasoner"):
        assert key in body, f"missing {key}"
    assert body["run_id"].startswith("ORCH-")
    assert body["reasoner"] == "mock"


def test_classification_detects_upi_scenario():
    body = _execute("Implement UPI Auto-Reversal for Mobile Banking.")
    cls = body["classification"]
    assert cls["scenario"] == "upi-auto-reversal"
    assert "UPI" in cls["business_domain"]
    assert cls["compliance_impact"] == "High"
    assert cls["risk"] == "High"
    assert cls["confidence"] >= 90
    assert cls["story_points"] > 0 and cls["sprint_estimate"] >= 1


def test_classification_biometric_security_impact():
    body = _execute("Implement Login using Biometric Authentication.")
    cls = body["classification"]
    assert cls["security_impact"] == "High"
    assert body["project"]["name"] == "Mobile Banking"


def test_project_resolution_from_prompt():
    body = _execute("Implement Beneficiary Addition.")
    assert body["project"]["name"] == "Payments"


def test_metadata_overrides_project():
    body = _execute("Implement a generic capability.", metadata={"project": "Net Banking"})
    assert body["project"]["name"] == "Net Banking"


def test_all_phases_populated():
    body = _execute("Implement UPI Auto-Reversal for Mobile Banking.")
    assert body["requirements"]["total_requirements"] >= 50
    assert body["development"]["total_stories"] >= 50
    assert body["testing"]["coverage"]["total_cases"] >= 50
    assert body["architecture"]["overview"]
    assert body["audit"]["evidence"]


def test_all_copilots_present():
    body = _execute("Implement UPI Auto-Reversal for Mobile Banking.")
    assert set(body["copilots"].keys()) == {
        "requirement", "architecture", "development", "testing",
        "release", "go-live", "audit", "executive-advisor",
    }
    for cop in body["copilots"].values():
        assert "confidence" in cop and "risk" in cop and "readiness" in cop


def test_dashboard_metrics():
    body = _execute("Implement UPI Auto-Reversal for Mobile Banking.")
    d = body["dashboard"]
    for key in ("overall_sdlc_score", "band", "business_value", "engineering_productivity",
                "risk_score", "compliance_score", "ai_confidence",
                "manual_effort_saved_days", "automation_pct"):
        assert key in d
    assert 0 <= d["automation_pct"] <= 100


def test_artifacts_generated_via_existing_generator():
    body = _execute("Implement UPI Auto-Reversal for Mobile Banking.")
    types = {a["artifact_type"] for a in body["artifacts"]}
    assert {"BRD", "FRD", "SRS", "HLD", "LLD", "API Spec", "Test Plan",
            "Executive Summary"} <= types
    for a in body["artifacts"]:
        assert a["sections"], "artifact must have sections"


def test_artifacts_markdown_optional():
    body = _execute("Implement UPI Auto-Reversal.", include_markdown=True)
    assert body["artifacts_markdown"]
    assert body["artifacts_markdown"][0]["markdown"].startswith("# ")


def test_custom_artifact_types():
    body = _execute("Implement UPI Auto-Reversal.", artifact_types=["BRD", "Test Plan"])
    types = {a["artifact_type"] for a in body["artifacts"]}
    assert types == {"BRD", "Test Plan"}


def test_traceability_updated():
    body = _execute("Implement UPI Auto-Reversal for Mobile Banking.")
    labels = [n["label"] for n in body["traceability"]["nodes"]]
    assert labels[0] == "Prompt"
    assert body["traceability"]["complete"] is True


def test_audit_trail_entry_created():
    from app.db.session import SessionLocal
    from app.models.platform import ActivityLog
    from sqlalchemy import func, select

    with SessionLocal() as db:
        before = db.scalar(
            select(func.count()).select_from(ActivityLog).where(ActivityLog.action == "orchestrate")
        )
    _execute("Implement UPI Auto-Reversal for Mobile Banking.")
    with SessionLocal() as db:
        after = db.scalar(
            select(func.count()).select_from(ActivityLog).where(ActivityLog.action == "orchestrate")
        )
    assert after >= (before or 0) + 1


def test_validation_error_on_empty_prompt():
    r = client.post(f"{API}/orchestrator/execute", json={"prompt": "x"})
    assert r.status_code == 422  # min_length=3


def test_provider_independent_reasoner_swap():
    """A custom reasoner can be injected without changing the engine (LLM-ready)."""
    from app.db.session import SessionLocal
    from app.llm.reasoning import MockReasoner, PromptClassification
    from app.schemas.orchestrator import OrchestrationRequest
    from app.services.orchestrator_service import PromptExecutionEngine

    class StubReasoner(MockReasoner):
        name = "stub"

        def classify(self, prompt: str, metadata=None) -> PromptClassification:
            base = super().classify(prompt, metadata)
            base.scenario = "stubbed"
            return base

    with SessionLocal() as db:
        engine = PromptExecutionEngine(db, reasoner=StubReasoner())
        resp = engine.execute(OrchestrationRequest(prompt="Implement anything."))
    assert resp.reasoner == "stub"
    assert resp.classification.scenario == "stubbed"
