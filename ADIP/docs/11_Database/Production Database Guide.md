# ADIP Production Database Guide (DBA)

Operational database guidance for running ADIP on PostgreSQL: indexing, query
optimization, partitioning, archival/retention, materialized views, monitoring,
backup/restore and health checks.

> Dev uses SQLite (zero setup, ADR-0004). The assets here are **production
> (PostgreSQL)** oriented and guarded by `settings.is_sqlite` where code is involved.

---

## 1. Schema at a glance

37 tables across projects, SDLC entities (requirements, stories, tasks, tests,
defects, releases, deployments), governance (audit, compliance, traceability),
AI (copilot findings, executive scores) and the Prompt Workbench. ER diagram:
`docs/04_Architecture/Architecture Diagrams (C4 and Flows).md` (§8).

Regenerate a full ER from the SQLAlchemy models with any ERD tool pointed at
`backend/app/models/`.

---

## 2. Indexing

Apply the recommended indexes (FK hot paths, status filters, composites):

```bash
psql "$DATABASE_URL" -f backend/scripts/db/index_recommendations.sql
ANALYZE;
```

Rationale and the full list are in that file. Highlights:

- FK columns on every child table (`*_project_id`, `requirement_id`, `story_id`, ...).
- Composite `(project_id, status)` for dashboard filters.
- `(project_id, created_at DESC)` on `activity_log` for the audit trail.
- Partial index on `workbench_prompts (is_published) WHERE is_published`.

---

## 3. Query optimization & execution plans

- Always validate with `EXPLAIN (ANALYZE, BUFFERS)` before/after adding an index.
- Watch for `Seq Scan` on large tables in hot endpoints (SDLC rollups, analytics).
- Keep planner stats fresh: autovacuum on; run `ANALYZE` after bulk loads/seeds.
- Avoid N+1 in services by using repository joins/`selectinload` for collections.

Example:

```sql
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM requirements WHERE project_id = 1 AND status = 'Approved';
```

---

## 4. Partitioning strategy (high-volume tables)

Candidates: `activity_log`, `test_execution`, `notifications`, `copilot_findings`.

- **Range-partition by month** on `created_at` for append-heavy, time-queried tables:

```sql
-- Illustrative (declarative partitioning):
CREATE TABLE activity_log (
  id bigserial, project_id int, created_at timestamptz NOT NULL, ...
) PARTITION BY RANGE (created_at);
CREATE TABLE activity_log_2026_07 PARTITION OF activity_log
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
```

- Automate monthly partition creation (pg_partman or a scheduled job).
- Benefits: partition pruning on time-range queries, cheap archival by detaching
  old partitions.

---

## 5. Archival & retention

| Data | Retention (suggested) | Archival |
|---|---|---|
| `activity_log` / audit trail | 24 months hot, then archive | detach partition → cold storage |
| `test_execution` | 12 months | archive to object storage as Parquet/CSV |
| `notifications` | 3–6 months | purge after export |
| `workbench_runs` | 12 months | keep aggregates, archive raw |
| Business entities (projects, requirements, ...) | retain (system of record) | — |

Implement as a scheduled job that (a) exports rows past the window, (b) detaches/
drops old partitions or deletes in batches, (c) records the action in the audit log.

---

## 6. Materialized views (reporting)

Heavy executive rollups can be precomputed:

```sql
CREATE MATERIALIZED VIEW mv_portfolio_health AS
SELECT p.id AS project_id, p.name,
       COUNT(r.id) AS requirement_count,
       COUNT(d.id) FILTER (WHERE d.severity = 'Critical') AS critical_defects
FROM projects p
LEFT JOIN requirements r ON r.project_id = p.id
LEFT JOIN defects d ON d.project_id = p.id
GROUP BY p.id, p.name;

-- Refresh on a schedule (concurrently to avoid locks):
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_portfolio_health;
```

Keep the API reading the view for dashboards; refresh every N minutes.

---

## 7. Monitoring

Key signals (wire into Prometheus/Grafana — see `docs/09_Operations/Observability Guide.md`):

- Connections vs `max_connections`; long-running/idle-in-transaction queries.
- Cache hit ratio (`pg_stat_database`), deadlocks, replication lag.
- Table/index bloat; least-used indexes (candidates to drop).
- Slow queries (`pg_stat_statements`).

Quick inventory + least-used indexes:

```bash
python -m scripts.db.health_check   # from backend/
```

---

## 8. Backup, restore & DR

```bash
# Backup (engine-aware): PostgreSQL custom dump or SQLite snapshot
DATABASE_URL=... backend/scripts/db/backup.sh /var/backups/adip

# Restore + migrate + validate
DATABASE_URL=... backend/scripts/db/restore.sh /var/backups/adip/adip-YYYYMMDD-HHMMSS.dump
```

- Schedule daily logical backups; enable **WAL archiving / PITR** for low RPO.
- Store off-host with lifecycle retention; test-restore monthly.
- Full DR runbook: `docs/09_Operations/Runbooks.md` (§6–7).

---

## 9. Migration validation

- CI runs `alembic upgrade head` on every backend change (both engines locally).
- Migrations are **additive** (ADR-0006) to keep rolling/blue-green deploys safe.
- After restore, `restore.sh` re-runs migrations to guarantee schema currency.

---

## 10. Seed & synthetic data

- Deterministic banking seed: `python -m app.cli seed --reset`.
- Large synthetic enterprise datasets (JSONL): `python -m app.cli datasets`.
- Sample full-SDLC projects: `python -m app.datasets.sample_projects`.
