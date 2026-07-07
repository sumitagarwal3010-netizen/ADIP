# ADIP Backend — Production Readiness (Phase 16)

## Logging

- Centralized config (`app/core/logging.py`), console formatter, level driven by
  `DEBUG`. SQLAlchemy noise suppressed unless `SQL_ECHO=true`.
- **Request logging middleware** (`app/core/middleware.py`) logs every request
  with a generated `X-Request-ID`, method, path, status and latency.

## Monitoring & metrics

- `GET /metrics` returns in-process counters: total requests, total 5xx errors,
  average latency, and the top-10 hit paths.
- Responses include `X-Request-ID` and `X-Response-Time-ms` headers.
- Seam for Prometheus/OpenTelemetry later (swap `app/core/metrics.py`).

## Health checks

- `GET /health` and `GET /api/v1/health` for liveness.
- Container `HEALTHCHECK` in the backend Dockerfile hits `/health`.
- Compose defines healthchecks for `db` and `backend`.

## Audit trail

- `app/services/audit_trail.record_activity(...)` writes immutable entries to the
  existing `activity_log` table (actor, action, entity, project, detail).
- Exposed for reads via the `activity-log` CRUD resource.

## Configuration

- 12-factor via `pydantic-settings` (`app/core/config.py`), `.env` supported.
- Key vars: `DATABASE_URL`, `ENVIRONMENT`, `DEBUG`, `SQL_ECHO`, `CORS_ORIGINS`,
  pagination bounds.

## Exception handling

- Domain exceptions (`app/core/exceptions.py`) → HTTP via a central handler.
- Middleware logs unhandled exceptions with the request id; clients receive a
  clean error (no stack traces leaked).

## Performance

- Indexed hot columns (`project_id`, `reference`, foreign keys).
- Pagination on all list endpoints; aggregation reads bounded (`fetch_all` cap).
- Connection pooling on PostgreSQL (`pool_pre_ping`, sized pool).

## Scalability

- Stateless API — horizontally scalable behind a load balancer / nginx.
- PostgreSQL for production concurrency; SQLite only for dev/test.
- LLM work isolated behind an abstraction for independent scaling later.

## Backup & restore (PostgreSQL)

```bash
# Backup
pg_dump "$DATABASE_URL" -Fc -f adip_backup.dump
# Restore
pg_restore --clean --if-exists -d "$DATABASE_URL" adip_backup.dump
# Schema (re)creation from migrations
alembic upgrade head
```

For SQLite dev: the database is a single file (`backend/adip.db`) — copy to back up.

## Readiness checklist

- [x] Structured logging + request ids
- [x] Metrics endpoint + latency headers
- [x] Health checks (app + containers)
- [x] Central exception handling (no leakage)
- [x] Config via env / .env
- [x] Migrations (Alembic) + backup/restore procedure
- [x] Pagination + indexes for performance
- [x] Stateless, horizontally scalable API
- [ ] AuthN/AuthZ (planned — out of current scope)
- [ ] External metrics/tracing backend (seam provided)
