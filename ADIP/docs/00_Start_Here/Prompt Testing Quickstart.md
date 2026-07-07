# Prompt Testing Quickstart

Execute prompts, capture metrics, benchmark and compare — in under a minute.

## Run a prompt

```bash
curl -s -X POST http://localhost:8000/api/v1/prompt-testing/run \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Implement UPI Auto-Reversal for Mobile Banking."}'
```
Captures: scenario, confidence, prompt/completion tokens, artifacts generated,
latency and reasoning.

## History, statistics, compare

```bash
curl -s http://localhost:8000/api/v1/prompt-testing/history
curl -s http://localhost:8000/api/v1/prompt-testing/statistics
curl -s "http://localhost:8000/api/v1/prompt-testing/compare?run_a=<id1>&run_b=<id2>"
```

## Benchmark

```bash
curl -s -X POST http://localhost:8000/api/v1/prompt-testing/benchmark \
  -H 'Content-Type: application/json' \
  -d '{"prompts":["Implement UPI Auto-Reversal.","Implement Biometric Login."],"iterations":3}'
```

## Persistent workbench (versions + quality)

For versioned prompt engineering with quality scoring, use the
[Prompt Workbench](../05_Workbench/Prompt%20Workbench.md).

## Test commands

```bash
cd backend && pytest -k "prompt_testing or enterprise"
```
