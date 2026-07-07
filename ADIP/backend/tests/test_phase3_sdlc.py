"""Phase 3 tests: AI SDLC aggregation, copilot, executive, artifact and traceability APIs."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
API = "/api/v1"


def _first_project_id() -> int:
    return client.get(f"{API}/projects").json()["items"][0]["id"]


def test_requirement_summary_aggregates_types():
    pid = _first_project_id()
    r = client.get(f"{API}/sdlc/projects/{pid}/requirements/summary")
    assert r.status_code == 200, r.text
    body = r.json()
    # business DTO shape (not CRUD list)
    for key in (
        "business_requirements", "functional_requirements", "non_functional_requirements",
        "assumptions", "dependencies", "acceptance_criteria", "gap_analysis",
        "findings", "recommendations", "total_requirements", "score", "readiness",
    ):
        assert key in body
    assert body["project"]["id"] == pid
    assert body["total_requirements"] >= 50
    assert body["functional_requirements"], "expected functional requirements"
    assert body["non_functional_requirements"], "expected NFRs"
    assert 0 <= body["score"] <= 100
    assert body["readiness"] in {"Ready", "On Track", "Needs Attention"}


def test_architecture_summary_has_views():
    pid = _first_project_id()
    body = client.get(f"{API}/sdlc/projects/{pid}/architecture/summary").json()
    for key in ("logical_design", "physical_design", "integrations", "apis",
                "database_design", "sequence_metadata", "applications", "score"):
        assert key in body
    assert body["applications"], "expected applications"


def test_development_summary_metrics():
    pid = _first_project_id()
    body = client.get(f"{API}/sdlc/projects/{pid}/development/summary").json()
    assert body["total_stories"] >= 50
    assert "average_coverage" in body
    assert isinstance(body["secure_coding"], list)


def test_testing_summary_coverage_block():
    pid = _first_project_id()
    body = client.get(f"{API}/sdlc/projects/{pid}/testing/summary").json()
    cov = body["coverage"]
    assert cov["total_cases"] >= 50
    assert 0 <= cov["automation_pct"] <= 100
    assert 0 <= cov["pass_rate_pct"] <= 100
    assert cov["automated"] + cov["manual"] == cov["total_cases"]


def test_release_and_go_live_summaries():
    pid = _first_project_id()
    rel = client.get(f"{API}/sdlc/projects/{pid}/release/summary").json()
    assert "release_plan" in rel and "rollback" in rel and "cab" in rel and "monitoring" in rel
    gl = client.get(f"{API}/sdlc/projects/{pid}/go-live/summary").json()
    for key in ("go_live_checklist", "business_signoff", "support_transition",
                "hypercare", "operational_readiness", "score"):
        assert key in gl


def test_audit_summary_composition():
    pid = _first_project_id()
    body = client.get(f"{API}/sdlc/projects/{pid}/audit/summary").json()
    for key in ("evidence", "compliance", "observations", "traceability", "findings", "score"):
        assert key in body
    assert body["evidence"], "expected audit evidence"


@pytest.mark.parametrize(
    "slug",
    ["requirement", "architecture", "development", "testing", "release", "audit", "executive-advisor"],
)
def test_copilot_endpoints(slug: str):
    pid = _first_project_id()
    r = client.get(f"{API}/copilots/{slug}/projects/{pid}")
    assert r.status_code == 200, r.text
    body = r.json()
    for key in ("findings", "recommendations", "reasoning", "confidence",
                "risk", "readiness", "business_impact", "priority", "score"):
        assert key in body
    assert body["risk"] in {"High", "Medium", "Low"}
    assert body["priority"] in {"P1", "P2", "P3"}
    assert 0 <= body["confidence"] <= 100
    # findings should carry nested recommendations + reasoning
    if body["findings"]:
        f = body["findings"][0]
        assert "reasoning" in f and "recommendations" in f


def test_executive_summary_metrics():
    pid = _first_project_id()
    body = client.get(f"{API}/executive/projects/{pid}/summary").json()
    for key in ("overall_score", "band", "business_value", "productivity_uplift_pct",
                "compliance_score", "risk_score", "ai_confidence", "engineering_health",
                "manual_effort_saved_days", "phase_scores", "top_recommendations"):
        assert key in body
    assert len(body["phase_scores"]) == 6
    assert body["band"] in {"Ready", "Conditional", "At Risk"}


def test_portfolio_executive_rollup():
    project_count = client.get(f"{API}/projects", params={"page_size": 1}).json()["total"]
    body = client.get(f"{API}/executive/portfolio").json()
    assert len(body["projects"]) == project_count
    assert "portfolio_overall_score" in body
    assert body["total_manual_effort_saved_days"] >= 0


def test_artifact_catalog_grouped():
    pid = _first_project_id()
    body = client.get(f"{API}/artifact-catalog/projects/{pid}").json()
    assert body["total"] >= 50
    assert body["groups"]
    types = {g["artifact_type"] for g in body["groups"]}
    # representative required artifact types present
    assert {"BRD", "FRD"} <= types
    # each group count matches its items
    for g in body["groups"]:
        assert g["count"] == len(g["items"])


def test_traceability_chain_ordered():
    pid = _first_project_id()
    body = client.get(f"{API}/traceability/projects/{pid}/chain").json()
    labels = [n["label"] for n in body["nodes"]]
    assert labels[0] == "Prompt"
    assert "Requirement" in labels
    assert body["complete"] is True
    assert body["links"], "expected raw traceability links"


def test_summary_404_for_missing_project():
    r = client.get(f"{API}/sdlc/projects/999999/requirements/summary")
    assert r.status_code == 404
    assert "not found" in r.json()["detail"].lower()
