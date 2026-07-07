"""Shared FastAPI dependencies for the API layer."""
from __future__ import annotations

from fastapi import Query

from app.core.config import settings
from app.core.pagination import PageParams
from app.db.session import get_db  # re-export for convenience

__all__ = ["get_db", "list_params"]


def list_params(
    page: int = Query(1, ge=1, description="1-based page number."),
    page_size: int = Query(
        settings.default_page_size,
        ge=1,
        le=settings.max_page_size,
        description="Items per page.",
    ),
    sort_by: str | None = Query(None, description="Column to sort by."),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$", description="Sort direction."),
    search: str | None = Query(None, description="Free-text search term."),
) -> PageParams:
    """Parse common list/query parameters into a :class:`PageParams`."""
    return PageParams(
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_dir=sort_dir,
        search=search,
    )
