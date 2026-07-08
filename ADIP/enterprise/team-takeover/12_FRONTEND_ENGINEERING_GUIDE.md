# Frontend Engineering Guide

## Route structure

`src/routes/index.tsx` — lazy-loaded outcome pages in `lazyPages.tsx`.

## SDK/hooks

- `useAdipQuery(fetcher, mockFallback, deps)` — backend with mock fallback
- `useConnectors`, `useConnectorArtifactWorkbench`

## Backend mode

`VITE_BACKEND_MODE=true` + `apiConfig.ts` → calls FastAPI. Otherwise mock data.

## Component patterns

- `GlassCard` + `ModuleHeader` for centers
- `CenterErrorBoundary` wrapper
- `AIWorkspacePanel` for SDLC hubs
- `RuleResultsPanel` for deterministic rules

## Workbenches

| Route | Page |
|-------|------|
| `/platform/team-engineering-workbench` | LLM, regression, quality, rules |
| `/ai-sdlc/connector-artifact-workbench` | Connector artifacts |
| `/administration/integrations` | Connector catalog |

## Testing

Vitest + Testing Library. See `src/**/*.test.ts`.

Cross-reference: `docs/12_UI_UX/` (stub README — use this guide instead).
