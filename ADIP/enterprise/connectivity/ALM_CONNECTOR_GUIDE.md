# ALM Connector Guide

ADIP includes foundation connectors for common ALM/DevOps tools. Each supports test connection, health check, list resources, and normalized sync into ADIP assets.

## Supported connectors

| Type | Key capabilities |
|------|------------------|
| `jira` | Projects, issues |
| `confluence` | Spaces, pages |
| `github_enterprise` | Repos, PRs, commits |
| `gitlab` | Projects, merge requests |
| `azure_devops` | Projects, work items, pipelines |
| `jenkins` | Jobs, builds |

## Configuration

```json
{
  "base_url": "https://jira.example.com",
  "credential_ref": "JIRA_API_TOKEN",
  "mock_mode": true,
  "dry_run": false,
  "retry_max": 3,
  "timeout_seconds": 30
}
```

Store token values in `JIRA_API_TOKEN` (or vault path) — never in the database.

## API usage

- `POST /api/v1/connectors` — create instance
- `POST /api/v1/connectors/{id}/test` — test connection
- `POST /api/v1/connectors/{id}/sync` — run sync job
- `GET /api/v1/connectors/{id}/data` — normalized assets

## Local demo

With `CONNECTOR_DEFAULT_MOCK=true`, all ALM connectors return deterministic mock data without credentials.
