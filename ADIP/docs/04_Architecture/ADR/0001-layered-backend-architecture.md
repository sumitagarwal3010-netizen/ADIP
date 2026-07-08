# 0001. Layered backend architecture

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Principal Architect, Backend Engineering

## Context

The backend exposes ~150 REST endpoints spanning CRUD, SDLC aggregation, prompt
orchestration, artifact generation, quality scoring and analytics. Without a
strict layering discipline, business logic leaks into route handlers, making
testing and reuse hard.

## Decision

Adopt a strict four-layer architecture:

```
API (app/api/v1/endpoints)  ->  Services (app/services)  ->  Repositories (app/repositories) / Models (app/models)
```

- **Endpoints** are thin: parse/validate input (Pydantic), call one service, shape the response.
- **Services** own business logic, transactions and domain exceptions.
- **Repositories** own data access; a generic `BaseRepository` provides CRUD, pagination, filtering.
- **LLM concerns** live in a separate `app/llm/` package behind a provider protocol.

## Consequences

- **Positive:** endpoints are trivially testable; services are reusable across
  routes (e.g. `ArtifactGenerator` used by generation, export, datasets and
  sample-project generators); CRUD is generated via a factory, avoiding boilerplate.
- **Positive:** clear ownership boundaries reduce merge conflicts.
- **Negative:** small features still cross three files; mitigated by the CRUD
  factory and `python -m app.cli scaffold`.
