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
            ModelSpec("qwen2.5:7b", "ollama", 32768, "Local Qwen 2.5 7B via Ollama"),
            ModelSpec("mistral:7b", "ollama", 8192, "Local Mistral 7B via Ollama"),
            ModelSpec("gpt-4o-mini", "openai", 128000, "OpenAI GPT-4o mini (future adapter)"),
            ModelSpec("local-model", "lmstudio", 8192, "LM Studio local model (future adapter)"),
            ModelSpec("gemini-1.5-flash", "gemini", 1000000, "Google Gemini 1.5 Flash (future adapter)"),
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
