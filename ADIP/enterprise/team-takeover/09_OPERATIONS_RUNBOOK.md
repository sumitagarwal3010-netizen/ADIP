# Operations Runbook

Additive to `docs/09_Operations/Runbooks.md` and `enterprise/connectivity/SRE_RUNBOOK.md`.

## Health checks

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness |
| `GET /ready` | DB + subsystem readiness |
| `GET /metrics/prometheus` | Prometheus scrape |

## Logs

Structured logging via `app/core/logging.py`. Correlation via request middleware. **Never log secrets or tokens.**

## Metrics

- `adip_requests_total`, `adip_connector_run_*`, LLM runtime snapshot at `/api/v1/llm/runtime`

## Failed prompt execution

1. Check `/api/v1/llm/prompt-log`
2. Verify provider health: `POST /api/v1/llm/smoke-test`
3. Review orchestrator error in API response
4. Fall back to mock mode for demo continuity

## Failed connector sync

1. `GET /api/v1/connectors/{id}/errors`
2. Verify `mock_mode` vs live credentials
3. Re-run `POST /connectors/{id}/test`
4. See `enterprise/connectivity/TROUBLESHOOTING_GUIDE.md`

## Failed artifact generation

1. Check rule engine: `POST /api/v1/rules/run`
2. Scorecard: `GET /api/v1/artifact-quality/scorecard`
3. Connector workbench explainability panel

## DB migration issues

```bash
cd backend && alembic current && alembic upgrade head
python -m app.cli doctor
```

## Rollback

1. Revert Helm release: `helm rollback adip`
2. Restore DB: `backend/scripts/db/restore.sh`
3. Set `CONNECTOR_DEFAULT_MOCK=true` to stabilize demos
