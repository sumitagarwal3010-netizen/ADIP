# ADIP — Developer Onboarding

Welcome to **ADIP (Automation Delivery Integration Platform)** — an enterprise
AI SDLC platform with a React/Vite/TypeScript frontend and a FastAPI backend.
This is the single starting point for new engineers.

---

## 1. Product overview

ADIP lets a user enter **one business prompt** (e.g. *"Implement UPI
Auto-Reversal for Mobile Banking"*) and orchestrates the entire AI SDLC —
classification → requirements → architecture → development → testing → release →
go-live → audit → executive summary → artifact generation → traceability.

It exposes executive dashboards, AI copilots, artifact generation, traceability,
knowledge and transformation modules, backed by realistic enterprise banking
data. See [`../01_Product/`](../01_Product/) for the product docs.

## 2. Architecture overview

```
React / Vite / TypeScript (MUI)
        │  REST/JSON  (feature-flagged: mock | backend)
        ▼
FastAPI  →  API routers  →  Services  →  Repositories  →  SQLAlchemy ORM  →  DB
                                          ↑ Pydantic schemas   ↑ Alembic migrations
        LLM abstraction (provider-independent, infra only) sits beside services.
```

Deep dives: [`../04_Architecture/`](../04_Architecture/) (incl.
`07_SOLUTION_ARCHITECTURE.md` with component/sequence/ER/deployment/AI-orchestration diagrams).

## 3. Repository structure

```
adip/
  src/                      # React frontend
    services/backend/       # backend API client + mock/backend feature flag
  backend/                  # FastAPI backend
    app/
      api/v1/               # routers (crud_factory, resources, sdlc, copilots,
                            #          executive, analytics, artifact_generation,
                            #          knowledge_transformation, orchestrator, llm_meta)
      core/                 # config, logging, exceptions, pagination, metrics, middleware
      db/                   # engine, session, declarative base
      models/               # SQLAlchemy ORM models
      schemas/              # Pydantic DTOs (CRUD + business + orchestrator)
      repositories/         # generic base repo + aggregation helper
      services/             # sdlc, analytics, knowledge, artifact_generator, orchestrator, audit_trail
      llm/                  # provider-independent LLM abstraction (scaffold)
      seed/                 # banking seed data + seeder
    alembic/                # migrations
    tests/                  # pytest suite
  docs/                     # this documentation set
```

## 4. Frontend architecture

- React 19 + Vite 8 + TypeScript + MUI.
- Rich mock/simulation layer powers every page by default.
- Backend access is **additive** via `src/services/backend/` (`apiClient`,
  `useBackendData`, feature flag) — pages opt in without redesign.
- Strict TS config: `verbatimModuleSyntax` (use `import type`),
  `erasableSyntaxOnly` (no parameter-property shorthand), `noUnusedLocals/Parameters`.

## 5. Backend architecture

- **Layered**: API → Service → Repository → ORM, with Pydantic schemas for I/O.
- **Generic reuse**: one `BaseRepository` + `BaseService` + a CRUD router factory
  power 29 CRUD resources; business endpoints reuse `fetch_all` (no bespoke SQL).
- **Orchestration** (`PromptExecutionEngine`) sits above all services.
- Details: [`01_ARCHITECTURE_GUIDE.md`](../04_Architecture/01_ARCHITECTURE_GUIDE.md),
  [`02_DEVELOPER_GUIDE.md`](02_DEVELOPER_GUIDE.md).

## 6. Running locally

```bash
# Backend (no Docker / Postgres needed — SQLite default)
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed.run --reset          # create tables + seed banking data
uvicorn app.main:app --reload --port 8000   # docs at /docs

# Frontend (separate terminal, repo root)
npm install
npm run dev                              # Vite dev server
```

## 7. SQLite (dev default)

The backend defaults to a local SQLite file (`backend/adip.db`) via
`DATABASE_URL` — zero setup. Foreign keys are enforced via PRAGMA. See
[`../11_Database/04_DATABASE_GUIDE.md`](../11_Database/04_DATABASE_GUIDE.md).

## 8. PostgreSQL (production)

```bash
pip install -r requirements-postgres.txt
export DATABASE_URL="postgresql+psycopg://user:pass@localhost:5432/adip"
alembic upgrade head
python -m app.seed.run --reset
```

## 9. Docker (optional — not required for dev)

```bash
docker compose up --build     # Postgres + FastAPI + Nginx-served frontend
# Frontend: http://localhost:8080   API: http://localhost:8000
```

Details: [`../13_Deployment/`](../13_Deployment/).

## 10. Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | SQLite (default) or PostgreSQL DSN |
| `ENVIRONMENT`, `DEBUG`, `SQL_ECHO` | backend | runtime config |
| `CORS_ORIGINS` | backend | allowed SPA origins |
| `VITE_DATA_SOURCE` | frontend | `mock` (default) or `backend` |
| `VITE_API_BASE_URL` | frontend | backend base URL in backend mode |

Copy `backend/.env.example` and `.env.example` (repo root) as needed.

## 11. Build

```bash
# Frontend
npm run build            # tsc -b && vite build → dist/
# Backend (no build step; run via uvicorn / container)
```

## 12. Tests

```bash
cd backend && pytest     # full suite (isolated temp SQLite)
npx tsc --noEmit         # frontend type-check (repo root)
```

Testing strategy: [`../06_Test_Workbench/08_TESTING_GUIDE.md`](../06_Test_Workbench/08_TESTING_GUIDE.md).

## 13. Debugging

- Backend logs include a per-request id (`X-Request-ID`) and latency
  (`X-Response-Time-ms`); see `GET /metrics`.
- Dev server doesn't type-check — run `tsc --noEmit` / `npm run build` to surface
  type errors.
- Common issues: [`06_TROUBLESHOOTING.md`](06_TROUBLESHOOTING.md).

## 14. Coding standards

Full standards: [`05_CODING_STANDARDS.md`](05_CODING_STANDARDS.md). Highlights:
type hints everywhere; Pydantic v2 for I/O; reuse `BaseRepository`/`BaseService`
and `fetch_all` (no duplication); raise domain exceptions; log via
`app.core.logging`.

## 15. Feature flag architecture

The frontend selects its data source at runtime/build time:
`localStorage['adip.dataSource']` → `VITE_DATA_SOURCE` → default `mock`. In
backend mode, pages call `apiClient`; on error they degrade gracefully to mock.
Source: `src/services/backend/apiConfig.ts`, `useBackendData.ts`.

## 16. AI SDLC architecture

Each SDLC phase produces findings, recommendations, risks, a readiness score,
confidence, reasoning, business impact and artifacts — assembled by
`SdlcService` from the relational data. See [`../02_AI_SDLC/`](../02_AI_SDLC/).

## 17. Prompt orchestration

`PromptExecutionEngine` (`backend/app/services/orchestrator_service.py`) is the
top layer: it classifies the prompt (via a provider-independent `Reasoner`),
resolves the target project, invokes every existing phase/copilot/executive
service, generates artifacts, and updates traceability — exposed at
`POST /api/v1/orchestrator/execute`.

## 18. Artifact generation

`ArtifactGenerator` builds 24 artifact types (Concept Note, BRD, FRD, SRS, NFR,
HLD, LLD, API Spec, DB Design, Sequence Flow, Security Controls, Test Strategy/
Plan/Cases, Automation Pack, Deployment/Rollback/Go-Live/Runbook, Audit
Checklist, Compliance Matrix, Traceability Matrix, Executive Summary) in JSON,
Markdown, DOCX-ready and PDF-ready models. See [`../02_AI_SDLC/`](../02_AI_SDLC/).

## 19. Traceability

`GET /api/v1/traceability/projects/{id}/chain|matrix|impact` expose the
Prompt → Requirement → Architecture → Development → Testing → Release → Go-Live →
Audit → Evidence chain, a requirement→dev→test coverage matrix, and impact
analysis.

## 20. Local LLM integration

Provider-independent abstraction (Ollama / OpenAI / LM Studio / Gemini adapters
as scaffolds) — no runtime dependency. See [`../08_Local_LLM/`](../08_Local_LLM/).

## 21. Troubleshooting

See [`06_TROUBLESHOOTING.md`](06_TROUBLESHOOTING.md) and, for operations,
[`../09_Operations/`](../09_Operations/).
