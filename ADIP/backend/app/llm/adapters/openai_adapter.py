"""OpenAI adapter (Phase 11 — future scaffold, no runtime dependency)."""
from __future__ import annotations

from app.llm.adapters.base import BaseAdapter


class OpenAIAdapter(BaseAdapter):
    name = "openai"

    DEFAULT_BASE_URL = "https://api.openai.com/v1"

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        super().__init__(base_url=base_url or self.DEFAULT_BASE_URL, api_key=api_key)

    # complete()/stream() inherited as NotImplementedError scaffolds.
