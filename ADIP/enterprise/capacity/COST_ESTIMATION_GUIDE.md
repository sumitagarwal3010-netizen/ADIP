# Cost Estimation Guide

Multi-environment cost estimation for Development, UAT, Production across Small/Medium/Large/Enterprise profiles.

## Components

Compute (GKE), Cloud SQL, Redis, object storage (GCS/S3/Azure/MinIO), vector storage, networking, LLM, monitoring.

## Object storage providers

GCS, AWS S3, Azure Blob, MinIO — PUT/GET/lifecycle pricing.

## API

Cost breakdown returned in `POST /api/v1/benchmarks/capacity-planning/plan` → `costs`.

## Module

`backend/app/perf/capacity/estimators.py` — `estimate_costs()`, `estimate_storage_costs()`

## Excel

`ADIP_Capacity_Planner.xlsx` — Cost worksheet with monthly/annual totals.
