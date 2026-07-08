"""Auth middleware hook — enforces OIDC in production mode; bypasses in demo/disabled."""
from __future__ import annotations

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.auth_config import AuthMode, get_auth_settings
from app.core.oidc import oidc_validator


class AuthMiddleware(BaseHTTPMiddleware):
    """Optional auth enforcement controlled by ADIP_AUTH_MODE."""

    PUBLIC_PATHS = {"/health", "/ready", "/metrics", "/metrics/prometheus", "/docs", "/redoc", "/openapi.json"}

    async def dispatch(self, request: Request, call_next) -> Response:
        settings = get_auth_settings()
        path = request.url.path
        if settings.mode != AuthMode.OIDC:
            request.state.auth_bypassed = settings.security_bypassed
            return await call_next(request)
        if any(path == p or path.endswith(p) for p in self.PUBLIC_PATHS):
            return await call_next(request)
        if path.startswith("/api/v1/connectors/catalog"):
            return await call_next(request)
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.removeprefix("Bearer ").strip() if auth_header.startswith("Bearer ") else None
        result = oidc_validator.validate_token(token)
        if not result.valid:
            return JSONResponse(status_code=401, content={"detail": result.error or "Unauthorized"})
        request.state.user = result.user
        request.state.auth_bypassed = False
        return await call_next(request)
