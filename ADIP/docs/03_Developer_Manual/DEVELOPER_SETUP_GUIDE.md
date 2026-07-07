# ADIP Developer Setup Guide

A practical guide for developers working on the **AI Driven Delivery Intelligence Platform
(ADIP)**. Everything below reflects the actual repository configuration
(`package.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`,
`src/App.tsx`, `src/routes/index.tsx`).

---

## 1. Prerequisites

| Tool | Recommended | Notes |
|---|---|---|
| Node.js | 20 LTS or newer (18+ works) | Required by Vite 8 / React 19 toolchain |
| npm | Bundled with Node | Lockfile is `package-lock.json` (use `npm`) |
| Git | any recent | Repository is a git repo |

The project is a **client-side single-page application** — there is no backend service or
database to run. State is served from in-memory mock data and a pluggable persistence layer.

---

## 2. Install

```bash
# from the repository root (the folder containing package.json)
npm install
```

This installs the runtime and dev dependencies declared in `package.json`:

- **Runtime:** `react`, `react-dom` (19), `react-router-dom` (7), `@mui/material`,
  `@mui/icons-material` (9), `@emotion/react`, `@emotion/styled`, `recharts`, `framer-motion`
- **Dev:** `vite` (8), `@vitejs/plugin-react`, `typescript` (~6), `typescript-eslint`,
  `eslint` (10) + React Hooks / React Refresh plugins, `@types/*`

---

## 3. Run the App

```bash
npm run dev
```

Vite starts a dev server with HMR (default `http://localhost:5173`). The entry chain is:

```
index.html → src/main.tsx → src/App.tsx → BrowserRouter → AppRoutes (src/routes/index.tsx)
```

`index.html` sets the title and loads the Inter font; `src/main.tsx` mounts `<App />` into
`#root` inside `<StrictMode>`.

### What you'll see

The index route (`/`) renders the **Executive Control Tower**. Because the app runs in
**demo mode**, no login is required — see §6.

---

## 4. Available Scripts

Source: `package.json`.

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot module replacement |
| `npm run build` | Type-check via `tsc -b`, then produce a production build with `vite build` |
| `npm run preview` | Serve the built `dist/` output locally for verification |
| `npm run lint` | Run ESLint across the project (`eslint .`) |

---

## 5. Build Configuration

- **Vite** (`vite.config.ts`): minimal config — the React plugin only.
- **TypeScript project references** (`tsconfig.json`):
  - `tsconfig.app.json` — application sources under `src/`
  - `tsconfig.node.json` — Node/tooling files (e.g. Vite config)
  - `npm run build` runs `tsc -b` (solution build) before bundling, so type errors fail the
    build.
- **ESLint** (`eslint.config.js`): flat config with `@eslint/js`, `typescript-eslint`,
  `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`; `dist` is ignored.
- **Git ignores** (`.gitignore`): `node_modules`, `dist`, logs, editor folders, `.DS_Store`,
  `*.local`.

> Note: a `dist/` folder and `vite-debug.log` may be present in the working tree from prior
> builds; both are covered by `.gitignore` patterns (`dist`, `*.log`).

---

## 6. Demo Mode (Important)

ADIP currently ships as an **executive demonstration environment**. Configuration lives in
`src/config/demoMode.ts`:

- `DEMO_MODE = true` — master switch.
- Authentication (Azure AD / MSAL, OAuth/OIDC, JWT validation, token refresh, session checks)
  is **disabled**. `src/components/auth/AuthGuard.tsx` is an intentional pass-through
  (`<Outlet />`).
- A non-expiring demo user/session is injected (`DEMO_USER`, `DEMO_SESSION`).
- The **persona switcher** (TopBar) lets you view the platform as different roles. Only the
  personas in `DEMO_SWITCHABLE_PERSONAS` are listed (CIO, CTO, Audit Head, Compliance Officer,
  Application Owner, Enterprise Architect, Operations Manager, CISO).
- RBAC/ABAC and persona scoping affect **visibility only** and are **not** security
  enforcement (see `docs/PERSONA_VISIBILITY_MATRIX.md`).

> Do not reintroduce real tokens or authentication in demo mode.

---

## 7. Project Structure

```
src/
  components/      Reusable UI + per-module component groups, layouts (AppLayout, Sidebar, TopBar)
  config/          navConfig.ts, personaConfig.ts, demoMode.ts
  context/         React context providers (one per module + cross-cutting)
  data/            Mock data (*Mock.ts), domain engines (*Engine.ts), RBAC/ABAC catalogs, traceability
  events/          Event bus: EventBus, EventEnvelope, EventRegistry, EventHistory, Publisher/Subscriber
  hooks/           useEntitlement, useAutoRefresh, simulation hooks
  pages/           Route-level page components (executive centers & hubs)
  persistence/     PersistenceEngine, EntityStore, swappable adapters, repositories
  routes/          AppRoutes (the route table)
  services/        AI response / executive summary / KPI drilldown / simulation engines
  theme/           MUI theme
  types/           Shared TS domain types (+ *_ALLOWED_PERSONAS access lists)
```

See `docs/ARCHITECTURE.md` for the layered architecture and `docs/MODULES.md` for the
route-by-route module reference.

---

## 8. Provider Tree (Context You Can Rely On)

`src/App.tsx` composes the global provider tree. When adding a feature, the following
contexts are available app-wide (outermost → innermost):

```
RootErrorBoundary → ThemeProvider (+CssBaseline) → AuthenticationProvider → StorageProvider
  → PersonaProvider → AbacProvider → CopilotProvider → ProductionIntelligenceProvider
  → KnowledgeCenterProvider → ValueRealizationProvider → PortfolioGovernanceProvider
  → ApplicationPortfolioProvider → ArchitectureRepositoryProvider → TechnologyStrategyProvider
  → TransformationPmoProvider → EnterpriseRiskProvider → EventProvider → WorkflowProvider
  → NotificationProvider → SimulationProvider → BrowserRouter → AppRoutes
```

Ordering matters: persistence (`StorageProvider`), persona, and ABAC sit above the module
providers and the event/workflow/notification/simulation layers that depend on them.

---

## 9. Common Development Tasks

### Add a new route

1. Create the page component under `src/pages/`.
2. Register it in `src/routes/index.tsx` inside the `AppLayout` route group.
3. (Optional) Add a sidebar entry under the appropriate hub in `src/config/navConfig.ts`.
4. (Optional) Add an entry to `ROUTE_RESOURCE_MAP` in `src/data/rbacCatalog.ts` so the route
   is RBAC-resolved; routes with no entry default to allowed in `canAccessRoute`.

> This guide is documentation only — these steps are described, not performed.

### Gate a route/feature by entitlement

- Use the `useEntitlement()` hook (`src/hooks/useEntitlement.ts`) — it returns a resolver with
  `can(permission, resource)`, `canAccessRoute(path)`, `canPerformApprovalAction(action)`, etc.
- Use `useCan(permission, resource)` for a boolean check.

### Restrict an executive center to certain personas

- Executive centers are gated by `*_ALLOWED_PERSONAS` arrays (in `src/types/*`) consumed by
  the matching `canAccess*` function in `src/data/*Engine.ts` and dispatched from
  `canAccessRoute` in `src/data/rbacEngine.ts`.

---

## 10. Pre-Commit Checklist

Before committing changes (when explicitly asked to commit):

```bash
npm run lint      # static analysis
npm run build     # type-check (tsc -b) + production build must succeed
```

Both should pass cleanly. The production build doubles as the type-check gate.

---

## 11. Troubleshooting

| Symptom | Likely cause / action |
|---|---|
| Blank page, no nav hubs visible | Active persona's `navHubs` filter the sidebar; click **"Show all modules"** in the sidebar to reveal every hub |
| A route 404s in the sidebar but works via URL | Sidebar only shows hubs whose children pass `canAccessRoute`; the route may not be in that persona's allow-list |
| Type errors only on build, not in dev | Dev server doesn't type-check; run `npm run build` (`tsc -b`) to surface them |
| Port 5173 in use | Vite will pick the next free port; check the dev server URL printed in the terminal |
