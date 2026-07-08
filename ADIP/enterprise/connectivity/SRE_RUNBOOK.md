# Enterprise Connectivity SRE Runbook

## Health checks

- `GET /ready` — database connectivity
- `GET /api/v1/connectors/dashboard` — connector subsystem summary
- `GET /api/v1/connectors/{id}/health` — per-connector health

## Metrics (Prometheus)

- `adip_connector_run_total`
- `adip_connector_run_success_total`
- `adip_connector_run_failure_total`

## Common issues

| Symptom | Action |
|---------|--------|
| Sync failures | Check `GET /api/v1/connectors/{id}/errors` |
| Auth 401 in oidc mode | Verify `OIDC_ISSUER` and Bearer token |
| Empty catalog | `POST /api/v1/connectors/seed-defaults` |

## Logs

Structured logs via `connector_audit` — secrets are never logged.
