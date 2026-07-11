# ADIP Infrastructure Sizing Benchmark (GKE/GCP)

Additive guide for capacity planning — extends the existing token benchmark (`app/llm/tokens.py`), prompt benchmark (`BenchmarkService`), and performance harness (`app/perf/harness.py`) without replacing them.

## Purpose

Estimate **CPU, memory, storage, and GKE node pool** requirements from mock workload scenarios that mirror ADIP operations:

| Scenario | Source reused |
|----------|---------------|
| Prompt execution | `BenchmarkService._evaluate` |
| Artifact generation | `/artifact-generation` API |
| Connector artifact generation | `ConnectorArtifactService` |
| Prompt regression | `/prompt-regression/run-golden` |
| LLM smoke test | `/llm/smoke-test` |
| Rule engine | `RuleEngine.run` |
| Traceability matrix | `/traceability/projects/{id}/matrix` |

## Metrics collected per scenario

- Input / output / total tokens (`estimate_tokens`)
- Latency and request duration (`perf_counter`)
- Peak memory (`resource.getrusage`, best-effort)
- CPU millicores (heuristic from duration + tokens)
- Artifact output bytes
- DB row growth estimate
- Vector embedding storage estimate (384-dim float32 heuristic)
- Object storage (GCS) estimate
- Log storage estimate

## Token → infra mapping

| Token/load signal | Maps to |
|-------------------|---------|
| Total tokens / prompt | Backend memory headroom (+~0.5 MB per 200 tokens) |
| Duration + tokens | Backend CPU millicores |
| DB rows × prompts/day | Cloud SQL storage |
| Artifact bytes × prompts/day | GCS bucket storage |
| Embeddings per row | Vector index / future Vertex AI storage |
| Log bytes per token | Cloud Logging / GCS log archive |

## Sizing profiles

| Profile | DAU | Prompts/user/day | Retention | Local LLM |
|---------|-----|------------------|-----------|-----------|
| small | 25 | 8 | 30d | No |
| medium | 100 | 12 | 90d | No |
| large | 500 | 15 | 180d | Yes (8Gi) |
| enterprise | 2000 | 20 | 365d | Yes (16Gi) |

## Sample GKE sizing (medium profile, mock run)

| Component | Replicas | CPU req/limit | Memory req/limit |
|-----------|----------|---------------|------------------|
| adip-backend | 3 | 250m–800m | 256Mi–512Mi |
| adip-frontend | 2 | 50m/250m | 64Mi/128Mi |
| connector-worker | 2 | 250m/1000m | 512Mi/1Gi |

Plus Cloud SQL and GCS estimates from daily write heuristics.

## Run locally

```bash
# CLI (mock mode, no GCP credentials)
python3 scripts/run_infra_sizing_benchmark.py medium

# All profiles
for p in small medium large enterprise; do python3 scripts/run_infra_sizing_benchmark.py $p; done

# API
curl http://localhost:8000/api/v1/benchmarks/infra-sizing
curl -X POST http://localhost:8000/api/v1/benchmarks/infra-sizing/run \
  -H 'Content-Type: application/json' \
  -d '{"profile":"medium"}'
```

Reports written to `docs/examples/performance/infra_sizing_{profile}.json` and `.md`.

## Assumptions and limitations

1. **Mock mode** — scenarios run in-process via `TestClient`; no live LLM or GCP calls.
2. **Token estimate** — ~4 characters per token (`app/llm/tokens.py`).
3. **CPU/memory** — heuristics + `ru_maxrss`; not a substitute for production profiling.
4. **Node pool** — 70% utilization target; round up to n2-standard-4+ class nodes.
5. **Local LLM** — large/enterprise profiles add Ollama pod (GPU node pool recommended).

## Helm baseline comparison

Current Helm defaults (`deploy/helm/adip/values.yaml`):

- Backend: 250m CPU / 256Mi request, 1 CPU / 512Mi limit, 2 replicas
- Frontend: 50m / 64Mi request, 250m / 128Mi limit, 2 replicas

Use infra sizing benchmark output to adjust `values.yaml` for your profile.

## Related docs

- `docs/02_AI_SDLC/Evaluation/Prompt Benchmark Guide.md`
- `app/perf/harness.py` — HTTP latency benchmark
- `enterprise/team-takeover/10_DEVOPS_GUIDE.md`
- `deploy/helm/adip/values.yaml`
