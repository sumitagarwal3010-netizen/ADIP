"""Anthropic Claude adapter scaffold (Role 4).

Claude uses the Messages API, not OpenAI chat-completions. This adapter exposes
the same ``BaseAdapter`` surface; wire ``ANTHROPIC_API_KEY`` to enable real
calls in a future phase. Today it participates in provider registry health
reporting without adding SDK dependencies.
"""
from __future__ import annotations

from app.core.config import settings
from app.llm.adapters.base import BaseAdapter


class ClaudeAdapter(BaseAdapter):
    name = "claude"
    DEFAULT_BASE_URL = "https://api.anthropic.com/v1"

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        super().__init__(
            base_url=base_url or getattr(settings, "anthropic_base_url", None) or self.DEFAULT_BASE_URL,
            api_key=api_key or getattr(settings, "anthropic_api_key", None),
        )

    def is_available(self) -> bool:
        return bool(self.api_key)
