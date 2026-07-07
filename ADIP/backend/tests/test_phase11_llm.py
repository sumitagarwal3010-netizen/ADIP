"""LLM layer tests: abstraction, registry, real Ollama adapter + scaffolds."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.llm import (
    ContextBuilder,
    CompletionRequest,
    Message,
    Role,
    conversation_manager,
    llm_service,
    prompt_manager,
    registry,
)
from app.llm.adapters.ollama_adapter import OllamaAdapter
from app.main import app

client = TestClient(app)
API = "/api/v1"


def test_registry_has_default_and_models():
    assert registry.default() is not None
    ids = {m.id for m in registry.list()}
    assert "llama3.1:8b" in ids


def test_prompt_manager_builds_messages():
    msgs = prompt_manager.build("requirement_analysis", project="Payments", content="Auto-reversal")
    assert len(msgs) == 2
    assert msgs[0].role == Role.SYSTEM
    assert "Payments" in msgs[1].content


def test_conversation_manager_state():
    conv = conversation_manager.get_or_create("t1")
    conversation_manager.append("t1", Role.USER, "hello")
    assert len(conversation_manager.get_or_create("t1").history()) >= 1
    conversation_manager.reset("t1")
    assert conversation_manager.get_or_create("t1").history() == []


def test_service_selects_adapter():
    adapter = llm_service.adapter_for("llama3.1:8b")
    assert adapter.name == "ollama"
    # providers all report unavailable (scaffolds); known set is a subset.
    providers = llm_service.available_providers()
    assert {"ollama", "openai", "lmstudio", "gemini"} <= set(providers.keys())
    assert all(available is False for available in providers.values())


def test_future_adapters_are_scaffolds():
    """OpenAI / Gemini / LM Studio remain scaffolds (raise NotImplementedError)."""
    from app.llm.adapters.gemini_adapter import GeminiAdapter
    from app.llm.adapters.lmstudio_adapter import LMStudioAdapter
    from app.llm.adapters.openai_adapter import OpenAIAdapter
    req = CompletionRequest(model="x", messages=[Message(Role.USER, "hi")])
    for adapter in (OpenAIAdapter(), GeminiAdapter(), LMStudioAdapter()):
        with pytest.raises(NotImplementedError):
            adapter.complete(req)


def test_ollama_adapter_is_real_but_needs_server():
    """Ollama is a real adapter now: raises LLMProviderError when unreachable
    (rather than being a NotImplementedError scaffold)."""
    from app.llm.adapters.base import LLMProviderError
    adapter = OllamaAdapter(timeout_seconds=1, max_retries=0)
    req = CompletionRequest(model="llama3.1:8b", messages=[Message(Role.USER, "hi")])
    if adapter.is_available():
        pytest.skip("Ollama is running locally; skipping the unreachable-path test.")
    with pytest.raises(LLMProviderError):
        adapter.complete(req)


def test_context_builder_uses_sdlc_data():
    from app.db.session import SessionLocal
    from app.models.organization import Project
    from sqlalchemy import select

    with SessionLocal() as db:
        pid = db.scalar(select(Project.id))
        ctx = ContextBuilder(db).requirement_context(pid)
    assert "Project:" in ctx


def test_llm_meta_endpoints():
    models = client.get(f"{API}/llm/models").json()
    assert models["default"]
    providers = client.get(f"{API}/llm/providers").json()
    assert {"ollama", "openai", "lmstudio", "gemini"} <= set(providers["providers"].keys())
    templates = client.get(f"{API}/llm/templates").json()
    assert any(t["name"] == "requirement_analysis" for t in templates["templates"])
