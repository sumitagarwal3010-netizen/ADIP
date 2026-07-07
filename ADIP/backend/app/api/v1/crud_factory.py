"""Factory that builds a standard CRUD APIRouter for an ORM model.

Produces five endpoints per resource:

    GET    /              list (pagination + sort + search + filters)
    GET    /{id}          get by id
    POST   /              create
    PUT    /{id}          update (partial)
    DELETE /{id}          delete

All routers share the same pagination/filter/sort/search contract and depend on
the DB session via FastAPI dependency injection.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable, Sequence

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import get_db, list_params
from app.core.pagination import PageParams
from app.db.base_class import Base
from app.repositories.base import BaseRepository
from app.schemas.common import PageResponse
from app.services.base import BaseService


@dataclass
class FilterSpec:
    """Describes one optional exact-match query filter for a list endpoint."""

    name: str
    type: type = int
    description: str = ""


def build_crud_router(
    *,
    prefix: str,
    tags: list[str],
    model: type[Base],
    read_schema: type[BaseModel],
    create_schema: type[BaseModel],
    update_schema: type[BaseModel],
    search_fields: Sequence[str] = (),
    default_sort: str = "id",
    filters: Sequence[FilterSpec] = (),
) -> APIRouter:
    """Create a fully wired CRUD router for ``model``."""

    router = APIRouter(prefix=prefix, tags=tags)

    # Build a concrete repository class bound to this model.
    repo_cls = type(
        f"{model.__name__}Repository",
        (BaseRepository,),
        {
            "model": model,
            "search_fields": tuple(search_fields),
            "default_sort": default_sort,
        },
    )

    def get_service(db: Session = Depends(get_db)) -> BaseService:
        return BaseService(db, repo_cls(db))

    # --- filter dependency (optional exact-match query params) ---
    def make_filter_dependency() -> Callable[..., dict[str, Any]]:
        # Build a function whose signature exposes each filter as a query param.
        if not filters:
            def _no_filters() -> dict[str, Any]:
                return {}

            return _no_filters

        # Use a closure that reads declared query params via FastAPI.
        def _filters(**kwargs: Any) -> dict[str, Any]:
            return {k: v for k, v in kwargs.items() if v is not None}

        # Attach an explicit signature so FastAPI recognizes the query params.
        import inspect

        params = [
            inspect.Parameter(
                spec.name,
                inspect.Parameter.KEYWORD_ONLY,
                default=Query(None, description=spec.description or f"Filter by {spec.name}"),
                annotation=spec.type | None,
            )
            for spec in filters
        ]
        _filters.__signature__ = inspect.Signature(params)  # type: ignore[attr-defined]
        return _filters

    filter_dependency = make_filter_dependency()

    @router.get("", response_model=PageResponse[read_schema], summary=f"List {model.__name__}")
    def list_items(
        params: PageParams = Depends(list_params),
        filter_values: dict[str, Any] = Depends(filter_dependency),
        service: BaseService = Depends(get_service),
    ):
        return service.list(params, filters=filter_values)

    @router.get("/{item_id}", response_model=read_schema, summary=f"Get {model.__name__} by id")
    def get_item(item_id: int, service: BaseService = Depends(get_service)):
        return service.get(item_id)

    def create_item(payload, service: BaseService = Depends(get_service)):
        return service.create(payload.model_dump(exclude_unset=True))

    def update_item(item_id: int, payload, service: BaseService = Depends(get_service)):
        return service.update(item_id, payload.model_dump(exclude_unset=True))

    # Bind the concrete request-body schema classes as real annotations so
    # FastAPI/Pydantic resolve them (a loop/closure variable used directly as an
    # annotation is seen as an unresolved forward reference).
    create_item.__annotations__["payload"] = create_schema
    update_item.__annotations__["payload"] = update_schema

    router.add_api_route(
        "",
        create_item,
        methods=["POST"],
        response_model=read_schema,
        status_code=status.HTTP_201_CREATED,
        summary=f"Create {model.__name__}",
    )
    router.add_api_route(
        "/{item_id}",
        update_item,
        methods=["PUT"],
        response_model=read_schema,
        summary=f"Update {model.__name__}",
    )

    @router.delete(
        "/{item_id}",
        status_code=status.HTTP_204_NO_CONTENT,
        summary=f"Delete {model.__name__}",
    )
    def delete_item(item_id: int, service: BaseService = Depends(get_service)):
        service.delete(item_id)
        return None

    return router
