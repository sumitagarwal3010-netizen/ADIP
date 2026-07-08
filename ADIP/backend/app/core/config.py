"""Application configuration.

Centralized, environment-driven settings using pydantic-settings. The database
URL defaults to a local SQLite file so the backend runs immediately in any
environment; set ``DATABASE_URL`` to a PostgreSQL DSN for production, e.g.::

    DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/adip
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# backend/ directory (two parents up from app/core/config.py).
BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Runtime configuration, overridable via environment variables or .env."""

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- Application metadata ---
    app_name: str = "ADIP Backend"
    app_description: str = (
        "Automation Delivery Integration Platform — REST API foundation for the "
        "AI SDLC copilots, executive intelligence, artifacts and traceability."
    )
    app_version: str = "0.1.0"
    environment: str = Field(default="development")
    debug: bool = Field(default=True)

    # --- API ---
    api_v1_prefix: str = "/api/v1"

    # --- Database ---
    # Postgres-first schema; SQLite default so it runs with zero setup here.
    database_url: str = Field(
        default=f"sqlite:///{(BACKEND_DIR / 'adip.db').as_posix()}",
    )
    sql_echo: bool = Field(default=False)

    # --- CORS (Vite dev server + preview) ---
    cors_origins: list[str] = Field(
        default=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:4173",
            "http://127.0.0.1:4173",
        ]
    )

    # --- Pagination defaults ---
    default_page_size: int = 25
    max_page_size: int = 200

    # --- Local LLM (Phase A) ---
    # When disabled (default), the platform uses deterministic mock reasoning and
    # never makes a network call. Enable to route through a real local provider.
    local_llm_enabled: bool = Field(default=False)
    llm_provider: str = Field(default="ollama")
    ollama_base_url: str = Field(default="http://localhost:11434")
    ollama_model: str = Field(default="llama3.1:8b")
    llm_timeout_seconds: int = Field(default=60)
    llm_max_tokens: int = Field(default=2048)
    llm_temperature: float = Field(default=0.2)
    llm_max_retries: int = Field(default=2)

    # --- Rate limiting (Role 7 / Security). Disabled by default so dev + tests
    # are unaffected; enable in production. ---
    rate_limit_enabled: bool = Field(default=False)
    rate_limit_rps: float = Field(default=10.0)
    rate_limit_burst: int = Field(default=20)

    # --- Auth (enterprise connectivity) ---
    adip_auth_mode: str = Field(default="demo", alias="ADIP_AUTH_MODE")
    connector_sync_enabled: bool = Field(default=True, alias="CONNECTOR_SYNC_ENABLED")
    connector_default_mock: bool = Field(default=True, alias="CONNECTOR_DEFAULT_MOCK")

    @property
    def is_sqlite(self) -> bool:
        return self.database_url.startswith("sqlite")


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (single source of truth)."""
    return Settings()


settings = get_settings()
