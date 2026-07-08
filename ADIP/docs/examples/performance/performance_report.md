# ADIP Performance Report

_Generated: 2026-07-08T00:17:31.804969+00:00_

Config: **60 requests**, **8 concurrency**

## HTTP Scenarios

| Scenario | Samples | p50 (ms) | p95 (ms) | p99 (ms) | RPS | Errors |
|---|--:|--:|--:|--:|--:|--:|
| latency:health_check | 30 | 1.14 | 2.61 | 5.6 | 727.9 | 0 |
| load:health_check | 60 | 8.7 | 10.91 | 11.13 | 897.9 | 0 |
| latency:list_projects | 30 | 2.27 | 3.96 | 35.37 | 284.3 | 0 |
| load:list_projects | 60 | 19.73 | 26.38 | 27.8 | 390.8 | 0 |
| latency:sdlc_summary | 30 | 5.3 | 6.63 | 15.0 | 176.1 | 0 |
| load:sdlc_summary | 60 | 126.35 | 265.45 | 274.74 | 57.1 | 0 |
| latency:portfolio_health | 30 | 33.1 | 67.05 | 79.11 | 27.5 | 0 |
| load:portfolio_health | 60 | 1504.58 | 1646.66 | 1710.61 | 5.6 | 0 |
| latency:prompt_templates | 30 | 1.83 | 2.49 | 2.94 | 518.2 | 0 |
| load:prompt_templates | 60 | 15.26 | 19.24 | 19.77 | 508.1 | 0 |
| latency:artifact_generate | 30 | 6.01 | 10.74 | 18.87 | 148.4 | 0 |
| load:artifact_generate | 60 | 122.77 | 184.81 | 194.13 | 65.0 | 0 |
| stress:artifact_generate | 120 | 296.8 | 378.72 | 479.1 | 53.8 | 0 |
| stress:portfolio_health | 120 | 3983.62 | 5540.43 | 6597.73 | 3.9 | 0 |

## Token & Prompt Throughput

- Prompts processed: **500**
- Prompt throughput: **9561692.4/s**
- Token throughput: **6023866197.0/s**
- Tokens estimated: 315000

## Summary

- Total scenarios: 14
- Total errors: 0
- Fastest p95: 2.49 ms
- Slowest p95: 5540.43 ms
