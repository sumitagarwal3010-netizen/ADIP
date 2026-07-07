# Prompt Benchmark Guide

Benchmark prompt versions across prompt, artifact, reviewer and overall scores.

## Metrics per version

| Metric | Meaning |
|---|---|
| Prompt Score | Heuristic prompt quality (specificity, banking signal) |
| Artifact Score | Mean quality score of generated artifacts |
| Reviewer Score | Mean AI-reviewer score |
| Latency (ms) | Orchestration time |
| Input / Output Tokens | Estimated tokens |
| Overall Score | 0.25·prompt + 0.4·artifact + 0.35·reviewer |

## API

```bash
curl -s -X POST http://localhost:8000/api/v1/prompt-benchmark/run \
  -H 'Content-Type: application/json' \
  -d '{"versions":[
        "Implement UPI Auto-Reversal.",
        "Implement UPI Auto-Reversal with NPCI reconciliation and audit trail."]}'
```
```jsonc
{
  "entries": [
    {"prompt_version":"V1","prompt_score":72,"artifact_score":89,"reviewer_score":86,
     "latency_ms":120.5,"input_tokens":8,"output_tokens":210,"overall_score":83}
  ],
  "best_version":"V2","best_overall_score":85,"average_overall_score":84
}
```

## Reports

The response *is* the benchmark report. For repeatable batches use the prompt
testing benchmark (`POST /api/v1/prompt-testing/benchmark`) which adds p95 latency.

## Test commands

```bash
cd backend && pytest -k "benchmark"
```
