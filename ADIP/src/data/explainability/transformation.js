/**
 * Transformation KPI Explainability catalog.
 *
 * Authored, defensible definitions for the five hero KPIs of the Enterprise
 * Transformation Center. Each entry conforms to the Universal Explainability
 * Model consumed by kpiExplainabilityEngine.js and reconciles to the live
 * engine value (TransformationHealth 70 · Benefits 55 · Milestones 20 ·
 * Dependency Risk 75 · ROI 97). All figures trace to the transformation estate
 * (147 application assessments · 50 programs · 100 benefits · 500 milestones ·
 * 100 cross-program dependencies).
 */

export const TRANSFORMATION_EXPLAINABILITY = [
  {
    keys: ['transformation-pmo.transformation-health', 'transformation-health'],
    id: 'transformation-health',
    name: 'Transformation Health',
    suffix: '%',
    description:
      'WHAT: A weighted health score for the applications delivering the transformation portfolio. ' +
      'WHY IT EXISTS: Executives need one defensible number that says whether transformation delivery is on solid footing. ' +
      'WHY IT MATTERS: A declining score is an early warning that programs will miss benefits and board commitments. ' +
      'It is computed by classifying every assessed application as healthy, at-risk or critical and weighting each band.',
    formula: {
      expression: '(Healthy × 1.0 + At-Risk × 0.5 + Critical × 0.0) ÷ Total Applications × 100',
      components: [
        { name: 'Healthy Applications', weight: 100, value: 89, note: 'weight 1.0 — fully healthy' },
        { name: 'At-Risk Applications', weight: 50, value: 28, note: 'weight 0.5 — partial credit' },
        { name: 'Critical Applications', weight: 0, value: 30, note: 'weight 0.0 — no credit' },
        { name: 'Total Applications', weight: 0, value: 147, note: 'assessed in scope' },
      ],
      result: 70,
    },
    dataSources: [
      'Transformation program register (50 programs)',
      'Application assessment register (147 applications)',
      'Architecture Repository (application health)',
      'Delivery health telemetry',
      'Transformation Health engine',
    ],
    contributingEntities: [
      { name: 'Fraud Management Engine 7', type: 'Application', score: 88, note: 'Critical · health 24 · remediation' },
      { name: 'Core Banking Renewal Loans 4', type: 'Application', score: 80, note: 'Critical · health 31 · remediation' },
      { name: 'Treasury Platform 12', type: 'Application', score: 58, note: 'At-Risk · health 54 · in-migration' },
      { name: 'Payments Hub 3', type: 'Application', score: 22, note: 'Healthy · health 86 · live' },
      { name: 'UPI Gateway 1', type: 'Application', score: 18, note: 'Healthy · health 92 · live' },
    ],
    traceability: [
      { stage: 'Strategy', description: 'Transformation pillars define the program portfolio' },
      { stage: 'Programs', description: '50 transformation programs own delivery scope' },
      { stage: 'Application Assessments', description: '147 applications scored and classified into health bands' },
      { stage: 'Weighted Band Score', description: '(Healthy + 0.5×At-Risk) ÷ Total normalized to 0–100' },
      { stage: 'Executive KPI', description: 'Single Transformation Health figure surfaced to the board' },
    ],
    aiReasoning: {
      confidence: 88,
      drivers: [
        '30 critical applications contribute zero health credit',
        '28 at-risk applications are one slip away from critical',
        'Healthy estate (89 apps) is concentrated in Payments and Digital domains',
      ],
      insights: [
        'Recovering 6 critical applications to at-risk would lift health from 70% to ~72%.',
        'Health is dragged down by Fraud Management and Core Banking applications.',
      ],
    },
    recommendations: [
      { priority: 'High', title: 'Launch remediation squad for 30 critical applications', expectedBenefit: 'Health 70% → 74%', estimatedImpact: '2 quarters' },
      { priority: 'Medium', title: 'Stabilize 28 at-risk applications before they degrade', expectedBenefit: 'Protects current 70%', estimatedImpact: '1 quarter' },
    ],
    trends: {
      monthly: [
        { label: '2022', value: 72 },
        { label: '2023', value: 40 },
        { label: '2024', value: 69 },
        { label: '2025', value: 70 },
        { label: 'Now', value: 93 },
      ],
      target: 80,
      forecast: { value: 72, horizon: 'Next quarter', note: 'Assuming critical remediation wave lands on plan' },
    },
    assumptions: [
      'Health bands: Healthy ≥ 70, At-Risk 50–69, Critical < 50.',
      'Higher is better; board target is 80%.',
      'Scores are application-count weighted, not budget weighted.',
    ],
    lastUpdated: '18 Jun 2026 · 06:00 IST',
  },
  {
    keys: ['transformation-pmo.benefits-realization', 'benefits-realization'],
    id: 'benefits-realization',
    name: 'Benefits Realization',
    suffix: '%',
    description:
      'WHAT: The share of planned transformation benefits that has actually been realized. ' +
      'WHY IT EXISTS: Investment is justified by benefits; this proves whether they are materializing. ' +
      'WHY IT MATTERS: A low ratio means the business case is slipping and funding decisions need revisiting.',
    formula: {
      expression: 'Realized Benefits ÷ Planned Benefits × 100',
      components: [
        { name: 'Realized Benefits (₹636 Cr)', weight: 100, value: 636, note: 'sum of realized value across benefits' },
        { name: 'Planned Benefits (₹1,150 Cr)', weight: 0, value: 1150, note: 'sum of target value across benefits' },
      ],
      result: 55,
    },
    dataSources: [
      'Benefit register (100 tracked benefits)',
      'Program business cases',
      'Value Realization Center',
      'Finance actuals',
    ],
    contributingEntities: [
      { name: 'Payments Transformation UPI 3', type: 'Program', score: 72, note: '₹118 Cr expected · ₹78 Cr realized' },
      { name: 'Core Banking Renewal 4', type: 'Program', score: 64, note: '₹96 Cr expected · ₹52 Cr realized' },
      { name: 'Digital Banking Mobile 2', type: 'Program', score: 48, note: '₹84 Cr expected · ₹30 Cr realized' },
      { name: 'Risk Platform AML 6', type: 'Program', score: 30, note: '₹72 Cr expected · ₹18 Cr realized' },
    ],
    traceability: [
      { stage: 'Business Case', description: 'Each program books target benefits at funding approval' },
      { stage: 'Benefit Register', description: '100 benefits tracked with target and realized value' },
      { stage: 'Finance Actuals', description: 'Realized value validated against finance ledger' },
      { stage: 'Aggregation', description: 'Σ realized ÷ Σ planned across all benefits' },
      { stage: 'Executive KPI', description: 'Portfolio benefits realization surfaced' },
    ],
    aiReasoning: {
      confidence: 85,
      drivers: [
        '₹514 Cr of planned benefit remains unrealized',
        'Realization is back-weighted to programs still mid-delivery',
        'Cost-reduction benefits are realizing faster than revenue benefits',
      ],
      insights: [
        'Accelerating the top 5 revenue benefits would move realization from 55% to ~62%.',
        'Benefit leakage is concentrated in programs behind on milestones.',
      ],
    },
    recommendations: [
      { priority: 'High', title: 'Re-baseline ₹514 Cr unrealized benefits with owners', expectedBenefit: 'Restores business-case confidence', estimatedImpact: '₹514 Cr at stake' },
      { priority: 'Medium', title: 'Fast-track top revenue benefits', expectedBenefit: '55% → 62%', estimatedImpact: '5 benefits' },
    ],
    trends: {
      monthly: [
        { label: '2022', value: 36 },
        { label: '2023', value: 53 },
        { label: '2024', value: 32 },
        { label: '2025', value: 93 },
        { label: 'Now', value: 74 },
      ],
      target: 75,
      forecast: { value: 60, horizon: 'Next quarter', note: 'Assuming revenue benefits accelerate' },
    },
    assumptions: [
      'Realized value is finance-validated, not forecast.',
      'Higher is better; target is 75% by year end.',
      '₹1 Cr = ₹10,000,000.',
    ],
    lastUpdated: '18 Jun 2026 · 06:00 IST',
  },
  {
    keys: ['transformation-pmo.milestone-completion', 'milestone-completion'],
    id: 'milestone-completion',
    name: 'Milestone Completion',
    suffix: '%',
    description:
      'WHAT: The proportion of transformation milestones that are fully completed. ' +
      'WHY IT EXISTS: Milestones are the smallest verifiable unit of delivery progress. ' +
      'WHY IT MATTERS: Low completion with high in-flight volume signals execution risk and likely benefit slippage.',
    formula: {
      expression: 'Completed Milestones ÷ Total Milestones × 100',
      components: [
        { name: 'Completed Milestones', weight: 100, value: 100, note: 'status = completed' },
        { name: 'Total Milestones', weight: 0, value: 500, note: 'all tracked milestones' },
      ],
      result: 20,
    },
    dataSources: [
      'Milestone tracker (500 milestones)',
      'Program delivery plans',
      'Critical-path schedule',
    ],
    contributingEntities: [
      { name: 'In Progress', type: 'Milestone band', score: 20, note: '100 milestones in flight' },
      { name: 'Not Started', type: 'Milestone band', score: 20, note: '100 milestones not started' },
      { name: 'Delayed', type: 'Milestone band', score: 78, note: '100 milestones delayed' },
      { name: 'Missed', type: 'Milestone band', score: 90, note: '100 milestones missed' },
      { name: 'Completed', type: 'Milestone band', score: 10, note: '100 milestones completed' },
    ],
    traceability: [
      { stage: 'Delivery Plans', description: 'Programs decompose scope into milestones' },
      { stage: 'Milestone Tracker', description: '500 milestones tracked with status and due date' },
      { stage: 'Status Roll-up', description: 'Completed milestones counted against total' },
      { stage: 'Executive KPI', description: 'Completion percentage surfaced' },
    ],
    aiReasoning: {
      confidence: 84,
      drivers: [
        '200 milestones are delayed or missed',
        '100 milestones have not started, concentrated in later waves',
        'Completion is early-cycle; most milestones land in the back half',
      ],
      insights: [
        'Recovering the 100 delayed milestones is the fastest lever on this KPI.',
        'Completion will step up sharply as in-flight milestones close.',
      ],
    },
    recommendations: [
      { priority: 'High', title: 'Run recovery plans on 200 delayed/missed milestones', expectedBenefit: '20% → 28%', estimatedImpact: 'Critical-path focus' },
      { priority: 'Medium', title: 'Unblock the 100 not-started milestones', expectedBenefit: 'Improves forward forecast', estimatedImpact: 'Later waves' },
    ],
    trends: {
      monthly: [
        { label: '2022', value: 46 },
        { label: '2023', value: 30 },
        { label: '2024', value: 56 },
        { label: '2025', value: 71 },
        { label: 'Now', value: 51 },
      ],
      target: 60,
      forecast: { value: 26, horizon: 'Next quarter', note: 'Assuming in-flight milestones close on plan' },
    },
    assumptions: [
      'Only fully completed milestones count toward the numerator.',
      'Higher is better; target is 60%.',
    ],
    lastUpdated: '18 Jun 2026 · 06:00 IST',
  },
  {
    keys: ['transformation-pmo.dependency-risk', 'dependency-risk'],
    id: 'dependency-risk',
    name: 'Dependency Risk',
    suffix: '%',
    description:
      'WHAT: The share of cross-program dependencies that are impeding delivery. ' +
      'WHY IT EXISTS: Transformation programs are interlocked; one blocked dependency can stall many programs. ' +
      'WHY IT MATTERS: A high index means delivery and board commitments are exposed to cascade failure. Lower is better.',
    formula: {
      expression: '(Blocked + Delayed + High/Critical severity, de-duplicated) ÷ Total Dependencies × 100',
      components: [
        { name: 'Blocked Dependencies', weight: 100, value: 25, note: 'status = blocked · weight 1.0' },
        { name: 'Delayed Dependencies', weight: 100, value: 25, note: 'status = at-risk · weight 1.0' },
        { name: 'High/Critical Severity', weight: 100, value: 50, note: 'severity high/critical · weight 1.0' },
        { name: 'Total Dependencies', weight: 0, value: 100, note: 'internal cross-program dependencies' },
      ],
      result: 75,
    },
    dataSources: [
      'Cross-program dependency register (100 dependencies)',
      'Program schedules',
      'Steering committee escalation log',
    ],
    contributingEntities: [
      { name: 'Payments → Core Banking (funding)', type: 'Dependency', score: 90, note: 'Blocked · critical' },
      { name: 'Risk Platform → Data & AI (data)', type: 'Dependency', score: 82, note: 'Blocked · high' },
      { name: 'Digital → Payments (sequence)', type: 'Dependency', score: 64, note: 'At-risk · high' },
      { name: 'Cloud Migration → Core (technical)', type: 'Dependency', score: 58, note: 'At-risk · medium' },
    ],
    traceability: [
      { stage: 'Program Schedules', description: 'Dependencies declared between programs' },
      { stage: 'Dependency Register', description: '100 dependencies tracked with status and severity' },
      { stage: 'Severity Weighting', description: 'Blocked / delayed / high-critical flagged as at-risk' },
      { stage: 'Risk Index', description: 'At-risk dependencies ÷ total, de-duplicated' },
      { stage: 'Executive KPI', description: 'Dependency risk index surfaced' },
    ],
    aiReasoning: {
      confidence: 86,
      drivers: [
        '25 dependencies are hard-blocked',
        '50 dependencies carry high or critical severity',
        'Funding and sequence dependencies dominate the blocked set',
      ],
      insights: [
        'Re-sequencing 8 funding dependencies would cut the index from 75% to ~66%.',
        'Dependency risk is the single biggest threat to the milestone forecast.',
      ],
    },
    recommendations: [
      { priority: 'High', title: 'Escalate 25 blocked dependencies to steering committee', expectedBenefit: '75% → 66%', estimatedImpact: 'Cross-program' },
      { priority: 'Medium', title: 'Re-sequence funding dependencies', expectedBenefit: 'Removes cascade risk', estimatedImpact: '8 dependencies' },
    ],
    trends: {
      monthly: [
        { label: '2022', value: 53 },
        { label: '2023', value: 75 },
        { label: '2024', value: 32 },
        { label: '2025', value: 97 },
        { label: 'Now', value: 62 },
      ],
      target: 40,
      forecast: { value: 70, horizon: 'Next quarter', note: 'Assuming blocked dependencies are escalated' },
    },
    assumptions: [
      'A dependency is counted once even if it is both blocked and high-severity.',
      'Lower is better; tolerance target is 40%.',
    ],
    lastUpdated: '18 Jun 2026 · 06:00 IST',
  },
  {
    keys: ['transformation-pmo.transformation-roi', 'transformation-roi'],
    id: 'transformation-roi',
    name: 'Transformation ROI',
    suffix: '%',
    description:
      'WHAT: Benefit realized to date as a percentage of investment spent to date (a recovery ratio). ' +
      'WHY IT EXISTS: It tells the board how much value each rupee of transformation spend has returned so far. ' +
      'WHY IT MATTERS: A ratio near 100% means the portfolio is approaching break-even on realized value; net ROI turns positive above 100%.',
    formula: {
      expression: 'Benefit Realized ÷ Total Investment × 100',
      components: [
        { name: 'Benefit Realized (₹636 Cr)', weight: 100, value: 636, note: 'realized benefit across programs' },
        { name: 'Total Investment (₹657 Cr)', weight: 0, value: 657, note: 'spend to date across programs' },
      ],
      result: 97,
    },
    dataSources: [
      'Program financials (spend to date)',
      'Benefit register (realized value)',
      'Value Realization Center',
      'Finance actuals',
    ],
    contributingEntities: [
      { name: 'Payments Transformation UPI 3', type: 'Program', score: 90, note: '₹40 Cr invested · ₹52 Cr benefit' },
      { name: 'Digital Banking Mobile 2', type: 'Program', score: 70, note: '₹35 Cr invested · ₹33 Cr benefit' },
      { name: 'Core Banking Renewal 4', type: 'Program', score: 45, note: '₹60 Cr invested · ₹38 Cr benefit' },
      { name: 'Risk Platform AML 6', type: 'Program', score: 30, note: '₹48 Cr invested · ₹22 Cr benefit' },
    ],
    traceability: [
      { stage: 'Program Financials', description: 'Spend to date booked per program' },
      { stage: 'Benefit Register', description: 'Realized benefit validated per program' },
      { stage: 'Aggregation', description: 'Σ benefit ÷ Σ investment across portfolio' },
      { stage: 'Executive KPI', description: 'Transformation ROI recovery ratio surfaced' },
    ],
    aiReasoning: {
      confidence: 83,
      drivers: [
        '₹636 Cr realized against ₹657 Cr invested — near break-even',
        'Net ROI is approximately −3%; the portfolio is about to turn positive',
        'Payments and Digital programs are carrying portfolio returns',
      ],
      insights: [
        'Shifting spend from paused initiatives to high-return programs pushes ROI past 100%.',
        'Two more quarters of benefit realization should flip net ROI positive.',
      ],
    },
    recommendations: [
      { priority: 'High', title: 'Reallocate spend from paused initiatives to high-ROI programs', expectedBenefit: 'ROI 97% → 105%', estimatedImpact: 'Portfolio rebalance' },
      { priority: 'Medium', title: 'Protect benefit realization on Payments programs', expectedBenefit: 'Sustains portfolio return', estimatedImpact: 'Top 5 programs' },
    ],
    trends: {
      monthly: [
        { label: '2022', value: 46 },
        { label: '2023', value: 74 },
        { label: '2024', value: 61 },
        { label: '2025', value: 68 },
        { label: 'Now', value: 91 },
      ],
      target: 120,
      forecast: { value: 101, horizon: 'Next quarter', note: 'Assuming benefit realization outpaces new spend' },
    },
    assumptions: [
      'This is a recovery ratio (realized benefit ÷ spend), not net ROI.',
      'Net ROI = (Benefit − Investment) ÷ Investment; positive above a 100% ratio.',
      'Higher is better; target is a 120% recovery ratio.',
    ],
    lastUpdated: '18 Jun 2026 · 06:00 IST',
  },
];
