# ADIP — KPI Traceability Matrix

**Post-Redesign · Generated 2026-06-17 · Branch `adip-ai-sdlc-june6-stable` · Documentation only**

Columns: **KPI · Parent KPI · Module · Page (route) · Persona · Data Source · Calculation · Drilldown Path (chartId)**

Persona codes: CIO, CTO, CRO, CFO, COO, PMO, Chief Architect (CA), Chief Audit Exec (CAE), Head of AI Governance (AIG), Head of Delivery (HoD), Engineering Enablement (EE), Ops (OPS).

---

## A. Executive — Tier 1 (Control Tower, route `/`)

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Delivery Health | — (pillar) | AI Delivery Copilot | `/` | CIO/HoD | `COPILOT_PROJECTS` | mean(healthScore) | `copilot.delivery-health` |
| Technology Health | — (pillar) | Technology Strategy | `/` | CTO/CA | `TECHNOLOGIES` | strategic/total ×100 | `technology-strategy.technology-health` |
| Risk Posture | — (pillar) | Enterprise Risk | `/` | CRO | `ERM_ENTERPRISE_RISKS` | mean(inherentScore) | `enterprise-risk.enterprise-risk-exposure` |
| Value Realized | — (pillar) | Value Realization | `/` | CFO | `VALUE_PROJECTS` | Σ valueRealized → ₹M | `value-realization.annual-value` |
| AI Use Cases | Risk Posture | AI Governance | `/` → `/ai-governance-center` | AIG | `aiUseCaseRegistryMock` | count total | (nav) |
| AI Models | Technology Health | AI Governance | `/` → `/ai-governance-center/models` | AIG | `MODEL_INVENTORY` | length | (nav) |
| AI Risks (open) | Risk Posture | AI Governance | `/` → `/ai-governance-center/risks` | AIG/CRO | `AI_RISKS` | count(status=Open) | (nav) |
| AI Controls | Risk Posture | AI Governance | `/` → `/ai-governance-center/controls` | AIG | `AI_CONTROLS` | active/total | (nav) |
| AI Evaluation Score | Delivery Health | AI Evaluation | `/` → `/ai-evaluation` | AIG | `aiEvaluationMock` | quality score | (nav) |
| Strategic Priorities (×5) | — | Executive scorecard | `/` | COO/PMO | `state.executive.scorecard` | static scorecard | (progress bars) |

---

## B. Governance Group

### B.1 Enterprise Risk — `/executive/enterprise-risk`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Risk Exposure | Risk Posture | Enterprise Risk | `/executive/enterprise-risk` | CRO | `ERM_ENTERPRISE_RISKS` | mean(inherentScore) | `enterprise-risk.enterprise-risk-exposure` |
| Residual Risk | Risk Exposure | Enterprise Risk | same | CRO | `ERM_ENTERPRISE_RISKS` | mean(residualScore) | `enterprise-risk.residual-risk` |
| Control Effectiveness | Risk Posture | Enterprise Risk | same | CRO | `ERM_CONTROLS` | effective/total | `enterprise-risk.control-effectiveness` |
| Open Critical Risks | Risk Exposure | Enterprise Risk | same | CRO | `ERM_ENTERPRISE_RISKS` | count(critical & active) | `enterprise-risk.open-critical-risks` |
| Appetite Breaches | Risk Posture | Enterprise Risk | same | CRO | `ERM_RISK_APPETITE` | count(breached) | `enterprise-risk.risk-appetite-breaches` |
| Regulatory Exposure | Risk Posture | Enterprise Risk | same | CRO/CAE | `ERM_REGULATORY_RISKS` | Σ exposure/1e6 | `enterprise-risk.regulatory-exposure` |
| Cyber Risk Score | Risk Exposure | Enterprise Risk | same | CRO/CISO | `ERM_CYBER_RISKS` | mean(exposureScore) | `enterprise-risk.cyber-risk-score` |
| AI Risk Score | Risk Exposure | Enterprise Risk | same | CRO/AIG | `ERM_AI_RISKS` | mean(residualScore) | `enterprise-risk.ai-risk-score` |
| Audit Risk Score | Risk Exposure | Enterprise Risk | same | CAE | `ERM_AUDIT_FINDINGS` | open/total | `enterprise-risk.audit-risk-score` |
| Assurance Coverage | Control Effectiveness | Enterprise Risk | same | CAE | `ERM_ASSURANCE_REVIEWS` | completed/total | `enterprise-risk.assurance-coverage` |

### B.2 Portfolio Governance — `/executive/portfolio-governance`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Portfolio Health | Value Realized | Portfolio Governance | `/executive/portfolio-governance` | PMO | `portfolioGovernanceMock` | composite | `portfolio-governance.portfolio-health` |
| Strategic Alignment | Portfolio Health | Portfolio Governance | same | PMO | objectives | aligned/total | `portfolio-governance.strategic-alignment` |
| Funding Utilization | Portfolio Health | Portfolio Governance | same | CFO/PMO | funding | used/allocated | `portfolio-governance.funding-utilization` |
| Capacity Utilization | Portfolio Health | Portfolio Governance | same | PMO | capacity | used/available | `portfolio-governance.capacity-utilization` |
| Delivery Confidence | Delivery Health | Portfolio Governance | same | PMO | delivery | composite | `portfolio-governance.delivery-confidence` |
| Benefits Realization | Value Realized | Portfolio Governance | same | CFO | benefits | realized/planned | `portfolio-governance.benefits-realization` |
| Risk Exposure | Risk Posture | Portfolio Governance | same | PMO/CRO | risks | composite | `portfolio-governance.risk-exposure` |
| Demand Backlog | Portfolio Health | Portfolio Governance | same | PMO | demand | count | `portfolio-governance.demand-backlog` |
| Investment Efficiency | Value Realized | Portfolio Governance | same | CFO | investments | efficiency | `portfolio-governance.investment-efficiency` |
| Transformation Progress | Value Realized | Portfolio Governance | same | PMO | programs | progress | `portfolio-governance.transformation-progress` |

### B.3 Enterprise Architecture — `/executive/architecture-repository`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Architecture Health | Technology Health | Architecture Repository | `/executive/architecture-repository` | CA | `architectureRepositoryMock` | composite | `architecture-repository.architecture-health` |
| Standards Compliance | Architecture Health | Architecture Repository | same | CA | standards | compliant/total | `architecture-repository.standards-compliance` |
| Architecture Debt | Technology Health | Architecture Repository | same | CA | debt | composite | `architecture-repository.architecture-debt` |
| Technology Obsolescence | Technology Health | Architecture Repository | same | CA | lifecycle | obsolete/total | `architecture-repository.technology-obsolescence` |
| Cloud Readiness | Technology Health | Architecture Repository | same | CA | cloud | ready/total | `architecture-repository.cloud-readiness` |
| AI Readiness | Technology Health | Architecture Repository | same | CA | ai | ready/total | `architecture-repository.ai-readiness` |
| Architecture Risk | Risk Posture | Architecture Repository | same | CA | risks | composite | `architecture-repository.architecture-risk` |
| Architecture Exceptions | Architecture Health | Architecture Repository | same | CA | exceptions | count | `architecture-repository.architecture-exceptions` |
| Reference Adoption | Architecture Health | Architecture Repository | same | CA | reference | adopted/total | `architecture-repository.reference-adoption` |
| Modernization Progress | Technology Health | Architecture Repository | same | CA | initiatives | progress | `architecture-repository.modernization-progress` |

### B.4 Audit & Compliance — `/governance/audit-center`, `/governance/compliance`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Open Findings | Risk Posture | Audit Center | `/governance/audit-center` | CAE | audit findings | count(open) | `audit-center.open-findings` |
| Critical Findings | Open Findings | Audit Center | same | CAE | audit findings | count(critical) | `audit-center.findings-by-severity` |
| Overdue Findings | Open Findings | Audit Center | same | CAE | audit findings | count(overdue) | `audit-center.overdue-findings` |
| Evidence Coverage | Audit Readiness | Audit Center | same | CAE | evidence | covered/required | `audit-center.evidence-coverage` |
| Audit Readiness | Risk Posture | Audit Center | same | CAE | composite | score | `audit-center.audit-readiness` |
| Control Coverage | Audit Readiness | Audit Center | same | CAE | controls | covered/total | `audit-center.control-coverage` |
| Compliance Coverage | Audit Readiness | Compliance | `/governance/compliance` | Compliance | controls | compliant/total | `audit-center.compliance-coverage` |

---

## C. AI SDLC Group

### C.1 AI Delivery Copilot — `/executive/ai-copilot`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| AI Recommendations | Delivery Health | Copilot | `/executive/ai-copilot` | HoD | `COPILOT_RECOMMENDATIONS` | length | `copilot.recommendations` |
| Delivery Health | Delivery Health (pillar) | Copilot | same | CIO | `COPILOT_PROJECTS` | mean(healthScore) | `copilot.delivery-health` |
| Portfolio Risk | Risk Posture | Copilot | same | HoD | `COPILOT_PROJECTS` | mean(deliveryRisk) | `copilot.portfolio-risk` |
| Quality Improvement | Delivery Health | Copilot | same | HoD | `COPILOT_IMPROVEMENT_ACTIONS` | mean(predictedQualityGain) | `copilot.quality-improvement` |

### C.2 AI Evaluation — `/ai-evaluation`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Quality Score | AI Evaluation Score | AI Evaluation | `/ai-evaluation` | AIG | `aiEvaluationMock` | computed | `ai-evaluation.quality` |
| Hallucination Score | Quality Score | AI Evaluation | same | AIG | `aiEvaluationMock` | computed | `ai-evaluation.hallucination` |
| Safety Score | Quality Score | AI Evaluation | same | AIG | `aiEvaluationMock` | computed | `ai-evaluation.safety` |
| Grounding Score | Quality Score | AI Evaluation | same | AIG | `aiEvaluationMock` | computed | `ai-evaluation.grounding` |
| Regression Pass Rate | Quality Score | AI Evaluation | same | AIG | `aiEvaluationMock` | pass/total | `ai-evaluation.regression` |
| Use Cases Evaluated | Quality Score | AI Evaluation | same | AIG | `aiEvaluationMock` | count | `ai-evaluation.coverage` |

### C.3 AI Governance Center — `/ai-governance-center`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Use Case Registry | AI Use Cases | AI Governance | `/ai-governance-center` | AIG | `aiUseCaseRegistryMock` | registry | `ai-governance.use-case-registry` |
| Model Registry | AI Models | AI Governance | `/ai-governance-center/models` | AIG | `MODEL_INVENTORY` | registry | `ai-governance.model-registry` |
| Prompt Registry | — | AI Governance | `/ai-governance-center/prompts` | AIG | prompt mock | registry | `ai-governance.prompt-registry` |
| Risk Registry | AI Risks | AI Governance | `/ai-governance-center/risks` | AIG/CRO | `AI_RISKS` | registry | `ai-governance.risk-registry` |
| Control Library | AI Controls | AI Governance | `/ai-governance-center/controls` | AIG | `AI_CONTROLS` | library | `ai-governance.control-library` |
| AI Controls (status set) | AI Controls | AI Controls Dash | `/ai-governance-center/controls` | AIG | `AI_CONTROLS` | computeAIControlsKpis | `ai-governance.ai-controls` |
| AI Incidents (status set) | AI Risks | AI Incidents Dash | `/ai-governance-center/incidents` | AIG | incidents mock | counts | `ai-governance.ai-incidents` |

### C.4 Legacy SDLC Hubs (label-keyed)

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path (label) |
|-----|--------|--------|------|---------|-------------|-------------|------------------------|
| Requirements Analysed | Delivery Health | Requirements Hub | `/requirements` | HoD | `state.requirements` | sim state | `requirements.quality-gauge` / `Requirements Analysed` |
| Quality Score | Requirements Analysed | Requirements Hub | same | HoD | `state.requirements.qualityScore` | sim | `requirements.quality-gauge` |
| Architecture Readiness | Technology Health | Architecture Hub | `/architecture` | CA | `state` | sim | `architecture.layer-readiness` / `Architecture Readiness` |
| Code Quality | Delivery Health | Development Hub | `/development` | HoD | `state.development` | sim | `Code Quality` |
| Tech Debt / Dev Health | Delivery Health | Development Hub | same | HoD | `state.development` | sim | `Tech Debt` / `Dev Health` |
| Total/Manual Tests, Coverage | Delivery Health | Testing Hub | `/testing` | QA | `state.testing` | sim | `testing.coverage-heatmap` / labels |
| Release Confidence | Delivery Health | Release Center | `/release` | HoD | `state.release` | sim | `release.confidence-gauge` / `Release Confidence` |
| Rollback / Deployment Readiness, Go-No-Go | Release Confidence | Release Center | same | HoD | `state.release` | sim | `release.readiness-dimension` / labels |
| Delivery Hub KPIs (×8) | Delivery Health | **Delivery Hub** | `/delivery` (**orphaned**) | HoD | `state.delivery` | sim | `delivery.*` / labels |

---

## D. Operations Group

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Production Risk | Risk Posture | Production Intelligence | `/production` | OPS | prod mock | composite | `prod-intel.production-risk` |
| Customer Impact | Production Risk | Production Intelligence | `/production/customer` | OPS | prod mock | composite | `prod-intel.customer-impact` |
| Defect Leakage | Production Risk | Production Intelligence | `/production/leakage` | OPS/QA | prod mock | leaked/total | `prod-intel.defect-leakage` |
| Service Health | — | Operations Center | `/operations` | OPS | `state.production.serviceHealth` | mean(uptime) | `operations.health-gauge` / `Service Health` |
| Batch Health | — | Operations Center | same | OPS | `state.operations` | sim | `operations.batch-jobs` / `Batch Health` |
| Capacity/CPU/Storage Utilization | — | Operations Center | same | OPS | `state.operations` | sim | labels |
| Model Usage | Technology Health | AI Observability | `/ai-observability` | OPS/AIG | `aiObservabilityMock` | calls/day | `ai-observability.usage` |
| Token Consumption | Model Usage | AI Observability | same | OPS/AIG | `aiObservabilityMock` | tokens/day | `ai-observability.tokens` |
| Monthly Cost | Value Realized | AI Observability | same | CFO/OPS | `aiObservabilityMock` | sum USD | `ai-observability.cost` |
| P95 Latency / Error Rate | Model Usage | AI Observability | same | OPS | `aiObservabilityMock` | percentile / rate | `ai-observability.latency` / `.errors` |

---

## E. Knowledge Group — `/knowledge-center`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Coverage | — | Knowledge Center | `/knowledge-center` | EE | knowledge mock | covered/total | `knowledge-center.coverage` |
| Reuse | Coverage | Knowledge Center | `/knowledge/reusable-assets` | EE | knowledge mock | reused/total | `knowledge-center.reuse` |
| Adoption | Coverage | Knowledge Center | `/knowledge-center/recommendations` | EE | knowledge mock | adopted/total | `knowledge-center.adoption` |
| Lessons by Category | Coverage | Knowledge Center | `/knowledge-center/lessons` | EE | knowledge mock | grouping | `knowledge-center.lessons-category` |
| Best Practices / Patterns / Playbooks | Coverage | Knowledge Center | various | EE | knowledge mock | counts | `knowledge-center.best-practices` / `.patterns` / `.playbooks` |

---

## F. Transformation Group

### F.1 Transformation PMO — `/executive/transformation-pmo`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Transformation Health | Value Realized | Transformation PMO | `/executive/transformation-pmo` | PMO | `transformationPmoMock` | composite | `transformation-pmo.transformation-health` |
| Program Delivery | Transformation Health | Transformation PMO | same | PMO | programs | delivered/planned | `transformation-pmo.program-delivery` |
| Objective Achievement | Transformation Health | Transformation PMO | `/objectives` | PMO | objectives | achieved/total | `transformation-pmo.objective-achievement` |
| Benefits Realization | Value Realized | Transformation PMO | `/benefits` | CFO | benefits | realized/planned | `transformation-pmo.benefits-realization` |
| Milestone Completion | Transformation Health | Transformation PMO | `/milestones` | PMO | milestones | done/total | `transformation-pmo.milestone-completion` |
| Executive Commitments | Transformation Health | Transformation PMO | `/commitments` | COO | commitments | met/total | `transformation-pmo.executive-commitments` |
| Dependency Risk | Risk Posture | Transformation PMO | same | PMO | dependencies | composite | `transformation-pmo.dependency-risk` |
| Business Unit Performance | Transformation Health | Transformation PMO | same | COO | BU data | composite | `transformation-pmo.business-unit-performance` |
| Transformation ROI | Value Realized | Transformation PMO | same | CFO | financials | ROI | `transformation-pmo.transformation-roi` |
| Board Readiness | Transformation Health | Transformation PMO | `/insights` | COO | composite | score | `transformation-pmo.board-readiness` |

### F.2 Value Realization — `/executive/value-realization`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Annual Value Realized | Value Realized (pillar) | Value Realization | `/executive/value-realization` | CFO | `VALUE_PROJECTS` | Σ valueRealized | `value-realization.annual-value` |
| ROI | Value Realized | Value Realization | `/roi` | CFO | trend history | latest.roi | `value-realization.roi` |
| Hours Saved | Value Realized | Value Realization | same | CFO | `VALUE_PROJECTS` | Σ hoursSaved | `value-realization.hours-saved` |
| FTE Savings | Value Realized | Value Realization | same | CFO | `VALUE_PROJECTS` | Σ fteSavings | `value-realization.fte-savings` |
| Productivity Gain | Value Realized | Value Realization | `/productivity` | CFO | trend history | latest | `value-realization.productivity` |
| Defects Prevented | Value Realized | Value Realization | same | CFO/QA | `VALUE_PROJECTS` | Σ defectsPrevented | `value-realization.defects-prevented` |
| Risk Reduction | Risk Posture | Value Realization | same | CRO/CFO | trend history | latest | `value-realization.risk-reduction` |
| 3-Year Projected Value | Value Realized | Value Realization | same | CFO | trend history | Σ projected | `value-realization.projected-value` |
| Transformation Score | Value Realized | Value Realization | `/scorecard` | CFO | `MATURITY_SCORES` | mean | `value-realization.transformation-score` |
| Audit Efficiency | Value Realized | Value Realization | `/audit` | CAE | constant (flagged) | static 68 | `value-realization.audit-efficiency` |

### F.3 Application Portfolio — `/executive/application-portfolio`

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Application Health | Technology Health | App Portfolio | `/executive/application-portfolio` | CA | `applicationPortfolioMock` | composite | `application-portfolio.application-health` |
| Critical Applications | Risk Posture | App Portfolio | `/criticality` | CA | apps | count(critical) | `application-portfolio.critical-applications` |
| Technical Debt | Technology Health | App Portfolio | `/technical-debt` | CA | apps | composite | `application-portfolio.technical-debt` |
| Modernization Readiness | Technology Health | App Portfolio | `/modernization` | CA | apps | ready/total | `application-portfolio.modernization-readiness` |
| Cloud Readiness | Technology Health | App Portfolio | `/cloud` | CA | apps | ready/total | `application-portfolio.cloud-readiness` |
| AI Readiness | Technology Health | App Portfolio | `/ai-readiness` | CA | apps | ready/total | `application-portfolio.ai-readiness` |
| Risk Exposure | Risk Posture | App Portfolio | same | CA/CRO | apps | composite | `application-portfolio.risk-exposure` |
| Annual Cost | Value Realized | App Portfolio | same | CFO | apps | Σ cost | `application-portfolio.annual-cost` |
| Rationalization Savings | Value Realized | App Portfolio | same | CFO | apps | potential | `application-portfolio.rationalization-savings` |
| Technology Obsolescence | Technology Health | App Portfolio | same | CA | apps | obsolete/total | `application-portfolio.technology-obsolescence` |

---

## G. Platform (Supporting) Group

| KPI | Parent | Module | Page | Persona | Data Source | Calculation | Drilldown Path |
|-----|--------|--------|------|---------|-------------|-------------|----------------|
| Bottlenecks / Completion / SLA Breaches | — | Workflow Orchestration | `/executive/workflow-orchestration` | PMO | workflow mock | computed | `workflow.*` |
| Pending Approvals / Overdue Reviews | — | Approval Workflow | `/governance/approval-workflow` | PMO | approval mock | counts | `approval-workflow.*` |
| Open/Critical/Escalated/Resolved Alerts, SLA Breaches | — | Notification Center | `/operations/notifications` | OPS | notification mock | counts | `notification-center.*` |
| Event Volume / Critical Events / Sources | — | Activity Center | `/activity` | OPS | activity mock | counts | `activity.*` |
| Policy Coverage / Domain Ownership / Access Violations | — | ABAC | `/administration/abac` | Security | abac mock | computed | `abac.*` |
| Persistence Health / Storage / Records / Data Quality | — | Persistence | `/administration/persistence` | Platform | persistence mock | computed | `persistence.*` |

---

## H. Notes on Traceability Integrity
1. **Two drilldown keying schemes coexist:** new modules use `module.kpi` chartIds resolved in
   `kpiDrilldownEngine.js`; legacy hubs use **label-keyed** resolvers (e.g. `'Delivery Health'`).
   Both flow through `openKpiDrilldown` → `KpiDrilldownDrawer`.
2. **Parent KPI** above maps each operational KPI to the Executive pillar it rolls up to. This is
   a *semantic* rollup for board reporting — the code does **not** currently aggregate children
   into pillars (pillars are computed independently by their own engines). This is the single most
   important integrity gap to close if true drill-up is desired.
3. **Orphaned page:** `/delivery` (Delivery Hub) is routed but absent from `navConfig.ts`; its KPIs
   are unreachable via navigation.
4. **Persona column** reflects intended executive ownership; it is **not** enforced by RBAC in the
   KPI components themselves (see `personaConfig.ts` / `rbacCatalog.ts` for access gating).

*End of KPI Traceability Matrix.*
