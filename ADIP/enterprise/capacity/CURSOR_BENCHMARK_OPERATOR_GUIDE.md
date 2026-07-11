# Cursor Benchmark Operator Guide

Step-by-step instructions for running ADIP benchmarks from the Cursor IDE terminal.

## 1. Open terminal

In Cursor: **Terminal → New Terminal** (or `` Ctrl+` ``).

## 2. Verify repository

```bash
cd /Users/nikhil/Documents/ADIP/ADIP   # adjust to your clone path
git branch --show-current            # expect: adip-ai-sdlc-june6-stable
ls scripts/run_*.py
```

## 3. Activate virtual environment (recommended)

```bash
cd backend
python3 -m venv .venv          # first time only
.venv/bin/pip install -r requirements.txt openpyxl
cd ..
```

Scripts auto-bootstrap via `scripts/_bootstrap.py` — venv activation is optional but faster.

## 4. Run individual benchmarks

```bash
# Infra sizing
python3 scripts/run_infra_sizing_benchmark.py small
python3 scripts/run_infra_sizing_benchmark.py medium

# Capacity planning (Dev / UAT / Prod)
python3 scripts/run_capacity_planning.py small --env dev --excel
python3 scripts/run_capacity_planning.py medium --env uat --excel
python3 scripts/run_capacity_planning.py enterprise --env production --load --excel

# Quality & smoke
python3 scripts/run_llm_smoke_test.py
python3 scripts/run_prompt_regression.py
python3 scripts/run_artifact_quality_check.py BRD
python3 scripts/run_connector_artifact_demo.py
```

## 5. Run all benchmarks

```bash
python3 scripts/run_all_benchmarks.py --env dev
python3 scripts/run_all_benchmarks.py --all-envs
```

Review the summary table printed at the end. Output directory: `docs/examples/performance/`.

## 6. Review outputs in Cursor

Open files from the file explorer:

- `docs/examples/performance/capacity_plan_medium.md` — human-readable report
- `docs/examples/performance/capacity_plan_medium.json` — full structured data
- `ADIP_Capacity_Planner.xlsx` — Excel workbook (open externally or in Cursor)

Use **Cursor chat** to ask questions about specific JSON fields.

## 7. Optional — start backend for API smoke

```bash
cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000
```

Then in a second terminal:

```bash
curl -s http://localhost:8000/api/v1/benchmarks/capacity-planning | jq .
curl -s -X POST http://localhost:8000/api/v1/benchmarks/capacity-planning/plan \
  -H 'Content-Type: application/json' \
  -d '{"profile":"small"}' | jq '.costs.monthly_total_usd'
```

## 8. Regenerate OpenAPI (if APIs changed)

```bash
cd backend && .venv/bin/python scripts/export_api.py
```

Updates `docs/10_API/openapi.json`.

## 9. Run validation

```bash
cd backend && .venv/bin/python -m pytest -q
cd .. && npx tsc --noEmit && npm run build && npm run test
```

## 10. Commit guidance

- **Do commit:** generated reports in `docs/examples/performance/` if your team tracks baselines in git
- **Do not commit:** `backend/.env`, secrets, or local `adip.db` with sensitive data
- **Recommended commit message:** `chore: refresh capacity baseline reports (dev/uat/prod)`

## Quick reference

| Goal | Command |
|------|---------|
| Fastest sanity check | `python3 scripts/run_llm_smoke_test.py` |
| Dev baseline | `python3 scripts/run_capacity_planning.py small --env dev --excel` |
| Full suite | `python3 scripts/run_all_benchmarks.py --all-envs` |
| Workbench UI | Start frontend, navigate to `/platform/team-engineering-workbench` |

## Troubleshooting in Cursor

- **Wrong Python** — Use `which python3` and ensure venv: `backend/.venv/bin/python`
- **Import errors** — Run from repo root, not `backend/`
- **WARN exit codes** — LLM smoke and regression may exit 1 in mock mode; check JSON output
- **Long runs** — Enterprise + `--load` takes ~30s; use Cursor terminal scrollback to review

See `BENCHMARK_RUNBOOK_DEV_UAT_PROD.md` for full operational detail.
