# Benchmark Execution Matrix

| Benchmark | Script / API | Dev | UAT | Prod | Inputs | Outputs | Owner | Runtime | Dependencies |
|-----------|--------------|-----|-----|------|--------|---------|-------|---------|--------------|
| Infra sizing | `run_infra_sizing_benchmark.py` / `POST /benchmarks/infra-sizing/run` | small | medium | enterprise | profile, scenarios | JSON, MD | Platform/SRE | ~2s | SQLite, TestClient |
| Capacity planning | `run_capacity_planning.py` / `POST /benchmarks/capacity-planning/plan` | small + dev | medium + uat | enterprise + prod | profile, env, --excel | JSON, MD, HTML, CSV, XLSX | Platform | ~2s | openpyxl optional |
| Enterprise capacity | `run_all_benchmarks.py` / `POST /plan/enterprise` | optional | recommended | required | ha_target, region_topology | JSON + extended MD | Architect | ~5s | — |
| Scenario comparison | API only | skip | optional | required | profiles, topologies | JSON, CSV | Architect | ~10s | — |
| Calibration | API only | mock | Prometheus | Prometheus/Cloud Monitoring | actual metrics | JSON, MD | SRE | ~1s | — |
| LLM smoke | `run_llm_smoke_test.py` / `POST /llm/smoke-test` | yes | yes | yes | none | JSON stdout | GenAI Eng | ~1s | mock LLM |
| Prompt regression | `run_prompt_regression.py` / `POST /prompt-regression/run-golden` | optional | yes | yes | golden limit | text summary | QA/GenAI | ~1s | golden datasets |
| Artifact quality | `run_artifact_quality_check.py` / `GET /artifact-quality/scorecard` | yes | yes | yes | artifact_type | JSON | QA | ~1s | rule engine |
| Connector artifact | `run_connector_artifact_demo.py` / `POST /connectors/artifacts/generate` | yes | yes | staged | connector_types | JSON | Integration | ~2s | mock connectors |
| Load test | `--load` flag / `POST /capacity-planning/load-test` | no | optional | yes | concurrency | JSON | Performance | ~30s | TestClient |
| Benchmark history | API only | optional | yes | yes | prior runs | JSON | SRE | instant | in-process store |
| **All benchmarks** | `run_all_benchmarks.py --all-envs` | dev suite | uat suite | prod suite | `--env`, `--profile` | all above | Release Mgr | ~2min | venv |

## API curl examples (backend optional)

```bash
# Info
curl -s http://localhost:8000/api/v1/benchmarks/infra-sizing | jq .
curl -s http://localhost:8000/api/v1/benchmarks/capacity-planning | jq .

# Run infra sizing
curl -s -X POST http://localhost:8000/api/v1/benchmarks/infra-sizing/run \
  -H 'Content-Type: application/json' \
  -d '{"profile":"medium"}' | jq '.gke.node_count_est'

# Capacity plan
curl -s -X POST http://localhost:8000/api/v1/benchmarks/capacity-planning/plan \
  -H 'Content-Type: application/json' \
  -d '{"profile":"small","environment":"development","inputs":{"run_infra_scenarios":false}}' | jq '.costs.monthly_total_usd'

# Enterprise plan
curl -s -X POST http://localhost:8000/api/v1/benchmarks/capacity-planning/plan/enterprise \
  -H 'Content-Type: application/json' \
  -d '{"profile":"medium","run_calibration":true}' | jq '.enterprise.architect_recommendations.overall_status'

# Compare scenarios
curl -s -X POST http://localhost:8000/api/v1/benchmarks/capacity-planning/compare \
  -H 'Content-Type: application/json' \
  -d '{"profiles":["small","medium","large"]}' | jq '.recommendation'

# Calibrate
curl -s -X POST http://localhost:8000/api/v1/benchmarks/capacity-planning/calibrate \
  -H 'Content-Type: application/json' \
  -d '{"profile":"medium","calibration":{"source":"mock"}}' | jq '.accuracy_pct'

# History
curl -s http://localhost:8000/api/v1/benchmarks/capacity-planning/history | jq .
```

Backend does not need to be running for CLI scripts (they use in-process TestClient).
