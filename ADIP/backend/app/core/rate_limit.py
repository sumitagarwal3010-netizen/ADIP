"""Rate limiting (Role 7 — Backend / Role 11 — Security).

An in-process token-bucket rate limiter middleware, keyed by client IP. Disabled
by default (``RATE_LIMIT_ENABLED=false``) so local dev and the test suite are
unaffected. Enable in production; for multi-replica deployments, back the bucket
store with Redis (seam noted below).

Returns HTTP 429 with a ``Retry-After`` header when the limit is exceeded.
"""
from __future__ import annotations

import threading
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class _TokenBucket:
    __slots__ = ("tokens", "updated")

    def __init__(self, tokens: float, updated: float) -> None:
        self.tokens = tokens
        self.updated = updated


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Token-bucket limiter: ``rate`` requests/second with ``burst`` capacity.

    For horizontal scaling, replace the in-process ``_buckets`` dict with a shared
    store (e.g. Redis INCR + EXPIRE); the algorithm is unchanged.
    """

    def __init__(self, app, *, rate: float = 10.0, burst: int = 20,
                 exempt_paths: tuple[str, ...] = ("/health", "/metrics")) -> None:
        super().__init__(app)
        self.rate = rate
        self.burst = burst
        self.exempt_paths = exempt_paths
        self._buckets: dict[str, _TokenBucket] = {}
        self._lock = threading.Lock()

    def _client_key(self, request: Request) -> str:
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            return fwd.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _allow(self, key: str) -> tuple[bool, float]:
        now = time.monotonic()
        with self._lock:
            bucket = self._buckets.get(key)
            if bucket is None:
                self._buckets[key] = _TokenBucket(self.burst - 1, now)
                return True, 0.0
            # Refill based on elapsed time.
            elapsed = now - bucket.updated
            bucket.tokens = min(self.burst, bucket.tokens + elapsed * self.rate)
            bucket.updated = now
            if bucket.tokens >= 1:
                bucket.tokens -= 1
                return True, 0.0
            retry_after = (1 - bucket.tokens) / self.rate
            return False, retry_after

    async def dispatch(self, request: Request, call_next) -> Response:  # noqa: ANN001
        if any(request.url.path.startswith(p) for p in self.exempt_paths):
            return await call_next(request)
        allowed, retry_after = self._allow(self._client_key(request))
        if not allowed:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please retry later."},
                headers={"Retry-After": str(max(1, int(retry_after) + 1))},
            )
        return await call_next(request)
