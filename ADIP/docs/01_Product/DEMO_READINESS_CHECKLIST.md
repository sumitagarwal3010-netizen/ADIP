# ADIP Demo Readiness Checklist

Use this checklist before every executive demo. Every item should be
green before you walk into the room.

> Last validated: 2026-06-17 · Build: `npm run build` ✅

---

## 1. Build & Lint

- [x] `npm run build` succeeds (tsc clean + vite build clean).
- [x] `npm run lint` produces no *new* errors in modified files.
- [x] No console errors on landing page.

## 2. Pages Functional

- [x] Executive Control Tower renders the four executive KPIs.
- [x] AI SDLC Copilot tabs (Requirements, Architecture, Development, Testing,
      Release, Audit) all render with non-empty findings, recommendations
      and suggested actions.
- [x] Portfolio Governance defaults to AI Portfolio Advisor.
- [x] Enterprise Architecture defaults to Architecture Domains.
- [x] Technology Strategy defaults to Technology Standards.
- [x] Risk & Compliance defaults to Enterprise Risk Register.
- [x] AI Governance Center renders Use Cases, Models, Prompts, Risks,
      Controls and Evaluation.
- [x] AI Evaluation Center and AI Observability Center render telemetry.
- [x] **Universal Artifacts Repository** (`/artifacts`) loads with seeded
      and generated artifacts.
- [x] **KPI Catalog** (`/kpi-catalog`) loads with the full KPI dictionary.

## 3. Generators & Downloads

- [x] AI SDLC Copilot generation actions complete and produce artifact
      cards with **Download** buttons (every card downloads a real text
      file).
- [x] Each center's AI Reports tab generates executive-grade artifacts
      with progress flow → run history → repository panel → viewer dialog
      → Download button.
- [x] **Generate KPI Catalog** on `/kpi-catalog` produces Markdown + CSV
      downloads and registers them in `/artifacts`.
- [x] **Export Catalog (CSV)** on `/artifacts` downloads the registry.
- [x] **Generate Executive Summary** in the TopBar opens the right-side
      drawer with a narrative summary, Copy and Export-to-Text actions.

## 4. Universal Artifact Repository

- [x] Every generation flow pushes into `/artifacts`.
- [x] Search, status filter, source filter, format filter all work.
- [x] View opens the full artifact viewer with sections + Download.
- [x] Download materializes the artifact body to disk.

## 5. KPI Documentation

- [x] Every KPI surfaced in the platform has an entry in
      `src/data/kpiCatalog.ts`.
- [x] Each entry has Definition, Formula, Source, Frequency, Owner,
      Executive Consumer, Answers, optional Unit, optional Target.
- [x] `/kpi-catalog` page renders all entries searchable / filterable.
- [x] Generate KPI Catalog action produces Markdown + CSV.

## 6. Charts & Drilldowns

- [x] Charts render with realistic, non-uniform values (driven by
      simulation engine + correlated mocks).
- [x] Domain risk panels link to detailed registers.
- [x] AI Risk panel in Risk & Compliance renders a summarized rollup with
      a deep link to AI Governance Risk Registry.

## 7. Documentation

- [x] `/docs/01-ADIP-Executive-Overview.md` — Vision · Objectives · Value.
- [x] `/docs/02-ADIP-Architecture.md` — Architecture, components, flows.
- [x] `/docs/03-ADIP-Modules.md` — Center inventory.
- [x] `/docs/04-ADIP-KPI-Catalog.md` — KPI dictionary reference.
- [x] `/docs/05-ADIP-Artifact-Catalog.md` — Artifact catalog.
- [x] `/docs/06-ADIP-Governance-Model.md` — AI governance model.
- [x] `/docs/07-ADIP-Personas.md` — Personas & RBAC scope.
- [x] `/docs/08-ADIP-Demo-Guide.md` — 20-minute demo script.
- [x] `/docs/09-ADIP-Executive-Demo-Talking-Points.md` — CIO script.
- [x] `/docs/10-ADIP-ROI-Methodology.md` — ROI formulas.
- [x] `/docs/11-ADIP-Installation-Guide.md` — Setup.
- [x] `/docs/12-ADIP-Developer-Guide.md` — Developer reference.
- [x] `/docs/13-ADIP-Operations-Guide.md` — Operations.
- [x] `/docs/14-ADIP-Release-Guide.md` — Release process.
- [x] `/docs/15-ADIP-FAQ.md` — FAQ.

## 8. README

- [x] Production-quality `README.md` at repo root with:
      - Product overview
      - Features
      - Architecture diagram
      - Setup steps
      - Demo credentials
      - Demo flow links
      - Documentation links

## 9. Executive Reports

- [x] CIO, CTO, CRO, CISO Executive Insights tabs each generate a
      downloadable executive report containing Summary, KPIs, Risks,
      Recommendations, Actions.

## 10. No Placeholder Content

- [x] No "Coming Soon" pages.
- [x] No lorem ipsum.
- [x] No empty charts / tables on visible pages.
- [x] No dead tabs.
- [x] All buttons either work or are absent.

---

## Pre-Demo Final 5

5 minutes before the meeting:

1. Open the deployed URL fresh in an incognito window.
2. Confirm the simulation tick (30s subtitle on Executive Insights).
3. Click **Generate Executive Summary** once to pre-warm the engine.
4. Click **Generate KPI Catalog** once to seed `/artifacts`.
5. Open `/artifacts` to confirm the registry already has entries.

You're ready.
