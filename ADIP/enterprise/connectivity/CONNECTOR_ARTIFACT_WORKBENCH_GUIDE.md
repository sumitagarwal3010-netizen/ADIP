# Connector Artifact Workbench Guide

Route: `/ai-sdlc/connector-artifact-workbench`

## Workflow

1. **Select artifact type** — requirements, architecture, traceability, release readiness, security report, audit pack, executive summary
2. **Preview sources** — loads mocked/synced connector records
3. **Review prompt** — predefined template with source grounding
4. **Generate artifact** — mock LLM path with quality score and explainability
5. **Copy/export** — copy generated markdown body

## APIs

| Method | Path |
|--------|------|
| GET | `/api/v1/connectors/artifacts/use-cases` |
| POST | `/api/v1/connectors/artifacts/preview-sources` |
| GET | `/api/v1/connectors/artifacts/prompt-preview` |
| POST | `/api/v1/connectors/artifacts/generate` |
| GET | `/api/v1/connectors/artifacts/{id}` |
| GET | `/api/v1/connectors/artifacts/{id}/traceability` |

## Explainability

Each generated artifact includes:
- Contributing source record IDs
- Prompt used (truncated in UI)
- Quality checks and confidence score
- Traceability links mapped to SDLC phases
