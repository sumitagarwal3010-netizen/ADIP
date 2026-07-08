# High-Level Solution Architecture

## Enterprise architecture

```mermaid
flowchart LR
  Users[Enterprise Users] --> ADIP[ADIP Platform]
  ADIP --> IdP[OIDC / Entra ID]
  ADIP --> ALM[Jira / Azure DevOps]
  ADIP --> Collab[SharePoint / Teams / Outlook]
  ADIP --> Sec[SonarQube / Prisma]
  ADIP --> Cloud[AWS / Azure / K8s]
```

## Logical architecture

| Layer | Components |
|-------|------------|
| Presentation | React 19, Vite, MUI, SDK hooks |
| API | FastAPI, OpenAPI, DI via `deps.py` |
| Domain | Services, connectors, orchestrator, rules |
| AI | LLM adapters, prompt engines, ML eval |
| Data | SQLAlchemy, Alembic, seed |

## Physical architecture

- **Dev:** single machine, SQLite, mock connectors, `ADIP_AUTH_MODE=demo`
- **Staging:** K8s, PostgreSQL, OIDC, mock or sandbox connectors
- **Prod:** HA backend, managed DB, OIDC + RBAC/ABAC, live connectors with vault creds

## Deployment architecture

```mermaid
flowchart TB
  subgraph K8s [Kubernetes Cluster]
    Ing[Ingress]
    FE[Frontend Pods]
    BE[Backend Pods]
    Prom[Prometheus]
  end
  Ing --> FE
  Ing --> BE
  BE --> PG[(PostgreSQL)]
  BE --> Prom
```

## Data flow architecture

```mermaid
flowchart LR
  Ext[External Tools] -->|sync| Conn[Connector Drivers]
  Conn --> Norm[Normalizers]
  Norm --> DB[(DB)]
  DB --> Art[Artifact Generator]
  Prompt[User Prompt] --> Orch[Orchestrator]
  Orch --> LLM[LLM Provider]
  Orch --> Art
  Art --> UI[Frontend]
```

See also `enterprise/database/ER_OVERVIEW.md` and `docs/04_Architecture/ARCHITECTURE.md`.
