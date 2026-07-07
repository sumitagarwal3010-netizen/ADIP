# Reference (Folder Structure · Standards · Debugging · Env · Errors · Reading Order)

## Folder structure

```
adip/
  src/services/backend/     frontend API client + mock/backend feature flag
  backend/app/
    api/v1/endpoints/       REST routers
    services/               business logic + orchestration + generators + testing/validation
    llm/                    provider-independent LLM layer (+ adapters)
    repositories/ models/ schemas/ core/ seed/
  docs/                     documentation (this set)
```

## Coding standards (essentials)

- Python: full type hints, Pydantic v2 for I/O, SQLAlchemy 2.0 typed models.
- Reuse `BaseRepository`/`BaseService`/`fetch_all` — no bespoke SQL or duplicate services.
- Frontend: `import type` (verbatimModuleSyntax), no parameter-property shorthand
  (erasableSyntaxOnly), no unused locals/params.
- Full standards: [`../03_Developer_Manual/05_CODING_STANDARDS.md`](../03_Developer_Manual/05_CODING_STANDARDS.md).

## Debugging

- Each backend response carries `X-Request-ID` and `X-Response-Time-ms`; see `GET /metrics`.
- Dev server doesn't type-check — run `npx tsc --noEmit` / `npm run build`.
- Prompt runs are logged; inspect via `GET /api/v1/prompt-testing/history`.

## Environment variables

| Variable | Scope | Default | Purpose |
|---|---|---|---|
| `DATABASE_URL` | backend | SQLite file | DB connection (SQLite or PostgreSQL) |
| `ENVIRONMENT` / `DEBUG` / `SQL_ECHO` | backend | development / true / false | runtime config |
| `CORS_ORIGINS` | backend | localhost dev URLs | allowed SPA origins |
| `LOCAL_LLM_ENABLED` | backend | `false` | enable real local LLM |
| `LLM_PROVIDER` | backend | `ollama` | active provider |
| `OLLAMA_BASE_URL` | backend | `http://localhost:11434` | Ollama endpoint |
| `OLLAMA_MODEL` | backend | `llama3.1:8b` | default model |
| `LLM_TIMEOUT_SECONDS` | backend | `60` | request timeout |
| `LLM_MAX_TOKENS` | backend | `2048` | max completion tokens |
| `LLM_TEMPERATURE` | backend | `0.2` | sampling temperature |
| `VITE_DATA_SOURCE` | frontend | `mock` | `mock` or `backend` |
| `VITE_API_BASE_URL` | frontend | `http://localhost:8000/api/v1` | backend base URL |

## Common errors

| Symptom | Fix |
|---|---|
| `pip install` build fails (pydantic-core/psycopg) | Use the pinned ranges in `requirements.txt`; Postgres driver is optional |
| `no such table` | Run `python -m app.seed.run --reset` or `alembic upgrade head` |
| `404` on business endpoint | The project/entity id doesn't exist — check `GET /api/v1/projects` |
| `422` on POST | Request body failed schema validation (see `detail`) |
| Frontend shows mock in backend mode | Set `VITE_DATA_SOURCE=backend` (rebuild) or `localStorage.adip.dataSource='backend'`; check CORS |
| LLM endpoints return no completions | `LOCAL_LLM_ENABLED=false` (default) or Ollama not running — mock reasoning is used |

Full troubleshooting: [`../03_Developer_Manual/06_TROUBLESHOOTING.md`](../03_Developer_Manual/06_TROUBLESHOOTING.md).

## Recommended reading order

1. [01 · Welcome](01_Welcome.md)
2. [02 · 5-Minute Setup](02_5_Minute_Setup.md)
3. [03 · Architecture Overview](03_Architecture_Overview.md)
4. [05 · Backend](05_Backend_Quick_Start.md) & [06 · Frontend](06_Frontend_Quick_Start.md)
5. [08 · Prompt Execution](08_Prompt_Execution_Guide.md)
6. [09 · Artifact Generation](09_Artifact_Generation_Guide.md)
7. [07 · Local LLM](07_Local_LLM_Quick_Start.md)
8. Deep dives: [`../03_Developer_Manual/`](../03_Developer_Manual/), [`../04_Architecture/`](../04_Architecture/), [`../10_API/`](../10_API/)
