"""Prompt logging (Phase A).

Lightweight, in-process ring buffer of prompt executions for observability and
the prompt-testing framework. Persistence (DB) is handled separately by the
prompt-testing service; this is a fast, dependency-free operational log.
"""
from __future__ import annotations

import threading
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional


@dataclass
class PromptLogEntry:
    prompt: str
    provider: str
    model: str
    prompt_tokens: int
    completion_tokens: int
    latency_ms: float
    ok: bool
    error: Optional[str] = None
    at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class PromptLog:
    """Thread-safe bounded prompt log."""

    def __init__(self, maxlen: int = 500) -> None:
        self._entries: deque[PromptLogEntry] = deque(maxlen=maxlen)
        self._lock = threading.Lock()

    def record(self, entry: PromptLogEntry) -> None:
        with self._lock:
            self._entries.append(entry)

    def recent(self, limit: int = 50) -> list[PromptLogEntry]:
        with self._lock:
            return list(self._entries)[-limit:][::-1]

    def stats(self) -> dict:
        with self._lock:
            entries = list(self._entries)
        if not entries:
            return {"total": 0, "ok": 0, "errors": 0, "avg_latency_ms": 0.0, "total_tokens": 0}
        ok = sum(1 for e in entries if e.ok)
        avg_latency = sum(e.latency_ms for e in entries) / len(entries)
        total_tokens = sum(e.prompt_tokens + e.completion_tokens for e in entries)
        return {
            "total": len(entries),
            "ok": ok,
            "errors": len(entries) - ok,
            "avg_latency_ms": round(avg_latency, 2),
            "total_tokens": total_tokens,
        }


prompt_log = PromptLog()
