# Performance Engineering Guide

ADIP performance engineering spans benchmarks, load testing, and resource profiling.

## Components

| Module | Purpose |
|--------|---------|
| `perf/harness.py` | HTTP latency harness |
| `perf/infra_sizing_benchmark.py` | GKE/GCP sizing |
| `perf/capacity/` | Enterprise capacity suite |
| `services/benchmark_service.py` | Prompt benchmark |
| `llm/tokens.py` | Token estimation |

## Resource profiling

`perf/capacity/resource_profiler.py` — peak/avg RAM and CPU via psutil (graceful degradation).

## Prometheus metrics

Extended in `app/core/metrics.py`:

- `adip_capacity_storage_gb_year`
- `adip_capacity_database_gb_year`
- `adip_capacity_monthly_cost_usd`
- `adip_capacity_gke_nodes_est`
- `adip_capacity_redis_mb`
- `adip_capacity_network_egress_gb_month`
- `adip_capacity_vector_storage_gb`
- `adip_capacity_prompt_throughput_rps`
- `adip_capacity_benchmark_runs_total`

## Reports

Markdown, JSON, CSV, HTML under `docs/examples/performance/`.
