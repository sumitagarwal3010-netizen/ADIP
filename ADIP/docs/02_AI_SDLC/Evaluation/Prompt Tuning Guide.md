# Prompt Tuning Guide

Iteratively improve prompts using optimization, benchmarking and the workbench.

## Auto-optimization (V1 → V2 → V3)

```bash
curl -s -X POST http://localhost:8000/api/v1/prompt-benchmark/optimize \
  -H 'Content-Type: application/json' \
  -d '{"base_prompt":"Implement UPI Auto-Reversal for Mobile Banking"}'
```

Produces three variants — V1 (base), V2 (+reconciliation/idempotency detail),
V3 (+monitoring/audit/compliance) — with diffs, per-version overall scores and
recommendations.

## Manual tuning loop

1. Save a prompt in the **Prompt Workbench** (`POST /prompt-workbench/prompts`).
2. Add versions/experiments (`.../versions`).
3. Run each version (`.../runs`) — captures quality, latency, tokens, coverage.
4. Compare (`.../compare`) and keep the winner.

## Tuning heuristics

- Be **banking-specific**: name the rail (UPI/IMPS/NEFT/RTGS), the control (RBI
  TAT, NPCI dispute), and the failure mode (switch timeout, credit-fail).
- Demand **structure**: list the required sections you expect.
- Add **compliance + monitoring + audit** asks to lift reviewer scores.
- Keep prompts **idempotent/traceable** in wording for higher artifact quality.

## Measuring improvement

Benchmark before/after (`prompt-benchmark/run`) and compare to the
[golden dataset](Golden%20Dataset%20Guide.md).

## Test commands

```bash
cd backend && pytest -k "benchmark or workbench"
```
