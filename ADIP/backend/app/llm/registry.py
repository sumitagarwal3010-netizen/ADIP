"""Model registry (Phase 11 — infrastructure only).

A declarative catalog of models and which provider serves them. No SDKs are
imported; this simply describes available models for future wiring.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ModelSpec:
    id: str
    provider: str
    context_window: int
    description: str
    default: bool = False


class ModelRegistry:
    """In-memory registry of known models."""

    def __init__(self) -> None:
        self._models: dict[str, ModelSpec] = {}
        self._register_defaults()

    def _register_defaults(self) -> None:
        for spec in [
            ModelSpec("llama3.1:8b", "ollama", 8192, "Local Llama 3.1 8B via Ollama", default=True),
            ModelSpec("llama3.1:8b-meta", "llama", 8192, "Meta Llama 3.1 8B (Ollama alias)"),
            ModelSpec("qwen2.5:7b", "qwen", 32768, "Local Qwen 2.5 7B via Ollama"),
            ModelSpec("mistral:7b", "ollama", 8192, "Local Mistral 7B via Ollama"),
            ModelSpec("mistral-small-latest", "mistral", 32768, "Mistral Small (cloud)"),
            ModelSpec("deepseek-chat", "deepseek", 65536, "DeepSeek Chat (cloud)"),
            ModelSpec("gpt-4o-mini", "openai", 128000, "OpenAI GPT-4o mini"),
            ModelSpec("claude-3-5-sonnet-latest", "claude", 200000, "Anthropic Claude 3.5 Sonnet"),
            ModelSpec("local-model", "lmstudio", 8192, "LM Studio local model"),
            ModelSpec("gemini-1.5-flash", "gemini", 1000000, "Google Gemini 1.5 Flash"),
            ModelSpec("qwen-plus", "qwen-cloud", 131072, "Qwen Plus via DashScope"),
        ]:
            self._models[spec.id] = spec

    def register(self, spec: ModelSpec) -> None:
        self._models[spec.id] = spec

    def get(self, model_id: str) -> ModelSpec | None:
        return self._models.get(model_id)

    def list(self) -> list[ModelSpec]:
        return list(self._models.values())

    def default(self) -> ModelSpec:
        for spec in self._models.values():
            if spec.default:
                return spec
        return next(iter(self._models.values()))


registry = ModelRegistry()
