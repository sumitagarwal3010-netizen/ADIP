# ADIP Executive KPI Explainability Framework

> Every KPI, score, percentage and chart in ADIP is now transparent, traceable,
> auditable and explainable. Clicking any KPI card opens a right-side drawer that
> answers: *How was this computed? Who contributed? Why did AI reach this
> conclusion? What should we do next?*

This document describes the framework delivered in Phase 1, the KPI definitions
authored across Phases 2–5 and the Executive Control Tower, and the integration
points for extending coverage.

---

## 1. Architecture

```
KpiCard (every dashboard)
   │  onClick → openExplainability({ label, value, suffix, trend, data, chartId })
   ▼
ExplainabilityProvider (app-level context)
   │  holds the lightweight card context
   ▼
KPIExplainabilityDrawer
   │  reads live simulation state, calls the engine, renders 6 tabs
   ▼
kpiExplainabilityEngine.getKpiExplainability(ctx, state)
   ├── 1. Authored catalog lookup  (src/data/explainability/*)
   ├── 2. Live enrichment          (reuses kpiDrilldownEngine for contributors/lineage/trend)
   └── 3. Merge → Universal Explainability Model (every field always populated)
```

### Files

| File | Purpose |
| --- | --- |
| `src/services/kpiExplainabilityEngine.js` | Universal engine: resolve + merge + fallback |
| `src/data/explainability/index.js` | Catalog merge + `slugify` + counts |
| `src/data/explainability/technologyHealth.js` | Phase 2 KPI definitions |
| `src/data/explainability/portfolioGovernance.js` | Phase 3 KPI definitions |
| `src/data/explainability/aiGovernance.js` | Phase 4 KPI definitions |
| `src/data/explainability/valueRealization.js` | Phase 5 KPI definitions |
| `src/data/explainability/executive.js` | Executive Control Tower pillars |
| `src/components/explainability/ExplainabilityProvider.jsx` (+ `.d.ts`) | Context + `useExplainability()` hook + drawer mount |
| `src/components/explainability/KPIExplainabilityDrawer.jsx` | Tabbed drawer shell |
| `src/components/explainability/KPIFormulaPanel.jsx` | Tab 1 — Formula |
| `src/components/explainability/KPIContributorsPanel.jsx` | Tab 2 — Contributors |
| `src/components/explainability/KPITraceabilityPanel.jsx` | Tab 3 — Traceability |
| `src/components/explainability/KPIAiAnalysisPanel.jsx` | Tab 4 — AI Analysis |
| `src/components/explainability/KPIRecommendationPanel.jsx` | Tab 5 — Recommendations |
| `src/components/explainability/KPITrendAnalysisPanel.jsx` | Tab 6 — Trend |

> **Why `.jsx`/`.js`?** The repo's `tsconfig` has `allowJs:false` and ESLint targets
> only `*.{ts,tsx}`, so the framework's `.jsx`/`.js` files are bundled by Vite but
> isolated from type-check/lint churn. The only TypeScript boundary —
> `useExplainability` / `ExplainabilityProvider` imported by `KpiCard.tsx` and
> `App.tsx` — is typed via the companion `ExplainabilityProvider.d.ts` (the same
> `.js + .d.ts` pattern already used by `kpiDrilldownEngine`).

---

## 2. Universal Explainability Model

Every KPI resolves to this shape (all fields always present):

```js
{
  id,                  // stable key (chartId or label slug)
  name,                // display name
  value, suffix,       // headline value
  description,         // business meaning
  formula: {           // expression + weighted components + result
    expression, components: [{ name, weight, value, note }], result
  },
  weightages,          // [{ name, weight }]
  dataSources,         // [string]
  contributingEntities,// [{ name, type, score, note }]  (apps / projects / platforms)
  calculations,        // [{ component, weight, value, contribution, expression }]
  aiReasoning: {        // confidence + drivers + insights
    confidence, drivers: [string], insights: [string]
  },
  recommendations,     // [{ priority, title, expectedBenefit, estimatedImpact }]
  traceability,        // [{ stage, description }]  (raw source → executive KPI)
  trends: {            // monthly / quarterly / target / forecast
    monthly: [{ label, value }], quarterly, target, forecast: { value, horizon, note }
  },
  assumptions,         // [string]
  lastUpdated,
  authored             // true = defensible catalog entry; false = live-derived
}
```

### Resolution & fallback

- **Authored KPIs** (listed below) carry bespoke formulas, weightages, contributors,
  AI reasoning, recommendations, lineage, trend and assumptions.
- **Any other KPI** still produces a substantive drawer: contributors, lineage and
  evidence are pulled live from the existing `kpiDrilldownEngine`, and the trend uses
  the card's own sparkline with a linear forecast. No placeholder dialogs.

---

## 3. The six tabs

| Tab | Shows |
| --- | --- |
| **Formula** | Business meaning, formula expression, weightage bars, full calculation walkthrough reconciling to the result |
| **Contributors** | Applications / projects / platforms / services with contribution bars, sorted descending |
| **Traceability** | Clickable data lineage from raw sources → calculation engine → executive KPI |
| **AI Analysis** | AI confidence, *why the score exists* (risk drivers), generated insights |
| **Recommendations** | Prioritized actions with expected benefit and estimated impact |
| **Trend** | Monthly trajectory, target reference line, forecast callout |

---

## 4. Authored KPI catalog

> Conventions: **higher-is-better** unless flagged. All numbers are illustrative,
> internally consistent simulation data (no backend calls).

### Phase 2 — Technology Health

| KPI | Formula | Target |
| --- | --- | --- |
| Technical Debt *(lower better)* | LegacyTech×30% + VulnBacklog×25% + Unsupported×20% + ArchViolations×15% + ManualOps×10% | < 30% |
| Modernization Progress | Completed ÷ Planned initiatives | 75% |
| Cloud Adoption | Cloud-hosted apps ÷ Total apps | 70% |
| Architecture Compliance | 1 − (severity-weighted violations ÷ controls) | 60% |
| Technology Health | StdAdoption×30% + Cloud×25% + Modernization×25% + (100−TechRisk)×20% | 70% |

### Phase 3 — Portfolio Governance

| KPI | Formula | Target |
| --- | --- | --- |
| Portfolio Health | Delivery×35% + Schedule×25% + Budget×20% + (100−Risk)×20% | 80% |
| Delivery Confidence | Milestones×30% + Dependencies×20% + Defects×20% + Release×15% + Resources×15% | 85% |
| Benefits Realization | Realized ÷ Committed benefits | 85% |
| Funding Gap *(lower better)* | (Approved − Allocated) ÷ Approved demand | < 10% |
| Strategic Alignment | Aligned ÷ Total investment | 85% |

### Phase 4 — AI Governance

| KPI | Formula | Target |
| --- | --- | --- |
| AI Explainability | Attribution×40% + Rationale×35% + Traceability×25% | 90% |
| Model Risk *(lower better)* | Materiality×30% + Drift×25% + ValidationStaleness×25% + ControlGaps×20% | < 30% |
| Bias / Fairness | 100 − max cohort disparity | 95% |
| Hallucination *(lower better)* | Unsupported ÷ Total evaluated claims | < 2% |
| AI Compliance & Evaluation | ControlCoverage×40% + EvalPassRate×40% + (100−PromptRisk)×20% | 95% |

For each AI score the drawer surfaces **prompt inputs, evaluation dataset, model
used, scoring logic, risk drivers and recommendations** (Traceability + AI Analysis tabs).

### Phase 5 — Value Realization

| KPI | Formula | Target |
| --- | --- | --- |
| ROI | (Annual Benefits − Annual Cost) ÷ Annual Cost | 180% |
| Annual Savings | Σ (Baseline − Current) across savings streams | ₹150M |
| Productivity Gain | (Current − Baseline throughput) ÷ Baseline | 45% |
| Automation Gains | Automated ÷ Total automatable effort | 85% |
| Cost Avoidance | Σ (Avoided events × unit cost) | ₹120M |

### Executive Control Tower

| Pillar | Formula | Target |
| --- | --- | --- |
| Delivery Health | DeliveryConfidence×40% + FlowEfficiency×30% + CopilotQuality×30% | 85% |
| Risk Posture *(lower better)* | Delivery×25% + Technology×25% + Security×25% + Compliance×25% | < 30% |
| Value Realized | BenefitsRealization×50% + ROIAttainment×30% + SavingsAttainment×20% | 85% |
| Enterprise AI Health | Delivery×25% + Technology×25% + Value×25% + (100−Risk)×25% | 80% |

---

## 5. Traceability model

Each authored KPI declares an ordered lineage of stages, e.g. Technical Debt:

```
Application Inventory → Technology Standards → Architecture Reviews
  → Vulnerability Scans → Debt Calculation Engine → Executive KPI
```

Un-authored KPIs derive their lineage live from the drilldown engine's
`sourceRecords`. The Traceability tab renders each stage as a clickable,
hover-highlighted node terminating in the executive KPI.

---

## 6. Executive walkthrough

1. Open any executive dashboard (Control Tower, Technology Health, Portfolio
   Governance, AI Governance, Value Realization).
2. Click a KPI card — e.g. **Technical Debt = 38%**.
3. **Formula** shows the weighted model and the calculation reconciling to 38%.
4. **Contributors** ranks the offending applications (Payments Gateway 82, …).
5. **Traceability** shows the lineage from CMDB to the executive number.
6. **AI Analysis** explains *why* (24 unsupported runtimes, 13 over threshold…)
   with an AI confidence of 91%.
7. **Recommendations** gives the defensible next action (Upgrade Java 8 → 38% to 29%).
8. **Trend** shows Jan 44% → May 38% with a 33% next-quarter forecast vs. a 30% target.

The executive can now defend every number to an audit committee.

---

## 7. Future integration points

- **Wire real data sources**: replace the catalog's illustrative numbers with live
  engine outputs (the engine already merges live contributors/lineage/trend).
- **Persisted forecasts**: swap the linear forecast for the simulation forecast engine.
- **Per-persona views**: filter contributors/recommendations by persona entitlement.
- **Drill-through navigation**: make Traceability nodes route to their source center.
- **Export**: add "Export explainability pack" (PDF) using the existing jsPDF utility.
- **Expand authored coverage**: add catalog entries for any remaining KPIs; the
  framework needs no code changes — only new data entries keyed by chartId/label.
