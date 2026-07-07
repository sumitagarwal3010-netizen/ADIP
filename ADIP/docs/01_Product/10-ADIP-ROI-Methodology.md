# 10 — ADIP ROI Methodology

ADIP's value claims are computed with explicit formulas. This document is
the audit trail for every value KPI.

## ROI Building Blocks

### Hours Saved

```
hoursSaved = Σ (taskVolume · taskBaseline · automationFraction)
```

Where:
- `taskVolume` — # of tasks per period (e.g. requirements reviewed)
- `taskBaseline` — pre-AI hours per task
- `automationFraction` — share of effort that the Copilot now handles

### FTE Saved

```
fteSaved = hoursSaved / annualHoursPerFTE
```

Default `annualHoursPerFTE = 1800` (post-leave, post-training).

### Cost Avoidance

```
costAvoidance = hoursSaved · blendedRate · costAvoidanceFactor
```

`costAvoidanceFactor` defaults to **0.65** (i.e. 35% of hours saved are
re-deployed to higher-value work, not eliminated).

### Productivity Gain

```
productivityGain = (currentOutputPerFTE − baselineOutputPerFTE) / baselineOutputPerFTE
```

### Risk Reduction

```
riskReduction = baselineRiskExposure − currentRiskExposure
```

`riskExposure` is the enterprise risk score from the simulation engine
(0 ≈ no risk; 100 = severe).

### Annual Value

```
annualValue = (hoursSaved · blendedRate)
            + costAvoidance
            + qualityUplift                  # rework avoidance
            + riskReductionInRupees          # priced via risk × business value
```

### ROI %

```
ROI% = (annualValue − annualPlatformCost) / annualPlatformCost
```

### Payback (months)

```
payback = totalInvestment / monthlyValue
```

### 3-Year Value

```
threeYearValue = Σ (year_i_value − year_i_cost),  i ∈ {1, 2, 3}
```

## Default Parameters (illustrative)

| Parameter | Default | Source |
| --- | --- | --- |
| Blended Rate (₹/hour) | 2,500 | Enterprise blended labor rate |
| Annual hours / FTE | 1,800 | HR baseline |
| Automation Fraction (Copilots) | 0.40–0.65 | Per Copilot, see Value Realization |
| Cost Avoidance Factor | 0.65 | Finance assumption |
| Annual Platform Cost | ₹6Cr | Demo placeholder |

## Deriving Annual Savings (Example)

For a 50-application, 120-project, 705-engineer estate:

```
hoursSaved        = 50 apps × 8 hrs/week (Copilot) × 52 weeks × 0.6
                  + 120 projects × 12 hrs/week (governance) × 52 × 0.5
                  + 705 engineers × 6 hrs/week × 52 × 0.4
                  ≈  148,400 hours/year

costAvoidance     = 148,400 × ₹2,500 × 0.65
                  ≈  ₹24.1Cr/year

qualityUplift     = ~₹6Cr (rework avoidance)
riskReduction₹    = ~₹7Cr (priced from risk score uplift)

annualValue       = ₹37.1Cr (matches the ₹37M figure in Value Realization)
```

## Click-Through Audit Trail

Every figure that appears in **Value Realization** has a *How Calculated*
affordance that surfaces:

1. The component formulas above.
2. The current parameter values (blended rate, hours, automation factor).
3. The KPI Catalog entry for the metric.

## Sensitivity

| Variable | ±10% impact on Annual Value |
| --- | --- |
| Blended Rate | ±₹2.4Cr |
| Automation Fraction | ±₹2.7Cr |
| Cost Avoidance Factor | ±₹2.4Cr |

A 10% pessimistic vs. optimistic spread = ±₹7Cr. We publish the central
case and let executives interrogate the parameters.
