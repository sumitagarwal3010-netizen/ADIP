"""Meta Llama adapter — local execution via Ollama (Role 4)."""
from __future__ import annotations

from app.llm.adapters.ollama_adapter import OllamaAdapter


class LlamaAdapter(OllamaAdapter):
    name = "llama"
