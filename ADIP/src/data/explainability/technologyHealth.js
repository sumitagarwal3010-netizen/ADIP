/**
 * Technology Health KPI Explainability catalog (Phase 2).
 *
 * Each entry conforms to the Universal Explainability Model consumed by
 * kpiExplainabilityEngine.js. `keys` lists every identifier a KPI card may use
 * (chartId first, then label slugs) so a single defensible definition is shared
 * across every screen that renders the metric.
 *
 * All numbers are illustrative mock data — no backend calls. They are internally
 * consistent so the formula, contributors and trend reconcile to the headline value.
 */

export const TECHNOLOGY_HEALTH_EXPLAINABILITY = [
  {
    keys: ['application-portfolio.technical-debt', 'technical-debt'],
    id: 'technical-debt',
    name: 'Technical Debt Score',
    suffix: '%',
    description:
      'Composite index of accumulated engineering and architectural debt across the application estate. A higher score means more remediation effort is required before the estate can be safely modernized or scaled.',
    formula: {
      expression:
        '(Legacy Technology × 30%) + (Vulnerability Backlog × 25%) + (Unsupported Software × 20%) + (Architecture Violations × 15%) + (Manual Operations × 10%)',
      components: [
        { name: 'Legacy Technology', weight: 30, value: 46, note: '% of estate on end-of-life frameworks' },
        { name: 'Vulnerability Backlog', weight: 25, value: 39, note: 'open critical/high vulns vs. threshold' },
        { name: 'Unsupported Software', weight: 20, value: 34, note: 'apps on unsupported runtimes' },
        { name: 'Architecture Violations', weight: 15, value: 28, note: 'unresolved architecture review findings' },
        { name: 'Manual Operations', weight: 10, value: 22, note: 'manual deploy / ops toil index' },
      ],
      result: 38,
    },
    dataSources: [
      'Application Inventory (CMDB)',
      'Technology Standards Register',
      'Architecture Review Board findings',
      'Vulnerability Scanner (SAST/DAST)',
      'Debt Calculation Engine',
    ],
    contributingEntities: [
      { name: 'Payments Gateway', type: 'Application', score: 82, note: 'Java 8, 6 critical vulns' },
      { name: 'Fraud Engine', type: 'Application', score: 68, note: 'unsupported ML runtime' },
      { name: 'Merchant Platform', type: 'Application', score: 61, note: 'monolith, 14 arch violations' },
      { name: 'UPI Switch', type: 'Application', score: 41, note: 'partial containerization' },
      { name: 'Customer Portal', type: 'Application', score: 20, note: 'modern stack, low debt' },
    ],
    traceability: [
      { stage: 'Application Inventory', description: '312 applications catalogued in CMDB with runtime metadata' },
      { stage: 'Technology Standards', description: 'Each app evaluated against approved technology register' },
      { stage: 'Architecture Reviews', description: 'ARB findings mapped to owning applications' },
      { stage: 'Vulnerability Scans', description: 'SAST/DAST backlog aged against SLA thresholds' },
      { stage: 'Debt Calculation Engine', description: 'Weighted factor model normalizes to a 0–100 score' },
      { stage: 'Executive KPI', description: 'Estate-weighted average surfaced on Technology Health' },
    ],
    aiReasoning: {
      confidence: 91,
      drivers: [
        '24 applications running on unsupported runtimes',
        '13 applications exceeding the vulnerability backlog threshold',
        '8 architecture review findings unresolved beyond SLA',
      ],
      insights: [
        'Debt is concentrated in payments-domain applications, which also carry the highest transaction risk.',
        'Upgrading the 11 Java 8 services would move the estate below the 30% target band.',
        'Manual operations contribute least to the score and are not the priority remediation lever.',
      ],
    },
    recommendations: [
      { priority: 'High', title: 'Upgrade Java 8 applications to LTS runtime', expectedBenefit: 'Debt 38% → 29%', estimatedImpact: '11 apps · 2 quarters' },
      { priority: 'High', title: 'Clear critical vulnerability backlog in payments domain', expectedBenefit: 'Removes audit-blocking risk', estimatedImpact: '6 critical vulns' },
      { priority: 'Medium', title: 'Decompose Merchant Platform monolith', expectedBenefit: 'Resolves 14 architecture violations', estimatedImpact: '3 quarters' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 68 },
        { label: 'Feb', value: 44 },
        { label: 'Mar', value: 42 },
        { label: 'Apr', value: 97 },
        { label: 'May', value: 48 },
      ],
      target: 30,
      forecast: { value: 33, horizon: 'Next quarter', note: 'Assuming Java upgrade wave completes on plan' },
    },
    assumptions: [
      'Factor weights are set by the Architecture Review Board and reviewed quarterly.',
      'Lower score is better; target band is below 30%.',
      'Scores are estate-weighted by application criticality.',
    ],
  },
  {
    keys: ['technology-strategy.modernization-progress', 'modernization-progress', 'modernization', 'application-portfolio.modernization-readiness', 'modernization-ready'],
    id: 'modernization-progress',
    name: 'Modernization Progress',
    suffix: '%',
    description:
      'Share of planned modernization initiatives completed across all transformation waves. Measures execution velocity of the modernization roadmap.',
    formula: {
      expression: 'Completed Initiatives ÷ Planned Initiatives × 100',
      components: [
        { name: 'Completed Initiatives', weight: 100, value: 63, note: 'initiatives marked done' },
        { name: 'Planned Initiatives', weight: 0, value: 126, note: 'total initiatives in roadmap' },
      ],
      result: 50,
    },
    dataSources: [
      'Transformation PMO roadmap',
      'Application Inventory modernization status',
      'Wave & milestone tracker',
    ],
    contributingEntities: [
      { name: 'Wave 1 — Core Banking', type: 'Program', score: 70, note: '21 of 30 initiatives complete' },
      { name: 'Wave 2 — Payments', type: 'Program', score: 45, note: '18 of 40 initiatives complete' },
      { name: 'Wave 3 — Channels', type: 'Program', score: 10, note: '5 of 50 initiatives complete' },
    ],
    traceability: [
      { stage: 'Application Inventory', description: 'Each app tagged with modernization status' },
      { stage: 'Roadmap Waves', description: 'Initiatives grouped into delivery waves' },
      { stage: 'Milestone Tracker', description: 'Completion events roll up per wave' },
      { stage: 'Executive KPI', description: 'Completed ÷ planned across all waves' },
    ],
    aiReasoning: {
      confidence: 88,
      drivers: [
        'Wave 3 has only just started, dragging the blended completion rate',
        'Wave 1 is ahead of schedule and near completion',
        'Dependency on cloud landing zones is gating Wave 2 throughput',
      ],
      insights: [
        'Front-loading Wave 3 discovery would de-risk the next-quarter forecast.',
        'Overall progress is on a healthy trajectory but back-weighted to later waves.',
      ],
    },
    recommendations: [
      { priority: 'High', title: 'Accelerate Wave 3 discovery & funding', expectedBenefit: '50% → 60% by next quarter', estimatedImpact: '50 initiatives unblocked' },
      { priority: 'Medium', title: 'Provision cloud landing zones for Wave 2', expectedBenefit: 'Removes throughput bottleneck', estimatedImpact: '22 initiatives' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 39 },
        { label: 'Feb', value: 74 },
        { label: 'Mar', value: 34 },
        { label: 'Apr', value: 82 },
        { label: 'May', value: 41 },
      ],
      target: 75,
      forecast: { value: 60, horizon: 'Next quarter', note: 'Wave 3 ramp assumed' },
    },
    assumptions: [
      'Initiative scope is fixed within a wave once baselined.',
      'Higher is better; target is 75% by year end.',
    ],
  },
  {
    keys: ['technology-strategy.cloud-adoption', 'cloud-adoption', 'architecture-repository.cloud-readiness', 'application-portfolio.cloud-readiness', 'cloud-readiness'],
    id: 'cloud-adoption',
    name: 'Cloud Adoption',
    suffix: '%',
    description:
      'Proportion of the application estate hosted on approved cloud platforms versus on-premises. Tracks progress against the enterprise cloud strategy.',
    formula: {
      expression: 'Cloud Hosted Apps ÷ Total Apps × 100',
      components: [
        { name: 'Cloud Hosted Apps', weight: 100, value: 156, note: 'apps on AWS/Azure/GCP' },
        { name: 'Total Apps', weight: 0, value: 312, note: 'total applications' },
      ],
      result: 50,
    },
    dataSources: [
      'Application Inventory (hosting metadata)',
      'Cloud Strategy target architecture',
      'Migration tracker',
    ],
    contributingEntities: [
      { name: 'UPI Switch', type: 'Application', score: 100, note: 'Hosted on AWS' },
      { name: 'Merchant Portal', type: 'Application', score: 100, note: 'Hosted on Azure' },
      { name: 'Customer Portal', type: 'Application', score: 100, note: 'Hosted on AWS' },
      { name: 'Fraud Engine', type: 'Application', score: 0, note: 'On-prem — migration planned' },
      { name: 'Core Ledger', type: 'Application', score: 0, note: 'On-prem — regulatory review' },
    ],
    traceability: [
      { stage: 'Application Inventory', description: 'Hosting platform recorded per application' },
      { stage: 'Cloud Strategy', description: 'Target hosting defined per application tier' },
      { stage: 'Migration Tracker', description: 'In-flight migrations tracked to completion' },
      { stage: 'Executive KPI', description: 'Cloud-hosted ÷ total applications' },
    ],
    aiReasoning: {
      confidence: 90,
      drivers: [
        '156 of 312 applications now cloud-hosted',
        'Regulatory review is gating 2 core on-prem ledgers',
        'Lift-and-shift candidates outnumber re-platform candidates 3:1',
      ],
      insights: [
        'Migrating the 18 stateless mid-tier apps is the fastest path to the 65% milestone.',
        'Core ledger migration is the long pole and needs regulatory pre-clearance.',
      ],
    },
    recommendations: [
      { priority: 'High', title: 'Batch-migrate 18 stateless mid-tier apps', expectedBenefit: '50% → 56%', estimatedImpact: '1 quarter' },
      { priority: 'Medium', title: 'Initiate regulatory pre-clearance for core ledger', expectedBenefit: 'Unblocks long-pole migration', estimatedImpact: '2–3 quarters' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 77 },
        { label: 'Feb', value: 44 },
        { label: 'Mar', value: 42 },
        { label: 'Apr', value: 48 },
        { label: 'May', value: 69 },
      ],
      target: 70,
      forecast: { value: 58, horizon: 'Next quarter', note: 'Mid-tier batch migration assumed' },
    },
    assumptions: [
      'Approved platforms are AWS, Azure and GCP only.',
      'Higher is better; target is 70%.',
    ],
  },
  {
    keys: [
      'architecture-repository.standards-compliance',
      'architecture-compliance',
      'standards-compliance',
      'technology-strategy.standards-adoption',
      'standards-adoption',
    ],
    id: 'architecture-compliance',
    name: 'Architecture Compliance',
    suffix: '%',
    description:
      'Degree to which applications conform to mandated architecture standards and reference patterns, weighted by the severity of open violations.',
    formula: {
      expression: '1 − (Weighted Violations ÷ Evaluated Controls) × 100',
      components: [
        { name: 'Critical Violations', weight: 50, value: 18, note: 'severity-weighted ×3' },
        { name: 'Major Violations', weight: 30, value: 34, note: 'severity-weighted ×2' },
        { name: 'Minor Violations', weight: 20, value: 61, note: 'severity-weighted ×1' },
      ],
      result: 25,
    },
    dataSources: [
      'Architecture Standards catalog',
      'Architecture Review Board findings',
      'Reference pattern library',
      'Application Inventory',
    ],
    contributingEntities: [
      { name: 'Merchant Platform', type: 'Application', score: 14, note: '14 open violations' },
      { name: 'Payments Gateway', type: 'Application', score: 22, note: '9 open violations' },
      { name: 'Fraud Engine', type: 'Application', score: 31, note: '6 open violations' },
      { name: 'UPI Switch', type: 'Application', score: 64, note: '2 open violations' },
    ],
    traceability: [
      { stage: 'Architecture Standards', description: 'Mandated controls and reference patterns published' },
      { stage: 'Architecture Reviews', description: 'Applications assessed; violations logged with severity' },
      { stage: 'Scoring Engine', description: 'Severity-weighted violation ratio computed' },
      { stage: 'Executive KPI', description: 'Estate compliance percentage surfaced' },
    ],
    aiReasoning: {
      confidence: 86,
      drivers: [
        '18 critical architecture violations remain open',
        'Compliance is dragged down by 3 payments-domain monoliths',
        'Reference-pattern adoption is below 40% for new services',
      ],
      insights: [
        'Compliance is the weakest Technology Health pillar and is audit-relevant.',
        'Resolving the 18 critical violations alone lifts the score above the 40% floor.',
      ],
    },
    recommendations: [
      { priority: 'High', title: 'Remediate 18 critical architecture violations', expectedBenefit: '25% → 41%', estimatedImpact: '2 quarters' },
      { priority: 'Medium', title: 'Mandate reference patterns for all new services', expectedBenefit: 'Prevents new violations', estimatedImpact: 'Policy change' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 14 },
        { label: 'Feb', value: 47 },
        { label: 'Mar', value: 52 },
        { label: 'Apr', value: 55 },
        { label: 'May', value: 76 },
      ],
      target: 60,
      forecast: { value: 33, horizon: 'Next quarter', note: 'Critical violation remediation assumed' },
    },
    assumptions: [
      'Violations are severity-weighted (critical ×3, major ×2, minor ×1).',
      'Higher is better; target is 60%.',
    ],
  },
  {
    keys: ['technology-strategy.technology-health', 'technology-health'],
    id: 'technology-health',
    name: 'Technology Health',
    suffix: '%',
    description:
      'Executive rollup of the technology estate combining standards adoption, cloud adoption, modernization progress and the inverse of technology risk.',
    formula: {
      expression:
        '(Standards Adoption × 30%) + (Cloud Adoption × 25%) + (Modernization × 25%) + ((100 − Technology Risk) × 20%)',
      components: [
        { name: 'Standards Adoption', weight: 30, value: 58 },
        { name: 'Cloud Adoption', weight: 25, value: 50 },
        { name: 'Modernization', weight: 25, value: 50 },
        { name: 'Inverse Technology Risk', weight: 20, value: 59 },
      ],
      result: 54,
    },
    dataSources: ['Technology Strategy engine', 'Application Portfolio', 'Architecture Repository'],
    contributingEntities: [
      { name: 'Standards Adoption', type: 'Sub-KPI', score: 58 },
      { name: 'Cloud Adoption', type: 'Sub-KPI', score: 50 },
      { name: 'Modernization', type: 'Sub-KPI', score: 50 },
      { name: 'Technology Risk (inverse)', type: 'Sub-KPI', score: 59 },
    ],
    traceability: [
      { stage: 'Sub-KPIs', description: 'Four technology sub-indicators computed independently' },
      { stage: 'Weighted Rollup', description: 'Weights applied per executive policy' },
      { stage: 'Executive Control Tower', description: 'Single Technology Health pillar surfaced' },
    ],
    aiReasoning: {
      confidence: 87,
      drivers: ['Cloud and modernization both at 50% cap the rollup', 'Standards adoption is the strongest contributor'],
      insights: ['Technology Health improves fastest by advancing cloud and modernization in lockstep.'],
    },
    recommendations: [
      { priority: 'Medium', title: 'Coordinate cloud + modernization waves', expectedBenefit: 'Health 54% → 62%', estimatedImpact: '2 quarters' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 51 },
        { label: 'Feb', value: 83 },
        { label: 'Mar', value: 19 },
        { label: 'Apr', value: 90 },
        { label: 'May', value: 59 },
      ],
      target: 70,
      forecast: { value: 60, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 70%.'],
  },
];
