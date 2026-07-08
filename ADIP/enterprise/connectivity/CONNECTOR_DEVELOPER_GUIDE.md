# Connector Developer Guide

Extend ADIP enterprise connectors without duplicating the framework.

## Add a new connector type

1. Register in `backend/app/connectors/registry.py` (`CONNECTOR_CATALOG`)
2. Add driver factory in `backend/app/connectors/drivers.py`
3. Implement `_test_connection_live` and `fetch_page` on a `BaseConnector` subclass
4. Add unit test in `backend/tests/test_connectors.py`

## Base class policies

- `mock_mode=True` (default) — returns deterministic sample data
- `dry_run=True` — test/sync without side effects
- Retry via `RetryPolicy` in `BaseConnector`
- Audit via `audit_event()`

## Normalization

Use `partition_sync_items()` and `normalize_finding()` from `normalizers.py` before persisting.

## AI integration

`backend/app/connectors/ai_context.py` builds prompt context from synced assets/findings.
