"""Ollama adapter (Phase 11 — scaffold only, no runtime dependency).

Describes how a local Ollama server would be reached. No `ollama`/`httpx` calls
are made here; methods raise ``NotImplementedError`` until wired up.
"""
from __future__ import annotations

from app.llm.adapters.base import BaseAdapter


class OllamaAdapter(BaseAdapter):
    name = "ollama"

    DEFAULT_BASE_URL = "http://localhost:11434"

    def __init__(self, base_url: str | None = None) -> None:
        super().__init__(base_url=base_url or self.DEFAULT_BASE_URL)

    # complete()/stream() inherited as NotImplementedError scaffolds.
