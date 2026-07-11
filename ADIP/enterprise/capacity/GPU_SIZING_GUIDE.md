# GPU Sizing Guide

Estimates local LLM (Ollama) GPU requirements when `local_llm=true`.

## GPU tiers

T4, L4, A10, A100, H100 — selected by VRAM requirement.

## Metrics

- Model size GB, VRAM required
- Latency p50, throughput RPS, max concurrent requests
- CPU fallback when local LLM disabled

## API

```
GET /api/v1/benchmarks/capacity-planning/sections/gpu?profile=large
```

## Module

`backend/app/perf/capacity/estimators.py` — `estimate_gpu()`
