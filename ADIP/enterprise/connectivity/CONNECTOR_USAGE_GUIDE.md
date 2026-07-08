# Connector Usage Guide

ADIP enterprise connectors ingest evidence from ALM, collaboration, security, and cloud tools. All connectors support **mock mode** for demos without credentials.

## Quick start

1. Open **Integration Center** (`/administration/integrations`)
2. Click **Seed demo connectors**
3. **Test** and **Sync** any connector
4. Open **Connector Artifact Workbench** (`/ai-sdlc/connector-artifact-workbench`)

## Modes

| Mode | Description |
|------|-------------|
| `mock` | Deterministic sample data (default) |
| `dry-run` | Sync preview without persistence |
| `live` | Requires credential refs via env/vault |

## Target connectors for artifact generation

SharePoint, OneDrive, Teams, Outlook, Jira, Confluence, SonarQube, Prisma Cloud, GitHub Enterprise, GitLab, Azure DevOps, Jenkins.

## Credential references

Never store secrets in connector config JSON. Use `credential_ref` pointing to `JIRA_API_TOKEN`, vault paths, or secret manager keys.
