# ADIP Backend — API Guide (Phase 13)

Base path: `/api/v1`. Interactive docs: `/docs` (Swagger), `/redoc`.

## Conventions

- **List endpoints** return a page envelope: `{ items, total, page, page_size, pages }`
  and accept `page`, `page_size`, `sort_by`, `sort_dir` (`asc|desc`), `search`,
  plus resource-specific filters.
- **Errors**: `404` not found, `409` conflict (unique constraint), `422`
  validation. Body: `{ "detail": "..." }`.
- **Business endpoints** return composed DTOs (not CRUD rows).

## CRUD resources (Phase 2) — 28 resources × 5 verbs

`GET /{resource}`, `GET /{resource}/{id}`, `POST /{resource}`,
`PUT /{resource}/{id}`, `DELETE /{resource}/{id}` for:

projects, applications, requirements, requirement-analysis, architecture,
architecture-review, development-stories, development-tasks,
source-code-metadata, code-review, test-cases, test-execution, defects,
releases, deployments, go-live, audit-evidence, compliance-records, artifacts,
traceability-links, copilot-findings, ai-recommendations, executive-scores,
ai-risk, knowledge-articles, transformation-programs, activity-log,
notifications.

## Business / AI SDLC APIs (Phase 3)

| Endpoint | Returns |
|---|---|
| `GET /sdlc/projects/{id}/requirements/summary` | BR/FR/NFR, assumptions, dependencies, AC, gaps, findings, score |
| `GET /sdlc/projects/{id}/architecture/summary` | logical/physical/integration/API/DB/sequence views, findings, score |
| `GET /sdlc/projects/{id}/development/summary` | stories, tasks, code review, secure coding, coverage, score |
| `GET /sdlc/projects/{id}/testing/summary` | plan, cases, execution, coverage, regression, automation, defects |
| `GET /sdlc/projects/{id}/release/summary` | plan, deployment, rollback, CAB, monitoring |
| `GET /sdlc/projects/{id}/go-live/summary` | checklist, sign-off, support transition, hypercare, readiness |
| `GET /sdlc/projects/{id}/audit/summary` | evidence, compliance, observations, traceability |

## Copilot APIs (Phase 4)

`GET /copilots/{slug}/projects/{id}` for slug in
`requirement | architecture | development | testing | release | audit | executive-advisor`.
Returns findings, recommendations, reasoning, confidence, risk, readiness,
business_impact, priority.

## Executive + analytics (Phase 7)

| Endpoint | Returns |
|---|---|
| `GET /executive/projects/{id}/summary` | per-project executive rollup |
| `GET /executive/portfolio` | portfolio executive rollup |
| `GET /analytics/portfolio-health` | health across projects |
| `GET /analytics/risk-rollup` | open/critical risks + exposure |
| `GET /analytics/projects/{id}/engineering-kpis` | velocity, coverage, defects, automation |
| `GET /analytics/projects/{id}/value` | business value metrics |
| `GET /analytics/projects/{id}/trend?metric=` | metric trend across snapshots |

## Artifacts (Phase 5/6)

| Endpoint | Returns |
|---|---|
| `GET /artifact-catalog/projects/{id}` | artifacts grouped by type |
| `GET /artifact-generation/types` | supported generatable types |
| `GET /artifact-generation/projects/{id}/generate?artifact_type=` | JSON artifact |
| `.../generate/markdown` | Markdown render |
| `.../generate/docx-model` | DOCX-ready paragraph model |

## Traceability (Phase 6)

| Endpoint | Returns |
|---|---|
| `GET /traceability/projects/{id}/chain` | Prompt→…→Evidence chain |
| `GET /traceability/projects/{id}/matrix` | requirement→dev→test coverage matrix |
| `GET /traceability/projects/{id}/impact?requirement_id=` | upstream/downstream impact |

## Knowledge & Transformation (Phase 8/9)

`GET /knowledge/overview`, `GET /knowledge/search?q=`,
`GET /knowledge/recommendations`, `GET /transformation/portfolio`,
`GET /transformation/roi`.

## LLM infrastructure (Phase 11, read-only)

`GET /llm/models`, `GET /llm/providers`, `GET /llm/templates`.
(No completion endpoints — adapters are scaffolds.)

## Health

`GET /health`, `GET /api/v1/health`.
