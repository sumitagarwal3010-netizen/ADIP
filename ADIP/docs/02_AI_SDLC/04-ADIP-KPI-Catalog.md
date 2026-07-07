# 04 — ADIP KPI Catalog

The authoritative KPI dictionary lives in code at
[`src/data/kpiCatalog.ts`](../src/data/kpiCatalog.ts) and is rendered in the
platform at **/kpi-catalog**.

The dictionary documents every KPI with:

- **Definition** — concise, non-technical description.
- **Formula** — calculation in plain English (or pseudo-formula).
- **Source** — origin engine / context / dataset.
- **Frequency** — refresh cadence (Real-time, 30s, Hourly, Daily, Weekly,
  Monthly, Per build).
- **Owner** — accountable role for data quality.
- **Executive Consumer** — the executive who consumes the KPI for decisions
  (CIO, CTO, CISO, CRO, CFO, COO, CEO).
- **Answers** — the executive question (Health, Risk, Progress, Adoption,
  Compliance, Value).
- **Unit** — display unit (%, count, ₹, ms, …).
- **Target** — acceptable threshold.

## Rendering & Generation

The `/kpi-catalog` page provides:

1. Live, filterable, searchable table of KPIs.
2. **Generate KPI Catalog** action that produces a Markdown + CSV catalog and
   registers them in the Universal Artifacts Repository.
3. Per-row formula and definition rendered inline so an executive can audit
   any KPI in one click.

## Detailed KPI Reference

For the full set of KPI definitions, formulas and consumers, the in-app
**/kpi-catalog** view is the canonical surface. The file
[`src/data/kpiCatalog.ts`](../src/data/kpiCatalog.ts) is the textual source
of truth and is also exported as Markdown / CSV via the Generate action.

A previously authored static reference also exists at
[`docs/KPI_CATALOG_V2.md`](./KPI_CATALOG_V2.md) and
[`docs/KPI_TRACEABILITY_MATRIX.md`](./KPI_TRACEABILITY_MATRIX.md).

## KPI Governance Rules

1. Maximum **6 primary KPIs** per center.
2. Every KPI must answer one of: **Health · Risk · Progress · Adoption ·
   Compliance · Value**.
3. No KPI is allowed without a documented formula and source.
4. Derived / overlapping / reporting-only KPIs are removed in favor of a
   single synthesized indicator.
5. AI Risk metrics live only in **AI Governance** (rollup-only elsewhere).
6. AI Evaluation metrics live only in **AI Evaluation**.
7. AI Runtime metrics live only in **AI Observability**.
