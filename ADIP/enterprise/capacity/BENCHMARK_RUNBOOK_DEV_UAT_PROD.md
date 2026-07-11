# ADIP Benchmark Runbook — Dev, UAT, Production

Operational guide for running the existing ADIP benchmark and enterprise capacity planning suite.

## Purpose

Establish repeatable capacity baselines before environment promotion (Dev → UAT → Prod). All benchmarks run in **mock/demo mode** without live cloud credentials.

## What benchmarks exist

| Benchmark | Script | API |
|-----------|--------|-----|
| Infra sizing (GKE/GCP) | `scripts/run_infra_sizing_benchmark.py` | `POST /api/v1/benchmarks/infra-sizing/run` |
| Capacity planning | `scripts/run_capacity_planning.py` | `POST /api/v1/benchmarks/capacity-planning/plan` |
| Enterprise capacity | via `run_all_benchmarks.py` | `POST /api/v1/benchmarks/capacity-planning/plan/enterprise` |
| LLM smoke test | `scripts/run_llm_smoke_test.py` | `POST /api/v1/llm/smoke-test` |
| Prompt regression | `scripts/run_prompt_regression.py` | `POST /api/v1/prompt-regression/run-golden` |
| Artifact quality | `scripts/run_artifact_quality_check.py` | `GET /api/v1/artifact-quality/scorecard` |
| Connector artifact demo | `scripts/run_connector_artifact_demo.py` | `POST /api/v1/connectors/artifacts/generate` |
| **All-in-one** | `scripts/run_all_benchmarks.py` | — |

## When to run each benchmark

| When | Run |
|------|-----|
| Local dev setup | LLM smoke + artifact quality |
| Sprint baseline | Infra sizing `small` + capacity `small` |
| UAT gate | Infra `medium` + capacity `medium` + prompt regression |
| Pre-prod / release | Enterprise capacity + load tests |
| Post-deploy calibration | `POST /capacity-planning/calibrate` with Prometheus metrics |

## Prerequisites

```bash
cd /path/to/ADIP
python3 --version   # 3.11+
cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt openpyxl
```

Optional: `pip install pyyaml` for `benchmark_profiles.yaml` parsing in `run_all_benchmarks.py` (falls back to built-in defaults).

## Environment profiles

Configuration: `scripts/benchmark_profiles.yaml`

| Setting | Dev | UAT | Prod |
|---------|-----|-----|------|
| Profile | small | medium | enterprise |
| Auth | demo | demo/OIDC optional | OIDC enforced |
| Connectors | mock | staged | live |
| DB | SQLite | PostgreSQL | Cloud SQL |
| Object storage | local | MinIO | GCS |
| Redis | off | on | on |
| Retention | 30d | 90d | 365d |
| Load concurrency | 2 | 10 | 50 |
| Prometheus/Grafana | off | prom on | both on |

## Commands

### Dev (small)

```bash
python3 scripts/run_infra_sizing_benchmark.py small
python3 scripts/run_capacity_planning.py small --env dev --excel
python3 scripts/run_llm_smoke_test.py
python3 scripts/run_artifact_quality_check.py BRD
```

### UAT (medium)

```bash
python3 scripts/run_infra_sizing_benchmark.py medium
python3 scripts/run_capacity_planning.py medium --env uat --excel
python3 scripts/run_prompt_regression.py
python3 scripts/run_connector_artifact_demo.py
```

### Production (enterprise)

```bash
python3 scripts/run_capacity_planning.py enterprise --env production --load --excel
python3 scripts/run_all_benchmarks.py --env prod
```

### All environments

```bash
python3 scripts/run_all_benchmarks.py --all-envs
```

## Expected outputs

All reports land in `docs/examples/performance/`:

| File pattern | Format |
|--------------|--------|
| `infra_sizing_{profile}.json` / `.md` | Infra sizing |
| `capacity_plan_{profile}.json` / `.md` / `.html` / `.csv` | Capacity plan |
| `capacity_plan_{profile}_executive_summary.md` | Executive summary |
| `enterprise_capacity_{profile}.json` | Enterprise extensions |
| `ADIP_Capacity_Planner.xlsx` | Excel workbook (repo root) |
| `llm_smoke_test.json` | LLM smoke (when using run_all) |
| `connector_artifact_demo.json` | Connector demo |

## Reading outputs

### CPU / RAM / GKE (`gke` section in JSON)

- `backend.replicas`, `cpu_limit`, `memory_limit` — per-pod sizing
- `node_count_est` — estimated GKE nodes at 70% utilization
- `node_pool_vcpu`, `node_pool_memory_gi` — aggregate pool

### Cloud SQL (`database_growth.cloud_sql_gb_year`)

Annual database growth from artifacts, prompts, connectors, audit tables. Add `backup_gb_year` for backup storage.

### Object storage (`object_storage.storage_per_year_bytes`)

Raw and post-processing estimates: `after_compression_bytes`, `archive_coldline_bytes`.

### Redis (`redis.total_mb`)

Cache breakdown: prompt, connector, session, artifact, metadata.

### GPU (`gpu` — when `local_llm=true`)

`recommended_gpu`, `vram_required_gb`, `throughput_rps`.

### Cost (`costs.monthly_total_usd`)

Component breakdown: compute, database, redis, object storage, vector, networking, LLM, monitoring.

## Comparing Dev / UAT / Prod

| Metric | Dev small | UAT medium | Prod enterprise |
|--------|-----------|------------|-----------------|
| Monthly cost | ~$73 | ~$234 | ~$3,279 |
| GKE nodes | 2 | 2 | 4 |
| Cloud SQL GB/yr | 0.23 | 0.23 | 0.23 |
| Object storage GB/yr | 10.85 | 10.85 | 10.85 |
| Redis MB | 6.92 | 6.92 | 6.92 |
| Network egress GB/mo | 15.77 | 15.77 | 15.77 |

*Generated 2026-07-09 from local mock runs. Re-run scripts to refresh.*

## Calibrating with real GKE metrics

```bash
curl -X POST http://localhost:8000/api/v1/benchmarks/capacity-planning/calibrate \
  -H 'Content-Type: application/json' \
  -d '{
    "profile": "medium",
    "calibration": {
      "source": "prometheus",
      "cpu_millicores_actual": 1200,
      "ram_mb_actual": 4096,
      "storage_gb_actual": 85
    }
  }'
```

Review `correction_factors` and `future_adjustments` in the response.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `No module named pytest/app` | Run `scripts/_bootstrap.py` path: use `python3 scripts/...` from repo root |
| LLM smoke exit 1 | Expected if `token_estimate` check fails in mock — review JSON, other checks may pass |
| Prompt regression FAIL 4/5 | Mock similarity thresholds — acceptable for local demo |
| Connector DB error | Script falls back to `ConnectorArtifactService` direct call |
| openpyxl missing | `pip install openpyxl` or skip `--excel` |
| Backend not running | Scripts use TestClient — no server required |

## Environment variables

See `backend/.env.example` and `deploy/.env.example` for:

`ADIP_ENV`, `ADIP_BENCHMARK_MODE`, `ADIP_AUTH_MODE`, `CONNECTOR_MODE`, `LOCAL_LLM_ENABLED`, `OBJECT_STORAGE_PROVIDER`, `OBJECT_STORAGE_BUCKET`, `REDIS_ENABLED`, `CAPACITY_PROFILE`, `BENCHMARK_OUTPUT_DIR`, `BENCHMARK_RETENTION_DAYS`, `PROMETHEUS_ENABLED`, `GRAFANA_ENABLED`

## Related docs

- `CAPACITY_PLANNING_GUIDE.md` — capacity suite overview
- `CURSOR_BENCHMARK_OPERATOR_GUIDE.md` — running from Cursor IDE
- `BENCHMARK_EXECUTION_MATRIX.md` — role/runtime matrix
- `DEV_UAT_PROD_CAPACITY_BASELINE.md` — latest baseline numbers
