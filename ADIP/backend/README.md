# ADIP Backend

FastAPI + SQLAlchemy + Alembic + Pydantic backend for the **Automation Delivery
Integration Platform (ADIP)**. It provides REST APIs backed by a relational
database seeded with realistic banking mock data, powering the existing
React/Vite/TypeScript frontend.

> Production target is **PostgreSQL**. For zero-setup local development the
> database defaults to **SQLite** (`backend/adip.db`); switch by setting
> `DATABASE_URL`.

## Architecture

```
React / Vite / TS  →  REST (FastAPI)  →  Services  →  Repositories  →  SQLAlchemy ORM  →  DB (SQLite dev / PostgreSQL prod)
                                                                         ↑ Pydantic schemas   ↑ Alembic migrations
```

## Layout

```
backend/
  app/
    api/v1/endpoints/   # REST endpoints (added per phase)
    core/               # config, logging, exceptions, pagination
    db/                 # engine, session, declarative base
    models/             # SQLAlchemy ORM models (all tables)
    schemas/            # Pydantic request/response DTOs
    repositories/       # data-access layer
    services/           # business logic
    seed/               # banking mock-data seeder
    main.py             # FastAPI app factory
  alembic/              # migrations
  tests/                # pytest suite
  requirements.txt
```

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Seed the database (creates tables + banking mock data)
python -m app.seed.run --reset

# Run the API
uvicorn app.main:app --reload --port 8000
# OpenAPI docs: http://localhost:8000/docs
```

## Using PostgreSQL

```bash
pip install -r requirements-postgres.txt   # psycopg driver (prod only)
export DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/adip"
alembic upgrade head        # apply migrations
python -m app.seed.run --reset
```

## Tests

```bash
cd backend
pytest -q
```

## Implementation phases

1. **Phase 1 (done):** structure, config, database, models, seed.
2. **Phase 2 (done):** Pydantic schemas, repository layer, service layer, CRUD
   APIs for all 24+ entities with pagination, filtering, sorting and search.
   28 resource groups under `/api/v1` (see `/docs`).
3. **Phase 3 (done):** business AI SDLC aggregation APIs — phase summaries,
   copilots, executive rollups, artifact catalog, traceability chain.
4. **Phase 4 (done):** copilot APIs (findings/recommendations/reasoning/
   confidence/risk/readiness/business-impact/priority).
5. **Phase 5 (done):** artifact generation framework (BRD/FRD/SRS/HLD/LLD/API
   Spec/DB Design/Test Plan/... in JSON, Markdown, DOCX-ready models).
6. **Phase 6 (done):** traceability engine (chain, matrix, impact).
7. **Phase 7 (done):** executive analytics + trend APIs.
8. **Phase 8 (done):** knowledge APIs (overview, search, recommendations).
9. **Phase 9 (done):** transformation APIs (portfolio, ROI).
10. **Phase 10 (done):** frontend integration feature flag (`src/services/backend`).
11. **Phase 11 (done):** LLM abstraction layer (scaffold — no runtime dependency).
12. **Phase 12 (done):** Docker/compose/nginx/health (dev does NOT need Docker).
13-15. **(done):** developer, solution-architecture and testing docs.
16. **(done):** production readiness — request logging, `/metrics`, audit trail.

See the repository-wide documentation set under [`../docs/`](../docs/README.md)
(backend guides live under `docs/03_Developer_Manual`, `docs/04_Architecture`,
`docs/06_Test_Workbench`, `docs/09_Operations`, `docs/10_API`, `docs/11_Database`).

Out of scope until after the CIO demo: LLM, LangChain/LangGraph, PGVector,
Docker, authentication, RBAC.
