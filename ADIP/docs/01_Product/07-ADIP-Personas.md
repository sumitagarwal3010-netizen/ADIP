# 07 — ADIP Personas

ADIP is designed for executive *and* practitioner personas. Each persona has
a default landing experience, a curated set of quick links, and an RBAC scope
defined in [`src/config/personaConfig.ts`](../src/config/personaConfig.ts) and
[`src/data/rbacCatalog.ts`](../src/data/rbacCatalog.ts).

## Executive Personas

### CIO — Chief Information Officer
- **Question answered**: "Can we deliver?"
- **Landing**: Executive Control Tower → Delivery Health
- **Quick links**: AI SDLC Copilot, Portfolio Governance · AI Advisor,
  Transformation PMO, Universal Artifacts Repository
- **Top KPIs**: Delivery Health, Release Readiness, Strategic Alignment,
  Annual Value

### CTO — Chief Technology Officer
- **Question answered**: "Is our technology estate healthy?"
- **Landing**: Technology Health
- **Quick links**: Enterprise Architecture, Technology Strategy, Cloud
  Adoption, AI Observability
- **Top KPIs**: Technology Health, Cloud Adoption, Modernization Progress,
  AI P95 Latency

### CISO — Chief Information Security Officer
- **Question answered**: "How exposed are we?"
- **Landing**: Risk Posture → Cyber & Security Risk
- **Quick links**: AI Governance Center · Risks, AI Governance Center ·
  Controls, Cyber Risk
- **Top KPIs**: Cyber Risk Score, Guardrail Coverage, Hallucination Score

### CRO — Chief Risk Officer
- **Question answered**: "Where could we fail?"
- **Landing**: Enterprise Risk Center
- **Quick links**: AI Governance Center · Risks, Risk Appetite & Tolerance,
  Audit Findings
- **Top KPIs**: Enterprise Risk Exposure, Open Critical Risks, Risk Appetite
  Breaches, AI Risk Score (rollup)

### CFO — Chief Financial Officer
- **Question answered**: "What is the value?"
- **Landing**: Value Realized
- **Quick links**: ROI Calculator, KPI Catalog, Portfolio Investments,
  AI Cost
- **Top KPIs**: Annual Savings, ROI, Productivity Gain, Payback

## Operational Personas

### Enterprise Architect (EA)
- **Landing**: Architecture Repository
- **Owns**: Architecture domains, application architecture, standards
  repository, architecture debt and risks.

### Program / Portfolio Manager (PM)
- **Landing**: Portfolio Governance · AI Portfolio Advisor
- **Owns**: Demand pipeline, investment decisions, portfolio risks,
  strategic alignment scoring.

### Architect (Solution / Domain)
- **Landing**: Architecture Copilot
- **Owns**: Architecture findings, modernization opportunities, target state.

### Developer
- **Landing**: Development Copilot
- **Owns**: Code quality, security findings, technical debt, refactoring.

### Tester
- **Landing**: Testing Copilot
- **Owns**: Test cases, regression coverage, missing scenarios.

### Auditor
- **Landing**: Audit Copilot
- **Owns**: Control findings, evidence completeness, compliance mappings.

### Compliance Officer
- **Landing**: Risk & Compliance · Risk Appetite
- **Owns**: Regulatory compliance, audit findings remediation.

### Model Owner / AI Governance Lead
- **Landing**: AI Governance Center
- **Owns**: Use case approvals, model registry, risk register, control
  library, evaluation runs.

## Cross-Persona Affordances

- **Generate Executive Summary** (TopBar): produces a narrative summary from
  the live simulation state. Available to every persona.
- **Universal Artifact Repository**: searchable, filterable repository of
  every AI-generated artifact across the platform.
- **KPI Catalog**: every KPI documented with definition, formula, source and
  consumer.
