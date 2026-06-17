# ADIP — AI Driven Delivery Intelligence Platform

ADIP is an **Enterprise AI SDLC Transformation Platform** that provides end-to-end
visibility, governance, automation, traceability, intelligence, and value realization
across the entire software delivery lifecycle.

It gives executives and delivery teams a single control surface that follows work from
the moment demand is raised through to the business value it ultimately delivers in
production.

---

## Business Flow

ADIP models the full enterprise delivery value chain as one connected flow:

```
Demand
  → Portfolio Governance
  → Application Portfolio
  → Enterprise Architecture
  → Technology Strategy
  → SDLC Delivery
  → Testing & Release
  → Production Intelligence
  → Knowledge Management
  → Value Realization
  → Executive Control Tower
```

### End-to-End Traceability

Every artifact is linked along a single lineage so any item can be traced forward to the
value it produced, or backward to the demand that justified it:

```
Demand → Program → Project → Architecture → Development → Release
       → Production → Incident → RCA → Knowledge → Value
```

This lineage is surfaced in the **Traceability Center** (`/traceability`).

---

## Key Executive Modules

| # | Module | Route | Highlights |
|---|--------|-------|-----------|
| 1 | **Executive Control Tower** | `/` | Enterprise KPIs, delivery health, risk indicators, transformation & value metrics |
| 2 | **Portfolio Governance Center** | `/executive/portfolio-governance` | Demand intake, business case review, investment governance, capacity planning, benefits tracking |
| 3 | **Application Portfolio Management** | `/executive/application-portfolio` | Application inventory, technical debt, modernization, cloud & AI readiness, rationalization |
| 4 | **Enterprise Architecture Repository** | `/executive/architecture-repository` | Business capabilities, application architecture, standards compliance, review board, architecture debt |
| 5 | **Technology Strategy Center** | `/executive/technology-strategy` | Technology lifecycle, standards governance, cloud strategy, AI platform strategy, roadmap |
| 6 | **AI Delivery Copilot** | `/executive/ai-copilot` | Requirement quality, architecture/development/testing recommendations, release & audit readiness |
| 7 | **Production Intelligence** | `/production` | Incident analytics, defect leakage, customer experience, root-cause intelligence, feedback |
| 8 | **Knowledge & Learning Center** | `/knowledge-center` | Lessons learned, best practices, architecture patterns, reusable controls, RCA knowledge |
| 9 | **Value Realization Center** | `/executive/value-realization` | ROI, productivity gains, cost avoidance, audit efficiency, transformation scorecard |
| 10 | **Transformation PMO** | `/executive/transformation-pmo` | Programs, initiatives, objectives, benefits, executive commitments |

> Supporting hubs round out the platform: **SDLC Lifecycle** (Requirements → Architecture →
> Development → Testing → Release), **Governance** (Audit Center, Compliance, Risk, Evidence,
> Approval Workflow, RBAC/ABAC admin), **AI Governance** (use-case registry, model inventory,
> prompt governance, AI risk/controls/incidents), and **Reports & Analytics**.

See [`docs/MODULES.md`](docs/MODULES.md) for the full per-module functional reference and
every sub-route.

---

## Tech Stack

- **React 19** + **TypeScript** (strict) via **Vite 8**
- **MUI 9** (`@mui/material`, `@mui/icons-material`) with **Emotion** styling
- **React Router 7** for routing
- **Recharts** for data visualization
- **Framer Motion** for animation
- React Context for per-module state, backed by a custom **event bus** and a pluggable
  **persistence abstraction layer** (memory / localStorage / future API / future DB adapters)

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the layered architecture.

---

## Getting Started

### Prerequisites

- Node.js 18+ (Node 20+ recommended)

### Install & Run

```bash
npm install
npm run dev        # start the Vite dev server
```

Then open the URL printed in the terminal (default `http://localhost:5173`).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the local dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and produce a production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Demo Mode

ADIP currently ships as an **executive demonstration environment**. Authentication
(Azure AD / MSAL, OAuth/OIDC, JWT validation, token refresh, session checks) is disabled
and a demo user is injected so every hub loads without a login.

- The master switch lives in `src/config/demoMode.ts` (`DEMO_MODE = true`).
- RBAC/ABAC remain active for **demo visibility only** — they shape what each persona sees
  and are **not** security enforcement.
- A persona switcher lets you view the platform as CIO, CTO, Audit Head, Compliance Officer,
  Application Owner, Enterprise Architect, Operations Manager, or CISO.

> Do not reintroduce real tokens or authentication in demo mode. See `src/config/demoMode.ts`
> for details.

---

## Project Structure

```
src/
  components/      Reusable UI + per-module component groups
  config/          navConfig, personaConfig, demoMode
  context/         React context providers (one per module + cross-cutting)
  data/            Mock data, domain engines, RBAC/ABAC catalogs
  events/          Event bus, envelope, registry, history, publisher/subscriber
  hooks/           Shared hooks (entitlement, auto-refresh, simulation)
  pages/           Route-level page components (the executive centers/hubs)
  persistence/     Persistence engine, entity store, swappable adapters
  routes/          Route table (AppRoutes)
  services/        AI response / executive summary / KPI drilldown / simulation engines
  theme/           MUI theme
  types/           Shared TypeScript domain types
```

---

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — technical architecture, layers, providers, data flow
- [`docs/MODULES.md`](docs/MODULES.md) — functional reference for every module and sub-route
