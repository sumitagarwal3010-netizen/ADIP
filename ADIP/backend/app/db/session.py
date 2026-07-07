"""Database engine and session management.

Uses a single configured engine. On SQLite (the dev/test default) we enable
foreign-key enforcement and the correct threading flag; on PostgreSQL (prod)
we use sane pool settings.
"""
from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


def _build_engine() -> Engine:
    if settings.is_sqlite:
        engine = create_engine(
            settings.database_url,
            echo=settings.sql_echo,
            connect_args={"check_same_thread": False},
        )

        # Enforce foreign keys on SQLite (off by default).
        @event.listens_for(engine, "connect")
        def _set_sqlite_pragma(dbapi_connection, _connection_record):  # noqa: ANN001
            cursor = dbapi_connection.cursor()
            cursor.execute("PRAGMA foreign_keys=ON")
            cursor.close()

        return engine

    # PostgreSQL / other production databases.
    return create_engine(
        settings.database_url,
        echo=settings.sql_echo,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
    )


engine: Engine = _build_engine()

SessionLocal = sessionmaker(
    bind=engine, autocommit=False, autoflush=False, expire_on_commit=False
)


def get_db() -> Iterator[Session]:
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
