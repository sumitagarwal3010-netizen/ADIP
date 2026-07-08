# ADIP Developer Experience — Master Index

One page that points to every developer-facing guide. Most guides already exist;
this index is the single entry point. New guides added in this pass are marked
**(new)**.

---

## Start here

| Topic | Document |
|---|---|
| Welcome | `docs/00_Start_Here/01_Welcome.md` |
| 5-minute setup | `docs/00_Start_Here/02_5_Minute_Setup.md` |
| Developer checklist | `docs/00_Start_Here/04_Developer_Checklist.md` |
| Reference / cheat sheet | `docs/00_Start_Here/10_Reference.md` |

## Architecture

| Topic | Document |
|---|---|
| Architecture guide | `docs/04_Architecture/01_ARCHITECTURE_GUIDE.md` |
| Solution architecture | `docs/04_Architecture/07_SOLUTION_ARCHITECTURE.md` |
| Diagrams (C4, flows, ER) **(new)** | `docs/04_Architecture/Architecture Diagrams (C4 and Flows).md` |
| Legacy diagrams | `docs/04_Architecture/DIAGRAMS.md` |

## Environment & setup

| Topic | Document |
|---|---|
| Developer setup | `docs/03_Developer_Manual/DEVELOPER_SETUP_GUIDE.md` |
| Developer onboarding | `docs/03_Developer_Manual/Developer Onboarding.md` |
| Backend quick start | `docs/00_Start_Here/05_Backend_Quick_Start.md` |
| Frontend quick start | `docs/00_Start_Here/06_Frontend_Quick_Start.md` |
| Environment variables | see `.env.example` + `backend/app/core/config.py` |

## Build guides

| Topic | Document |
|---|---|
| Backend guide | `docs/03_Developer_Manual/12-ADIP-Developer-Guide.md` |
| Frontend guide | `docs/00_Start_Here/06_Frontend_Quick_Start.md` |
| LLM guide | `docs/00_Start_Here/07_Local_LLM_Quick_Start.md`, `docs/08_Local_LLM/` |
| Prompt guide | `docs/03_Developer_Manual/Prompt Engineering Developer Guide.md`, `docs/00_Start_Here/08_Prompt_Execution_Guide.md` |
| Artifact guide | `docs/00_Start_Here/09_Artifact_Generation_Guide.md`, `docs/02_AI_SDLC/Artifacts/` |
| Prompt Studio | `docs/05_Workbench/` + API `/api/v1/prompt-studio/*` |
| Artifact export | API `/api/v1/artifact-export/*` |

## Testing & quality

| Topic | Document |
|---|---|
| Testing / test workbench | `docs/06_Test_Workbench/`, `docs/00_Start_Here/Prompt Testing Quickstart.md` |
| Benchmark | `docs/07_Benchmark/` |
| Regression **(new capability)** | API `/api/v1/prompt-regression/compare` |
| Performance framework **(new)** | `python -m app.perf.harness` → `docs/examples/performance/` |

## Operations & deployment

| Topic | Document |
|---|---|
| Deployment / installation | `docs/13_Deployment/11-ADIP-Installation-Guide.md` |
| Operations guide | `docs/09_Operations/13-ADIP-Operations-Guide.md` |
| Release guide | `docs/09_Operations/14-ADIP-Release-Guide.md` |
| Runbooks (incident/backup/restore/recovery/upgrade) **(new)** | `docs/09_Operations/Runbooks.md` |
| Observability **(new)** | `docs/09_Operations/Observability Guide.md` |
| Production readiness | `docs/09_Operations/09_PRODUCTION_READINESS.md` |

## Standards & contribution

| Topic | Document |
|---|---|
| Coding standards | `docs/03_Developer_Manual/05_CODING_STANDARDS.md` |
| Troubleshooting | `docs/03_Developer_Manual/06_TROUBLESHOOTING.md` |
| FAQ **(new)** | `docs/03_Developer_Manual/FAQ.md` |
| Folder structure **(new)** | `docs/03_Developer_Manual/Folder Structure Guide.md` |
| Contribution guide | see `docs/03_Developer_Manual/05_CODING_STANDARDS.md` + branch/PR conventions |

## Extensibility

| Topic | Document |
|---|---|
| Extension points (MCP/agents/cloud LLM/RAG/vector/workflow/plugins) **(new)** | `docs/14_Extensibility/Extensibility Guide.md` |

## Developer CLI **(new)**

```bash
python -m app.cli doctor          # environment self-check
python -m app.cli routes          # list all API routes
python -m app.cli seed --reset    # seed the database
python -m app.cli datasets        # generate enterprise datasets
python -m app.cli perf            # run the performance framework
python -m app.cli benchmark "..." # benchmark prompts
python -m app.cli scaffold Name   # scaffold a CRUD resource
python -m app.cli export-prompts out.json / import-prompts in.json
python -m app.cli migrate         # alembic upgrade head
```
