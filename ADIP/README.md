# ADIP — AI Delivery Intelligence Platform

> **AI Executive Delivery Intelligence Platform** for the CIO, CTO, CRO and
> CISO. ADIP transforms a multi-portfolio, multi-domain technology estate
> into a single AI-orchestrated control surface where AI **analyzes**,
> **finds**, **recommends** and **generates** at every step of the SDLC.

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](.)
[![License](https://img.shields.io/badge/license-internal-blue)](.)
[![React](https://img.shields.io/badge/react-19-blue)](.)
[![TypeScript](https://img.shields.io/badge/typescript-5-blue)](.)
[![MUI](https://img.shields.io/badge/MUI-7-purple)](.)

---

## What ADIP is

ADIP is **not a KPI dashboard**. It is the executive operating cockpit
for an AI-driven SDLC. Every center surfaces four things:

1. **What did AI analyze?**
2. **What did AI find?**
3. **What does AI recommend?**
4. **What can AI generate?**

KPIs are *secondary outcome indicators*; they exist to confirm that the AI
recommendations are landing.

---

## Features

### AI SDLC Copilot
Six AI Copilots — Requirements, Architecture, Development, Testing,
Release, Audit — each with **AI Findings**, **AI Recommendations**,
**Generated Artifacts** and **Suggested Actions**. Click Generate; the AI
authors a downloadable executive deliverable.

### Universal Artifact Generation Framework
Every center has a Generate flow with multi-stage progress modal,
governed run history and a downloadable artifact. Every generated
artifact lands in the **Universal Artifacts Repository** at `/artifacts`
where it is searchable, filterable, viewable and downloadable.

### KPI Governance Framework
The **KPI Catalog** at `/kpi-catalog` is the authoritative dictionary —
every KPI documented with definition, formula, source, frequency, owner
and executive consumer. One click downloads a Markdown + CSV catalog and
registers them in the Universal Artifact Repository.

### Single Source of Truth
- **AI Risks** → AI Governance only (rollup-only elsewhere)
- **AI Evaluation** → AI Evaluation Center only
- **AI Runtime** → AI Observability only
- **Artifacts** → Universal Artifact Repository

### Executive Cockpit
- **Executive Control Tower** — four executive KPIs answering four
  CIO-level questions.
- **Executive Summary Drawer** (TopBar) — narrative summary generated
  live from the simulation state, with Copy and Export-to-Text actions.

### Driver-Based Correlated Simulation
A driver-based simulation engine ticks every 30 seconds with latent
variables and KPI cascades — incidents lower operational health, lower
release readiness, lower delivery score; governance findings raise risk;
realistic interdependencies, deterministic seeded RNG.

---

## Architecture

```
                         ┌────────────────────────────────────┐
                         │        AI Executive Surface        │
                         │  (Tower · Summary · Outcomes)      │
                         └──────────────┬─────────────────────┘
                                        ▼
   ┌──────────────────┬─────────────────────────────┬────────────────────┐
   │   AI SDLC        │   Governance & Risk         │    Operations      │
   │   Copilot        │   (Portfolio · EA · Tech ·  │  (Production · Ops │
   │   (6 tabs)       │   Risk · AI Governance)     │   · Observability) │
   └────────┬─────────┴───────────────┬─────────────┴───────────┬────────┘
            ▼                         ▼                         ▼
   ┌──────────────────────────────────────────────────────────────────┐
   │            CopilotSection · HubArtifactGenerator                 │
   └────────┬─────────────────────────────────────────────────────────┘
            ▼
   ┌──────────────────┐    push    ┌──────────────────────────────────┐
   │ ArtifactsContext │◀───────────│  every Generate action everywhere │
   └────────┬─────────┘            └──────────────────────────────────┘
            ▼
       /artifacts (Universal Artifacts Repository)
```

Detailed architecture: [`docs/02-ADIP-Architecture.md`](./docs/02-ADIP-Architecture.md).

---

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Install & Run

```bash
git clone <repo>
cd adip
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
npm run build       # tsc -b && vite build
npm run preview     # preview the production build
```

### Lint

```bash
npm run lint
```

Detailed install guide: [`docs/11-ADIP-Installation-Guide.md`](./docs/11-ADIP-Installation-Guide.md).

---

## Demo Credentials

ADIP runs locally with no backend. There are no real auth credentials —
use the **Persona Switcher** in the TopBar to assume any persona.

Available personas: CIO · CTO · CISO · CRO · CFO · EA · PM · Architect ·
Developer · Tester · Auditor · Compliance Officer · Model Owner · AI
Governance Lead.

Each persona has a curated default landing experience, quick links and
an RBAC scope — see [`docs/07-ADIP-Personas.md`](./docs/07-ADIP-Personas.md).

---

## Demo Flow

A scripted 20-minute boardroom demo is provided:
[`docs/08-ADIP-Demo-Guide.md`](./docs/08-ADIP-Demo-Guide.md).

A condensed CIO talking-points version:
[`docs/09-ADIP-Executive-Demo-Talking-Points.md`](./docs/09-ADIP-Executive-Demo-Talking-Points.md).

Acts:
1. Executive Cockpit — KPIs + Executive Summary
2. AI SDLC Copilot — generate artifacts in 6 phases
3. AI Governance — single source of truth tour
4. Portfolio AI Advisor — accelerate / stop / fund / at-risk
5. Risk, Architecture & Technology centers
6. Universal Artifact Repository (closing reveal)
7. KPI Governance

---

## Screenshots

> Run `npm run dev` to capture live screenshots. The platform is
> intentionally tick-driven so static screenshots will rapidly look
> stale; we capture them per-release.

Suggested capture path:

1. Executive Control Tower
2. Executive Summary Drawer (open)
3. Requirements Copilot — generated artifact card
4. AI Governance Center — Risks
5. Risk & Compliance — AI Risk rollup with deep link
6. Universal Artifact Repository — populated with generated artifacts
7. KPI Catalog — full dictionary

---

## Documentation Links

| # | Document | Purpose |
| --- | --- | --- |
| 01 | [Executive Overview](./docs/01-ADIP-Executive-Overview.md) | Vision · Objectives · Value |
| 02 | [Architecture](./docs/02-ADIP-Architecture.md) | Components · Flows |
| 03 | [Modules](./docs/03-ADIP-Modules.md) | Center inventory |
| 04 | [KPI Catalog](./docs/04-ADIP-KPI-Catalog.md) | KPI dictionary reference |
| 05 | [Artifact Catalog](./docs/05-ADIP-Artifact-Catalog.md) | Generated artifacts |
| 06 | [Governance Model](./docs/06-ADIP-Governance-Model.md) | AI governance |
| 07 | [Personas](./docs/07-ADIP-Personas.md) | Personas & RBAC |
| 08 | [Demo Guide](./docs/08-ADIP-Demo-Guide.md) | 20-min demo script |
| 09 | [Executive Talking Points](./docs/09-ADIP-Executive-Demo-Talking-Points.md) | CIO script |
| 10 | [ROI Methodology](./docs/10-ADIP-ROI-Methodology.md) | ROI formulas |
| 11 | [Installation Guide](./docs/11-ADIP-Installation-Guide.md) | Setup |
| 12 | [Developer Guide](./docs/12-ADIP-Developer-Guide.md) | Developer reference |
| 13 | [Operations Guide](./docs/13-ADIP-Operations-Guide.md) | Operations |
| 14 | [Release Guide](./docs/14-ADIP-Release-Guide.md) | Release process |
| 15 | [FAQ](./docs/15-ADIP-FAQ.md) | FAQ |

Plus:

- [Demo Readiness Checklist](./DEMO_READINESS_CHECKLIST.md)
- Legacy reference: [Architecture](./docs/ARCHITECTURE.md), [Modules](./docs/MODULES.md), [Diagrams](./docs/DIAGRAMS.md), [Functional walkthrough](./docs/FUNCTIONAL_WALKTHROUGH.md)

---

## License

Internal — All rights reserved.
