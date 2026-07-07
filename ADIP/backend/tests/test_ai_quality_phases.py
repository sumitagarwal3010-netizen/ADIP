"""Tests for AI quality/prompt-engineering/authoring phases (1-5):
artifact-authoring templates, prompt workbench, quality scoring, AI reviewer
(deterministic + mocked LLM), and professional artifact authoring."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
API = "/api/v1"


def _pid() -> int:
    return client.get(f"{API}/projects").json()["items"][0]["id"]


# --- Phase 1: artifact-authoring templates ---
def test_artifact_prompt_templates_list():
    body = client.get(f"{API}/prompt-templates/artifacts").json()
    assert body["total"] >= 20
    types = {t["artifact_type"] for t in body["templates"]}
    assert {"BRD", "FRD", "HLD", "LLD", "API Spec", "Test Plan", "Executive Summary"} <= types


def test_artifact_prompt_template_detail():
    t = client.get(f"{API}/prompt-templates/artifacts/BRD").json()
    for key in ("role_instruction", "business_context", "artifact_objective",
                "required_sections", "output_format", "banking_domain_assumptions",
                "compliance_considerations", "quality_checklist",
                "traceability_requirements", "json_schema_expectations", "markdown_expectations"):
        assert key in t and t[key]
    assert t["json_schema_expectations"]["type"] == "object"


def test_use_case_templates_still_work():
    assert client.get(f"{API}/prompt-templates").json()["total"] == 25


# --- Phase 2: prompt workbench ---
def test_workbench_full_flow():
    p = client.post(f"{API}/prompt-workbench/prompts",
                    json={"name": "Test Prompt", "content": "Implement UPI Auto-Reversal for Mobile Banking."})
    assert p.status_code == 201
    pid = p.json()["id"]
    assert p.json()["version_count"] == 1

    v2 = client.post(f"{API}/prompt-workbench/prompts/{pid}/versions",
                     json={"content": "Implement UPI Auto-Reversal with NPCI reconciliation.", "experiment": "v2"})
    assert v2.status_code == 201 and v2.json()["version"] == 2

    versions = client.get(f"{API}/prompt-workbench/prompts/{pid}/versions").json()
    assert len(versions) == 2

    r1 = client.post(f"{API}/prompt-workbench/runs", json={"version_id": versions[0]["id"]}).json()
    r2 = client.post(f"{API}/prompt-workbench/runs", json={"version_id": versions[1]["id"]}).json()
    assert r1["quality_score"] is not None and r1["artifact_coverage"] >= 1
    assert r1["prompt_tokens"] >= 1 and r1["output_quality"] in {"Excellent", "Good", "Fair", "Poor"}

    cmp = client.post(f"{API}/prompt-workbench/compare",
                      json={"run_id_a": r1["id"], "run_id_b": r2["id"]}).json()
    assert "verdict" in cmp and "quality_delta" in cmp

    assert client.get(f"{API}/prompt-workbench/prompts").status_code == 200
    assert client.get(f"{API}/prompt-workbench/runs/{r1['id']}").status_code == 200


def test_workbench_run_from_prompt_text():
    r = client.post(f"{API}/prompt-workbench/runs",
                    json={"prompt_text": "Implement Beneficiary Addition."}).json()
    assert r["scenario"] and r["artifact_coverage"] >= 1


# --- Phase 3: quality scoring ---
def test_quality_rules_14_dimensions():
    body = client.get(f"{API}/artifact-quality/rules").json()
    assert len(body["rules"]) == 14
    assert body["total_weight"] == 100


def test_quality_score():
    pid = _pid()
    body = client.post(f"{API}/artifact-quality/score",
                       json={"project_id": pid, "artifact_type": "BRD"}).json()
    assert 0 <= body["overall_score"] <= 100
    assert body["quality_band"] in {"Excellent", "Good", "Fair", "Poor"}
    assert len(body["dimension_scores"]) == 14
    assert body["section_scores"]
    assert "improvement_suggestions" in body and "risk_notes" in body


def test_quality_batch_score():
    pid = _pid()
    body = client.post(f"{API}/artifact-quality/batch-score",
                       json={"project_id": pid, "artifact_types": ["BRD", "FRD", "HLD"]}).json()
    assert len(body["reports"]) == 3
    assert 0 <= body["average_score"] <= 100


# --- Phase 4: AI reviewer ---
def test_review_artifact_deterministic():
    pid = _pid()
    body = client.post(f"{API}/ai-review/review-artifact",
                       json={"project_id": pid, "artifact_type": "HLD"}).json()
    assert body["reviewer"] == "deterministic"
    assert 0 <= body["review_score"] <= 100
    assert "findings" in body and "hallucination_risk" in body
    assert "missing_assumptions" in body and "executive_clarity" in body


def test_improve_artifact():
    pid = _pid()
    body = client.post(f"{API}/ai-review/improve-artifact",
                       json={"project_id": pid, "artifact_type": "FRD"}).json()
    assert "review" in body and "improved" in body
    assert body["improved"]["sections"]
    assert isinstance(body["changes_applied"], list)


def test_review_run():
    body = client.post(f"{API}/ai-review/review-run",
                       json={"prompt": "Implement UPI Auto-Reversal for Mobile Banking."}).json()
    assert body["artifacts_reviewed"] >= 1
    assert 0 <= body["average_review_score"] <= 100
    assert len(body["reviews"]) == body["artifacts_reviewed"]


def test_review_uses_ollama_when_enabled_with_mock(monkeypatch):
    """With LOCAL_LLM_ENABLED patched on and the LLM completion mocked, the
    reviewer uses the Ollama path (reviewer='ollama')."""
    from app.core.config import settings
    from app.llm.service import llm_service
    from app.llm.types import CompletionResponse, Usage
    from app.services.ai_reviewer import AIReviewer
    from app.db.session import SessionLocal

    monkeypatch.setattr(settings, "local_llm_enabled", True, raising=False)
    monkeypatch.setattr(
        llm_service, "complete",
        lambda req: CompletionResponse(model="llama3.1:8b", content="Strong artifact; minor gaps.",
                                       usage=Usage(10, 20, 30), provider="ollama"),
    )
    with SessionLocal() as db:
        reviewer = AIReviewer(db)
        review = reviewer.review(_pid(), "BRD")
    assert review.reviewer == "ollama"
    assert review.overall_assessment


# --- Phase 5: professional authoring ---
def test_professional_envelope_sections():
    pid = _pid()
    art = client.get(f"{API}/artifact-generation/projects/{pid}/generate",
                     params={"artifact_type": "BRD"}).json()
    heads = [s["heading"] for s in art["sections"]]
    for required in ("Document Control", "Assumptions", "Dependencies", "Risks",
                     "Approval", "Review Status", "Appendix"):
        assert required in heads, f"missing {required}"
    assert art["author"] and art["version"] and art["project_reference"]


def test_test_cases_structured():
    pid = _pid()
    art = client.get(f"{API}/artifact-generation/projects/{pid}/generate",
                     params={"artifact_type": "Test Cases"}).json()
    joined = " ".join(b for s in art["sections"] for b in s.get("bullets", []))
    assert "Precondition:" in joined and "Steps:" in joined and "Expected Result:" in joined
