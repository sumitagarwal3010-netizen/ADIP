# ADIP Architecture

This document describes the technical architecture of the AI Driven Delivery Intelligence
Platform (ADIP) — a single-page React application that presents the enterprise SDLC value
chain as one connected, traceable experience.

---

## 1. High-Level Overview

ADIP is a **client-side SPA** with a layered, modular design:

```
┌──────────────────────────────────────────────────────────────┐
│                         Presentation                            │
│  pages/ (executive centers & hubs)  ·  components/ (UI groups)  │
│  layouts/ (AppLayout, nav)          ·  charts/ · common/         │
├──────────────────────────────────────────────────────────────┤
│                          State                                  │
│  context/ (one provider per module + cross-cutting providers)   │
│  hooks/ (entitlement, auto-refresh, simulation)                 │
├──────────────────────────────────────────────────────────────┤
│                       Domain / Logic                            │
│  data/*Engine.ts  ·  services/ (AI, summary, KPI, simulation)   │
│  data/*Mock.ts (seed data)  ·  data/traceability* (lineage)     │
├──────────────────────────────────────────────────────────────┤
│            Cross-Cutting Infrastructure                         │
│  events/ (event bus)  ·  persistence/ (engine + adapters)       │
│  data/rbac* · data/abac* · data/rowSecurityEngine (visibility)  │
└──────────────────────────────────────────────────────────────┘
```

Each executive module is self-contained: it owns a **types** definition, a **mock data**
seed, a **domain engine** that derives KPIs/insights, a **context provider** that exposes
state to the UI, and one or more **page** components.

---

## 2. Tech Stack

| Concern | Choice |
|--------|--------|
| Language | TypeScript (strict, project references via `tsconfig.*.json`) |
| Framework | React 19 |
| Build tool | Vite 8 (`@vitejs/plugin-react`) |
| UI library | MUI 9 (`@mui/material`, `@mui/icons-material`) + Emotion |
| Routing | React Router 7 |
| Charts | Recharts |
| Animation | Framer Motion |
| Linting | ESLint 10 + typescript-eslint |

---

## 3. Application Composition

The app is bootstrapped in `src/main.tsx` → `src/App.tsx`. `App.tsx` composes the full
provider tree, wrapping the router so all routes share global state:

```
RootErrorBoundary
└─ ThemeProvider (+ CssBaseline)
   └─ AuthenticationProvider
      └─ StorageProvider (persistence)
         └─ PersonaProvider
            └─ AbacProvider
               └─ Module providers
                  (Copilot, ProductionIntelligence, KnowledgeCenter,
                   ValueRealization, PortfolioGovernance, ApplicationPortfolio,
                   ArchitectureRepository, TechnologyStrategy, TransformationPmo,
                   EnterpriseRisk)
                  └─ EventProvider
                     └─ WorkflowProvider
                        └─ NotificationProvider
                           └─ SimulationProvider
                              └─ BrowserRouter → AppRoutes
```

Ordering matters: persistence and persona/ABAC sit near the top because downstream module
providers and the event/workflow/notification layers depend on them.

---

## 4. Routing & Navigation

- **Route table:** `src/routes/index.tsx` (`AppRoutes`). All authenticated routes render
  inside `AuthGuard` → `AppLayout`. The index route is the **Executive Control Tower**.
- **Navigation model:** `src/config/navConfig.ts` defines `NAV_HUBS` — a grouped sidebar of
  hubs, each with child links. Hubs include Executive Control Tower, SDLC Lifecycle,
  Traceability, Operations, Governance, AI Governance, Knowledge, and Reports & Analytics.
- **Tabbed centers:** Many executive centers (e.g. Value Realization, Portfolio Governance,
  Application Portfolio, Architecture Repository, Technology Strategy, Transformation PMO,
  Enterprise Risk, AI Copilot, Production Intelligence, Audit Center, Activity Center,
  Notification Center, Knowledge Center, Traceability Center) are a single page component
  driven by an `initialTab` prop, with one route per tab. This keeps deep links shareable
  while reusing one component.

---

## 5. State Management (Context Layer)

State is organized as **one context per domain module** plus cross-cutting providers, all in
`src/context/`:

- **Module state:** `CopilotContext`, `ProductionIntelligenceContext`,
  `KnowledgeCenterContext`, `ValueRealizationContext`, `PortfolioGovernanceContext`,
  `ApplicationPortfolioContext`, `ArchitectureRepositoryContext`,
  `TechnologyStrategyContext`, `TransformationPmoContext`, `EnterpriseRiskContext`.
- **Cross-cutting:** `AuthContext`, `PersonaContext`, `AbacContext`, `PersistenceContext`
  (`StorageProvider`), `EventContext`, `WorkflowContext`, `NotificationContext`,
  `SimulationContext`.

Each module context typically loads its seed (`data/*Mock.ts`), runs it through the module's
engine (`data/*Engine.ts`), and exposes derived KPIs, collections, and actions to pages.

---

## 6. Domain Logic

- **Engines** (`src/data/*Engine.ts`): pure-ish logic that transforms seed data into KPIs,
  rollups, insights, and recommendations per module (e.g. `valueRealizationEngine`,
  `portfolioGovernanceEngine`, `traceabilityEngine`, `unifiedLifecycleEngine`).
- **Services** (`src/services/`): shared cross-module engines —
  - `aiResponseEngine` — AI Delivery Copilot recommendation generation
  - `executiveSummaryEngine` — executive narrative/summary rollups
  - `kpiDrilldownEngine` — KPI drill-down expansion
  - `simulationEngine` / `simulationService` — live data simulation
  - `mockDataEngine` — shared mock data utilities
- **Artifacts** (`src/data/*ArtifactFactory.ts`, `artifactBuilder.ts`): generate SDLC
  artifacts (requirements, design, development, testing, release) used for traceability.

---

## 7. Traceability

The lineage `Demand → Program → Project → Architecture → Development → Release → Production →
Incident → RCA → Knowledge → Value` is modeled in `src/data/traceabilityModel.ts` and computed
by `src/data/traceabilityEngine.ts`. It is surfaced through the **Traceability Center**
(`/traceability`) with tabs for the lineage dashboard, requirement matrix (RTM), AI
traceability, impact analysis, executive view, workflow lifecycle, evidence lineage, and
reports.

---

## 8. Event Bus

`src/events/` implements an in-app enterprise event bus:

- `EventEnvelope.ts` — standard event envelope shape
- `EventBus.ts` — publish/subscribe core
- `EventRegistry.ts` — known event types
- `EventPublisher.ts` / `EventSubscriber.ts` — producer/consumer helpers
- `EventHistory.ts` — retained event stream (drives the Activity Center / activity stream)

`EventContext` exposes the bus to the app, and `data/eventNotificationBridge.ts` connects
events to the notification system.

---

## 9. Persistence Abstraction

`src/persistence/` provides a swappable storage layer so the platform can move from demo
storage to a real backend without touching feature code:

- `PersistenceEngine.ts` + `EntityStore.ts` — the storage facade and entity store
- `adapters/` — `MemoryAdapter`, `LocalStorageAdapter`, `FutureApiAdapter`,
  `FutureDatabaseAdapter`, all conforming to `StorageAdapter`
- `repositories/` — repository accessors over the engine

`PersistenceContext` (`StorageProvider`) wires the chosen adapter into the app. The
**Persistence Admin** dashboard (`/administration/persistence`) exposes its state.

---

## 10. Access Control & Personas (Demo Visibility)

- **Personas:** `src/config/personaConfig.ts` defines persona identities; `PersonaContext`
  tracks the active persona and the persona switcher drives demo viewpoints.
- **RBAC:** `data/rbacCatalog.ts` + `data/rbacEngine.ts`, surfaced via `/administration/rbac`.
- **ABAC:** `data/abacCatalog.ts` + `data/abacEngine.ts`, via `AbacContext` and
  `/administration/abac`.
- **Row-level visibility:** `data/rowSecurityEngine.ts`.
- **Entitlement hook:** `hooks/useEntitlement.ts` gates UI by persona/role.

> In demo mode these shape **visibility only** and are not security enforcement. See
> `src/config/demoMode.ts`.

---

## 11. Theming

`src/theme/theme.ts` defines the MUI theme. `App.tsx` applies it via `ThemeProvider` +
`CssBaseline` at the top of the tree.

---

## 12. Build & Tooling

- `npm run build` runs `tsc -b` (project-reference type-check across
  `tsconfig.app.json` / `tsconfig.node.json`) then `vite build`.
- ESLint config in `eslint.config.js` (with React Hooks + React Refresh plugins).
- Vite config in `vite.config.ts`.
