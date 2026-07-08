# Developer Manual

Additive to `docs/03_Developer_Manual/DEVELOPER_SETUP_GUIDE.md`.

## Local setup

```bash
cd backend && python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head  # or rely on seed create_all
uvicorn app.main:app --reload
```

```bash
cd .. && npm install && npm run dev
```

## Running tests

```bash
cd backend && pytest -q
cd .. && npx tsc --noEmit && npm run test && npm run build
```

## Adding APIs

1. Schema in `app/schemas/`
2. Service in `app/services/`
3. Router in `app/api/v1/endpoints/`
4. Register in `app/api/v1/router.py`
5. `python -m scripts.export_api`

## Adding UI pages

1. Page in `src/pages/`
2. Route in `src/routes/index.tsx`
3. Nav in `src/config/navConfig.ts`
4. Hook in `src/sdk/hooks/` with mock fallback

## Adding connectors

See `enterprise/connectivity/CONNECTOR_DEVELOPER_GUIDE.md`.

## Adding prompt templates

Extend `app/services/prompt_template_library.py` or `app/connectors/connector_artifact_prompts.py`.
