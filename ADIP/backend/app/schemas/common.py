"""Shared Pydantic schema building blocks."""
from __future__ import annotations

from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ORMModel(BaseModel):
    """Base for read schemas mapped from ORM objects."""

    model_config = ConfigDict(from_attributes=True)


class TimestampSchema(ORMModel):
    """Mixin exposing audit timestamps on read schemas."""

    created_at: datetime
    updated_at: datetime


class PageResponse(BaseModel, Generic[T]):
    """Paginated list response envelope returned by list endpoints."""

    items: list[T]
    total: int
    page: int
    page_size: int
    pages: int
