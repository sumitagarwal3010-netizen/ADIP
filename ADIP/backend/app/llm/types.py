"""Core LLM abstraction types (Phase 11 — infrastructure only).

These are provider-agnostic data structures. No LLM SDK is imported and no
network calls are made anywhere in this package; adapters are stubs that raise
``NotImplementedError`` until a real integration is wired in a future phase.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Iterable, Optional, Protocol, runtime_checkable


class Role(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


@dataclass
class Message:
    role: Role
    content: str
    name: Optional[str] = None


@dataclass
class CompletionRequest:
    """A provider-agnostic completion request."""

    model: str
    messages: list[Message]
    temperature: float = 0.2
    max_tokens: Optional[int] = None
    stream: bool = False
    stop: Optional[list[str]] = None
    metadata: dict[str, str] = field(default_factory=dict)


@dataclass
class Usage:
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0


@dataclass
class CompletionResponse:
    """A provider-agnostic completion response."""

    model: str
    content: str
    finish_reason: str = "stop"
    usage: Usage = field(default_factory=Usage)
    provider: str = "unknown"


@dataclass
class StreamChunk:
    """A single streamed token/delta."""

    delta: str
    done: bool = False


@runtime_checkable
class LLMProvider(Protocol):
    """Interface every LLM adapter must implement.

    Implementations are responsible for translating :class:`CompletionRequest`
    into their provider's wire format and back. This project ships only stubs.
    """

    name: str

    def is_available(self) -> bool:
        """Return True if the provider is configured and reachable."""
        ...

    def complete(self, request: CompletionRequest) -> CompletionResponse:
        """Perform a (non-streaming) completion."""
        ...

    def stream(self, request: CompletionRequest) -> Iterable[StreamChunk]:
        """Perform a streaming completion, yielding chunks."""
        ...
