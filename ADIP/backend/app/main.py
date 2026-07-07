"""FastAPI application entrypoint.

Wires configuration, logging, CORS, exception handling and the versioned API
router. Run locally with::

    uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import ADIPError
from app.core.logging import configure_logging, get_logger
from app.core.metrics import metrics
from app.core.middleware import RequestContextMiddleware

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
    # Request logging + latency metrics (Phase 16).
    app.add_middleware(RequestContextMiddleware)

    @app.exception_handler(ADIPError)
    async def _handle_adip_error(_request: Request, exc: ADIPError) -> JSONResponse:
        logger.warning("Domain error (%s): %s", exc.status_code, exc.message)
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        """Liveness probe."""
        return {"status": "ok", "app": settings.app_name, "version": settings.app_version}

    @app.get(f"{settings.api_v1_prefix}/health", tags=["meta"])
    def api_health() -> dict[str, str]:
        """Versioned liveness probe."""
        return {"status": "ok", "environment": settings.environment}

    @app.get("/metrics", tags=["meta"])
    def get_metrics() -> dict:
        """In-process request metrics (counts, errors, avg latency, top paths)."""
        return metrics.snapshot()

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    logger.info("%s v%s initialized (env=%s)", settings.app_name, settings.app_version, settings.environment)
    return app


app = create_app()
