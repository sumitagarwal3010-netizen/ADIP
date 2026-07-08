# Low-Level Design

## Backend packages

| Package | Purpose |
|---------|---------|
| `app/api/v1/endpoints/` | REST routers |
| `app/services/` | Business logic |
| `app/models/` | SQLAlchemy ORM |
| `app/schemas/` | Pydantic DTOs |
| `app/connectors/` | Connector framework |
| `app/llm/` | Provider abstraction |
| `app/ml/` | Evaluation, drift, hallucination |
| `app/ai/` | Planning, reasoning, artifact ops |

## Frontend packages

| Path | Purpose |
|------|---------|
| `src/pages/` | Center/hub pages |
| `src/sdk/hooks/` | Data hooks with mock fallback |
| `src/services/backend/` | apiClient, apiConfig |
| `src/components/workflow/` | AIWorkspacePanel |
| `src/components/workbench/` | RuleResultsPanel |

## Database entities

See `enterprise/database/ER_OVERVIEW.md`. Key groups: organization/projects, SDLC phases, connectors (`enterprise_connectors`, runs, assets, findings), prompt workbench.

## Connector flow

```mermaid
sequenceDiagram
  participant U as User
  participant API as Connectors API
  participant S as ConnectorService
  participant D as Driver
  U->>API: POST /connectors/{id}/sync
  API->>S: sync()
  S->>D: fetch_page + sync
  D-->>S: normalized items
  S->>S: persist assets/findings
  S-->>U: ConnectorRun
```

## Prompt execution flow

```mermaid
sequenceDiagram
  participant U as User
  participant O as Orchestrator
  participant L as LLM
  participant A as ArtifactGenerator
  U->>O: POST /orchestrator/execute
  O->>L: classify + copilots
  O->>A: generate artifacts
  A-->>U: GeneratedArtifact[]
```

## Artifact generation from connectors

```mermaid
sequenceDiagram
  participant U as User
  participant W as Artifact Workbench
  participant C as ConnectorArtifactService
  participant P as Prompt Templates
  U->>W: Generate release readiness
  W->>C: preview_sources
  C-->>W: Jira/SonarQube records
  W->>P: render_prompt
  W->>C: generate (mock_llm)
  C-->>U: artifact + explainability
```

See `02_LOW_LEVEL_DESIGN` companion: `docs/04_Architecture/ADR/`.
