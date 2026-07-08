# DevOps Deployment Notes — Enterprise Connectors

## Environment variables

See `backend/.env.example` and `deploy/.env.example` for:

- `ADIP_AUTH_MODE` — `oidc` in production
- `CONNECTOR_DEFAULT_MOCK` — `false` in production
- `CONNECTOR_SYNC_ENABLED` — background sync toggle

## Helm

`deploy/helm/adip/values.yaml` includes connector and auth env defaults. Production should use `secrets.existingSecret` for:

- `DATABASE_URL`
- OIDC client secret (if confidential client)
- Connector API tokens (referenced by env var names in connector config)

## Kubernetes secret example

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: adip-secrets
type: Opaque
stringData:
  DATABASE_URL: postgresql://...
  JIRA_API_TOKEN: "<from-secret-manager>"
  SNYK_TOKEN: "<from-secret-manager>"
```

## Health checks

- `/health` — process liveness
- `/ready` — DB + subsystem readiness
- `/metrics` — includes `adip_connector_*` counters

## Worker / scheduler

Set `CONNECTOR_SYNC_ENABLED=true` to allow scheduled sync (cron/worker deployment is environment-specific; ADIP exposes sync API for external schedulers).

## Grafana

Import `deploy/observability/grafana-dashboard.json` — includes connector run and sync panels.
