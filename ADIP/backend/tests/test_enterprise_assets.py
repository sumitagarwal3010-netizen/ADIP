"""Tests for enterprise assets added in Phases A–D:
LLM runtime, Prompt Studio, Artifact Export Engine, and Prompt Regression.
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.llm.runtime import (
    CancellationToken,
    CancelledError,
    CircuitBreaker,
    Conversation,
    LLMRuntime,
    LRUCache,
    chunk_prompt,
    compress_prompt,
    estimate_cost,
    estimate_memory_mb,
    llm_runtime,
)
from app.llm.types import CompletionRequest, Message, Role
from app.main import app

client = TestClient(app)


# --- Phase A: LLM runtime primitives ---
def test_chunk_prompt_splits_large_text():
    assert len(chunk_prompt("x", 100)) == 1
    big = "para\n\n" * 3000
    assert len(chunk_prompt(big, 8000)) > 1


def test_compress_prompt_collapses_whitespace():
    out = compress_prompt("a   b\n\n\n\nc")
    assert "   " not in out and "\n\n\n" not in out


def test_cost_and_memory_estimation():
    assert estimate_cost("ollama", 1000, 1000) == 0.0
    assert estimate_cost("openai", 1000, 1000) > 0
    assert estimate_memory_mb("llama3:70b") > estimate_memory_mb("llama3.1:8b")


def test_circuit_breaker_opens_and_half_opens():
    cb = CircuitBreaker(threshold=2, reset_after_s=0.0)
    assert cb.state == "closed"
    cb.record_failure()
    cb.record_failure()
    # reset_after_s=0 → immediately half-open (allows a trial)
    assert cb.state in {"open", "half-open"}
    cb.record_success()
    assert cb.state == "closed"


def test_lru_cache_evicts():
    c = LRUCache(2)
    c.put("a", 1)
    c.put("b", 2)
    c.get("a")  # a most-recent
    c.put("c", 3)  # evicts b
    assert c.get("b") is None
    assert c.get("a") == 1


def test_runtime_routing_and_estimate():
    plan = llm_runtime.routing_plan(None)
    assert plan and isinstance(plan, list)
    est = llm_runtime.estimate([Message(Role.USER, "hello world")])
    assert est["prompt_tokens"] > 0
    assert "fits_context" in est


def test_runtime_endpoints():
    assert client.get("/api/v1/llm/runtime").status_code == 200
    r = client.get("/api/v1/llm/routing")
    assert r.status_code == 200 and "plan" in r.json()


def test_cancellation_token():
    tok = CancellationToken()
    assert tok.cancelled is False
    tok.cancel()
    assert tok.cancelled is True
    with pytest.raises(CancelledError):
        tok.raise_if_cancelled()


def test_conversation_history_and_trim():
    conv = Conversation(system="You are a banking BA.", model="llama3.1:8b")
    conv.add_user("Draft a BRD.").add_assistant("Sure.").add_user("Add NFRs.")
    assert len(conv.messages) == 4
    req = conv.to_request(temperature=0.1)
    assert req.model == "llama3.1:8b"
    assert len(req.messages) >= 1  # fitted to context window


def test_batch_isolates_failures_and_cancels():
    rt = LLMRuntime(max_concurrency=2)
    reqs = [CompletionRequest(model="llama3.1:8b", messages=[Message(Role.USER, f"q{i}")])
            for i in range(3)]
    # No LLM server in CI/mock → each item returns an Exception, not a crash.
    results = rt.batch(reqs)
    assert len(results) == 3
    assert all(r is not None for r in results)
    # Pre-cancelled batch → all items are CancelledError.
    cancelled = CancellationToken()
    cancelled.cancel()
    results2 = rt.batch(reqs, cancel=cancelled)
    assert all(isinstance(r, CancelledError) for r in results2)


def test_stream_is_generator():
    import inspect
    assert inspect.isgeneratorfunction(llm_runtime.stream)


# --- Phase B: Prompt Studio ---
@pytest.fixture()
def prompt_id() -> int:
    resp = client.post("/api/v1/prompt-workbench/prompts",
                       json={"name": "Studio Fixture", "content": "Implement UPI reversal."})
    assert resp.status_code in (200, 201)
    return resp.json()["id"]


def test_studio_tags_favorite_approval_publish(prompt_id: int):
    client.put(f"/api/v1/prompt-studio/prompts/{prompt_id}/tags", json={"tags": ["upi", "pay"]})
    fav = client.put(f"/api/v1/prompt-studio/prompts/{prompt_id}/favorite",
                     json={"is_favorite": True}).json()
    assert fav["is_favorite"] is True and set(fav["tags"]) == {"upi", "pay"}
    # Cannot publish before approval.
    assert client.post(f"/api/v1/prompt-studio/prompts/{prompt_id}/publish").status_code >= 400
    client.put(f"/api/v1/prompt-studio/prompts/{prompt_id}/approval",
               json={"approval_status": "Approved"})
    pub = client.post(f"/api/v1/prompt-studio/prompts/{prompt_id}/publish").json()
    assert pub["is_published"] is True


def test_studio_search_clone_export_import(prompt_id: int):
    client.put(f"/api/v1/prompt-studio/prompts/{prompt_id}/tags", json={"tags": ["searchme"]})
    found = client.get("/api/v1/prompt-studio/search", params={"q": "searchme"}).json()
    assert found["total"] >= 1
    clone = client.post(f"/api/v1/prompt-studio/prompts/{prompt_id}/clone").json()
    assert clone["id"] != prompt_id
    exported = client.get(f"/api/v1/prompt-studio/prompts/{prompt_id}/export").json()
    assert "versions" in exported
    imported = client.post("/api/v1/prompt-studio/import", json=exported).json()
    assert imported["name"]


# --- Phase C: Artifact Export Engine ---
def test_export_formats_listed():
    body = client.get("/api/v1/artifact-export/formats").json()
    assert "html" in body["formats"] and "csv" in body["formats"]


@pytest.mark.parametrize("fmt", ["markdown", "html", "json", "csv"])
def test_export_artifact_formats(fmt: str):
    r = client.get("/api/v1/artifact-export/projects/1",
                   params={"artifact_type": "BRD", "format": fmt})
    assert r.status_code == 200
    assert len(r.content) > 50


def test_export_html_watermark_and_branding():
    r = client.get("/api/v1/artifact-export/projects/1",
                   params={"artifact_type": "BRD", "format": "html", "watermark": "CONFIDENTIAL"})
    assert r.status_code == 200
    assert "CONFIDENTIAL" in r.text and "Table of Contents" in r.text


def test_export_bundle_zip():
    r = client.post("/api/v1/artifact-export/projects/1/bundle",
                    json={"project_id": 1, "artifact_types": ["BRD", "FRD"]})
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/zip"
    assert len(r.content) > 100


# --- Phase D: Prompt Regression ---
def test_regression_compare_flags_metrics():
    r = client.post("/api/v1/prompt-regression/compare", json={
        "baseline_prompt": "Implement UPI reversal.",
        "candidate_prompt": "Implement UPI reversal with NPCI reconciliation and audit trail.",
    })
    assert r.status_code == 200
    body = r.json()
    assert len(body["metrics"]) == 7
    assert body["overall_verdict"]
    metric_names = {m["metric"] for m in body["metrics"]}
    assert {"overall_score", "latency_ms", "input_tokens"} <= metric_names
