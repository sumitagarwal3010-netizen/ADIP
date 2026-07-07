"""Generic repository providing reusable data-access over any ORM model.

The repository is deliberately thin and typed: services own business rules,
the repository owns query construction (filtering, sorting, search, pagination).
"""
from __future__ import annotations

from typing import Any, Generic, Sequence, TypeVar

from sqlalchemy import String, func, or_, select
from sqlalchemy.orm import Session

from app.db.base_class import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """CRUD + query helpers for a single model.

    Subclasses may set ``search_fields`` (column names searched by ``search``)
    and ``default_sort`` (fallback ordering column).
    """

    model: type[ModelT]
    search_fields: Sequence[str] = ()
    default_sort: str = "id"

    def __init__(self, db: Session) -> None:
        self.db = db

    # --- read ---
    def get(self, obj_id: int) -> ModelT | None:
        return self.db.get(self.model, obj_id)

    def _apply_filters(self, stmt, filters: dict[str, Any] | None):
        if not filters:
            return stmt
        for key, value in filters.items():
            if value is None:
                continue
            column = getattr(self.model, key, None)
            if column is not None:
                stmt = stmt.where(column == value)
        return stmt

    def _apply_search(self, stmt, search: str | None):
        if not search or not self.search_fields:
            return stmt
        term = f"%{search.lower()}%"
        clauses = []
        for field in self.search_fields:
            column = getattr(self.model, field, None)
            if column is not None:
                clauses.append(func.lower(column.cast(String)).like(term))
        if clauses:
            stmt = stmt.where(or_(*clauses))
        return stmt

    def _apply_sort(self, stmt, sort_by: str | None, sort_dir: str):
        column = getattr(self.model, sort_by or self.default_sort, None)
        if column is None:
            column = getattr(self.model, self.default_sort, None)
        if column is None:  # pragma: no cover - safety net
            return stmt
        return stmt.order_by(column.desc() if sort_dir == "desc" else column.asc())

    def list(
        self,
        *,
        offset: int = 0,
        limit: int = 25,
        filters: dict[str, Any] | None = None,
        search: str | None = None,
        sort_by: str | None = None,
        sort_dir: str = "asc",
    ) -> tuple[list[ModelT], int]:
        """Return a page of rows and the total count matching the filters."""
        base = select(self.model)
        base = self._apply_filters(base, filters)
        base = self._apply_search(base, search)

        total = self.db.scalar(
            select(func.count()).select_from(base.subquery())
        ) or 0

        stmt = self._apply_sort(base, sort_by, sort_dir).offset(offset).limit(limit)
        items = list(self.db.scalars(stmt).all())
        return items, int(total)

    # --- write ---
    def create(self, data: dict[str, Any]) -> ModelT:
        obj = self.model(**data)
        self.db.add(obj)
        self.db.flush()
        self.db.refresh(obj)
        return obj

    def update(self, obj: ModelT, data: dict[str, Any]) -> ModelT:
        for key, value in data.items():
            setattr(obj, key, value)
        self.db.add(obj)
        self.db.flush()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: ModelT) -> None:
        self.db.delete(obj)
        self.db.flush()
