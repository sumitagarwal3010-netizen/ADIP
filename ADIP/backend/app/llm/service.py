"""LLM service / provider factory (Phase 11 — infrastructure only).

Selects an adapter for a model via the registry. Because adapters are scaffolds,
this wires the abstraction end-to-end without enabling any runtime LLM call.
"""
from __future__ import annotations

from app.llm.adapters.base import BaseAdapter
from app.llm.adapters.gemini_adapter import GeminiAdapter
from app.llm.adapters.lmstudio_adapter import LMStudioAdapter
from app.llm.adapters.ollama_adapter import OllamaAdapter
from app.llm.adapters.openai_adapter import OpenAIAdapter
from app.llm.registry import ModelSpec, registry

_ADAPTERS: dict[str, type[BaseAdapter]] = {
    "ollama": OllamaAdapter,
    "openai": OpenAIAdapter,
    "lmstudio": LMStudioAdapter,
    "gemini": GeminiAdapter,
}


class LLMService:
    """Resolves a provider adapter for a requested model."""

    def adapter_for(self, model_id: str | None = None) -> BaseAdapter:
        spec: ModelSpec | None = registry.get(model_id) if model_id else registry.default()
        if spec is None:
            spec = registry.default()
        adapter_cls = _ADAPTERS.get(spec.provider, OllamaAdapter)
        return adapter_cls()

    def available_providers(self) -> dict[str, bool]:
        """Report configured providers and whether each is available (all False as scaffolds)."""
        return {name: cls().is_available() for name, cls in _ADAPTERS.items()}


llm_service = LLMService()
