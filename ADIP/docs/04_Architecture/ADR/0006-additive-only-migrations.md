# 0006. Additive-only database migrations

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Principal Architect, DBA

## Context

Zero-downtime rolling upgrades require that a new backend can run against the
previous schema and vice-versa during a deploy. Destructive migrations (dropping
or renaming columns in place) break this and risk data loss.

## Decision

Migrations are **additive by convention**:

- Add tables/columns/indexes; make new columns nullable or defaulted.
- Never drop/rename in the same release that starts using the change; use an
  expand → migrate data → contract sequence across releases if removal is needed.
- Every migration must apply cleanly on both SQLite and PostgreSQL (CI enforces
  `alembic upgrade head`).

## Consequences

- **Positive:** rolling and blue/green deploys are safe (see DevOps assets).
- **Positive:** rollbacks rarely need a `downgrade`.
- **Negative:** schema cleanup is deferred and multi-step; tracked explicitly.
