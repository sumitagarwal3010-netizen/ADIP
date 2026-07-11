# ADIP Infra Sizing Benchmark — small

_Generated: 2026-07-09T01:22:37.675423+00:00_

## Scenario metrics

| Scenario | In tok | Out tok | Latency ms | Peak MB | CPU m | DB rows | GCS est |
|---|--:|--:|--:|--:|--:|--:|--:|
| prompt_execution | 34 | 81 | 221.17 | 118.27 | 146 | 2 | 4800 |
| artifact_generation | 5 | 954 | 12.95 | 118.27 | 121 | 2 | 4800 |
| connector_artifact_generation | 34 | 341 | 0.1 | 118.27 | 107 | 5 | 4800 |
| prompt_regression | 34 | 122 | 3.53 | 118.27 | 103 | 2 | 4800 |
| llm_smoke_test | 3 | 142 | 28.98 | 122.03 | 107 | 2 | 4800 |
| rule_engine_execution | 34 | 1078 | 1.28 | 122.03 | 122 | 2 | 4800 |
| traceability_matrix_generation | 5 | 3277 | 9.65 | 122.03 | 166 | 2 | 13105 |

## Totals

- Total tokens: **6144**
- Avg duration: **39.67 ms**
- Peak memory (max): **122.03 MB**

## GKE sizing

| Component | Replicas | CPU req/limit | Memory req/limit |
|---|---|---|---|
| Backend | 2 | 250m/250m | 256Mi/256Mi |
| Frontend | 2 | 50m/250m | 64Mi/128Mi |
| Worker | 1 | 250m/1000m | 512Mi/1Gi |

- **Node pool:** ~2.1 vCPU, ~2.5 Gi RAM, **2 nodes** (est.)
- **Cloud SQL:** ~0.03 GB
- **GCS:** ~0.03 GB
- **Monthly storage growth:** ~0.06 GB

## Assumptions

- Profile small: 25 DAU, 200 prompts/day
- Retention 30 days; token estimate ~4 chars/token
- CPU/memory from mock scenario peaks + 50% headroom
- Node pool at 70% target utilization
- Cloud SQL and GCS sized from daily write heuristics
