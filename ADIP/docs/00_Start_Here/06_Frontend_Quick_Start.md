# Frontend Quick Start

```bash
npm install
npm run dev          # dev server
npm run build        # tsc -b && vite build → dist/
npx tsc --noEmit     # type-check only
```

## Data source feature flag

The frontend defaults to its built-in **mock** layer (works with no backend). To
read from the FastAPI backend instead:

```bash
# .env.local at repo root
VITE_DATA_SOURCE=backend
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

Or toggle at runtime: `localStorage.setItem('adip.dataSource','backend')`.

## Backend access (additive — no page redesign)

```ts
import { apiClient, useBackendData, isBackendMode } from '@/services/backend';

// Orchestrate a prompt from any page/component:
const res = await apiClient.orchestrate('Implement UPI Auto-Reversal for Mobile Banking.');
```

`src/services/backend/` holds the typed client, feature flag and `useBackendData`
hook (mock fallback on error). Existing pages/mocks are untouched.
