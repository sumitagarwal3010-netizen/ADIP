# ADIP Backend — Database Guide (Phase 13/14)

## Engines

- **Development/test:** SQLite (default `DATABASE_URL=sqlite:///backend/adip.db`).
  Foreign keys enforced via `PRAGMA foreign_keys=ON`.
- **Production:** PostgreSQL — `DATABASE_URL=postgresql+psycopg://user:pass@host:5432/adip`.

The schema is Postgres-first and portable; migrations use Alembic batch mode on
SQLite so `ALTER` operations work there too.

## Migrations (Alembic)

```bash
alembic upgrade head                       # apply
alembic revision --autogenerate -m "msg"   # generate from model changes
alembic downgrade -1                        # roll back one
```

`alembic/env.py` pulls `DATABASE_URL` from app settings and targets
`Base.metadata`, so migrations always match the running app.

## Schema (33 tables)

Organization: `users`, `roles`, `user_roles`, `business_domains`, `projects`,
`applications`.

SDLC: `requirements`, `requirement_analysis`, `architecture`,
`architecture_review`, `development_stories`, `development_tasks`,
`source_code_metadata`, `code_review`, `test_cases`, `test_execution`,
`defects`, `releases`, `deployments`, `go_live`, `audit_evidence`,
`compliance_records`, `audit_observations`.

AI/Intelligence: `copilot_findings`, `ai_recommendations`, `executive_scores`,
`ai_risk`.

Artifacts/Traceability: `artifacts`, `traceability_links`.

Platform: `knowledge_articles`, `transformation_programs`, `activity_log`,
`notifications`.

## Entity relationships (high level)

```
business_domains 1─* projects 1─* applications
projects 1─* requirements 1─* requirement_analysis
requirements 1─* development_stories 1─* {development_tasks, source_code_metadata, code_review}
requirements 1─* test_cases 1─* {test_execution, defects}
projects 1─* architecture 1─* architecture_review
projects 1─* releases 1─* {deployments, go_live}
projects 1─* audit_evidence 1─* {compliance_records, audit_observations}
projects 1─* copilot_findings 1─* ai_recommendations
projects 1─* {executive_scores, ai_risk, artifacts, traceability_links}
```

All FKs use `ondelete=CASCADE` for owned children (or `SET NULL` for optional
references). Timestamps (`created_at`, `updated_at`) on every table.

## Seed data

`python -m app.seed.run --reset` loads 3 banking projects (Net Banking, Mobile
Banking, Payments) with 50+ requirements/test-cases/stories/artifacts/copilot
findings each — ~2,250 rows across 32 tables. Deterministic (fixed seed).
