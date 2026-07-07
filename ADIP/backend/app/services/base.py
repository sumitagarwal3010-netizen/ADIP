"""Generic service layer coordinating repositories, transactions and errors.

Services translate low-level data-access into business operations and raise the
application's domain exceptions (handled centrally by the API layer).
"""
from __future__ import annotations

from typing import Any, Generic, TypeVar

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError, NotFoundError
from app.core.pagination import Page, PageParams
from app.db.base_class import Base
from app.repositories.base import BaseRepository

ModelT = TypeVar("ModelT", bound=Base)


class BaseService(Generic[ModelT]):
    """Business-logic wrapper around a :class:`BaseRepository`."""

    def __init__(self, db: Session, repository: BaseRepository[ModelT]) -> None:
        self.db = db
        self.repo = repository
        self.entity_name = repository.model.__name__

    def get(self, obj_id: int) -> ModelT:
        obj = self.repo.get(obj_id)
        if obj is None:
            raise NotFoundError(f"{self.entity_name} {obj_id} not found.")
        return obj

    def list(
        self, params: PageParams, filters: dict[str, Any] | None = None
    ) -> Page[ModelT]:
        items, total = self.repo.list(
            offset=params.offset,
            limit=params.page_size,
            filters=filters,
            search=params.search,
            sort_by=params.sort_by,
            sort_dir=params.sort_dir,
        )
        return Page.create(items=items, total=total, params=params)

    def create(self, data: dict[str, Any]) -> ModelT:
        try:
            obj = self.repo.create(data)
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError(
                f"{self.entity_name} could not be created due to a constraint conflict."
            ) from exc
        self.db.refresh(obj)
        return obj

    def update(self, obj_id: int, data: dict[str, Any]) -> ModelT:
        obj = self.get(obj_id)
        try:
            obj = self.repo.update(obj, data)
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError(
                f"{self.entity_name} {obj_id} could not be updated due to a constraint conflict."
            ) from exc
        self.db.refresh(obj)
        return obj

    def delete(self, obj_id: int) -> None:
        obj = self.get(obj_id)
        self.repo.delete(obj)
        self.db.commit()
