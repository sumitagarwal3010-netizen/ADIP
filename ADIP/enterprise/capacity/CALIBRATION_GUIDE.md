# Calibration Guide

Compare estimated capacity against actual runtime metrics.

## Input sources

kubectl top, Prometheus, Cloud Monitoring, Grafana, mock (no live cluster required).

## Outputs

Estimated vs actual, accuracy %, correction factors, future sizing adjustments.

## API

```
POST /api/v1/benchmarks/capacity-planning/calibrate
{
  "profile": "medium",
  "calibration": {
    "source": "mock",
    "cpu_millicores_actual": 900,
    "ram_mb_actual": 2048
  }
}
```

## Module

`backend/app/perf/capacity/calibration.py`

## Workbench

Team Engineering Workbench → Enterprise Capacity → Calibration tab.
