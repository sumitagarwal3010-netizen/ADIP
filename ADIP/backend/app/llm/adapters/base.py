"""Base adapter scaffolding + shared timeout/retry helpers (Phase A).

Adapters that are not yet wired inherit the ``NotImplementedError`` stubs.
The real adapters (e.g. Ollama) override ``complete``/``stream``/``is_available``
and may reuse ``_retry`` for a simple, bounded retry policy.
"""
from __future__ import annotations

import time
from typing import Callable, Iterable, TypeVar

from app.core.logging import get_logger
from app.llm.types import CompletionRequest, CompletionResponse, StreamChunk

logger = get_logger(__name__)

T = TypeVar("T")


class LLMProviderError(RuntimeError):
    """Raised when a provider call fails after exhausting retries."""


class BaseAdapter:
    """Common base for provider adapters.

    Un-wired adapters remain stubs (raise ``NotImplementedError``). Concrete
    adapters override the methods and may use ``_retry`` for resilience.
    """

    name: str = "base"

    def __init__(
        self,
        base_url: str | None = None,
        api_key: str | None = None,
        timeout_seconds: int = 60,
        max_retries: int = 2,
    ) -> None:
        self.base_url = base_url
        self.api_key = api_key
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries

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

    # --- shared resilience helper ---
    def _retry(self, fn: Callable[[], T]) -> T:
        """Run ``fn`` with a bounded retry policy and exponential backoff."""
        last_exc: Exception | None = None
        for attempt in range(self.max_retries + 1):
            try:
                return fn()
            except Exception as exc:  # noqa: BLE001 - adapters translate to LLMProviderError
                last_exc = exc
                if attempt < self.max_retries:
                    backoff = 0.5 * (2 ** attempt)
                    logger.warning(
                        "%s call failed (attempt %d/%d): %s — retrying in %.1fs",
                        self.name, attempt + 1, self.max_retries + 1, exc, backoff,
                    )
                    time.sleep(backoff)
        raise LLMProviderError(f"{self.name} call failed after {self.max_retries + 1} attempts: {last_exc}")
