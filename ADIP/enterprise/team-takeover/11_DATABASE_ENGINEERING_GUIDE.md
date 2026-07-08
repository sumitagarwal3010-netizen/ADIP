# Database Engineering Guide

Additive to `docs/11_Database/Production Database Guide.md` and `enterprise/database/ER_OVERVIEW.md`.

## Schema overview

- Core: organizations, projects, users (seeded)
- SDLC: phase summaries, traceability
- Connectors: `enterprise_connectors`, runs, assets, findings, credential refs
- Prompt workbench: prompts, versions, runs

## Migrations

```bash
cd backend
alembic revision -m "description"
alembic upgrade head
```

ADR: additive-only migrations (`docs/04_Architecture/ADR/0006-additive-only-migrations.md`).

## Seed data

```bash
python -m app.cli seed
```

Tests use isolated SQLite via `tests/conftest.py`.

## Indexes

Connector migration includes indexes on type, status, last sync, severity. See `backend/scripts/db/index_recommendations.sql`.

## Backup/restore

`backend/scripts/db/backup.sh`, `restore.sh`

## PostgreSQL compatibility

Use `DATABASE_URL=postgresql://...` in production. SQLite for dev (`ADR-0004`).

## Health

`python backend/scripts/db/health_check.py`
