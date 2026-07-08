# Enterprise Connectivity Architecture

ADIP enterprise connectivity is built as an extensible connector framework that normalizes external tool data into ADIP evidence, assets, and security findings.

## Layers

1. **Connector drivers** (`backend/app/connectors/drivers.py`) — vendor-specific mock/real adapters implementing `BaseConnector`.
2. **Registry** (`backend/app/connectors/registry.py`) — catalog metadata, capability flags, driver resolution.
3. **Service** (`backend/app/services/connector_service.py`) — persistence, sync orchestration, dashboard aggregation.
4. **API** (`backend/app/api/v1/endpoints/connectors.py`) — REST surface for management and sync.
5. **AI context** (`backend/app/connectors/ai_context.py`) — prompt context, traceability, and risk summarization hooks.
6. **Frontend** (`src/pages/IntegrationCenter.tsx`) — Integration Center UI.

## Data flow

```
External system → Connector driver → Normalizer → DB (assets/findings) → AI SDLC views
```

## Security

- Credentials are **references only** (env var names, vault paths).
- `ADIP_AUTH_MODE=demo|disabled` bypasses auth for local prototype only.
- Production must set `ADIP_AUTH_MODE=oidc` with Entra ID or generic OIDC.

## Categories

| Category | Connectors |
|----------|------------|
| ALM | Jira, Confluence, GitHub Enterprise, GitLab, Azure DevOps, Jenkins |
| Collaboration | SharePoint, Teams, Outlook, OneDrive, Slack |
| Security | SonarQube, Checkmarx, Prisma Cloud, Snyk, Veracode, Trivy, Dependency-Track |
| Cloud | AWS, Azure, GCP, Kubernetes, ArgoCD, Prometheus, Grafana |

## Mock and dry-run

All connectors support `mock_mode` (default in dev) and `dry_run` sync (no persistence). Enable real integrations by disabling mock mode and supplying credential references via environment or secret manager.
