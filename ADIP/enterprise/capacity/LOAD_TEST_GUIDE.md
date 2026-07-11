# Load Test Guide

Enterprise load generator extending `perf.harness` patterns.

## Scenarios

- prompt_execution
- artifact_generation
- connector_sync
- rule_engine
- prompt_regression
- traceability

## Concurrency levels

1, 10, 50, 100, 250, 500, 1000, 5000

## API

```
POST /api/v1/benchmarks/capacity-planning/load-test
POST /api/v1/benchmarks/capacity-planning/load-test/suite?concurrency=10
```

## Module

`backend/app/perf/capacity/load_generator.py`

## Reports

JSON load test results included in capacity plan when `run_load_test=true`.
