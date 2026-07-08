"""Retry framework (Role 7 — Backend utilities).

A small, dependency-free retry helper with exponential backoff + jitter, usable
as a decorator or a direct call. Complements the LLM adapter's internal retry and
the runtime circuit breaker; use this for other flaky operations (external HTTP,
transient DB errors).
"""
from __future__ import annotations

import functools
import random
import time
from collections.abc import Callable, Iterable
from typing import TypeVar

from app.core.logging import get_logger

logger = get_logger("retry")

T = TypeVar("T")


class RetryPolicy:
    """Configurable retry policy with exponential backoff and jitter."""

    def __init__(self, *, attempts: int = 3, base_delay: float = 0.2,
                 max_delay: float = 5.0, jitter: float = 0.1,
                 retry_on: Iterable[type[BaseException]] = (Exception,)) -> None:
        if attempts < 1:
            raise ValueError("attempts must be >= 1")
        self.attempts = attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.jitter = jitter
        self.retry_on = tuple(retry_on)

    def delay_for(self, attempt: int) -> float:
        """Backoff delay for a 1-based attempt index."""
        raw = min(self.max_delay, self.base_delay * (2 ** (attempt - 1)))
        return raw + random.uniform(0, self.jitter)

    def run(self, fn: Callable[[], T]) -> T:
        last_exc: BaseException | None = None
        for attempt in range(1, self.attempts + 1):
            try:
                return fn()
            except self.retry_on as exc:  # noqa: PERF203
                last_exc = exc
                if attempt == self.attempts:
                    break
                delay = self.delay_for(attempt)
                logger.warning("Attempt %d/%d failed (%s); retrying in %.2fs.",
                               attempt, self.attempts, exc, delay)
                time.sleep(delay)
        assert last_exc is not None
        raise last_exc


def retry(attempts: int = 3, *, base_delay: float = 0.2, max_delay: float = 5.0,
          jitter: float = 0.1, retry_on: Iterable[type[BaseException]] = (Exception,)):
    """Decorator form of the retry policy."""
    policy = RetryPolicy(attempts=attempts, base_delay=base_delay, max_delay=max_delay,
                         jitter=jitter, retry_on=retry_on)

    def decorator(fn: Callable[..., T]) -> Callable[..., T]:
        @functools.wraps(fn)
        def wrapper(*args, **kwargs) -> T:
            return policy.run(lambda: fn(*args, **kwargs))
        return wrapper

    return decorator
