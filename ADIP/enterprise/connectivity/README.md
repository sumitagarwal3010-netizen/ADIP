# ADIP Enterprise Connectivity

**Additive documentation** — does not replace existing `docs/` manuals.

## Architecture

- **Connector framework:** `backend/app/connectors/` — registry, drivers, normalizers, metrics, AI context
- **Persistence:** `enterprise_connectors` + runs/errors/assets/findings tables
- **APIs:** `/api/v1/connectors/*`
- **UI:** `/administration/integrations` Integration Center
- **Auth:** `ADIP_AUTH_MODE=demo|oidc|disabled` (backend), `VITE_AUTH_MODE` (frontend)

## Security bypass (prototype only)

| Mode | Behavior |
|------|----------|
| `demo` | Auth bypassed; demo user context |
| `disabled` | Auth explicitly off for local prototype |
| `oidc` | Middleware enforces Bearer token (production path) |

**Never use demo/disabled in production.** Logs emit warnings when bypass is active.

## Connector categories (24 types)

- **ALM:** Jira, Confluence, GitHub Enterprise, GitLab, Azure DevOps, Jenkins
- **Collaboration:** SharePoint, Teams, Outlook, OneDrive, Slack
- **Security:** SonarQube, Checkmarx, Prisma Cloud, Snyk, Veracode, Trivy, Dependency-Track
- **Cloud:** AWS, Azure, GCP, Kubernetes, ArgoCD, Prometheus, Grafana

All connectors support **mock mode** by default — no real credentials required for dev/test.

## Credential references

Store only references in DB (`connector_credential_refs`):

- `env_var` — e.g. `JIRA_API_TOKEN_ENV`
- `vault_path` — placeholder for HashiCorp Vault
- `secret_manager` — cloud secret manager key name

## Guides

| Guide | Path |
|-------|------|
| Enterprise Connectivity Architecture | `enterprise/connectivity/ENTERPRISE_CONNECTIVITY_ARCHITECTURE.md` |
| Connector Developer Guide | `enterprise/connectivity/CONNECTOR_DEVELOPER_GUIDE.md` |
| Connector Configuration | `enterprise/connectivity/CONNECTOR_CONFIGURATION.md` |
| ALM Connector Guide | `enterprise/connectivity/ALM_CONNECTOR_GUIDE.md` |
| Security Scanner Connector Guide | `enterprise/connectivity/SECURITY_SCANNER_CONNECTOR_GUIDE.md` |
| Cloud Connector Guide | `enterprise/connectivity/CLOUD_CONNECTOR_GUIDE.md` |
| OIDC / Entra ID Setup | `enterprise/connectivity/OIDC_ENTRA_SETUP.md` |
| Microsoft Graph Setup | `enterprise/connectivity/MICROSOFT_GRAPH_SETUP.md` |
| Security Bypass (Prototype) | `enterprise/connectivity/SECURITY_BYPASS_PROTOTYPE.md` |
| DevOps Deployment Notes | `enterprise/connectivity/DEVOPS_DEPLOYMENT_NOTES.md` |
| SRE Runbook | `enterprise/connectivity/SRE_RUNBOOK.md` |
| Connector Artifact Workbench Guide | `enterprise/connectivity/CONNECTOR_ARTIFACT_WORKBENCH_GUIDE.md` |
| Connector Usage Guide | `enterprise/connectivity/CONNECTOR_USAGE_GUIDE.md` |
| LLM Prompt Guide (Connector Artifacts) | `enterprise/connectivity/LLM_PROMPT_GUIDE_CONNECTOR_ARTIFACTS.md` |
| Connector Artifact Use Cases | `enterprise/connectivity/CONNECTOR_ARTIFACT_USE_CASES.md` |
| SharePoint/Teams/Outlook Setup | `enterprise/connectivity/SHAREPOINT_TEAMS_OUTLOOK_SETUP.md` |
| Jira/Confluence Setup | `enterprise/connectivity/JIRA_CONFLUENCE_SETUP.md` |
| SonarQube/Prisma Setup | `enterprise/connectivity/SONARQUBE_PRISMA_SETUP.md` |
| Demo Script (Management Review) | `enterprise/connectivity/DEMO_SCRIPT_MANAGEMENT_REVIEW.md` |
| Troubleshooting Guide | `enterprise/connectivity/TROUBLESHOOTING_GUIDE.md` |

## Operations

- Seed demo connectors: `POST /api/v1/connectors/seed-defaults`
- Metrics: Prometheus lines `adip_connector_run_*` on `/metrics/prometheus`
- Runbook: see `SRE_RUNBOOK.md`
