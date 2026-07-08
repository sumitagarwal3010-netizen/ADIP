"""FastAPI application entrypoint.

Wires configuration, logging, CORS, exception handling and the versioned API
router. Run locally with::

    uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import ADIPError
from app.core.logging import configure_logging, get_logger
from app.core.metrics import metrics
from app.core.middleware import RequestContextMiddleware
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.auth_config import get_auth_settings

configure_logging()
logger = get_logger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        description=settings.app_description,
        version=settings.app_version,
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestContextMiddleware)
    from app.core.auth_middleware import AuthMiddleware
    app.add_middleware(AuthMiddleware)
    get_auth_settings().warn_if_bypass()
    # Optional rate limiting (off by default; enable in production).
    if settings.rate_limit_enabled:
        from app.core.rate_limit import RateLimitMiddleware
        app.add_middleware(
            RateLimitMiddleware,
            rate=settings.rate_limit_rps,
            burst=settings.rate_limit_burst,
        )

    @app.exception_handler(ADIPError)
    async def _handle_adip_error(_request: Request, exc: ADIPError) -> JSONResponse:
        logger.warning("Domain error (%s): %s", exc.status_code, exc.message)
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        """Liveness probe."""
        return {"status": "ok", "app": settings.app_name, "version": settings.app_version}

    @app.get("/ready", tags=["meta"])
    def readiness() -> dict:
        """Readiness probe — verifies database connectivity."""
        from sqlalchemy import text
        from app.db.session import SessionLocal

        db_ok = False
        try:
            with SessionLocal() as db:
                db.execute(text("SELECT 1"))
                db_ok = True
        except Exception as exc:  # noqa: BLE001
            logger.warning("Readiness check failed: %s", exc)
        body = {
            "status": "ok" if db_ok else "degraded",
            "database": "ok" if db_ok else "unavailable",
            "environment": settings.environment,
        }
        if db_ok:
            return body
        return JSONResponse(status_code=503, content=body)

    @app.get(f"{settings.api_v1_prefix}/health", tags=["meta"])
    def api_health() -> dict[str, str]:
        """Versioned liveness probe."""
        return {"status": "ok", "environment": settings.environment}

    @app.get("/metrics", tags=["meta"])
    def get_metrics() -> dict:
        """In-process request metrics (counts, errors, avg latency, top paths)."""
        return metrics.snapshot()

    @app.get("/metrics/prometheus", tags=["meta"])
    def get_metrics_prometheus() -> Response:
        """Prometheus text exposition of request metrics (for scraping)."""
        return Response(content=metrics.prometheus_format(), media_type="text/plain; version=0.0.4")

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    logger.info("%s v%s initialized (env=%s)", settings.app_name, settings.app_version, settings.environment)
    return app


app = create_app()
