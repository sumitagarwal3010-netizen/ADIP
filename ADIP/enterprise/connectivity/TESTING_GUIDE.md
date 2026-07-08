# Enterprise Connectivity Testing Guide

## Backend

```bash
cd backend
DATABASE_URL=sqlite:///./test.db ADIP_AUTH_MODE=demo pytest tests/test_connectors.py -q
pytest -q
```

## Frontend

```bash
npm run test
npx tsc --noEmit
npm run build
```

## Manual smoke

1. Start backend + frontend with `VITE_DATA_SOURCE=backend`
2. Open `/administration/integrations`
3. Seed connectors → Test → Sync
4. Verify dashboard KPIs update
