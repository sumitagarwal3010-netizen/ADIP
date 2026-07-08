# ADIP Operations Runbooks

Actionable runbooks for operating ADIP in production. Each runbook is
self-contained: symptom → diagnosis → resolution → verification.

> Complements `13-ADIP-Operations-Guide.md` (general operations) and
> `14-ADIP-Release-Guide.md` (releases). This file is the incident/recovery
> playbook.

---

## Index

1. [Incident: API returning 5xx](#1-incident-api-returning-5xx)
2. [Incident: LLM circuit breaker open](#2-incident-llm-circuit-breaker-open)
3. [Incident: High latency](#3-incident-high-latency)
4. [Incident: Database unavailable](#4-incident-database-unavailable)
5. [Backup](#5-backup)
6. [Restore](#6-restore)
7. [Recovery (disaster)](#7-recovery-disaster)
8. [Upgrade](#8-upgrade)
9. [Maintenance](#9-maintenance)

---

## 1. Incident: API returning 5xx

**Symptom:** clients get 500s; `GET /metrics` shows rising `total_errors`.

**Diagnose**
- `GET /api/v1/health` — is the DB reachable?
- Check backend logs for the failing `request_id` (correlation id in the error).
- `GET /api/v1/llm/runtime` — is the breaker open (LLM-dependent routes)?

**Resolve**
- DB down → see runbook #4.
- LLM down → see runbook #2 (or set `LOCAL_LLM_ENABLED=false` to fall back to mock).
- Recent deploy → roll back to previous image tag.

**Verify:** error rate returns to baseline in `/metrics`; smoke test key endpoints.

---

## 2. Incident: LLM circuit breaker open

**Symptom:** `GET /api/v1/llm/runtime` shows `circuit_breaker: "open"`; LLM routes fail fast.

**Diagnose**
- `GET /api/v1/llm/health` — provider reachable?
- Check Ollama/cloud provider status and network egress.

**Resolve**
- Restart / scale the LLM provider (Ollama) or restore cloud connectivity.
- The breaker half-opens automatically after the reset window; it closes on the
  next success.
- **Immediate mitigation:** set `LOCAL_LLM_ENABLED=false` — ADIP continues in
  deterministic mock mode (no user-facing outage).

**Verify:** breaker returns to `closed`; a test completion succeeds.

---

## 3. Incident: High latency

**Symptom:** `/metrics` p95 above SLO; slow UI.

**Diagnose**
- Identify hot paths from `top_paths` in `/metrics`.
- Run `python -m app.perf.harness` to reproduce and localize.
- Check DB slow queries and connection pool saturation.

**Resolve**
- Scale backend replicas; increase DB pool size.
- Enable/verify response caching for LLM-heavy routes (`/api/v1/llm/runtime`
  cache hit rate).
- Add DB indexes for hot filters.

**Verify:** p95 back under SLO; perf report improves.

---

## 4. Incident: Database unavailable

**Symptom:** `GET /api/v1/health` fails DB check; connection errors in logs.

**Diagnose**
- Is PostgreSQL up and accepting connections? Disk full? Max connections hit?
- Validate `DATABASE_URL` and network/security-group rules.

**Resolve**
- Restart DB / free disk / raise `max_connections`.
- If corrupted, go to **Restore** (#6).

**Verify:** `GET /api/v1/health` passes; writes succeed.

---

## 5. Backup

**PostgreSQL (production)**
```bash
# Logical backup (schedule daily; retain 30 days)
pg_dump "$DATABASE_URL" --format=custom --file "adip-$(date +%F).dump"
```
- Store off-host (object storage) with lifecycle retention.
- Back up environment/secrets separately (never in the DB dump).

**SQLite (dev)**
```bash
cp backend/adip.db "backend/adip-$(date +%F).db"
```

**What to back up:** database, `.env`/secrets, generated datasets under
`docs/examples/` if treated as source of truth.

---

## 6. Restore

**PostgreSQL**
```bash
createdb adip_restore
pg_restore --dbname adip_restore --clean --if-exists adip-YYYY-MM-DD.dump
# Point DATABASE_URL at the restored DB, then:
cd backend && alembic upgrade head
```

**SQLite**
```bash
cp backend/adip-YYYY-MM-DD.db backend/adip.db
```

**Verify:** `python -m app.cli doctor` and a read/write smoke test.

---

## 7. Recovery (disaster)

Full-region / total-loss recovery:

1. Provision infra (containers + managed PostgreSQL) from IaC / `docker-compose.yml`.
2. Restore the latest DB dump (#6).
3. Deploy the last known-good image tags (backend + frontend).
4. Apply migrations: `alembic upgrade head`.
5. Restore secrets/config.
6. Run `python -m app.cli doctor` + `python -m app.perf.harness` smoke.
7. Flip DNS / load balancer to the recovered stack.

**RPO/RTO:** RPO = backup interval (target ≤ 24h, ideally hourly WAL archiving);
RTO = provisioning + restore time (target ≤ 1h).

---

## 8. Upgrade

**Rolling upgrade**
1. Announce maintenance window (if schema changes are non-backward-compatible).
2. Build & tag new images; run **Backend CI** + **Frontend CI** green.
3. Back up the DB (#5).
4. Deploy backend with new image; run `alembic upgrade head` (migrations are
   additive by convention — verify).
5. Deploy frontend bundle.
6. Verify: `doctor`, health probes, smoke tests, `/metrics` error rate.

**Rollback:** redeploy previous image tags; if a migration must be reverted,
`alembic downgrade -1` (only if the migration is reversible).

---

## 9. Maintenance

**Routine**
- Rotate secrets/credentials per policy.
- Vacuum/analyze PostgreSQL; review slow-query log.
- Prune old logs and stale backups per retention.
- Refresh datasets: `python -m app.cli datasets`.
- Re-baseline performance: `python -m app.cli perf` and compare to prior report.

**Health checklist (weekly)**
- [ ] Error rate < 1% (`/metrics`)
- [ ] p95 latency within SLO
- [ ] LLM breaker closed, cache hit rate healthy (`/api/v1/llm/runtime`)
- [ ] Backups present and restore-tested this month
- [ ] Dependency and CVE review (backend `requirements.txt`, frontend `npm audit`)
