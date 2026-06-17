# 08 — ADIP Demo Guide

A 20-minute boardroom demo path. Run `npm run dev` and open
[http://localhost:5173](http://localhost:5173).

## Pre-Demo (1 min)

1. Open the app fresh — ensure the simulation is ticking (subtitle on
   Executive Insights reads *"Live · updates every 30s"*).
2. The TopBar carries a **Generate Executive Summary** button — verify it
   opens the right-side drawer.
3. Have a clean browser window — every artifact you generate during the
   demo will accumulate in `/artifacts`.

## Act 1 — Executive Cockpit (3 min)

1. Land on **Executive Control Tower**.
2. Walk the four executive KPIs (Delivery Health, Technology Health, Risk
   Posture, Value Realized). Note the live ticking simulation.
3. Click **Generate Executive Summary** in the TopBar. Show the dynamically
   generated narrative covering Health, Risks, Achievements, Incidents,
   Release & Governance Status, Recommended Actions. Demonstrate **Copy**
   and **Export to Text**.

## Act 2 — AI SDLC Copilot (6 min)

Goal: prove that ADIP is *AI-first*, not a KPI portal.

1. Open **AI SDLC Copilot** (left nav → Executive → AI SDLC Copilot).
2. **Requirements Copilot** — review AI Findings (ambiguity, missing AC,
   missing NFR). Click **Generate User Stories**. Watch the AI-authoring
   stages run, see the new artifact card appear with **Run ID, AI agent,
   timestamp, preview, Download button**.
3. **Architecture Copilot** — generate an Architecture Risk Assessment and
   a Modernization Plan.
4. **Testing Copilot** — generate a Regression Pack.
5. **Release Copilot** — show the GO / CONDITIONAL GO / NO GO decision and
   generate a CAB Pack.
6. **Audit Copilot** — generate an Audit Report.

## Act 3 — AI Governance Single Source of Truth (3 min)

1. Open **AI Governance Center**.
2. Tour Use Cases → Models → Prompts → Risks → Controls → Evaluation.
3. On any tab open the **AI Reports** subtab and click **Generate** — show
   the multi-stage simulation flow producing an executive-grade artifact
   with sections, executive summary, risk rating and **Download**.
4. Open **Risk & Compliance** → **AI Risk** tab — show the rollup view
   that explicitly states *"AI Risk Register lives in AI Governance"*
   with a deep-link button.

## Act 4 — Portfolio AI Advisor (2 min)

1. Open **Portfolio Governance**. The default tab is **AI Portfolio
   Advisor**.
2. Show projects classified into **Accelerate / Stop / Fund / At-Risk**
   with business impact and reasoning.
3. Generate a **Portfolio Review Pack** from the AI Reports tab.

## Act 5 — Risk, Architecture & Technology (2 min)

1. **Enterprise Risk Center** → register, drill into a Critical risk.
2. **Enterprise Architecture** → architecture domains, application
   architecture, debt.
3. **Technology Strategy** → standards, roadmaps, cloud, investments.
4. Each center has an AI Reports tab — generate one report from each.

## Act 6 — Universal Artifacts Repository (2 min)

1. Open **Platform → Artifacts Repository** (`/artifacts`).
2. Show **every** artifact generated during the demo, captured in a single
   repository with: name, source, generator, version, status, format,
   timestamp.
3. Filter by source (e.g. *Architecture Copilot*), by status, by format.
4. Click **Download** on a few artifacts to show real text downloads.
5. Click **Export Catalog (CSV)** to download the full repository as CSV.

## Act 7 — KPI Governance (1 min)

1. Open **Platform → KPI Catalog** (`/kpi-catalog`).
2. Show the searchable KPI dictionary — definition, formula, source,
   frequency, owner, executive consumer.
3. Click **Generate KPI Catalog** — produces a downloadable Markdown +
   CSV catalog and registers them in the Universal Artifact Repository.

## Closing (1 min)

1. Open `/artifacts` again — note that the KPI catalog and every demo
   artifact are now governed in one place.
2. Reiterate: **AI analyzes, finds, recommends, generates, and governs.
   ADIP is the executive control surface for an AI-driven SDLC.**

## Demo Tips

- Speak to the **AI Activity Banner** on every Copilot tab — it explicitly
  answers *what AI analyzed*.
- When generating, narrate the simulation stages — "loading context",
  "synthesizing", "drafting", "validating", "stored in repository".
- Use the **Universal Artifact Repository** as the closing reveal.
