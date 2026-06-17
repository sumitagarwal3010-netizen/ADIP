# ADIP Module Reference

A functional reference for every ADIP module, mapped to its routes. Routes are taken from
`src/routes/index.tsx`; the grouped sidebar is defined in `src/config/navConfig.ts`.

Tabbed centers are a single page component driven by an `initialTab` prop — each row below
is a deep-linkable tab.

---

## 1. Executive Control Tower

The enterprise landing surface: aggregate KPIs, delivery health, risk indicators,
transformation progress, and value metrics.

| Route | View |
|-------|------|
| `/` | Executive Control Tower (default landing) |
| `/executive/portfolio-health` | Portfolio Health |
| `/executive/program-status` | AI Program Status |
| `/executive/strategic-risks` | Strategic Risks |
| `/executive/executive-summary` | Executive Summary |
| `/executive/board-reporting` | Board Reporting |
| `/executive/authentication` | Authentication Health |
| `/executive/workflow-orchestration` | Workflow Orchestration |

---

## 2. Portfolio Governance Center

Demand intake → business case → investment governance → capacity → benefits.

| Route | Tab |
|-------|-----|
| `/executive/portfolio-governance` | Dashboard |
| `/executive/portfolio-governance/demand` | Demand Intake |
| `/executive/portfolio-governance/business-case` | Business Case Review |
| `/executive/portfolio-governance/investment` | Investment Governance |
| `/executive/portfolio-governance/capacity` | Capacity Planning |
| `/executive/portfolio-governance/resources` | Resources |
| `/executive/portfolio-governance/alignment` | Strategic Alignment |
| `/executive/portfolio-governance/roadmap` | Roadmap |
| `/executive/portfolio-governance/risks` | Risks |
| `/executive/portfolio-governance/benefits` | Benefits Tracking |
| `/executive/portfolio-governance/insights` | Insights |
| `/executive/portfolio-governance/reports` | Reports |

---

## 3. Application Portfolio Management

Application inventory, technical debt, modernization, cloud/AI readiness, rationalization.

| Route | Tab |
|-------|-----|
| `/executive/application-portfolio` | Dashboard |
| `/executive/application-portfolio/inventory` | Application Inventory |
| `/executive/application-portfolio/technology-health` | Technology Health |
| `/executive/application-portfolio/criticality` | Business Criticality |
| `/executive/application-portfolio/technical-debt` | Technical Debt |
| `/executive/application-portfolio/modernization` | Modernization Opportunities |
| `/executive/application-portfolio/cloud` | Cloud Readiness |
| `/executive/application-portfolio/ai-readiness` | AI Readiness |
| `/executive/application-portfolio/risks` | Risks |
| `/executive/application-portfolio/dependencies` | Dependencies |
| `/executive/application-portfolio/lifecycle` | Lifecycle |
| `/executive/application-portfolio/rationalization` | Rationalization Recommendations |
| `/executive/application-portfolio/insights` | Insights |
| `/executive/application-portfolio/reports` | Reports |

---

## 4. Enterprise Architecture Repository

Business capabilities, application architecture, standards compliance, review board,
architecture debt.

| Route | Tab |
|-------|-----|
| `/executive/architecture-repository` | Dashboard |
| `/executive/architecture-repository/domains` | Domains |
| `/executive/architecture-repository/capabilities` | Business Capabilities |
| `/executive/architecture-repository/applications` | Application Architecture |
| `/executive/architecture-repository/review-board` | Architecture Review Board |
| `/executive/architecture-repository/findings` | Findings |
| `/executive/architecture-repository/exceptions` | Exceptions |
| `/executive/architecture-repository/standards` | Standards Compliance |
| `/executive/architecture-repository/reference` | Reference Architecture |
| `/executive/architecture-repository/debt` | Architecture Debt |
| `/executive/architecture-repository/lifecycle` | Lifecycle |
| `/executive/architecture-repository/cloud` | Cloud |
| `/executive/architecture-repository/ai` | AI |
| `/executive/architecture-repository/risks` | Risks |
| `/executive/architecture-repository/insights` | Insights |
| `/executive/architecture-repository/reports` | Reports |

---

## 5. Technology Strategy Center

Technology lifecycle, standards governance, cloud strategy, AI platform strategy, roadmap.

| Route | Tab |
|-------|-----|
| `/executive/technology-strategy` | Dashboard |
| `/executive/technology-strategy/standards` | Standards Governance |
| `/executive/technology-strategy/lifecycle` | Technology Lifecycle |
| `/executive/technology-strategy/roadmaps` | Technology Roadmap |
| `/executive/technology-strategy/strategic-platforms` | Strategic Platforms |
| `/executive/technology-strategy/cloud` | Cloud Strategy |
| `/executive/technology-strategy/ai-platform` | AI Platform Strategy |
| `/executive/technology-strategy/vendors` | Vendors |
| `/executive/technology-strategy/investments` | Investments |
| `/executive/technology-strategy/risks` | Risks |
| `/executive/technology-strategy/modernization` | Modernization |
| `/executive/technology-strategy/insights` | Insights |
| `/executive/technology-strategy/reports` | Reports |

---

## 6. AI Delivery Copilot

Requirement quality analysis, architecture/development/testing recommendations, release
readiness, audit readiness.

| Route | Tab |
|-------|-----|
| `/executive/ai-copilot` | Dashboard |
| `/executive/ai-copilot/workspace` | Workspace |
| `/executive/ai-copilot/health` | Health |
| `/executive/ai-copilot/requirements` | Requirement Quality Analysis |
| `/executive/ai-copilot/architecture` | Architecture Recommendations |
| `/executive/ai-copilot/development` | Development Recommendations |
| `/executive/ai-copilot/testing` | Testing Recommendations |
| `/executive/ai-copilot/release` | Release Readiness |
| `/executive/ai-copilot/audit` | Audit Readiness |
| `/executive/ai-copilot/executive` | Executive View |
| `/executive/ai-copilot/improvement` | Improvement |
| `/executive/ai-copilot/reports` | Reports |

---

## 7. Production Intelligence

Incident analytics, defect leakage, customer experience, root-cause intelligence, feedback
recommendations.

| Route | Tab |
|-------|-----|
| `/production` | Dashboard |
| `/production/incidents` | Incident Analytics |
| `/production/leakage` | Defect Leakage |
| `/production/customer` | Customer Experience |
| `/production/applications` | Application Health |
| `/production/releases` | Release Performance |
| `/production/rca` | Root Cause Intelligence |
| `/production/feedback` | Feedback Recommendations |
| `/production/reports` | Reports |

---

## 8. Knowledge & Learning Center

Lessons learned, best practices, architecture patterns, reusable controls, RCA knowledge.

| Route | Tab |
|-------|-----|
| `/knowledge-center` | Dashboard |
| `/knowledge-center/lessons` | Lessons Learned |
| `/knowledge-center/best-practices` | Best Practices |
| `/knowledge-center/patterns` | Architecture Patterns |
| `/knowledge-center/controls` | Reusable Controls |
| `/knowledge-center/rca` | RCA Knowledge |
| `/knowledge-center/playbooks` | SDLC Playbooks |
| `/knowledge-center/search` | Search & Discovery |
| `/knowledge-center/recommendations` | Learning Recommendations |
| `/knowledge-center/reports` | Reports |

---

## 9. Value Realization Center

ROI, productivity improvements, cost avoidance, audit efficiency, transformation scorecard.

| Route | Tab |
|-------|-----|
| `/executive/value-realization` | Dashboard |
| `/executive/value-realization/productivity` | Productivity Improvements |
| `/executive/value-realization/delivery` | Delivery |
| `/executive/value-realization/quality` | Quality |
| `/executive/value-realization/governance` | Governance |
| `/executive/value-realization/audit` | Audit Efficiency |
| `/executive/value-realization/ai-adoption` | AI Adoption |
| `/executive/value-realization/scorecard` | Transformation Scorecard |
| `/executive/value-realization/roi` | ROI |
| `/executive/value-realization/business-case` | Business Case |
| `/executive/value-realization/benchmarking` | Benchmarking |
| `/executive/value-realization/reports` | Reports |

---

## 10. Transformation PMO

Programs, initiatives, objectives, benefits, executive commitments.

| Route | Tab |
|-------|-----|
| `/executive/transformation-pmo` | Dashboard |
| `/executive/transformation-pmo/programs` | Programs |
| `/executive/transformation-pmo/initiatives` | Initiatives |
| `/executive/transformation-pmo/objectives` | Objectives |
| `/executive/transformation-pmo/milestones` | Milestones |
| `/executive/transformation-pmo/benefits` | Benefits |
| `/executive/transformation-pmo/commitments` | Executive Commitments |
| `/executive/transformation-pmo/dependencies` | Dependencies |
| `/executive/transformation-pmo/risks` | Risks |
| `/executive/transformation-pmo/business-units` | Business Units |
| `/executive/transformation-pmo/insights` | Insights |
| `/executive/transformation-pmo/reports` | Reports |

---

## End-to-End Traceability Center

Implements the lineage `Demand → Program → Project → Architecture → Development → Release →
Production → Incident → RCA → Knowledge → Value`.

| Route | Tab |
|-------|-----|
| `/traceability` | Lineage Dashboard |
| `/traceability/matrix` | Requirement Matrix (RTM) |
| `/traceability/ai` | AI Traceability |
| `/traceability/impact` | Impact Analysis |
| `/traceability/executive` | Executive View |
| `/traceability/lifecycle` | Workflow Lifecycle |
| `/traceability/evidence` | Evidence Lineage |
| `/traceability/events` | Events |
| `/traceability/reports` | AI Reports |

---

## Supporting Hubs

### SDLC Lifecycle Hub

| Route | View |
|-------|------|
| `/requirements` | Requirements |
| `/architecture` | Architecture |
| `/development` | Development |
| `/testing` | Testing |
| `/release` | Release |
| `/delivery` | Delivery Hub |

### Operations Hub

| Route | View |
|-------|------|
| `/operations` | Operations Center |
| `/operations/incidents` | Incidents |
| `/operations/availability` | Availability |
| `/operations/capacity` | Capacity |
| `/operations/notifications` | Notification Center (Dashboard / Inbox / Escalations / Delivery / History / Reports) |

### Governance Hub

| Route | View |
|-------|------|
| `/governance` | Audit |
| `/governance/audit-center` | Audit Center (Findings / Observations / Evidence / Timeline / Compliance / Readiness / Lineage / Reports) |
| `/governance/compliance` | Compliance |
| `/governance/risk` | Risk |
| `/governance/evidence` | Evidence |
| `/governance/approval-workflow` | Approval Workflow |
| `/governance/activity-center` | Activity Center (Stream / Analytics / Sources / History / Lineage / Reports) |
| `/administration/rbac` | RBAC Administration |
| `/administration/abac` | ABAC Administration |
| `/administration/persistence` | Persistence Admin |

### AI Governance Hub

| Route | View |
|-------|------|
| `/ai-governance` | Use Case Registry |
| `/ai-governance/model-inventory` | Model Inventory |
| `/ai-governance/prompt-governance` | Prompt Governance |
| `/ai-governance/ai-risk` | AI Risk |
| `/ai-governance/ai-controls` | AI Controls |
| `/ai-governance/ai-incidents` | AI Incidents |

### Enterprise Risk Center

| Route | Tab |
|-------|-----|
| `/executive/enterprise-risk` | Dashboard |
| `/executive/enterprise-risk/register` | Risk Register |
| `/executive/enterprise-risk/operational` | Operational |
| `/executive/enterprise-risk/technology` | Technology |
| `/executive/enterprise-risk/cyber` | Cyber |
| `/executive/enterprise-risk/ai` | AI |
| `/executive/enterprise-risk/regulatory` | Regulatory |
| `/executive/enterprise-risk/audit-findings` | Audit Findings |
| `/executive/enterprise-risk/controls` | Controls |
| `/executive/enterprise-risk/appetite` | Risk Appetite |
| `/executive/enterprise-risk/assurance` | Assurance |
| `/executive/enterprise-risk/insights` | Insights |
| `/executive/enterprise-risk/reports` | Reports |

### Reports & Analytics

| Route | View |
|-------|------|
| `/reports` | Executive Reports |
| `/reports/compliance` | Compliance Reports |
| `/reports/audit` | Audit Reports |
| `/reports/trends` | Trend Analytics |
