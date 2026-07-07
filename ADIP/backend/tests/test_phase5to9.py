"""Tests for Phase 5 (artifact generation), 6 (traceability matrix/impact),
7 (executive analytics/trends), 8 (knowledge) and 9 (transformation)."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
API = "/api/v1"


def _pid() -> int:
    return client.get(f"{API}/projects").json()["items"][0]["id"]


def _project_count() -> int:
    return client.get(f"{API}/projects", params={"page_size": 1}).json()["total"]


# --- Phase 5: artifact generation ---
def test_artifact_types_listed():
    body = client.get(f"{API}/artifact-generation/types").json()
    types = {t["artifact_type"] for t in body["supported"]}
    assert {"BRD", "FRD", "SRS", "HLD", "LLD", "API Spec", "DB Design",
            "Test Plan", "Deployment Guide", "Rollback Guide",
            "Go Live Checklist", "Audit Checklist", "Executive Summary"} <= types


@pytest.mark.parametrize("atype", ["BRD", "FRD", "SRS", "HLD", "LLD", "API Spec",
                                    "DB Design", "Test Plan", "Deployment Guide",
                                    "Rollback Guide", "Go Live Checklist",
                                    "Audit Checklist", "Executive Summary", "Architecture", "Solution Design"])
def test_generate_json_artifact(atype: str):
    pid = _pid()
    r = client.get(f"{API}/artifact-generation/projects/{pid}/generate", params={"artifact_type": atype})
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["artifact_type"] == atype
    assert body["sections"], "expected non-empty sections"
    assert body["executive_summary"]


def test_generate_markdown_and_docx():
    pid = _pid()
    md = client.get(f"{API}/artifact-generation/projects/{pid}/generate/markdown", params={"artifact_type": "BRD"}).json()
    assert md["markdown"].startswith("# ")
    assert "## Executive Summary" in md["markdown"]
    docx = client.get(f"{API}/artifact-generation/projects/{pid}/generate/docx-model", params={"artifact_type": "BRD"}).json()
    styles = {p["style"] for p in docx["paragraphs"]}
    assert "Title" in styles and "Heading 1" in styles


def test_generate_unsupported_type_422():
    pid = _pid()
    r = client.get(f"{API}/artifact-generation/projects/{pid}/generate", params={"artifact_type": "NOPE"})
    assert r.status_code == 422


# --- Phase 6: traceability matrix + impact ---
def test_traceability_matrix():
    pid = _pid()
    body = client.get(f"{API}/traceability/projects/{pid}/matrix").json()
    assert body["total_requirements"] >= 50
    assert 0 <= body["coverage_pct"] <= 100
    assert body["rows"]
    row = body["rows"][0]
    assert "development_refs" in row and "test_refs" in row and "covered" in row


def test_impact_analysis():
    pid = _pid()
    # pick a requirement id from the matrix
    matrix = client.get(f"{API}/traceability/projects/{pid}/matrix").json()
    rid = matrix["rows"][0]["requirement_id"]
    body = client.get(f"{API}/traceability/projects/{pid}/impact", params={"requirement_id": rid}).json()
    assert body["entity_type"] == "Requirement"
    assert body["entity_id"] == rid
    assert isinstance(body["downstream"], list)
    assert isinstance(body["upstream"], list)


# --- Phase 7: executive analytics ---
def test_portfolio_health():
    n = _project_count()
    body = client.get(f"{API}/analytics/portfolio-health").json()
    assert len(body["items"]) == n
    assert "portfolio_score" in body
    assert body["healthy"] + body["at_risk"] <= n


def test_risk_rollup():
    n = _project_count()
    body = client.get(f"{API}/analytics/risk-rollup").json()
    assert len(body["items"]) == n
    assert body["total_open"] >= 0
    assert body["total_exposure"] >= 0


def test_engineering_kpis():
    pid = _pid()
    body = client.get(f"{API}/analytics/projects/{pid}/engineering-kpis").json()
    for key in ("total_stories", "done_stories", "velocity_points", "average_coverage",
                "total_defects", "open_defects", "critical_defects", "automation_pct"):
        assert key in body
    assert body["total_stories"] >= 50


def test_executive_trend():
    pid = _pid()
    body = client.get(f"{API}/analytics/projects/{pid}/trend", params={"metric": "overall_score"}).json()
    assert body["metric"] == "overall_score"
    assert len(body["points"]) >= 1
    assert all("overall_score" in p for p in body["points"])


def test_value_metrics():
    pid = _pid()
    body = client.get(f"{API}/analytics/projects/{pid}/value").json()
    assert body["business_value"] >= 0
    assert body["manual_effort_saved_days"] >= 0


# --- Phase 8: knowledge ---
def test_knowledge_overview_and_search():
    ov = client.get(f"{API}/knowledge/overview").json()
    assert ov["total"] >= 1
    assert ov["categories"]
    res = client.get(f"{API}/knowledge/search", params={"q": "reversal"}).json()
    assert "results" in res and res["query"] == "reversal"


def test_knowledge_recommendations():
    pid = _pid()
    body = client.get(f"{API}/knowledge/recommendations", params={"project_id": pid}).json()
    assert "recommendations" in body
    assert len(body["recommendations"]) >= 1


# --- Phase 9: transformation ---
def test_transformation_portfolio_and_roi():
    port = client.get(f"{API}/transformation/portfolio").json()
    assert port["total_programs"] >= 1
    assert "total_benefit_value" in port
    roi = client.get(f"{API}/transformation/roi").json()
    assert roi["items"]
    assert "average_roi_index" in roi
