# 0004. SQLite for dev, PostgreSQL for production

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Principal Architect, DBA, Backend Engineering

## Context

Contributors need a zero-setup local database; production needs a robust,
concurrent RDBMS. Maintaining two schemas is untenable.

## Decision

Use **SQLAlchemy + Alembic** with a single, Postgres-first schema:

- `DATABASE_URL` defaults to a local SQLite file (`backend/adip.db`).
- Production sets `DATABASE_URL=postgresql+psycopg://...`.
- `psycopg` is an **optional** install (`requirements-postgres.txt`) so Python
  version/wheel issues never block local dev.
- Migrations are written to run on both engines.

## Consequences

- **Positive:** `git clone` → run, no DB install.
- **Positive:** the same ORM models and migrations serve both engines.
- **Negative:** SQLite lacks some PostgreSQL features (advanced indexes,
  partitioning, materialized views). These are documented as **production-only**
  DBA assets (see `docs/11_Database/`) and guarded by the `settings.is_sqlite` flag.
