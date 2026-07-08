# ADIP SLIs, SLOs & Error Budgets (SRE)

Service Level Indicators/Objectives and error budgets for ADIP, plus the health
probes and capacity guidance. Metrics come from `/metrics/prometheus`; alerts are
in `deploy/observability/alert_rules.yml`; the dashboard is
`deploy/observability/grafana-dashboard.json`.

---

## 1. Service Level Indicators (SLIs)

| SLI | Definition | Source metric |
|---|---|---|
| Availability | Fraction of successful (non-5xx) requests | `adip_request_errors_total` / `adip_requests_total` |
| Latency | Request latency | `adip_request_latency_ms_avg` (proxy; add histogram for true p95) |
| Correctness | Artifact quality ≥ band threshold | ML evaluation pipeline (`app.ml.evaluation`) |
| Freshness | LLM circuit healthy, cache effective | `GET /api/v1/llm/runtime` |

---

## 2. Service Level Objectives (SLOs)

| SLO | Target (30-day) | Rationale |
|---|---|---|
| API availability | **99.5%** success | Enterprise internal platform |
| API latency | **p95 < 800 ms** | Interactive dashboards/authoring |
| Artifact quality | **≥ 90%** of generated artifacts in Good/Excellent | Deterministic engine baseline is high |
| LLM resilience | Circuit breaker `open` **< 0.1%** of time | Fallback + mock keep UX up |

---

## 3. Error budgets

- **Availability 99.5%** → budget = **0.5%** of requests may fail per 30 days.
- Burn-rate policy:
  - **Fast burn** (2% error over 5m) → page immediately (`AdipHighErrorRate`).
  - **Slow burn** (budget projected to exhaust before window end) → ticket, prioritize.
- When the budget is exhausted: freeze risky changes, focus on reliability until recovered.

---

## 4. Health probes (Kubernetes)

Configured in `deploy/k8s/backend.yaml` and the Helm chart:

| Probe | Endpoint | Purpose |
|---|---|---|
| Startup | `/health` | Gate traffic until the app + migrations are ready |
| Readiness | `/api/v1/health` | Remove from LB if DB unreachable |
| Liveness | `/health` | Restart a wedged pod |

---

## 5. Capacity planning

- **Baseline:** run `python -m app.cli perf` → `docs/examples/performance/` for
  throughput and p95 under load.
- **Scaling:** backend is stateless; HPA scales on CPU (70% target, 2–10 replicas).
  Add custom metrics (rps, latency) to HPA for finer control.
- **Database:** the usual bottleneck — see `docs/11_Database/Production Database Guide.md`
  (indexes, pooling, read replicas, partitioning).
- **LLM:** scale provider replicas; the runtime bounds concurrency and caches to
  protect the backend.

---

## 6. Auto-recovery hooks

- **Circuit breaker** (runtime) sheds load from a failing LLM provider and
  half-opens automatically; mock mode is the ultimate fallback.
- **HPA** scales out under CPU pressure; **liveness** restarts wedged pods.
- **Restart policy** + startup probe ensure clean migration-then-serve on boot.
- Alertmanager routes (`alert_rules.yml`) can trigger runbooks in
  `docs/09_Operations/Runbooks.md`.
