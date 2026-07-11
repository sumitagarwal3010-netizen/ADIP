# Database Growth Guide

Estimates Cloud SQL growth across ADIP data domains.

## Tables

Artifacts, prompt history/replay/metadata, golden datasets, benchmark results, connector metadata/runs/logs, traceability, rule execution, audit history, metrics, logs, embeddings.

## Outputs

- Rows/day, month, year per table
- Index overhead
- Cloud SQL GB/year, backup GB/year

## API

```
GET /api/v1/benchmarks/capacity-planning/sections/database_growth?profile=medium
```

## Module

`backend/app/perf/capacity/estimators.py` — `estimate_database_growth()`
