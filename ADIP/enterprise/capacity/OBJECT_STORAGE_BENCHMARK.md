# Object Storage Benchmark

Extends the ADIP benchmark subsystem to estimate enterprise object storage for SDLC artifacts.

## Categories estimated

Requirements, architecture, design, user stories, source exports, test reports, evidence, compliance/audit evidence, screenshots, images, PDF, DOCX, XLSX, CSV, ZIP, generated artifacts, prompt outputs, connector payloads, model outputs, version history, retention copies.

## Metrics

- Uploads/day, month, year
- Average, median, maximum upload size
- Object count and storage/day, month, year, 3yr, 5yr
- Post-processing: compression, deduplication, versioning, encryption, archive (coldline)

## API

```
GET  /api/v1/benchmarks/capacity-planning/sections/object_storage?profile=medium
POST /api/v1/benchmarks/capacity-planning/plan
```

## CLI

```bash
python3 scripts/run_capacity_planning.py medium
```

## Module

`backend/app/perf/capacity/estimators.py` — `estimate_object_storage()`
