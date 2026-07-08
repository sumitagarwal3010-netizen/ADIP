"""Qwen adapter — routes to Ollama local tags or DashScope OpenAI-compatible API (Role 4)."""
from __future__ import annotations

from app.core.config import settings
from app.llm.adapters.ollama_adapter import OllamaAdapter
from app.llm.adapters.openai_compatible import OpenAICompatibleAdapter


class QwenCloudAdapter(OpenAICompatibleAdapter):
    name = "qwen"
    DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1"

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        super().__init__(
            base_url=base_url or getattr(settings, "qwen_base_url", None) or self.DEFAULT_BASE_URL,
            api_key=api_key or getattr(settings, "qwen_api_key", None),
        )


class QwenAdapter(OllamaAdapter):
    """Local Qwen via Ollama (default ``qwen2.5:7b`` tag)."""

    name = "qwen-local"

    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)
        self.name = "qwen"
