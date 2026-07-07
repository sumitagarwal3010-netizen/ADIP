# ADIP Backend — Troubleshooting (Phase 13)

| Symptom | Cause / Fix |
|---|---|
| `pip install` fails building `pydantic-core`/`psycopg` | No prebuilt wheel for your Python. Use the pinned ranges in `requirements.txt` (they resolve to wheels on 3.11–3.14). Postgres driver is optional (`requirements-postgres.txt`). |
| `sqlite3.OperationalError: no such table` | Run `python -m app.seed.run --reset` (creates tables) or `alembic upgrade head`. |
| FK violations on SQLite | FKs are enabled via PRAGMA in `app/db/session.py`; ensure you use the app's session. |
| `404` on a business endpoint | The project/entity id doesn't exist; check `GET /api/v1/projects`. |
| `409` on create | Unique constraint (e.g. duplicate `code`/`reference`). |
| `422` on create | Request body failed schema validation; see `detail`. |
| Alembic can't find models | It imports `app.db.base` (which imports all models). Don't remove that import. |
| Frontend still shows mock data in backend mode | Set `VITE_DATA_SOURCE=backend` (rebuild) or `localStorage.adip.dataSource='backend'`; confirm `VITE_API_BASE_URL` and CORS. |
| CORS errors from the SPA | Add the origin to `cors_origins` in `app/core/config.py`. |
| Tests touch my dev DB | They don't — `tests/conftest.py` forces a temp SQLite file before app import. |
| LLM endpoints return no completions | By design — Phase 11 adapters are scaffolds (`/llm/*` is read-only metadata). |
| Docker build needed for dev? | No. Use SQLite + `uvicorn` locally; Docker is deployment-only. |
