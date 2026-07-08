# Jira / Confluence Setup Guide

## Jira

```json
{
  "base_url": "https://your-org.atlassian.net",
  "project_key": "ADIP",
  "credential_ref": "JIRA_API_TOKEN_ENV",
  "mock_mode": true
}
```

Set `JIRA_API_TOKEN` in environment or secret manager.

### Traceability mapping

Epic → Story → Bug → Release item with external IDs preserved in artifact traceability.

## Confluence

```json
{
  "base_url": "https://your-org.atlassian.net/wiki",
  "space_key": "ARCH",
  "credential_ref": "CONFLUENCE_API_TOKEN_ENV",
  "mock_mode": true
}
```

### Classifications

architecture, design_decision, runbook, requirement

## Demo

Use Integration Center **Seed** + **Sync**, then open Connector Artifact Workbench with `requirements_document` or `traceability_matrix`.
