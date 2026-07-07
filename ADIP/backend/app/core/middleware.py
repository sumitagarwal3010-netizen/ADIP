"""HTTP middleware (Phase 16): request logging + latency metrics."""
from __future__ import annotations

import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import get_logger
from app.core.metrics import metrics

logger = get_logger("request")


class RequestContextMiddleware(BaseHTTPMiddleware):
    """Adds a request id, logs each request, and records latency metrics."""

    async def dispatch(self, request: Request, call_next) -> Response:  # noqa: ANN001
        request_id = uuid.uuid4().hex[:12]
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            latency_ms = (time.perf_counter() - start) * 1000
            metrics.record(request.url.path, 500, latency_ms)
            logger.exception("request_id=%s %s %s failed in %.1fms",
                             request_id, request.method, request.url.path, latency_ms)
            raise
        latency_ms = (time.perf_counter() - start) * 1000
        metrics.record(request.url.path, response.status_code, latency_ms)
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Response-Time-ms"] = f"{latency_ms:.1f}"
        logger.info("request_id=%s %s %s -> %d in %.1fms",
                    request_id, request.method, request.url.path, response.status_code, latency_ms)
        return response
