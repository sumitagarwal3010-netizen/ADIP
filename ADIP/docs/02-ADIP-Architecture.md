# 02 — ADIP Architecture

ADIP is a single-page React application built around a **driver-based
correlated simulation engine** and a **universal artifact pipeline**.

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        ADIP Front-End (React + MUI)             │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ Executive  │  │   AI SDLC  │  │ Governance │  │ Operations │ │
│  │   Tower    │  │   Copilot  │  │   Centers  │  │  Centers   │ │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘ │
│        │               │                │               │       │
│        ▼               ▼                ▼               ▼       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Hub & Copilot Sections (UI primitives)        │  │
│  │   CopilotSection · HubArtifactGenerator · GlassCard      │  │
│  └─────────────────┬────────────────────────────┬───────────┘  │
│                    │                            │              │
│                    ▼                            ▼              │
│       ┌────────────────────────┐     ┌──────────────────────┐  │
│       │  ArtifactsContext      │     │  SimulationContext   │  │
│       │  (universal registry)  │     │  (driver-based ticks)│  │
│       └────────────────────────┘     └──────────────────────┘  │
│                    │                            │              │
└────────────────────┼────────────────────────────┼──────────────┘
                     ▼                            ▼
            /artifacts page            simulationEngine.js
            /kpi-catalog page          (mulberry32 RNG +
                                        latent variables)
```

## Components

### Universal Artifact Pipeline

- **`CopilotSection`** — used by AI SDLC Copilots (Requirements, Architecture,
  Development, Testing, Release, Audit). On every Generate click it produces a
  preview-grade artifact and pushes it into `ArtifactsContext`.
- **`HubArtifactGenerator`** — used by every center's "AI Reports" tab.
  Produces fully-built executive-grade artifacts (with sections, executive
  summary, risk rating) via `data/hubArtifactDefinitions.ts`.
- **`ArtifactsContext`** — a session-scoped registry that stores **every**
  artifact generated anywhere on the platform.
- **`UniversalArtifactsRepository` (`/artifacts`)** — search, filter, view
  and download any artifact from any center.

### Driver-Based Simulation Engine

`src/services/simulationEngine.js` — a deterministic, seeded simulation that
ticks every 30 seconds. KPIs are derived from latent variables and cascade
through the platform (e.g., more incidents → lower operational health → lower
release readiness). See `04-ADIP-KPI-Catalog.md` for the formulas.

### KPI Governance Framework

`src/data/kpiCatalog.ts` is the authoritative KPI dictionary. The `/kpi-catalog`
page renders the dictionary and generates a downloadable catalog into the
Universal Artifact Repository.

### Executive Summary Engine

`src/services/executiveSummaryEngine.js` produces a narrative executive summary
from the live `SimulationState`. The "Generate Executive Summary" button on the
TopBar triggers this engine and renders the narrative in a right-side drawer.

## Routing & Layouts

- `src/routes/index.tsx` — declarative route table with explicit redirects for
  legacy AI-Governance paths.
- `src/components/layouts/AppLayout.tsx` — top-level chrome (TopBar, Sidebar,
  page meta, and the Executive Summary Drawer).
- `src/config/navConfig.ts` — left-navigation hierarchy (Executive,
  Governance, AI SDLC, Operations, Knowledge, Transformation, Platform).

## State Management

- React Context for cross-cutting state (Simulation, Persona, ABAC, Auth,
  Workflow, Notifications, Storage, Events, Copilot, Production Intelligence,
  Knowledge, Value Realization, Portfolio Governance, Application Portfolio,
  Architecture Repository, Technology Strategy, Transformation PMO, Enterprise
  Risk, **Artifacts**).

## Data Flows

```
   ┌───────────────┐   tick(30s)   ┌─────────────────┐
   │ simulationEng │──────────────▶│ SimulationState │
   └───────┬───────┘               └─────────┬───────┘
           │                                 │
           ▼                                 ▼
   ┌───────────────┐               ┌─────────────────┐
   │   Copilot     │ ◀─────────────│   Centers       │
   │   panels      │  data props   │ (Tabs render)   │
   └───────┬───────┘               └─────────┬───────┘
           │                                 │
           ▼                                 ▼
   ┌──────────────────────────────────────────────┐
   │           ArtifactsContext (registry)        │
   └─────────────────────┬────────────────────────┘
                         ▼
                  /artifacts page
```
