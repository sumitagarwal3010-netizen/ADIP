# Cost Optimization Guide

Generates actionable cost reduction recommendations.

## Strategies

Reserved instances, spot nodes, autoscaling, GPU sharing, storage lifecycle, compression, caching, deduplication, cold storage, archive.

## Outputs

Per-strategy monthly/annual savings, effort level, recommendation text.

## API

`POST /plan/enterprise` → `enterprise.cost_optimization`

Extended report: `enterprise_capacity_{profile}_cost_optimization.md`

## Module

`backend/app/perf/capacity/cost_optimizer.py`
