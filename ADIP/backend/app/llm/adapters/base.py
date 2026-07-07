"""Base adapter scaffolding (Phase 11 — infrastructure only)."""
from __future__ import annotations

from typing import Iterable

from app.llm.types import CompletionRequest, CompletionResponse, StreamChunk


class BaseAdapter:
    """Common base for provider adapters.

    Concrete adapters are intentionally stubs: they declare the interface and
    configuration surface but perform no network calls and import no SDK. A
    future phase implements ``complete``/``stream`` against the real provider.
    """

    name: str = "base"

    def __init__(self, base_url: str | None = None, api_key: str | None = None) -> None:
        self.base_url = base_url
        self.api_key = api_key

    def is_available(self) -> bool:  # pragma: no cover - stub
        return False

    def complete(self, request: CompletionRequest) -> CompletionResponse:  # pragma: no cover - stub
        raise NotImplementedError(
            f"{self.name} adapter is a scaffold; real integration is a future phase."
        )

    def stream(self, request: CompletionRequest) -> Iterable[StreamChunk]:  # pragma: no cover - stub
        raise NotImplementedError(
            f"{self.name} adapter streaming is a scaffold; real integration is a future phase."
        )
