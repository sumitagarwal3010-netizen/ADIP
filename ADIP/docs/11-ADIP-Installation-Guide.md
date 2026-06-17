# 11 — ADIP Installation Guide

## Prerequisites

- Node.js **18+** (LTS recommended)
- npm 9+ (ships with Node 18)
- Git
- A modern browser (Chrome / Edge / Firefox / Safari)

## Quick Start

```bash
# 1. Clone
git clone <repo>
cd adip

# 2. Install
npm install

# 3. Run dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Production Build

```bash
npm run build       # type-checks (tsc -b) and builds (vite build)
npm run preview     # serve dist/ locally
```

The build output is at `dist/`.

## Lint

```bash
npm run lint
```

The lint config is in `eslint.config.js`. Some pre-existing context-file
warnings exist (react-refresh) — these are tolerated.

## Demo Credentials

ADIP runs locally with no backend. Authentication is simulated; pick a
persona from the persona switcher in the TopBar:

| Persona | Default landing |
| --- | --- |
| CIO | Executive Control Tower |
| CTO | Technology Health |
| CISO | Risk Posture · Cyber Risk |
| CRO | Risk & Compliance |
| CFO | Value Realized |
| Architect | Architecture Copilot |
| Developer | Development Copilot |
| Tester | Testing Copilot |
| Auditor | Audit Copilot |

(See [`07-ADIP-Personas.md`](./07-ADIP-Personas.md).)

## Folder Layout

```
adip/
├── docs/                 ← documentation package (this folder)
├── public/               ← static assets
├── src/
│   ├── components/       ← UI primitives + center panels
│   ├── config/           ← navigation, persona, RBAC config
│   ├── context/          ← React contexts (simulation, copilot, …)
│   ├── data/             ← mock data, hub artifact definitions, KPI catalog
│   ├── hooks/            ← reusable hooks (useGenerationSimulation, …)
│   ├── pages/            ← top-level page components (one per center)
│   ├── routes/           ← route declarations
│   ├── services/         ← simulationEngine.js, executiveSummaryEngine.js
│   ├── theme/            ← MUI theme + colors
│   └── types/            ← TypeScript domain types
├── README.md
├── DEMO_READINESS_CHECKLIST.md
├── package.json
└── vite.config.ts
```

## Configuration

ADIP has no external configuration for the demo build. The simulation
engine seeds itself with `Date.now()` and runs deterministically.

For **production** wiring (real telemetry instead of simulated):

1. Replace `src/services/simulationEngine.js` with a real-data fetcher.
2. Replace `src/data/hubArtifactDefinitions.ts` with adapters to your
   actual document generation backend.
3. Replace `src/data/kpiCatalog.ts` if you have a backend KPI registry.
