# Vector Database Guide

Estimates vector storage for embedding workloads. **Estimate only — no integration.**

## Dimensions

384, 768, 1024, 1536

## Providers (comparison estimates)

PGVector, Vertex AI Vector Search, Pinecone, Weaviate, Milvus, Qdrant

Each includes storage GB, recall estimate, latency p50.

## API

```
GET /api/v1/benchmarks/capacity-planning/sections/vector_db?profile=medium
```

## Module

`backend/app/perf/capacity/estimators.py` — `estimate_vector_db()`
