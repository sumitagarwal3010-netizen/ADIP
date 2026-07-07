"""Gemini-compatible adapter (Phase 11 — future scaffold, no runtime dependency).

Targets a Google Gemini-compatible generative endpoint. No SDK is imported and
no network call is made; methods inherit the ``NotImplementedError`` scaffolds.
"""
from __future__ import annotations

from app.llm.adapters.base import BaseAdapter


class GeminiAdapter(BaseAdapter):
    name = "gemini"

    DEFAULT_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        super().__init__(base_url=base_url or self.DEFAULT_BASE_URL, api_key=api_key)

    # complete()/stream() inherited as NotImplementedError scaffolds.
