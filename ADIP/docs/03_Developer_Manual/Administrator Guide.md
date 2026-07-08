# ADIP Administrator Guide

For platform administrators operating ADIP: configuration, environments, users &
personas, LLM providers, data lifecycle, and day-2 tasks. Operational incident
handling lives in `docs/09_Operations/Runbooks.md`.

---

## 1. Configuration

All configuration is environment-driven (`backend/app/core/config.py`,
overridable via `.env` or environment variables):

| Setting | Env var | Default | Notes |
|---|---|---|---|
| Environment | `ENVIRONMENT` | development | set `production` in prod |
| Debug | `DEBUG` | true | **set `false` in prod** |
| Database | `DATABASE_URL` | SQLite file | PostgreSQL DSN in prod |
| CORS origins | `CORS_ORIGINS` | localhost dev ports | restrict to SPA origin(s) |
| Local LLM | `LOCAL_LLM_ENABLED` | false | enable to use a real model |
| LLM provider | `LLM_PROVIDER` | ollama | ollama / (future) cloud |
| Ollama URL/model | `OLLAMA_BASE_URL`, `OLLAMA_MODEL` | localhost / llama3.1:8b | |
| Rate limiting | `RATE_LIMIT_ENABLED` | false | **enable in prod** |
| Rate limits | `RATE_LIMIT_RPS`, `RATE_LIMIT_BURST` | 10 / 20 | tune per client |

Quick environment check: `python -m app.cli doctor`.

---

## 2. Environments & promotion

- **Local:** SQLite + `npm run dev` / `uvicorn` — zero infra.
- **Containerized:** `docker compose up --build` (PostgreSQL + backend + Nginx).
- **Kubernetes:** `deploy/k8s/` manifests or `deploy/helm/adip` chart.
- **Promotion:** build immutable images, tag per release, promote the same tag
  dev → staging → prod. Config differs per environment via secrets/values, not code.

---

## 3. Users, roles & personas

- ADIP models `personas`, `roles`, `users`, `user_roles` (see `docs/11_Database/`).
- Personas drive frontend navigation visibility.
- **Authentication is a documented future seam** (OIDC/SSO + RBAC — see
  `docs/15_Security/Threat Model.md`). Until then, restrict access at the network
  layer and treat the deployment as trusted-internal.

---

## 4. LLM provider administration

- **Mock mode (default):** no model, deterministic output — nothing to administer.
- **Enable a local model:** install Ollama, `ollama pull <model>`, set
  `LOCAL_LLM_ENABLED=true`. Verify via `GET /api/v1/llm/health`.
- **Monitor:** `GET /api/v1/llm/runtime` (breaker state, cache hit rate, token
  cost). Alerts fire on an open breaker (see SRE assets).
- **Routing/fallback:** models registered in `app/llm/registry.py`; the runtime
  routes to the preferred model and falls back automatically.

---

## 5. Data lifecycle

- **Seed demo data:** `python -m app.cli seed --reset`.
- **Generate datasets:** `python -m app.cli datasets` → `docs/examples/enterprise-datasets/`.
- **Version datasets:** `python -m app.ml.dataset_versioning`.
- **Backups/restore:** `backend/scripts/db/backup.sh` / `restore.sh`
  (see `docs/11_Database/Production Database Guide.md`).
- **Retention/archival:** policies in the Production Database Guide (§5).

---

## 6. Day-2 tasks

| Task | How |
|---|---|
| Apply migrations | `python -m app.cli migrate` (or auto on container start) |
| Inspect routes | `python -m app.cli routes` or `/docs` |
| Health/inventory | `python -m scripts.db.health_check` |
| Re-baseline performance | `python -m app.cli perf` |
| Regenerate API spec/Postman | `python -m scripts.export_api` |
| Run evaluation | `python -m app.ml.evaluation` |
| Rotate secrets | via vault/secret store; never in code |

---

## 7. Hardening checklist (production)

- [ ] `DEBUG=false`, `ENVIRONMENT=production`
- [ ] `DATABASE_URL` → managed PostgreSQL; backups + PITR configured
- [ ] `RATE_LIMIT_ENABLED=true`; secure headers at ingress (`docs/15_Security/API Hardening.md`)
- [ ] CORS restricted to SPA origin(s)
- [ ] Secrets in vault/secret store; secret scanning in CI
- [ ] Indexes applied (`backend/scripts/db/index_recommendations.sql`)
- [ ] Monitoring + alerts wired (`deploy/observability/`)
- [ ] Authentication/RBAC plan in place before external exposure
```
