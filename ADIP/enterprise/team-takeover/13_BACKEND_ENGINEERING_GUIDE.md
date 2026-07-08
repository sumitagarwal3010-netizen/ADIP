# Backend Engineering Guide

## API conventions

- Prefix: `/api/v1/`
- Tags in OpenAPI per router
- Pydantic `response_model` on routes
- Errors: `HTTPException` or `app/core/exceptions.py`

## Service conventions

- One service class per domain in `app/services/`
- DB session injected via constructor
- No secrets in services — env/vault only

## Schemas

`app/schemas/` — request/response DTOs separate from ORM models.

## Dependency injection

```python
def get_service(db: Session = Depends(get_db)) -> MyService:
    return MyService(db)
```

## Metrics

`app/core/metrics.py`, `app/connectors/metrics.py` — Prometheus exposition on `/metrics/prometheus`.

## Testing

`backend/tests/` — session-scoped seeded DB in `conftest.py`. Run `pytest -q`.

## New endpoints checklist

1. Schema 2. Service 3. Router 4. `router.py` 5. Test 6. `export_api`
