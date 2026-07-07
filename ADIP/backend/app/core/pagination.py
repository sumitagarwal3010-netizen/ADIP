"""Reusable pagination primitives shared across services and the API layer."""
from __future__ import annotations

from typing import Generic, TypeVar

from pydantic import BaseModel, Field

from app.core.config import settings

T = TypeVar("T")


class PageParams(BaseModel):
    """Common query parameters for list endpoints."""

    page: int = Field(default=1, ge=1, description="1-based page number.")
    page_size: int = Field(
        default=settings.default_page_size,
        ge=1,
        le=settings.max_page_size,
        description="Items per page.",
    )
    sort_by: str | None = Field(default=None, description="Column to sort by.")
    sort_dir: str = Field(default="asc", pattern="^(asc|desc)$")
    search: str | None = Field(default=None, description="Free-text search term.")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


class Page(BaseModel, Generic[T]):
    """A paginated response envelope."""

    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int

    @classmethod
    def create(cls, items: list[T], total: int, params: PageParams) -> "Page[T]":
        pages = (total + params.page_size - 1) // params.page_size if params.page_size else 0
        return cls(
            items=items,
            total=total,
            page=params.page,
            page_size=params.page_size,
            pages=pages,
        )
