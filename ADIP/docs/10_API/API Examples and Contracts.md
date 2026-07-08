# ADIP API — Examples & Contracts

Worked request/response examples for the most-used ADIP endpoints. The full,
always-current contract is in `openapi.json` (155 paths) and Swagger UI at
`/docs`. Import `ADIP.postman_collection.json` into Postman (set the `baseUrl`
variable) to try every endpoint.

Base URL (local): `http://localhost:8000` · API prefix: `/api/v1`

---

## Conventions

- **Content type:** `application/json` for request/response bodies.
- **Correlation id:** every response includes `X-Request-ID` and `X-Response-Time-ms`.
- **Errors:** consistent envelope:

```json
{ "detail": "Project 999 not found." }
```

- **Pagination:** list endpoints accept `page` and `size`; return
  `{ "items": [...], "total": N, "page": 1, "size": 25, "pages": M }`.

---

## Health & metrics

```http
GET /api/v1/health
```
```json
{ "status": "ok", "environment": "development" }
```

```http
GET /metrics/prometheus        # Prometheus exposition (text/plain)
GET /api/v1/llm/runtime        # runtime: breaker, caches, tokens, cost
```

---

## Projects (CRUD)

```http
GET /api/v1/projects?page=1&size=5
```
```json
{ "items": [{ "id": 1, "code": "UPI-CORE", "name": "UPI Core", "status": "Active" }],
  "total": 7, "page": 1, "size": 5, "pages": 2 }
```

```http
POST /api/v1/projects
Content-Type: application/json

{ "code": "NEW-1", "name": "New Initiative", "status": "Active" }
```

---

## Orchestration — one prompt → full SDLC

```http
POST /api/v1/orchestrator/run
Content-Type: application/json

{ "prompt": "Implement UPI Auto-Reversal with NPCI reconciliation and audit trail." }
```
Response (shape):
```json
{
  "prompt": "Implement UPI Auto-Reversal ...",
  "classification": { "domain": "UPI", "intent": "..." },
  "phases": [ { "phase": "Requirements", "summary": "...", "artifacts": ["..."] } ],
  "artifacts": [ { "reference": "BRD-...", "quality_score": 88 } ]
}
```

---

## Artifacts

Generate:
```http
GET /api/v1/artifact-generation/projects/1/generate?artifact_type=BRD
```
```json
{ "reference": "BRD-UPI-CORE-0001", "title": "Business Requirements Document",
  "version": "1.0", "author": "AI SDLC Copilot",
  "executive_summary": "...", "sections": [ { "heading": "Scope", "body": "...", "bullets": ["..."] } ] }
```

Score quality:
```http
POST /api/v1/artifact-quality/score
{ "project_id": 1, "artifact_type": "BRD" }
```
```json
{ "artifact_type": "BRD", "overall_score": 88, "quality_band": "Good",
  "dimension_scores": [ ... ], "missing_sections": [], "improvement_suggestions": ["..."] }
```

Export (download):
```http
GET /api/v1/artifact-export/projects/1?artifact_type=BRD&format=html&watermark=CONFIDENTIAL
POST /api/v1/artifact-export/projects/1/bundle
{ "project_id": 1, "artifact_types": ["BRD", "FRD"] }        # → application/zip
```

---

## Prompt Studio

```http
POST /api/v1/prompt-workbench/prompts
{ "name": "UPI Reversal BRD", "content": "Implement UPI Auto-Reversal ..." }

PUT  /api/v1/prompt-studio/prompts/1/tags        { "tags": ["upi", "payments"] }
PUT  /api/v1/prompt-studio/prompts/1/favorite    { "is_favorite": true }
PUT  /api/v1/prompt-studio/prompts/1/approval    { "approval_status": "Approved" }
POST /api/v1/prompt-studio/prompts/1/publish
GET  /api/v1/prompt-studio/search?q=upi
```

---

## Benchmark & Regression

```http
POST /api/v1/prompt-benchmark/benchmark
{ "versions": ["Implement UPI reversal.", "Implement UPI reversal with reconciliation & audit."] }
```
```json
{ "entries": [ ... ], "best_version": "V2", "best_overall_score": 82, "average_overall_score": 80 }
```

```http
POST /api/v1/prompt-regression/compare
{ "baseline_prompt": "Implement UPI reversal.",
  "candidate_prompt": "Implement UPI reversal with reconciliation & audit." }
```
```json
{ "baseline_label": "baseline", "candidate_label": "candidate",
  "metrics": [ { "metric": "overall_score", "baseline": 79, "candidate": 82, "delta": 3, "regressed": false } ],
  "overall_verdict": "PASS — no regressions", "regressions": [], "improvements": ["overall_score"] }
```

---

## Contract testing

- The OpenAPI spec (`openapi.json`) is the source of truth for contracts.
- Generate typed clients from it, or use the shipped SDKs (`sdks/`).
- In CI, validate that the running app's `/openapi.json` matches the committed
  spec to catch accidental breaking changes (add a diff check to `backend-ci.yml`).
- Regenerate after API changes: `python -m scripts.export_api` (from `backend/`).
```
