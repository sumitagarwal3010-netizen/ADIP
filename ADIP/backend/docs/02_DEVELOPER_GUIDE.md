# ADIP Backend — Developer Guide (Phase 13)

## Environment setup

Prerequisites: Python 3.11+ (tested on 3.14), Node 18+ for the frontend.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt          # core (SQLite dev)
# pip install -r requirements-postgres.txt  # only for PostgreSQL

python -m app.seed.run --reset           # create tables + seed banking data
uvicorn app.main:app --reload --port 8000
# Docs: http://localhost:8000/docs
```

No Docker or PostgreSQL is required for development (SQLite is the default).

## Folder structure

```
backend/
  app/
    api/v1/
      endpoints/        # routers: resources (CRUD), sdlc, copilots, executive,
                        #          analytics, artifact_generation, knowledge_transformation, llm_meta
      crud_factory.py   # generic CRUD router builder
      deps.py           # shared DI (get_db, list_params)
      router.py         # aggregates all routers
    core/               # config, logging, exceptions, pagination
    db/                 # base_class, base, session
    models/             # ORM models (organization, requirements, ... , ai, artifacts, platform)
    schemas/            # Pydantic DTOs (CRUD + business: sdlc, analytics, ...)
    repositories/       # base (generic), aggregation (reuse helper)
    services/           # base, sdlc_service, analytics_service, knowledge_service, artifact_generator
    llm/                # LLM abstraction (types, registry, prompt/conversation, adapters) — scaffold
    seed/               # banking_data, seeder, run
    main.py             # FastAPI app factory
  alembic/              # migrations
  tests/                # pytest suite
  docs/                 # this documentation set
```

## Coding standards

- **Type hints** on all functions/parameters/returns.
- **Pydantic v2** for all request/response models (`from_attributes=True` for reads).
- **No duplication**: reuse `BaseRepository`/`BaseService`; for aggregation use
  `app.repositories.aggregation.fetch_all`.
- **Errors**: raise `NotFoundError`/`ConflictError`/`ValidationError` from
  `app.core.exceptions`; never return ad-hoc error dicts from services.
- **Logging**: `from app.core.logging import get_logger`.
- **Naming**: snake_case Python, kebab-case route prefixes, PascalCase schemas.
- **Imports**: absolute (`from app...`). Keep modules focused.

## Adding a new CRUD resource

1. Add the ORM model in `app/models/…` and export it in `app/models/__init__.py`.
2. Add Create/Update/Read schemas in `app/schemas/…`.
3. Append a `build_crud_router(...)` entry in `app/api/v1/endpoints/resources.py`.
   Pagination/filter/sort/search come for free.

## Adding a new business (aggregation) endpoint

1. Add a DTO in `app/schemas/…`.
2. Add a method to the relevant service (reuse `fetch_all`, don't write new SQL).
3. Add a route in the matching endpoint module and include it in `router.py`.

## Running tests

```bash
cd backend && pytest          # uses an isolated temp SQLite DB (see tests/conftest.py)
```

## Frontend integration (feature flag)

The frontend defaults to its mock layer. To point it at this backend:

```bash
# .env.local at repo root
VITE_DATA_SOURCE=backend
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Or toggle at runtime: `localStorage.setItem('adip.dataSource','backend')`.
Consume via `src/services/backend` (`apiClient`, `useBackendData`).
