"""Mistral adapter — OpenAI-compatible API (Role 4)."""
from __future__ import annotations

from app.core.config import settings
from app.llm.adapters.openai_compatible import OpenAICompatibleAdapter


class MistralAdapter(OpenAICompatibleAdapter):
    name = "mistral"
    DEFAULT_BASE_URL = "https://api.mistral.ai/v1"

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        super().__init__(
            base_url=base_url or getattr(settings, "mistral_base_url", None) or self.DEFAULT_BASE_URL,
            api_key=api_key or getattr(settings, "mistral_api_key", None),
        )
