# Developer Starter Guide

## First-day setup

1. Clone `sumitagarwal3010-netizen/ADIP`, branch `adip-ai-sdlc-june6-stable`
2. Follow `docs/00_Start_Here/02_5_Minute_Setup.md`
3. Read `enterprise/team-takeover/README.md`

## Common commands

| Task | Command |
|------|---------|
| Backend tests | `cd backend && pytest -q` |
| Frontend tests | `npm run test` |
| Build | `npm run build` |
| OpenAPI export | `cd backend && python -m scripts.export_api` |
| Prompt regression | `python scripts/run_prompt_regression.py` |
| LLM smoke | `python scripts/run_llm_smoke_test.py` |
| Connector demo | `python scripts/run_connector_artifact_demo.py` |

## Repo structure

```
ADIP/
  backend/app/     # FastAPI application
  src/             # React frontend
  enterprise/      # Enterprise docs
  docs/            # Product/developer docs
  deploy/          # Helm, K8s, Terraform
  scripts/         # Team ops scripts
```

## Where to start coding

| Goal | Start here |
|------|------------|
| New API | `backend/app/api/v1/endpoints/` |
| Connector | `backend/app/connectors/drivers.py` |
| UI hub | `src/pages/` + `AIWorkspacePanel` |
| Rules | `backend/app/services/rule_engine.py` |

## Common mistakes

- Forgetting mock fallback in SDK hooks
- Storing secrets in connector config (use credential refs)
- Registering routes after `/{id}` catch-alls
- Skipping `pytest` after Alembic changes
