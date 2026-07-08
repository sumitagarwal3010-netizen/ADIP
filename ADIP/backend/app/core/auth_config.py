"""OIDC / auth configuration — demo, disabled, and production OIDC modes."""
from __future__ import annotations

from enum import Enum
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.config import BACKEND_DIR
from app.core.logging import get_logger

logger = get_logger("auth")


class AuthMode(str, Enum):
    DEMO = "demo"
    OIDC = "oidc"
    DISABLED = "disabled"


class AuthSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    adip_auth_mode: str = Field(default="demo", alias="ADIP_AUTH_MODE")
    oidc_issuer: str | None = Field(default=None, alias="OIDC_ISSUER")
    oidc_client_id: str | None = Field(default=None, alias="OIDC_CLIENT_ID")
    oidc_audience: str | None = Field(default=None, alias="OIDC_AUDIENCE")
    oidc_jwks_uri: str | None = Field(default=None, alias="OIDC_JWKS_URI")
    oidc_group_claim: str = Field(default="groups", alias="OIDC_GROUP_CLAIM")
    oidc_role_claim: str = Field(default="roles", alias="OIDC_ROLE_CLAIM")

    @property
    def mode(self) -> AuthMode:
        val = (self.adip_auth_mode or "demo").lower()
        if val in ("oidc", "entra", "azure_ad"):
            return AuthMode.OIDC
        if val == "disabled":
            return AuthMode.DISABLED
        return AuthMode.DEMO

    @property
    def security_bypassed(self) -> bool:
        return self.mode in (AuthMode.DEMO, AuthMode.DISABLED)

    def warn_if_bypass(self) -> None:
        if self.security_bypassed:
            logger.warning(
                "SECURITY BYPASS ACTIVE: ADIP_AUTH_MODE=%s — authentication/authorization "
                "enforcement is disabled. Use only for local/pre-MVP prototype.",
                self.adip_auth_mode,
            )


@lru_cache
def get_auth_settings() -> AuthSettings:
    settings = AuthSettings()
    settings.warn_if_bypass()
    return settings
