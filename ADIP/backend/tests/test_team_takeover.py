"""Rule engine tests."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app
from app.schemas.rules import RuleRunRequest
from app.services.rule_engine import rule_engine

client = TestClient(app)


def test_list_rules():
    r = client.get("/api/v1/rules")
    assert r.status_code == 200
    assert len(r.json()) >= 10


def test_run_rules_pass():
    report = rule_engine.run(RuleRunRequest(
        artifact_type="requirements_document",
        artifact_content="# Requirements\n## REQ-101 Settlement\n## REQ-102 Reversal\nArchitecture payments-service API.",
        connector_records=[{"external_id": "jira-1", "title": "Story", "classification": "story", "severity": "high"}],
    ))
    assert report.total >= 10
    assert report.passed >= 1


def test_security_severity_rule():
    report = rule_engine.run(RuleRunRequest(
        connector_records=[{"severity": "CRITICAL", "external_id": "f1", "classification": "vuln"}],
        categories=["security_mapping"],
    ))
    assert report.results[0].status == "pass"


def test_rules_api():
    r = client.post("/api/v1/rules/run", json={
        "artifact_type": "BRD",
        "artifact_content": "# BRD v1\n## Summary\nREQ-101 control evidence audit SOX.",
    })
    assert r.status_code == 200
    assert "overall_status" in r.json()


def test_team_takeover_metadata():
    r = client.get("/api/v1/team-takeover/metadata")
    assert r.status_code == 200
    body = r.json()
    assert "scripts" in body
    assert "workbenches" in body


def test_golden_regression_mock():
    r = client.post("/api/v1/prompt-regression/run-golden?limit=3")
    assert r.status_code == 200
    assert r.json()["total"] == 3


def test_llm_smoke_test():
    r = client.post("/api/v1/llm/smoke-test")
    assert r.status_code == 200
    assert r.json()["mode"] == "mock"


def test_artifact_scorecard():
    r = client.get("/api/v1/artifact-quality/scorecard?artifact_type=BRD")
    assert r.status_code == 200
    assert "composite_score" in r.json()


def test_takeover_docs_exist():
    from pathlib import Path
    takeover = Path(__file__).resolve().parents[2] / "enterprise" / "team-takeover"
    required = ["README.md", "ARTIFACT_MANIFEST.md", "17_RULE_ENGINE_GUIDE.md", "21_DEMO_SCRIPT.md"]
    for name in required:
        assert (takeover / name).is_file(), f"Missing {name}"
