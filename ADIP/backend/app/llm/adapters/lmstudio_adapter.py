"""LM Studio adapter (Phase 11 — future scaffold, no runtime dependency).

LM Studio exposes an OpenAI-compatible local server; the real implementation
would reuse the OpenAI wire format against the local base URL.
"""
from __future__ import annotations

from app.llm.adapters.base import BaseAdapter


class LMStudioAdapter(BaseAdapter):
    name = "lmstudio"

    DEFAULT_BASE_URL = "http://localhost:1234/v1"

    def __init__(self, base_url: str | None = None) -> None:
        super().__init__(base_url=base_url or self.DEFAULT_BASE_URL)

    # complete()/stream() inherited as NotImplementedError scaffolds.
