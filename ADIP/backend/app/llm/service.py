"""LLM service / provider factory (Phase A — runtime provider selection).

Resolves a provider adapter from configuration/model registry and exposes a
uniform ``complete``/``stream`` surface with health, timeout and retry. When
``LOCAL_LLM_ENABLED`` is false (default), no real provider is used — callers
fall back to deterministic mock reasoning and NO network call is made.

Future providers (OpenAI, Gemini, LM Studio) are already registered here and
remain plug-in compatible; only Ollama is wired for real execution today.
"""
from __future__ import annotations

from typing import Iterable

from app.core.config import settings
from app.core.logging import get_logger
from app.llm.adapters.base import BaseAdapter
from app.llm.adapters.gemini_adapter import GeminiAdapter
from app.llm.adapters.lmstudio_adapter import LMStudioAdapter
from app.llm.adapters.ollama_adapter import OllamaAdapter
from app.llm.adapters.openai_adapter import OpenAIAdapter
from app.llm.registry import ModelSpec, registry
from app.llm.types import CompletionRequest, CompletionResponse, StreamChunk

logger = get_logger(__name__)

_ADAPTERS: dict[str, type[BaseAdapter]] = {
    "ollama": OllamaAdapter,
    "openai": OpenAIAdapter,
    "lmstudio": LMStudioAdapter,
    "gemini": GeminiAdapter,
}


class LLMService:
    """Resolves and drives provider adapters."""

    def adapter_for(self, model_id: str | None = None) -> BaseAdapter:
        """Return an adapter for the given model (or the configured default)."""
        spec: ModelSpec | None = registry.get(model_id) if model_id else None
        provider = spec.provider if spec else settings.llm_provider
        adapter_cls = _ADAPTERS.get(provider, OllamaAdapter)
        return adapter_cls()

    @property
    def enabled(self) -> bool:
        """True when real local LLM execution is enabled via config."""
        return settings.local_llm_enabled

    def active_provider(self) -> str:
        return settings.llm_provider

    def available_providers(self) -> dict[str, bool]:
        """Report each provider's availability (health-checked)."""
        return {name: cls().is_available() for name, cls in _ADAPTERS.items()}

    def health(self) -> dict[str, object]:
        """Health snapshot for the active provider and configuration."""
        adapter = self.adapter_for()
        available = adapter.is_available()
        return {
            "local_llm_enabled": self.enabled,
            "active_provider": self.active_provider(),
            "model": settings.ollama_model,
            "available": available,
            "base_url": getattr(adapter, "base_url", None),
            "timeout_seconds": settings.llm_timeout_seconds,
        }

    # --- execution surface (used by real reasoners; mock path never calls this) ---
    def complete(self, request: CompletionRequest) -> CompletionResponse:
        adapter = self.adapter_for(request.model)
        return adapter.complete(request)

    def stream(self, request: CompletionRequest) -> Iterable[StreamChunk]:
        adapter = self.adapter_for(request.model)
        return adapter.stream(request)


llm_service = LLMService()
