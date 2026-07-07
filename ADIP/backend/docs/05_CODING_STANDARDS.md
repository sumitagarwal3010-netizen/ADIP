# ADIP Backend — Coding Standards (Phase 13)

## Python

- Target 3.11+ syntax; full type hints (PEP 604 unions `X | None`).
- `from __future__ import annotations` at the top of modules.
- Pydantic v2 models for all external I/O; ORM reads use `from_attributes=True`.
- SQLAlchemy 2.0 typed `Mapped[...]` columns.
- Absolute imports (`from app.…`). One responsibility per module.
- Raise domain exceptions (`app.core.exceptions`), never bare `Exception`.
- Log via `app.core.logging.get_logger(__name__)`; no `print`.

## API design

- REST resources are kebab-case plural (`/development-stories`).
- List endpoints paginate + expose `sort_by/sort_dir/search` + typed filters.
- Business endpoints return DTOs, not ORM rows; never leak internal fields.
- Every route declares a `response_model` and a `summary`.

## Reuse rules (enforced by review)

- CRUD → `BaseRepository` + `BaseService` + `build_crud_router` (no bespoke CRUD).
- Aggregation → `fetch_all` (no new SQL per entity).
- No duplicate services, routers, schemas, or queries.

## Testing

- Pytest; isolated temp SQLite DB (see `tests/conftest.py`).
- Cover: list envelope, get/404, create/update/delete, pagination, search,
  business aggregation shape, and error paths.

## Frontend (integration layer only)

- `verbatimModuleSyntax`: use `import type` for type-only imports.
- No parameter-property shorthand (`erasableSyntaxOnly`).
- No unused locals/params (`noUnusedLocals`/`noUnusedParameters`).
- Backend access only through `src/services/backend`; never hard-code URLs in pages.
