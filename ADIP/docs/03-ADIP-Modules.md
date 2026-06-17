# 03 — ADIP Modules

This document is the canonical inventory of ADIP centers and what each one
owns. It complements [`MODULES.md`](./MODULES.md) which contains exhaustive
reference detail.

## Executive Layer

### Executive Control Tower
Landing page for the CIO. Surfaces four executive KPIs (Delivery Health,
Technology Health, Risk Posture, Value Realized) and the four outcome pages
listed below. Has a global "Generate Executive Summary" affordance in the
TopBar.

### Delivery Health (a.k.a. AI SDLC Copilot)
Six AI Copilot tabs:
- **Requirements Copilot** — finds ambiguity, missing AC and NFR; generates
  user stories, acceptance criteria, test scenarios and a traceability matrix.
- **Architecture Copilot** — surfaces architecture, resiliency and
  modernization findings; generates architecture review, scorecard, risk
  assessment, modernization plan.
- **Development Copilot** — surfaces code quality, security and performance
  findings; generates code review summary, refactoring plan, secure coding
  recommendations and a technical debt report.
- **Testing Copilot** — generates test cases, regression pack, UAT scenarios,
  performance and negative tests.
- **Release Copilot** — produces a GO / CONDITIONAL GO / NO GO recommendation;
  generates CAB pack, go-live checklist, rollback plan and release readiness
  report.
- **Audit Copilot** — surfaces control findings, evidence gaps and compliance
  observations; generates audit report, evidence checklist, compliance
  mapping and remediation plan.

### Technology Health, Risk Posture, Value Realized
Each is an outcome page that aggregates the relevant centers and surfaces
4 executive KPIs.

## Governance Layer

### Portfolio Governance
8 tabs — Portfolio Dashboard, **AI Portfolio Advisor (default)**, Portfolio
Risks, Strategic Alignment, Investment Governance, Demand Pipeline,
Executive Insights, AI Reports.

### Enterprise Architecture
8 tabs — **Architecture Domains (default)**, Application Architecture,
Standards Repository, Reference Architectures, Architecture Debt,
Architecture Risks, Executive Insights, AI Reports.

### Technology Strategy
6 tabs — **Technology Standards (default)**, Technology Roadmaps, Cloud
Strategy, Technology Investments, Executive Insights, AI Reports.

### Risk & Compliance
8 tabs — **Enterprise Risk Register (default)**, Operational Risk, Technology
Risk, Cyber & Security Risk, **AI Risk (rollup)**, Risk Appetite & Tolerance,
Executive Insights, AI Reports.

### AI Governance Center
6 tabs — Use Case Registry, Model Registry, Prompt Registry, Risk Registry,
Control Library, AI Evaluation. Single source of truth for AI risk, AI
controls and AI use case approvals.

### AI Evaluation Center
Single source of truth for AI evaluation (Quality, Hallucination, Bias,
Explainability, Regression).

### AI Observability Center
Single source of truth for AI runtime metrics (Usage, Tokens, Cost, Latency,
Error rates).

## Operations Layer

### Production Intelligence
7 tabs covering live production health, change throughput, incidents and
runtime risk telemetry.

### Service Operations
Operational health, change calendars, problem records, RCA and stability.

### AI Observability
Listed above.

## Transformation Layer

### Transformation PMO
5 tabs — Overview, Program Health, Strategic Initiatives, Risks &
Dependencies, AI Recommendations.

## Platform Layer

### Universal Artifacts Repository (NEW)
Single, search-, filter- and download-capable view across **every artifact
generated anywhere in ADIP**. Filterable by source center, status, format and
free-text query.

### KPI Catalog (NEW)
Authoritative KPI dictionary with definitions, formulas, sources, frequency,
owners and executive consumers. Generates a downloadable catalog (Markdown +
CSV).

### Workflow, Reporting, Administration
Cross-cutting platform centers for workflow orchestration, executive
reporting and administration (RBAC, ABAC, persistence, etc.).

## Knowledge & Reuse

### Knowledge & Learning Center
Best practices, reusable assets and lessons learned across the SDLC.
