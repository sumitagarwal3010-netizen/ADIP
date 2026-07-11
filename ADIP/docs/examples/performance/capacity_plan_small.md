# ADIP Enterprise Capacity Planning Report — small

_Generated: 2026-07-09T01:22:43.312328+00:00_ | Environment: **development**

## Executive Summary

- Monthly cost estimate: **$73.31** (annual $879.74)
- Object storage/year: **10.85 GB**
- Cloud SQL/year: **0.23 GB**
- Network egress/month: **15.77 GB**
- GKE nodes (est.): **2**

## Inputs

| Metric | Value |
|---|---|
| Users | 100 |
| Concurrent users | 25 |
| Prompts/day | 1200 |
| Artifacts/day | 400 |
| Retention days | 90 |

## Object Storage

- Uploads/day: 370 | month: 11100
- Storage/day: 120.54 MB
- After compression: 7.05 GB
- After deduplication: 5.99 GB
- After versioning: 7.49 GB
- Archive (coldline): 4.34 GB

## Database Growth

| Table | Rows/day | Year storage |
|---|---:|---:|
| artifacts | 60 | 16.59 MB |
| prompt_history | 300 | 110.59 MB |
| prompt_replay | 60 | 11.06 MB |
| prompt_metadata | 120 | 16.59 MB |
| golden_datasets | 4 | 2.95 MB |
| benchmark_results | 32 | 5.90 MB |
| connector_metadata | 12 | 1.59 MB |
| connector_runs | 14 | 1.33 MB |

**Total Cloud SQL:** 0.23 GB/year | Backup: 0.26 GB

## Network

- Ingress/month: 2.29 GB | Egress/month: 15.77 GB
- Annual bandwidth: 216.73 GB

## Cost Breakdown

| Component | Monthly USD |
|---|---:|
| Compute | $36.00 |
| Database | $0.00 |
| Redis | $7.50 |
| Object storage | $0.06 |
| Vector storage | $0.00 |
| Networking | $0.65 |
| LLM | $21.60 |
| Monitoring | $7.50 |
| **Total** | **$73.31** |

## Growth Forecast

| Period | Storage GB | Database GB | Artifacts |
|---|---:|---:|---:|
| day | 0.12 | 0.0 | 400 |
| week | 0.86 | 0.0 | 2800 |
| month | 3.69 | 0.02 | 12000 |
| quarter | 11.08 | 0.06 | 36000 |
| year | 38.19 | 0.2 | 124100 |
| 3yr | 114.57 | 0.59 | 372300 |
| 5yr | 190.95 | 0.98 | 620500 |
