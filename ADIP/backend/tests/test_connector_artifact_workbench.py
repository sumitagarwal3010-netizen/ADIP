"""Connector artifact workbench tests."""
from __future__ import annotations

import re

from fastapi.testclient import TestClient

from app.connectors.connector_artifact_prompts import ARTIFACT_USE_CASES, render_prompt
from app.connectors.mock_catalog import preview_for_connectors, samples_for
from app.main import app

client = TestClient(app)


def test_artifact_use_cases_list():
    r = client.get("/api/v1/connectors/artifacts/use-cases")
    assert r.status_code == 200
    ids = {u["id"] for u in r.json()}
    assert "release_readiness_report" in ids
    assert len(ids) >= len(ARTIFACT_USE_CASES)


def test_preview_sources_sharepoint_jira():
    r = client.post("/api/v1/connectors/artifacts/preview-sources", json={
        "artifact_type": "requirements_document",
        "connector_types": ["jira", "sharepoint"],
        "limit": 10,
    })
    assert r.status_code == 200
    body = r.json()
    assert body["total"] >= 1
    assert "jira" in body["connector_types"] or "sharepoint" in body["connector_types"]
    assert body["mode"]  # mock


def test_prompt_preview_sonarqube():
    r = client.get("/api/v1/connectors/artifacts/prompt-preview", params={
        "artifact_type": "security_findings_report",
        "connector_types": "sonarqube,prisma_cloud",
    })
    assert r.status_code == 200
    body = r.json()
    assert "prompt" in body
    assert "sonarqube" in body["prompt"].lower() or "source" in body["prompt"].lower()


def test_generate_artifact_from_mock_jira():
    client.post("/api/v1/connectors/seed-defaults")
    connectors = client.get("/api/v1/connectors").json()
    jira = next(c for c in connectors if c["connector_type"] == "jira")
    r = client.post("/api/v1/connectors/artifacts/generate", json={
        "artifact_type": "traceability_matrix",
        "connector_ids": [jira["id"]],
    })
    assert r.status_code == 200
    art = r.json()
    assert art["artifact_type"] == "traceability_matrix"
    assert art["quality_score"] > 0
    assert art["traceability"]
    assert art["explainability"]["generation_mode"] == "mock_llm"
    assert not re.search(r"(api[_-]?key|secret|password)\s*[:=]\s*\S+", art["prompt"], re.I)


def test_generate_prisma_sonar_security_report():
    r = client.post("/api/v1/connectors/artifacts/generate", json={
        "artifact_type": "security_findings_report",
        "connector_types": ["sonarqube", "prisma_cloud"],
    })
    assert r.status_code == 200
    art = r.json()
    assert "sonarqube" in art["source_connectors"] or "prisma_cloud" in art["source_connectors"]
    severities = [rec.get("severity") for rec in art["source_records"] if rec.get("severity")]
    assert severities  # normalized findings present


def test_generate_biometric_login_uses_prompt_and_llm(monkeypatch):
    from app.core.config import settings
    from app.llm.service import llm_service
    from app.llm.types import CompletionResponse, Usage

    monkeypatch.setattr(settings, "local_llm_enabled", True, raising=False)

    captured: dict[str, str] = {}

    def fake_complete(request):
        captured["prompt"] = request.messages[-1].content
        assert "Implement biometric login for mobile banking" in captured["prompt"]
        return CompletionResponse(
            model=request.model,
            content=(
                "# Biometric Login Requirements\n\n"
                "The solution should support secure biometric authentication for mobile banking "
                "with device-bound enrollment, fallback PIN handling, and audit logging."
            ),
            usage=Usage(prompt_tokens=42, completion_tokens=64, total_tokens=106),
            provider="ollama",
        )

    monkeypatch.setattr(llm_service, "complete", fake_complete)

    r = client.post("/api/v1/connectors/artifacts/generate", json={
        "artifact_type": "requirements_document",
        "connector_types": ["jira", "sharepoint"],
        "prompt": "Implement biometric login for mobile banking",
    })
    assert r.status_code == 200
    art = r.json()
    assert "biometric" in art["body"].lower()
    assert "upi-101" not in art["body"].lower()
    assert "sonarqube" not in art["body"].lower()
    assert "biometric" in art["prompt"].lower()
    assert art["explainability"]["generation_mode"] == "real_llm"


def test_get_generated_artifact_and_traceability():
    gen = client.post("/api/v1/connectors/artifacts/generate", json={
        "artifact_type": "architecture_summary",
        "connector_types": ["sharepoint", "confluence"],
    }).json()
    aid = gen["id"]
    r = client.get(f"/api/v1/connectors/artifacts/{aid}")
    assert r.status_code == 200
    tr = client.get(f"/api/v1/connectors/artifacts/{aid}/traceability")
    assert tr.status_code == 200
    assert tr.json()["traceability"]


def test_mock_catalog_classifications():
    sp = samples_for("sharepoint")
    assert any(s.get("classification") == "architecture" for s in sp)
    teams = samples_for("teams")
    assert any(s.get("classification") == "decision_log" for s in teams)
    jira = samples_for("jira")
    assert any(s.get("classification") == "bug" for s in jira)


def test_render_prompt_no_secret_placeholder():
    prompt = render_prompt("jira_requirements_traceability", connectors="jira", source_records="- jira-1: test")
    assert "jira" in prompt
    assert "password" not in prompt.lower() or "do not" in prompt.lower()


def test_preview_for_connectors_quality():
    rows = preview_for_connectors(["sonarqube", "prisma_cloud"], artifact_type="security_findings_report")
    assert len(rows) >= 2
