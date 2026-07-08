# SharePoint / Teams / Outlook Setup Guide

## Microsoft Graph (SharePoint, Teams, Outlook, OneDrive)

### Config placeholders

```json
{
  "tenant_id": "<azure-tenant-id>",
  "client_id": "<app-registration-client-id>",
  "credential_ref": "GRAPH_CLIENT_SECRET_VAULT_PATH",
  "mock_mode": true
}
```

### Credential reference

Store client secret in vault path `secret/adip/graph-client-secret` — never in DB.

### Permissions (production)

- `Sites.Read.All`, `Files.Read.All` (SharePoint/OneDrive)
- `ChannelMessage.Read.All` (Teams)
- `Mail.Read` (Outlook)

### Demo mode

Set `mock_mode: true` or `CONNECTOR_DEFAULT_MOCK=true` — no Graph credentials required.

## Classification mapping

| Source | Classifications |
|--------|-----------------|
| SharePoint | requirement, architecture, policy, test_evidence, release_evidence, governance_evidence |
| Teams | decision_log, approval, incident, release_discussion |
| Outlook | approval, audit_evidence, signoff, risk_escalation |
