# RAG Capacity Guide

Estimates retrieval-augmented generation pipeline capacity.

## Metrics

Chunk size, chunk count, embedding latency, retrieval latency, context assembly, top-K, context window utilization, vector growth GB/year.

## Module

`enterprise_planners.py` — `estimate_rag_benchmark()`

## API

`POST /plan/enterprise` → `enterprise.rag_benchmark`
