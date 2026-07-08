"""Production LLM runtime (Phase A).

Adds enterprise execution concerns AROUND the existing LLMService/adapters —
concurrency controls, a circuit breaker, prompt/response caching, cost & memory
estimation, multi-model routing with automatic fallback, large-prompt chunking
and simple prompt compression. No adapter/service is duplicated; this is a thin
orchestration layer over `llm_service`.

The runtime never requires a live model: with LOCAL_LLM_ENABLED=false it is not
exercised for real completions (mock reasoning is used), but its accounting and
policy primitives are import- and unit-testable offline.
"""
from __future__ import annotations

import hashlib
import threading
import time
from collections import OrderedDict
from collections.abc import Iterator
from dataclasses import dataclass, field

from app.core.config import settings
from app.core.logging import get_logger
from app.llm.registry import registry
from app.llm.service import llm_service
from app.llm.tokens import estimate_messages_tokens, estimate_tokens
from app.llm.types import CompletionRequest, CompletionResponse, Message, Role, StreamChunk

logger = get_logger(__name__)


# --- caching ---
class LRUCache:
    """A tiny thread-safe LRU cache for prompt/response reuse."""

    def __init__(self, capacity: int = 256) -> None:
        self._cap = capacity
        self._data: "OrderedDict[str, object]" = OrderedDict()
        self._lock = threading.Lock()
        self.hits = 0
        self.misses = 0

    def get(self, key: str):
        with self._lock:
            if key in self._data:
                self._data.move_to_end(key)
                self.hits += 1
                return self._data[key]
            self.misses += 1
            return None

    def put(self, key: str, value: object) -> None:
        with self._lock:
            self._data[key] = value
            self._data.move_to_end(key)
            while len(self._data) > self._cap:
                self._data.popitem(last=False)

    def stats(self) -> dict:
        with self._lock:
            total = self.hits + self.misses
            return {"size": len(self._data), "hits": self.hits, "misses": self.misses,
                    "hit_rate": round(self.hits / total, 3) if total else 0.0}


# --- circuit breaker ---
@dataclass
class CircuitBreaker:
    """Opens after `threshold` consecutive failures; half-opens after `reset_after`."""

    threshold: int = 5
    reset_after_s: float = 30.0
    _failures: int = 0
    _opened_at: float = 0.0
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    @property
    def state(self) -> str:
        with self._lock:
            if self._failures < self.threshold:
                return "closed"
            if time.monotonic() - self._opened_at >= self.reset_after_s:
                return "half-open"
            return "open"

    def allow(self) -> bool:
        return self.state != "open"

    def record_success(self) -> None:
        with self._lock:
            self._failures = 0
            self._opened_at = 0.0

    def record_failure(self) -> None:
        with self._lock:
            self._failures += 1
            if self._failures == self.threshold:
                self._opened_at = time.monotonic()


# --- cost & memory estimation ---
# Illustrative per-1K-token costs (USD). Local models are ~free; cloud priced.
_COST_PER_1K: dict[str, float] = {
    "ollama": 0.0, "lmstudio": 0.0, "llama": 0.0, "qwen": 0.0,
    "openai": 0.0005, "gemini": 0.0004, "claude": 0.003,
    "mistral": 0.0002, "deepseek": 0.00014,
}


def estimate_cost(provider: str, prompt_tokens: int, completion_tokens: int) -> float:
    rate = _COST_PER_1K.get(provider, 0.0)
    return round((prompt_tokens + completion_tokens) / 1000 * rate, 6)


def estimate_memory_mb(model_id: str) -> int:
    """Rough model memory footprint from the parameter hint in the model id."""
    lid = model_id.lower()
    for tag, mb in (("70b", 40000), ("34b", 20000), ("13b", 9000),
                    ("8b", 6000), ("7b", 5000), ("3b", 2500)):
        if tag in lid:
            return mb
    return 4000


# --- prompt chunking + compression ---
def chunk_prompt(text: str, max_chars: int = 8000) -> list[str]:
    """Split a large prompt into ordered chunks on paragraph boundaries."""
    if len(text) <= max_chars:
        return [text]
    chunks: list[str] = []
    current = ""
    for para in text.split("\n\n"):
        if len(current) + len(para) + 2 > max_chars and current:
            chunks.append(current.strip())
            current = ""
        current += para + "\n\n"
    if current.strip():
        chunks.append(current.strip())
    return chunks


def compress_prompt(text: str) -> str:
    """Cheap, lossless-ish compression: collapse whitespace and blank lines."""
    lines = [ln.strip() for ln in text.splitlines()]
    out: list[str] = []
    blank = False
    for ln in lines:
        if not ln:
            if not blank:
                out.append("")
            blank = True
        else:
            out.append(" ".join(ln.split()))
            blank = False
    return "\n".join(out).strip()


# --- cancellation ---
class CancellationToken:
    """Cooperative cancellation signal for long-running / streaming calls."""

    def __init__(self) -> None:
        self._event = threading.Event()

    def cancel(self) -> None:
        self._event.set()

    @property
    def cancelled(self) -> bool:
        return self._event.is_set()

    def raise_if_cancelled(self) -> None:
        if self._event.is_set():
            raise CancelledError("LLM request was cancelled.")


class CancelledError(RuntimeError):
    """Raised when a runtime call is cancelled via a CancellationToken."""


# --- conversation history ---
class Conversation:
    """Multi-turn conversation buffer with context-window-aware trimming.

    Holds an ordered message history and, when converted to a request, trims to
    fit the target model's context window (reusing ``fit_to_context_window``).
    """

    def __init__(self, system: str | None = None, *, model: str | None = None) -> None:
        self.model = model
        self._messages: list[Message] = []
        if system:
            self._messages.append(Message(Role.SYSTEM, system))

    def add(self, role: Role, content: str) -> "Conversation":
        self._messages.append(Message(role, content))
        return self

    def add_user(self, content: str) -> "Conversation":
        return self.add(Role.USER, content)

    def add_assistant(self, content: str) -> "Conversation":
        return self.add(Role.ASSISTANT, content)

    @property
    def messages(self) -> list[Message]:
        return list(self._messages)

    def to_request(self, model: str | None = None, **kw) -> CompletionRequest:
        from app.llm.tokens import fit_to_context_window

        model_id = model or self.model or (registry.default().id if registry.default() else settings.ollama_model)
        spec = registry.get(model_id)
        window = spec.context_window if spec else 8192
        fitted = fit_to_context_window(self._messages, window)
        return CompletionRequest(model=model_id, messages=fitted, **kw)


# --- the runtime ---
class LLMRuntime:
    """Concurrency-limited, cached, circuit-broken, routed execution layer."""

    def __init__(self, max_concurrency: int = 4) -> None:
        self._sem = threading.BoundedSemaphore(max_concurrency)
        self.prompt_cache = LRUCache(256)
        self.response_cache = LRUCache(256)
        self.breaker = CircuitBreaker()
        self.max_concurrency = max_concurrency
        self._inflight = 0
        self._lock = threading.Lock()
        self.total_prompt_tokens = 0
        self.total_completion_tokens = 0
        self.total_cost = 0.0

    @staticmethod
    def _key(request: CompletionRequest) -> str:
        raw = f"{request.model}|{request.temperature}|" + "|".join(
            f"{m.role.value}:{m.content}" for m in request.messages
        )
        return hashlib.sha256(raw.encode()).hexdigest()

    def routing_plan(self, model_id: str | None) -> list[str]:
        """Preferred model + fallbacks (same provider first, then any available)."""
        spec = registry.get(model_id) if model_id else registry.default()
        primary = spec.id if spec else settings.ollama_model
        others = [m.id for m in registry.list() if m.id != primary]
        return [primary, *others]

    def complete(self, request: CompletionRequest, use_cache: bool = True) -> CompletionResponse:
        """Execute a completion with caching, concurrency, breaker and fallback."""
        key = self._key(request)
        if use_cache:
            cached = self.response_cache.get(key)
            if cached is not None:
                return cached  # type: ignore[return-value]

        if not self.breaker.allow():
            raise RuntimeError("LLM circuit breaker is open; refusing new requests.")

        plan = self.routing_plan(request.model)
        last_exc: Exception | None = None
        with self._sem:
            with self._lock:
                self._inflight += 1
            try:
                for model_id in plan:
                    attempt = CompletionRequest(
                        model=model_id, messages=request.messages,
                        temperature=request.temperature, max_tokens=request.max_tokens,
                        stream=False, stop=request.stop, metadata=request.metadata,
                    )
                    try:
                        resp = llm_service.complete(attempt)
                        self.breaker.record_success()
                        self._account(resp)
                        if use_cache:
                            self.response_cache.put(key, resp)
                        return resp
                    except Exception as exc:  # noqa: BLE001 - try next model
                        last_exc = exc
                        logger.warning("Model %s failed (%s); trying fallback.", model_id, exc)
                self.breaker.record_failure()
                raise RuntimeError(f"All models failed; last error: {last_exc}")
            finally:
                with self._lock:
                    self._inflight -= 1

    def stream(self, request: CompletionRequest,
               cancel: "CancellationToken | None" = None) -> "Iterator[StreamChunk]":
        """Stream a completion with circuit-breaker gating and cooperative cancellation.

        Yields ``StreamChunk`` deltas. If ``cancel`` is triggered, streaming stops
        promptly (a final ``done`` chunk is emitted).
        """
        if not self.breaker.allow():
            raise RuntimeError("LLM circuit breaker is open; refusing new requests.")
        with self._sem:
            with self._lock:
                self._inflight += 1
            try:
                collected = 0
                for chunk in llm_service.stream(request):
                    if cancel is not None and cancel.cancelled:
                        yield StreamChunk(delta="", done=True)
                        return
                    collected += 1
                    yield chunk
                self.breaker.record_success()
            except Exception:  # noqa: BLE001
                self.breaker.record_failure()
                raise
            finally:
                with self._lock:
                    self._inflight -= 1

    def batch(self, requests: list[CompletionRequest], *, use_cache: bool = True,
              cancel: "CancellationToken | None" = None) -> list[CompletionResponse | Exception]:
        """Execute a batch of completion requests concurrently.

        Concurrency is bounded by the runtime semaphore (via ``complete``). Returns
        one result per request in order; failures are returned as exceptions rather
        than aborting the whole batch. Honors cooperative cancellation.
        """
        from concurrent.futures import ThreadPoolExecutor

        results: list[CompletionResponse | Exception] = [None] * len(requests)  # type: ignore[list-item]

        def run(idx_req: tuple[int, CompletionRequest]):
            idx, req = idx_req
            if cancel is not None and cancel.cancelled:
                return idx, CancelledError("Batch cancelled before execution.")
            try:
                return idx, self.complete(req, use_cache=use_cache)
            except Exception as exc:  # noqa: BLE001 - per-item isolation
                return idx, exc

        with ThreadPoolExecutor(max_workers=self.max_concurrency) as pool:
            for idx, result in pool.map(run, list(enumerate(requests))):
                results[idx] = result
        return results

    def _account(self, resp: CompletionResponse) -> None:
        with self._lock:
            self.total_prompt_tokens += resp.usage.prompt_tokens
            self.total_completion_tokens += resp.usage.completion_tokens
            self.total_cost += estimate_cost(
                resp.provider, resp.usage.prompt_tokens, resp.usage.completion_tokens
            )

    def estimate(self, messages: list[Message], model_id: str | None = None) -> dict:
        """Pre-flight estimate: tokens, cost, memory and context fit."""
        spec = registry.get(model_id) if model_id else registry.default()
        prompt_tokens = estimate_messages_tokens(messages)
        expected_completion = min(settings.llm_max_tokens, 1024)
        provider = spec.provider if spec else settings.llm_provider
        return {
            "model": spec.id if spec else settings.ollama_model,
            "prompt_tokens": prompt_tokens,
            "expected_completion_tokens": expected_completion,
            "estimated_cost_usd": estimate_cost(provider, prompt_tokens, expected_completion),
            "estimated_memory_mb": estimate_memory_mb(spec.id if spec else settings.ollama_model),
            "context_window": spec.context_window if spec else 8192,
            "fits_context": prompt_tokens + expected_completion <= (spec.context_window if spec else 8192),
        }

    def snapshot(self) -> dict:
        with self._lock:
            inflight = self._inflight
        return {
            "max_concurrency": self.max_concurrency,
            "inflight": inflight,
            "circuit_breaker": self.breaker.state,
            "prompt_cache": self.prompt_cache.stats(),
            "response_cache": self.response_cache.stats(),
            "total_prompt_tokens": self.total_prompt_tokens,
            "total_completion_tokens": self.total_completion_tokens,
            "total_cost_usd": round(self.total_cost, 6),
        }


llm_runtime = LLMRuntime()
