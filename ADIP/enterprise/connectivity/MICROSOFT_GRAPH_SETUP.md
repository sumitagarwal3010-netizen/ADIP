# Microsoft Graph Setup Guide

Graph-backed connectors: SharePoint, Teams, Outlook, OneDrive.

## Placeholder configuration

```json
{
  "tenant_id": "<azure-tenant-id>",
  "client_id": "<app-id>",
  "credential_ref": "GRAPH_CLIENT_SECRET_VAULT_PATH"
}
```

## Permissions (production)

- `Sites.Read.All`, `ChannelMessage.Read.All`, `Mail.Read`, `Files.Read.All`

## Mock mode

Default `mock_mode=true` returns sample sites/channels without calling Graph.

Implement live calls in collaboration driver `_test_connection_live` when credentials are available.
