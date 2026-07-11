# Dev / UAT / Prod Capacity Baseline

Generated from local benchmark runs on branch `adip-ai-sdlc-june6-stable` (2026-07-09, mock mode).

Report location: `docs/examples/performance/`

## Dev — small profile (`development`)

**Command:** `python3 scripts/run_capacity_planning.py small --env dev --excel`

| Component | Value |
|-----------|-------|
| Monthly cost | **$73.31** |
| Annual cost | $879.72 |
| GKE nodes (est.) | 2 |
| Backend replicas | 2 |
| Cloud SQL GB/year | 0.23 |
| Backup GB/year | 0.25 |
| Object storage GB/year | 10.85 |
| Redis total MB | 6.92 |
| Network egress GB/month | 15.77 |
| GPU | N/A (managed LLM) |

**Infra sizing:** `infra_sizing_small.json` — 7/7 scenarios OK, GKE nodes 2, Cloud SQL 0.03 GB, GCS 0.03 GB

## UAT — medium profile (`uat`)

**Command:** `python3 scripts/run_capacity_planning.py medium --env uat --excel`

| Component | Value |
|-----------|-------|
| Monthly cost | **$233.62** |
| Annual cost | $2,803.44 |
| GKE nodes (est.) | 2 |
| Backend replicas | 3 |
| Cloud SQL GB/year | 0.23 |
| Object storage GB/year | 10.85 |
| Redis total MB | 6.92 |
| Network egress GB/month | 15.77 |

**Infra sizing:** `infra_sizing_medium.json` — 7/7 scenarios OK, GKE nodes 2, Cloud SQL 0.5 GB, GCS 0.6 GB

## Prod — enterprise profile (`production`)

**Command:** `python3 scripts/run_capacity_planning.py enterprise --env production --load --excel`

| Component | Value |
|-----------|-------|
| Monthly cost | **$3,279.37** |
| Annual cost | $39,352.44 |
| GKE nodes (est.) | 4 |
| Backend replicas | 10 |
| Cloud SQL GB/year | 0.23 |
| Object storage GB/year | 10.85 |
| Redis total MB | 6.92 |
| Network egress GB/month | 15.77 |
| Load tests | 6 scenarios @ concurrency 10 |

## GKE sizing summary

| Profile | Nodes | Backend CPU limit | Backend memory | Frontend replicas |
|---------|-------|-------------------|----------------|-------------------|
| small | 2 | ~500m | ~256Mi | 2 |
| medium | 2 | ~500m | ~512Mi | 2 |
| enterprise | 4 | ~2000m | ~1Gi+ | 4 |

## Cost breakdown (enterprise)

| Component | Monthly USD |
|-----------|-------------|
| Compute | ~$2,880 |
| LLM | ~$288 |
| Monitoring | ~$50 |
| Database | ~$0.04 |
| Redis | ~$25 |
| Object storage | ~$0.20 |
| Networking | ~$4 |

## Recommended next actions

1. **Dev** — Use baselines for local resource limits; no cloud spend required.
2. **UAT** — Run `run_prompt_regression.py` before each release; compare against this baseline.
3. **Prod** — Run enterprise plan with `--load`; calibrate against real Prometheus after GKE deploy.
4. **Cost optimization** — Run `POST /plan/enterprise` and review `cost_optimization` (est. 25–35% savings via RI + lifecycle).
5. **Storage** — Object storage dominates long-term; enable lifecycle policies before prod go-live.
6. **Refresh** — Re-run `python3 scripts/run_all_benchmarks.py --all-envs` after major feature changes.

## Files generated

```
docs/examples/performance/
  infra_sizing_small.json / .md
  infra_sizing_medium.json / .md
  capacity_plan_small.json / .md / .html / .csv
  capacity_plan_medium.json / .md / .html / .csv
  capacity_plan_enterprise.json / .md / .html / .csv
  enterprise_capacity_small.json (+ summaries)
  llm_smoke_test.json
  artifact_quality_brd.json
  connector_artifact_demo.json
ADIP_Capacity_Planner.xlsx
```
