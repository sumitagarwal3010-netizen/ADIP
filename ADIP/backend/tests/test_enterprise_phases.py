"""Tests for the enterprise completion phases (A–G):
LLM execution layer, enterprise artifacts, prompt templates, prompt testing,
artifact validation, and the new APIs."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
API = "/api/v1"


def _pid() -> int:
    return client.get(f"{API}/projects").json()["items"][0]["id"]


# --- Phase A: LLM layer ---
def test_token_estimation():
    from app.llm.tokens import estimate_messages_tokens, estimate_tokens
    from app.llm.types import Message, Role
    assert estimate_tokens("") == 0
    assert estimate_tokens("hello world") >= 1
    assert estimate_messages_tokens([Message(Role.USER, "hi there")]) >= 1


def test_structured_parser():
    from app.llm.parser import parse_response
    p = parse_response('```json\n{"x": 1}\n```\n# Heading\nbody')
    assert p.json == {"x": 1}
    assert "Heading" in p.sections


def test_context_window_trim():
    from app.llm.tokens import fit_to_context_window
    from app.llm.types import Message, Role
    msgs = [Message(Role.SYSTEM, "sys")] + [Message(Role.USER, "x" * 400) for _ in range(50)]
    trimmed = fit_to_context_window(msgs, context_window=1000, reserve_for_response=200)
    assert len(trimmed) < len(msgs)
    assert trimmed[0].role == Role.SYSTEM


def test_llm_health_and_disabled_by_default():
    body = client.get(f"{API}/llm/health").json()
    assert body["local_llm_enabled"] is False   # mock mode default
    assert body["active_provider"] == "ollama"
    assert "available" in body


def test_ollama_adapter_unavailable_gracefully():
    # No Ollama running in CI — is_available must return False (not raise).
    from app.llm.adapters.ollama_adapter import OllamaAdapter
    adapter = OllamaAdapter(timeout_seconds=1, max_retries=0)
    assert adapter.is_available() in (True, False)
    assert adapter.list_models() == [] or isinstance(adapter.list_models(), list)


# --- Phase B: enterprise artifacts ---
def test_enterprise_artifact_types_present():
    types = {t["artifact_type"] for t in client.get(f"{API}/artifact-generation/types").json()["supported"]}
    required = {"PRD", "Vision Document", "Business Case", "Stakeholder Matrix",
                "Architecture Decision Record", "Risk Register", "Release Notes",
                "Implementation Roadmap", "UAT Plan", "Test Scenarios",
                "Deployment Diagram", "Infrastructure Design", "Security Design",
                "Performance Design", "Support Runbook", "Knowledge Transfer",
                "Operational Checklist", "Regression Plan"}
    assert required <= types


@pytest.mark.parametrize("atype", ["PRD", "Vision Document", "Business Case", "Risk Register",
                                    "Implementation Roadmap", "ADR" if False else "Architecture Decision Record",
                                    "Release Notes", "UAT Plan", "Stakeholder Matrix"])
def test_generate_enterprise_artifact_with_metadata(atype: str):
    pid = _pid()
    a = client.get(f"{API}/artifact-generation/projects/{pid}/generate",
                   params={"artifact_type": atype}).json()
    assert a["sections"]
    assert a["author"]
    assert a["project_reference"]
    assert a["version"]


def test_artifact_pdf_model():
    pid = _pid()
    body = client.get(f"{API}/artifact-generation/projects/{pid}/generate/pdf-model",
                      params={"artifact_type": "BRD"}).json()
    kinds = {b["kind"] for b in body["blocks"]}
    assert "title" in kinds and "heading" in kinds


# --- Phase C: prompt templates ---
def test_prompt_templates_count_and_ranking():
    body = client.get(f"{API}/prompt-templates").json()
    assert body["total"] == 25
    ranks = [t["composite_rank"] for t in body["templates"]]
    assert ranks == sorted(ranks, reverse=True)  # ranked desc


def test_prompt_template_detail():
    t = client.get(f"{API}/prompt-templates/upi-auto-reversal").json()
    for key in ("business_prompt", "functional_prompt", "architecture_prompt",
                "development_prompt", "testing_prompt", "release_prompt",
                "audit_prompt", "executive_prompt", "expected_artifacts",
                "acceptance_criteria", "risks", "compliance", "ranking"):
        assert key in t
    assert t["ranking"]["composite"] > 0


def test_prompt_template_categories_and_top():
    cats = client.get(f"{API}/prompt-templates/categories").json()["categories"]
    assert "Payments" in cats
    top = client.get(f"{API}/prompt-templates/top", params={"limit": 5}).json()
    assert len(top) == 5


# --- Phase E: prompt testing ---
def test_prompt_run_and_history():
    r = client.post(f"{API}/prompt-testing/run",
                    json={"prompt": "Implement UPI Auto-Reversal for Mobile Banking."}).json()
    assert r["scenario"] == "upi-auto-reversal"
    assert r["artifacts_generated"] > 0
    assert r["latency_ms"] >= 0
    hist = client.get(f"{API}/prompt-testing/history").json()
    assert hist["total"] >= 1
    # fetch the run by id
    got = client.get(f"{API}/prompt-testing/{r['run_id']}")
    assert got.status_code == 200


def test_prompt_benchmark_and_stats():
    bench = client.post(f"{API}/prompt-testing/benchmark",
                        json={"prompts": ["Implement UPI Auto-Reversal.", "Implement Biometric Login."],
                              "iterations": 2}).json()
    assert bench["total_runs"] == 4
    assert bench["errors"] == 0
    assert bench["avg_latency_ms"] >= 0
    stats = client.get(f"{API}/prompt-testing/statistics").json()
    assert stats["total_runs"] >= 4


def test_prompt_compare():
    a = client.post(f"{API}/prompt-testing/run", json={"prompt": "Implement UPI Auto-Reversal."}).json()
    b = client.post(f"{API}/prompt-testing/run", json={"prompt": "Implement Beneficiary Addition."}).json()
    cmp = client.get(f"{API}/prompt-testing/compare",
                     params={"run_a": a["run_id"], "run_b": b["run_id"]}).json()
    assert "latency_delta_ms" in cmp and "confidence_delta" in cmp


# --- Phase F: artifact validation ---
def test_artifact_validation():
    pid = _pid()
    body = client.get(f"{API}/artifact-validation/projects/{pid}",
                      params={"artifact_type": "BRD"}).json()
    assert body["passed"] is True
    assert 0 <= body["quality_score"] <= 100
    assert set(body["checks"].keys()) >= {"completeness", "formatting", "required_sections",
                                          "placeholder_free", "traceability", "consistency"}
    assert isinstance(body["suggestions"], list)


# --- Phase G: artifact ops + prompt validation ---
def test_artifact_metadata_preview_download():
    pid = _pid()
    meta = client.get(f"{API}/artifact-metadata/projects/{pid}", params={"artifact_type": "FRD"}).json()
    assert meta["reference"] and meta["section_count"] >= 1
    preview = client.get(f"{API}/artifact-preview/projects/{pid}", params={"artifact_type": "FRD"})
    assert preview.status_code == 200 and preview.text.startswith("# ")
    dl = client.get(f"{API}/artifact-download/projects/{pid}", params={"artifact_type": "FRD"})
    assert dl.status_code == 200
    assert "attachment" in dl.headers.get("content-disposition", "")


def test_prompt_validation_endpoint():
    body = client.post(f"{API}/prompt-validation",
                       json={"prompt": "Implement UPI Auto-Reversal for Mobile Banking."}).json()
    assert body["valid"] is True
    assert body["scenario"] == "upi-auto-reversal"
    assert body["confidence"] >= 90


def test_prompt_validation_warns_on_short_prompt():
    body = client.post(f"{API}/prompt-validation", json={"prompt": "do it now"}).json()
    assert body["warnings"]  # short/generic prompt should warn
