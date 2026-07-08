# Testing Strategy

## Backend tests

`cd backend && pytest -q` — 250+ tests, isolated SQLite in `conftest.py`.

Key suites: connectors, connector artifact workbench, team takeover (rules, smoke, regression), production hardening.

## Frontend tests

`npm run test` — Vitest. Covers auth config, apiConfig, connector hooks, rule panel.

## Prompt tests

- `POST /api/v1/prompt-testing/*`
- `python scripts/run_prompt_regression.py`

## Connector tests

`tests/test_connectors.py`, `tests/test_connector_artifact_workbench.py`

## Integration tests

FastAPI `TestClient` against full app — no live network.

## Regression tests

`POST /api/v1/prompt-regression/compare` (pairwise)  
`POST /api/v1/prompt-regression/run-golden` (mock batch)

## Performance tests

`python -m app.cli perf` — harness in `app/perf/`.

## Pre-release validation

```bash
pytest -q && npx tsc --noEmit && npm run build && npm run test
python scripts/run_llm_smoke_test.py
python scripts/run_connector_artifact_demo.py
```

Cross-reference: `enterprise/connectivity/TESTING_GUIDE.md`, `docs/06_Test_Workbench/`.
