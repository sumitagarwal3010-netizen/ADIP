# Connector Configuration Guide

## Environment variables (see `backend/.env.example`)

```bash
CONNECTOR_DEFAULT_MOCK=true
CONNECTOR_SYNC_ENABLED=true
JIRA_API_TOKEN_ENV=JIRA_API_TOKEN
GRAPH_CLIENT_SECRET_VAULT_PATH=secret/adip/graph-client-secret
```

## API workflow

1. `GET /api/v1/connectors/catalog` — available types
2. `POST /api/v1/connectors` — create instance with credential refs
3. `POST /api/v1/connectors/{id}/test` — connectivity check
4. `POST /api/v1/connectors/{id}/sync` — ingest assets/findings
5. `GET /api/v1/connectors/{id}/data` — normalized view

## Helm / Kubernetes

See `deploy/helm/adip/values.yaml` connector section and `deploy/k8s/secrets.example.yaml`.
