# Backend Quick Start

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt              # core (SQLite dev)
# pip install -r requirements-postgres.txt   # only for PostgreSQL
python -m app.seed.run --reset               # tables + banking seed
uvicorn app.main:app --reload --port 8000
```

- **Docs:** `http://localhost:8000/docs` (Swagger) · `/redoc` · `/metrics`
- **Tests:** `pytest`
- **Migrations:** `alembic upgrade head` / `alembic revision --autogenerate -m "msg"`

## Key layout

```
backend/app/
  api/v1/endpoints/   routers (resources, sdlc, copilots, executive, analytics,
                      artifact_generation, orchestrator, prompt_templates,
                      prompt_testing, validation, knowledge_transformation, llm_meta)
  services/           SdlcService, AnalyticsService, KnowledgeService,
                      ArtifactGenerator, ArtifactValidator, PromptExecutionEngine,
                      PromptTestingService, PromptTemplateLibrary
  llm/                provider-independent LLM layer (adapters, reasoning, tokens, parser)
  repositories/       BaseRepository + fetch_all aggregation helper
  models/ schemas/ seed/ core/
```

More: [`../03_Developer_Manual/02_DEVELOPER_GUIDE.md`](../03_Developer_Manual/02_DEVELOPER_GUIDE.md).
