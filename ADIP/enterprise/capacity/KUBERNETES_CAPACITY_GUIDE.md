# Kubernetes Capacity Guide

Extends the GKE planner with full Kubernetes platform resource estimates.

## Resources estimated

Deployments, StatefulSets, DaemonSets, Jobs, CronJobs, HPA, VPA, PDB, Ingress, Services, PVCs, ConfigMaps, Secrets.

## Outputs

- Resource counts and replicas per workload
- PVC total (Gi), namespace layout
- Cluster complexity score (low → very_high)

## API

```
POST /api/v1/benchmarks/capacity-planning/plan/enterprise
```

Returns `enterprise.kubernetes_platform`.

## Module

`backend/app/perf/capacity/enterprise_planners.py` — `estimate_kubernetes_platform()`
