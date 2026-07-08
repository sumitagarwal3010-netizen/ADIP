# ADIP Folder Structure Guide

Where everything lives and why. Reflects the current repository layout.

---

## Repository root

```
ADIP/
├── backend/            # FastAPI backend (Python)
├── src/                # React + Vite frontend (TypeScript)
├── public/             # Static frontend assets
├── docs/               # All documentation (this folder)
├── deploy/             # Deployment assets
├── scripts/            # Helper scripts
├── .github/workflows/  # CI/CD (backend, frontend, docker, release)
├── Dockerfile          # Frontend image
├── docker-compose.yml  # PostgreSQL + backend + frontend (Nginx)
├── package.json        # Frontend deps & scripts (dev/build/lint/preview)
├── tsconfig*.json      # TypeScript configs
└── vite.config.ts      # Vite config
```

---

## Backend — `backend/`

```
backend/
├── app/
│   ├── api/            # FastAPI routers
│   │   └── v1/
│   │       ├── endpoints/   # One module per feature (sdlc, orchestrator,
│   │       │                #   artifact_generation/export, prompt_studio,
│   │       │                #   artifact_quality, ai_review, prompt_benchmark,
│   │       │                #   regression, CRUD resources, llm_meta, ...)
│   │       └── router.py     # Aggregates all v1 routers
│   ├── core/           # config, logging, metrics, middleware, exceptions
│   ├── db/             # SQLAlchemy session/engine
│   ├── models/         # ORM models (Project, Requirement, WorkbenchPrompt, ...)
│   ├── schemas/        # Pydantic DTOs (request/response)
│   ├── repositories/   # BaseRepository + data access
│   ├── services/       # Business logic (engine, generator, export, quality,
│   │                   #   reviewer, benchmark, regression, studio, sdlc, ...)
│   ├── llm/            # LLM abstraction: types, adapters, registry, tokens,
│   │                   #   parser, runtime (queue/cache/breaker/routing)
│   ├── datasets/       # Enterprise dataset generator (JSONL)
│   ├── perf/           # Performance framework (load/stress/latency/throughput)
│   ├── seed/           # Deterministic banking seed data + seeder
│   ├── cli.py          # Developer CLI (seed/datasets/perf/benchmark/scaffold/...)
│   └── main.py         # App entrypoint (middleware, /metrics, /health)
├── alembic/            # Migrations (versions/*.py)
├── tests/              # pytest suite (test_*.py)
├── requirements.txt          # Core deps (Python 3.12+)
└── requirements-postgres.txt # Optional psycopg for PostgreSQL
```

**Layering rule:** `endpoints → services → repositories/models`. Endpoints stay
thin; business logic lives in services; data access in repositories. LLM concerns
stay in `app/llm/`.

---

## Frontend — `src/`

```
src/
├── pages/         # Route-level screens (dashboards, workspaces, studios)
├── components/    # Reusable UI components
├── routes/        # Routing configuration
├── context/       # React context providers
├── hooks/         # Custom hooks (kept separate for Fast Refresh)
├── services/      # API clients (services/backend/apiClient.ts, index.ts)
├── config/        # Navigation / persona / app config
├── data/          # Static/mock data
├── events/        # Event utilities
├── persistence/   # Local persistence
├── theme/         # MUI theme
├── types/         # Shared TypeScript types
├── utils/         # Pure utilities
└── assets/        # Images/icons
```

**Fast Refresh rule:** components export components only; hooks, contexts and
utilities live in their own files (`hooks/`, `context/`, `utils/`).

---

## Documentation — `docs/`

```
docs/
├── 00_Start_Here/     # Onboarding & quick starts
├── 01_Product/        # Product docs
├── 02_AI_SDLC/        # Prompt engine, artifacts, copilots, evaluation
├── 03_Developer_Manual/  # Dev guides, standards, FAQ, folder structure, index
├── 04_Architecture/   # Architecture guides + C4/flow diagrams
├── 05_Workbench/      # Prompt Workbench / Studio
├── 06_Test_Workbench/ # Testing
├── 07_Benchmark/      # Benchmarking
├── 08_Local_LLM/      # Local LLM
├── 09_Operations/     # Operations, runbooks, observability, releases
├── 10_API/            # API docs
├── 11_Database/       # Data model
├── 12_UI_UX/          # UI/UX
├── 13_Deployment/     # Installation & deployment
├── 14_Extensibility/  # Extension points (MCP/agents/cloud LLM/RAG/vector/...)
├── examples/          # Generated datasets, performance reports, sample projects
└── README.md          # Docs index
```
