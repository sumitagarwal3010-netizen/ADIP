# Prompt Execution Guide

One prompt drives the whole AI SDLC via the **Prompt Execution Engine**.

## Execute a prompt

```bash
curl -s -X POST http://localhost:8000/api/v1/orchestrator/execute \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Implement UPI Auto-Reversal for Mobile Banking.",
       "metadata":{"project":"Mobile Banking"},
       "include_markdown":false}'
```

The response contains: `classification`, all phase summaries (`requirements` …
`audit`), all `copilots`, `executive`, `dashboard`, `artifacts`, and
`traceability`.

## Prompt testing & benchmarks

```bash
# Run once (captures latency, tokens, confidence, artifacts)
curl -s -X POST http://localhost:8000/api/v1/prompt-testing/run \
  -H 'Content-Type: application/json' -d '{"prompt":"Implement Beneficiary Addition."}'

# History / statistics
curl -s http://localhost:8000/api/v1/prompt-testing/history
curl -s http://localhost:8000/api/v1/prompt-testing/statistics

# Benchmark several prompts x iterations → report
curl -s -X POST http://localhost:8000/api/v1/prompt-testing/benchmark \
  -H 'Content-Type: application/json' \
  -d '{"prompts":["Implement UPI Auto-Reversal.","Implement Biometric Login."],"iterations":3}'

# Compare two runs
curl -s "http://localhost:8000/api/v1/prompt-testing/compare?run_a=<id1>&run_b=<id2>"
```

## Validate a prompt (no full run)

```bash
curl -s -X POST http://localhost:8000/api/v1/prompt-validation \
  -H 'Content-Type: application/json' -d '{"prompt":"Implement UPI Auto-Reversal."}'
```

## Reusable banking templates

```bash
curl -s http://localhost:8000/api/v1/prompt-templates/top?limit=5
curl -s http://localhost:8000/api/v1/prompt-templates/upi-auto-reversal
```

25 ranked banking templates (UPI, IMPS, NEFT, RTGS, Cards, Corporate, Trade
Finance, Loans, KYC, AML, Fraud, NPCI, RBI Compliance, …), each with per-phase
prompts, expected artifacts, acceptance criteria, risks, compliance and success
criteria.
