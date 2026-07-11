# Enterprise Capacity Planning Guide

The **Enterprise Capacity Planning Suite** orchestrates all estimators into a unified plan.

## Inputs

Applications, projects, users, concurrent users, prompts/day, artifacts/day, documents/day, uploads/day, sizes, connector sync frequency, retention, embedding, local/managed LLM.

## Outputs

CPU, RAM, pods, node count, Cloud SQL, Redis, object storage, vector storage, network, monthly/annual cost, growth forecast.

## API

```
GET  /api/v1/benchmarks/capacity-planning
POST /api/v1/benchmarks/capacity-planning/plan
POST /api/v1/benchmarks/capacity-planning/excel
```

## CLI

```bash
python3 scripts/run_capacity_planning.py medium --env production --excel
```

## Workbench

Team Engineering Workbench → Capacity Planning, Object Storage, Cost, Growth Forecast tabs.

## Module

`backend/app/perf/capacity/planner_engine.py` — `EnterpriseCapacityPlanner`

Reuses `InfraSizingBenchmarkService` for GKE sizing.
