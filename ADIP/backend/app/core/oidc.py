"""OIDC token validation interface — JWKS abstraction without live IdP dependency."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from app.core.auth_config import AuthMode, get_auth_settings


@dataclass
class UserContext:
    user_id: str
    username: str
    email: str = ""
    display_name: str = ""
    roles: list[str] = field(default_factory=list)
    groups: list[str] = field(default_factory=list)
    claims: dict[str, Any] = field(default_factory=dict)


@dataclass
class TokenValidationResult:
    valid: bool
    user: UserContext | None = None
    error: str | None = None
    bypassed: bool = False


class JwksClient:
    """JWKS fetch abstraction — mockable for tests."""

    def __init__(self, jwks_uri: str | None = None) -> None:
        self.jwks_uri = jwks_uri

    def fetch_keys(self) -> dict:
        if not self.jwks_uri:
            return {"keys": []}
        # Production: HTTP GET jwks_uri. Not required for mock/demo tests.
        return {"keys": [], "uri": self.jwks_uri}


class OidcValidator:
    def __init__(self) -> None:
        self.settings = get_auth_settings()
        self.jwks = JwksClient(self.settings.oidc_jwks_uri or (
            f"{self.settings.oidc_issuer}/.well-known/jwks.json" if self.settings.oidc_issuer else None
        ))

    def validate_token(self, token: str | None) -> TokenValidationResult:
        if self.settings.mode in (AuthMode.DEMO, AuthMode.DISABLED):
            return TokenValidationResult(
                valid=True,
                bypassed=True,
                user=UserContext(user_id="demo-user", username="demo", display_name="Demo User", roles=["admin"]),
            )
        if not token:
            return TokenValidationResult(valid=False, error="Missing bearer token")
        if self.settings.mode == AuthMode.OIDC and not self.settings.oidc_issuer:
            return TokenValidationResult(valid=False, error="OIDC issuer not configured")
        # Production seam: decode JWT against JWKS keys from self.jwks.fetch_keys()
        return TokenValidationResult(valid=False, error="OIDC validation not wired — configure IdP integration")

    def map_claims(self, claims: dict[str, Any]) -> UserContext:
        s = self.settings
        return UserContext(
            user_id=str(claims.get("sub", "")),
            username=str(claims.get("preferred_username", claims.get("sub", ""))),
            email=str(claims.get("email", "")),
            display_name=str(claims.get("name", "")),
            groups=list(claims.get(s.oidc_group_claim, []) or []),
            roles=list(claims.get(s.oidc_role_claim, []) or []),
            claims=claims,
        )


oidc_validator = OidcValidator()
