# ADIP Infra Sizing Benchmark — medium

_Generated: 2026-07-09T01:20:48.728869+00:00_

## Scenario metrics

| Scenario | In tok | Out tok | Latency ms | Peak MB | CPU m | DB rows | GCS est |
|---|--:|--:|--:|--:|--:|--:|--:|
| prompt_execution | 34 | 80 | 131.65 | 124.75 | 128 | 2 | 4800 |
| artifact_generation | 5 | 954 | 9.65 | 125.42 | 120 | 2 | 4800 |
| connector_artifact_generation | 34 | 341 | 0.09 | 125.42 | 107 | 5 | 4800 |
| prompt_regression | 34 | 122 | 2.36 | 125.42 | 103 | 2 | 4800 |
| llm_smoke_test | 3 | 142 | 13.06 | 129.08 | 104 | 2 | 4800 |
| rule_engine_execution | 34 | 1078 | 0.32 | 129.08 | 122 | 2 | 4800 |
| traceability_matrix_generation | 5 | 3277 | 4.46 | 129.2 | 165 | 2 | 13105 |

## Totals

- Total tokens: **6143**
- Avg duration: **23.08 ms**
- Peak memory (max): **129.2 MB**

## GKE sizing

| Component | Replicas | CPU req/limit | Memory req/limit |
|---|---|---|---|
| Backend | 3 | 250m/250m | 256Mi/256Mi |
| Frontend | 2 | 50m/250m | 64Mi/128Mi |
| Worker | 2 | 250m/1000m | 512Mi/1Gi |

- **Node pool:** ~3.2 vCPU, ~4.3 Gi RAM, **2 nodes** (est.)
- **Cloud SQL:** ~0.5 GB
- **GCS:** ~0.6 GB
- **Monthly storage growth:** ~0.37 GB

## Assumptions

- Profile medium: 100 DAU, 1200 prompts/day
- Retention 90 days; token estimate ~4 chars/token
- CPU/memory from mock scenario peaks + 50% headroom
- Node pool at 70% target utilization
- Cloud SQL and GCS sized from daily write heuristics
