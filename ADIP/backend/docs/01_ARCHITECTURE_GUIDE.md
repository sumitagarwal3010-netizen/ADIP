# ADIP Backend — Architecture Guide (Phase 13/14)

## Overview

ADIP (Automation Delivery Integration Platform) is a React/Vite/TypeScript
frontend backed by a FastAPI service. The backend exposes REST APIs over a
relational database seeded with realistic banking mock data.

```
React / Vite / TS (MUI)
        │  REST/JSON  (feature-flagged: mock | backend)
        ▼
FastAPI  ──►  API layer (routers)
        ──►  Service layer (business logic, aggregation)
        ──►  Repository layer (generic data access)
        ──►  SQLAlchemy ORM  ──►  DB (SQLite dev / PostgreSQL prod)
                                   ▲ Alembic migrations
        Pydantic schemas everywhere for validation/serialization.
        LLM abstraction layer (infrastructure only) sits beside services.
```

## Layered design

| Layer | Package | Responsibility |
|---|---|---|
| API | `app/api/v1` | HTTP routing, request/response models, DI, error mapping |
| Schemas | `app/schemas` | Pydantic DTOs (CRUD + business) |
| Services | `app/services` | Business logic, aggregation, transactions |
| Repositories | `app/repositories` | Generic query construction (CRUD, filter, sort, search) |
| Models | `app/models` | SQLAlchemy ORM entities |
| DB | `app/db` | Engine, session, declarative base |
| Core | `app/core` | Config, logging, exceptions, pagination |
| LLM | `app/llm` | Provider-agnostic LLM abstraction (scaffold) |

## Key principles

- **Reuse over duplication.** A single generic `BaseRepository` + `BaseService`
  power all CRUD; a CRUD router factory generates 28 resource routers. Business
  APIs (Phase 3+) reuse the same repository via `fetch_all` — no bespoke SQL.
- **DB portability.** Postgres-first schema; SQLite default via `DATABASE_URL`.
- **Everything typed.** Type hints throughout; Pydantic validates all I/O.
- **Feature-flagged frontend.** The frontend can switch mock ⇆ backend without
  a redesign (`src/services/backend`).

## Request lifecycle

1. Router receives request; FastAPI validates path/query/body via schemas + DI.
2. Router calls a service (via `Depends`).
3. Service uses repositories to read/write; raises domain exceptions.
4. Exceptions are mapped to HTTP by a central handler in `app/main.py`.
5. Response serialized through a Pydantic `response_model`.

See `02_DEVELOPER_GUIDE.md`, `03_API_GUIDE.md`, `04_DATABASE_GUIDE.md`.
