# Onboarding Guide

## ML Engineer

- Read `14_ML_ENGINEERING_GUIDE.md`
- Explore `backend/app/ml/`, `docs/examples/golden-dataset/`
- Run `python scripts/run_prompt_regression.py`
- Workbench: Team Engineering → Prompt Regression tab

## GenAI Developer

- Read `15_GENAI_ENGINEERING_GUIDE.md`, `17_RULE_ENGINE_GUIDE.md`
- Explore orchestrator, prompt workbench, connector artifact prompts
- Workbench: Connector Artifact Workbench

## Backend Developer

- Read `13_BACKEND_ENGINEERING_GUIDE.md`, `06_DEVELOPER_MANUAL.md`
- Run `pytest -q`, add endpoint following existing patterns

## Frontend Developer

- Read `12_FRONTEND_ENGINEERING_GUIDE.md`
- Study `IntegrationCenter.tsx`, `useAdipQuery` pattern
- Run `npm run test`

## DB Engineer

- Read `11_DATABASE_ENGINEERING_GUIDE.md`
- Review Alembic versions, `enterprise/database/ER_OVERVIEW.md`
- Run `backend/scripts/db/health_check.py`

## SRE

- Read `09_OPERATIONS_RUNBOOK.md`
- Import `deploy/observability/grafana-dashboard.json`
- Monitor `/health`, `/ready`, `/metrics`

## DevOps Engineer

- Read `10_DEVOPS_GUIDE.md`
- Deploy via `deploy/helm/adip/`
- Set `ADIP_AUTH_MODE=oidc` in production values

## QA Engineer

- Read `18_TESTING_STRATEGY.md`
- Run full validation suite before release
- Use demo script `21_DEMO_SCRIPT.md`

## Security Architect

- Read `19_SECURITY_GUIDE.md`, `enterprise/connectivity/SECURITY_BYPASS_PROTOTYPE.md`
- Plan OIDC/RBAC enforcement for production cutover
