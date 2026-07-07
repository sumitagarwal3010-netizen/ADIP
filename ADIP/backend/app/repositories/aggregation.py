"""Aggregation helpers built on top of the existing generic repository.

Phase 3 assembles business DTOs from many tables. To avoid duplicating query
logic, it reuses :class:`BaseRepository.list` via a tiny bound-repository
factory rather than writing new SQL per entity.
"""
from __future__ import annotations

from typing import Any, TypeVar

from sqlalchemy.orm import Session

from app.db.base_class import Base
from app.repositories.base import BaseRepository

ModelT = TypeVar("ModelT", bound=Base)

# Fetch cap for aggregation reads (seed sizes are well under this).
AGG_LIMIT = 1000


def repo_for(db: Session, model: type[ModelT]) -> BaseRepository[ModelT]:
    """Return a generic repository bound to ``model`` (reuses BaseRepository)."""
    repo_cls = type(f"{model.__name__}AggRepo", (BaseRepository,), {"model": model})
    return repo_cls(db)


def fetch_all(
    db: Session,
    model: type[ModelT],
    filters: dict[str, Any] | None = None,
    *,
    sort_by: str | None = None,
    sort_dir: str = "asc",
    limit: int = AGG_LIMIT,
) -> list[ModelT]:
    """Fetch all rows of ``model`` matching ``filters`` (reuses repository.list)."""
    items, _ = repo_for(db, model).list(
        offset=0, limit=limit, filters=filters, sort_by=sort_by, sort_dir=sort_dir
    )
    return items
