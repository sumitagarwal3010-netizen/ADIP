# Transformation KPI Methodology Guide

_Enterprise Transformation Center · ADIP · June 2026_

This guide documents how every KPI in the **Enterprise Transformation Center** is
defined, calculated, sourced and traced, so that executives can trust and defend
each number. Every figure on the dashboard reconciles to the contributing records
shown in its drill-down register and in the universal **"How Calculated"**
explainability drawer (Formula · Contributors · Traceability · AI Analysis ·
Recommendations · Trend).

> All values are illustrative simulation data. They are internally consistent: each
> headline KPI reconciles exactly to the records and inputs presented for it.

---

## 1. Purpose of the Transformation Center

The Transformation Center is the executive system of record for **enterprise
transformation execution and outcomes**. It answers a single board-level question:
_"Is our transformation portfolio healthy, on track, and returning value?"_ It
rolls up 50 transformation programs, 200 strategic initiatives, 500 milestones,
100 benefits, 100 cross-program dependencies and 147 application assessments into
five hero KPIs.

## 2. Why Transformation KPIs Exist

Each KPI exists to make a specific executive decision defensible:

| KPI | Decision it supports |
| --- | --- |
| Transformation Health | Is delivery on solid footing, or do we intervene? |
| Benefits Realization | Is the investment returning the promised benefits? |
| Milestone Completion | Is execution progressing at the expected pace? |
| Dependency Risk | Are interlocked programs exposed to cascade failure? |
| Transformation ROI | Is each rupee of spend returning value? |

Every KPI must answer eleven questions: what it is, why it exists, why it matters,
how it is calculated, what data sources feed it, which applications / programs /
milestones / benefits contribute, when it was last calculated, and what changed
since the previous calculation.

## 3. Transformation Health Formula

```
Transformation Health =
  (Healthy × 1.0 + At-Risk × 0.5 + Critical × 0.0) ÷ Total Applications × 100
```

Contributing records: **147 application assessments** classified into bands
(Healthy ≥ 70, At-Risk 50–69, Critical < 50):

```
(89 Healthy × 1.0 + 28 At-Risk × 0.5 + 30 Critical × 0.0) ÷ 147 = 70%
```

Higher is better. Board target: 80%. Drill-down register columns: Application,
Program, Domain, Health, Owner, Last Assessment, Risk Rating, Status.

## 4. Benefits Realization Formula

```
Benefits Realization = Realized Benefits ÷ Planned Benefits × 100
                     = ₹636 Cr ÷ ₹1,150 Cr × 100 = 55%
```

- Expected Benefits: **₹1,150 Cr**
- Realized Benefits: **₹636 Cr**
- Pending Benefits: **₹514 Cr**

Higher is better. Target: 75%. Drill-down register columns: Program, Expected,
Realized, Variance, Owner, Evidence, Business Case.

## 5. Milestone Completion Formula

```
Milestone Completion = Completed Milestones ÷ Total Milestones × 100
                     = 100 ÷ 500 × 100 = 20%
```

Of 500 milestones: 100 completed, 100 in progress, 100 not started, 100 delayed,
100 missed. Higher is better. Target: 60%. Drill-down register columns: Program,
Milestone, Planned, Actual, Delay, Status, Owner.

## 6. Dependency Risk Formula

```
Dependency Risk =
  (Blocked + Delayed + High/Critical severity, de-duplicated) ÷ Total Dependencies × 100
```

Of 100 cross-program dependencies: 25 blocked, 25 delayed (at-risk), 50 high/critical
severity. The **at-risk union** (a dependency counts once even if it is both blocked
and high-severity) is **75 of 100 = 75%**.

**Weighting logic:** every disrupted state — blocked, delayed, or high/critical
severity — carries full weight (1.0); satisfied and pending dependencies carry 0.
**Lower is better.** Tolerance target: 40%. Drill-down register columns: Source
Program, Target Program, Dependency, Severity, Status, Impact.

## 7. Transformation ROI Formula

```
Transformation ROI (recovery ratio) = Benefit Realized ÷ Total Investment × 100
                                     = ₹636 Cr ÷ ₹657 Cr × 100 = 97%
```

This is a **recovery ratio**: realized benefit as a percentage of spend to date. A
ratio near 100% means the portfolio is approaching break-even on realized value.

```
Net ROI = (Benefit − Investment) ÷ Investment × 100
        = (₹636 Cr − ₹657 Cr) ÷ ₹657 Cr × 100 ≈ −3%
```

Net ROI turns positive once the recovery ratio exceeds 100%. Higher is better.
Target: 120%. Drill-down register columns: Program, Investment, Benefit, ROI,
Payback, Owner, Evidence.

## 8. Data Sources

- Transformation program register (50 programs)
- Application assessment register (147 applications)
- Benefit register (100 benefits) and program business cases
- Milestone tracker (500 milestones)
- Cross-program dependency register (100 dependencies)
- Program financials (spend) and finance actuals
- Architecture Repository, Value Realization Center, Delivery health telemetry

## 9. Weighting Methodology

- **Transformation Health** — application band weighting: Healthy 1.0, At-Risk 0.5,
  Critical 0.0.
- **Dependency Risk** — severity/status weighting: disrupted states (blocked,
  delayed, high/critical) weight 1.0; healthy states weight 0.0; counted once per
  dependency (de-duplicated union).
- **Benefits, Milestones, ROI** — simple ratios of contributing aggregates; no
  band weighting applied.

Weights are set by the Transformation PMO and reviewed quarterly.

## 10. Drill-down Navigation

1. **Click a KPI tile** → opens its drill-down register (the contributing records)
   below the tiles, with the formula and reconciling inputs.
2. **Click the "How Calculated" info icon** on a KPI → opens the universal
   explainability drawer with six tabs: Formula, Contributors, Traceability,
   AI Analysis, Recommendations, Trend.
3. **Click a year** on the 5-Year Transformation History → shows that year's value,
   change from the previous year, contributing programs/applications, the formula
   and the source data.

Full executive traceability chain:

```
Executive Summary → KPI → Formula → Program → Application → Evidence
```

## 11. Executive Interpretation Guide

- **Transformation Health 70%** — solid but below the 80% target; 30 critical
  applications are the primary drag. Intervene on remediation.
- **Benefits Realization 55%** — over half the benefits are realized; ₹514 Cr
  remains. Re-baseline unrealized benefits with owners.
- **Milestone Completion 20%** — early in the delivery cycle; 200 delayed/missed
  milestones need recovery plans. Expect step-ups as in-flight milestones close.
- **Dependency Risk 75%** — high; cross-program dependencies are the biggest threat
  to the milestone forecast. Escalate the 25 blocked dependencies.
- **Transformation ROI 97%** — near break-even on realized value; net ROI turns
  positive once benefit realization outpaces new spend.

---

## Universal Rule

No KPI may exist anywhere in ADIP unless it has a formula, contributing records, a
drill-down, evidence, explainability and a documented methodology. Any KPI lacking
a configured methodology must display **"Calculation Methodology Not Configured"**
instead of a value. All five Transformation Center KPIs are fully configured and
marked **Defensible** in the explainability drawer.
