# Infrastructure Planning Guide

Combines infra sizing benchmark with enterprise capacity planning for GKE deployment.

## GKE capacity planner

Reuses `InfraSizingBenchmarkService.estimate_gke()`:

- Backend, frontend, connector worker, LLM (Ollama) pods
- CPU/memory requests and limits
- Node pool vCPU, memory Gi, node count
- Autoscaling assumptions (70% utilization target)

## Cloud SQL & GCS

Sized from database growth and object storage estimators.

## Redis

Session, prompt, connector, artifact, metadata cache — TTL 24h default.

## Helm baseline

See `deploy/helm/adip/values.yaml` for resource requests.

## Terraform / Prometheus / Grafana

Use capacity plan outputs to right-size node pools, Cloud SQL tier, GCS buckets, and alert thresholds.

## Workflow

1. Run `python3 scripts/run_capacity_planning.py enterprise --excel`
2. Review `ADIP_Capacity_Planner.xlsx`
3. Apply GKE node pool sizing from report `gke` section
4. Configure lifecycle policies on object storage from compression/archive estimates
