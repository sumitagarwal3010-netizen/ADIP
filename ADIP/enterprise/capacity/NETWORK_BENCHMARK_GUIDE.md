# Network Benchmark Guide

Estimates ingress/egress for ADIP platform traffic.

## Traffic types

REST, streaming (managed LLM), WebSocket, connector sync, prompt traffic, artifact downloads, dashboard.

## Outputs

Monthly ingress/egress GB per category, annual bandwidth total.

## API

```
GET /api/v1/benchmarks/capacity-planning/sections/network?profile=medium
```

## Module

`backend/app/perf/capacity/estimators.py` — `estimate_network()`
