/**
 * Portfolio Governance KPI Explainability catalog (Phase 3).
 * Universal Explainability Model entries — illustrative, internally consistent mock data.
 */

export const PORTFOLIO_GOVERNANCE_EXPLAINABILITY = [
  {
    keys: ['portfolio-governance.portfolio-health', 'portfolio-health'],
    id: 'portfolio-health',
    name: 'Portfolio Health',
    suffix: '%',
    description:
      'Blended health of the active project portfolio, weighting delivery, schedule, budget and risk signals across all in-flight projects.',
    formula: {
      expression: '(Delivery × 35%) + (Schedule × 25%) + (Budget × 20%) + ((100 − Risk) × 20%)',
      components: [
        { name: 'Delivery Performance', weight: 35, value: 74, note: 'milestones met vs. planned' },
        { name: 'Schedule Adherence', weight: 25, value: 66, note: 'on-time milestone ratio' },
        { name: 'Budget Adherence', weight: 20, value: 71, note: 'actual vs. planned spend' },
        { name: 'Inverse Risk', weight: 20, value: 52, note: '100 − portfolio risk index' },
      ],
      result: 67,
    },
    dataSources: ['Portfolio Governance engine', 'Project Delivery tracker', 'Finance / budget system', 'Risk register'],
    contributingEntities: [
      { name: 'Digital Onboarding', type: 'Project', score: 88, note: 'on track, low risk' },
      { name: 'Payments Modernization', type: 'Project', score: 71, note: 'amber schedule' },
      { name: 'Core Ledger Upgrade', type: 'Project', score: 54, note: 'budget pressure' },
      { name: 'Open Banking APIs', type: 'Project', score: 48, note: 'dependency risk' },
    ],
    traceability: [
      { stage: 'Project Delivery', description: 'Milestone and delivery signals collected per project' },
      { stage: 'Finance System', description: 'Budget burn reconciled against plan' },
      { stage: 'Risk Register', description: 'Project risks scored and aggregated' },
      { stage: 'Scoring Engine', description: 'Weighted health model applied' },
      { stage: 'Executive KPI', description: 'Portfolio-weighted health surfaced' },
    ],
    aiReasoning: {
      confidence: 89,
      drivers: ['Risk is the weakest weighted input at 52', 'Two projects carry schedule amber status', 'Budget adherence is healthy across the portfolio'],
      insights: ['Portfolio health is constrained by risk, not delivery — risk burn-down is the highest-leverage action.'],
    },
    recommendations: [
      { priority: 'High', title: 'Burn down top 5 portfolio risks', expectedBenefit: 'Health 67% → 73%', estimatedImpact: '1 quarter' },
      { priority: 'Medium', title: 'Re-baseline Open Banking dependencies', expectedBenefit: 'Removes amber schedule', estimatedImpact: '2 sprints' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 71 },
        { label: 'Feb', value: 39 },
        { label: 'Mar', value: 68 },
        { label: 'Apr', value: 69 },
        { label: 'May', value: 92 },
      ],
      target: 80,
      forecast: { value: 71, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 80%.', 'Health is weighted by project budget size.'],
  },
  {
    keys: ['portfolio-governance.delivery-confidence', 'delivery-confidence'],
    id: 'delivery-confidence',
    name: 'Delivery Confidence',
    suffix: '%',
    description:
      'Forward-looking confidence that committed scope will be delivered on time, derived from milestone trajectory, dependency health, defect trends, release status and resource constraints.',
    formula: {
      expression:
        '(Milestone Trajectory × 30%) + (Dependency Health × 20%) + (Defect Trend × 20%) + (Release Status × 15%) + (Resource Availability × 15%)',
      components: [
        { name: 'Milestone Trajectory', weight: 30, value: 85 },
        { name: 'Dependency Health', weight: 20, value: 78 },
        { name: 'Defect Trend', weight: 20, value: 83 },
        { name: 'Release Status', weight: 15, value: 80 },
        { name: 'Resource Availability', weight: 15, value: 79 },
      ],
      result: 82,
    },
    dataSources: ['Milestone tracker', 'Dependency graph', 'Defect management system', 'Release pipeline', 'Resource management'],
    contributingEntities: [
      { name: 'Milestones', type: 'Signal', score: 85, note: '17 of 20 milestones on trajectory' },
      { name: 'Dependencies', type: 'Signal', score: 78, note: '3 cross-team dependencies at risk' },
      { name: 'Defects', type: 'Signal', score: 83, note: 'defect inflow trending down' },
      { name: 'Release Status', type: 'Signal', score: 80, note: 'last 4 releases green' },
      { name: 'Resource Constraints', type: 'Signal', score: 79, note: 'one critical skill gap' },
    ],
    traceability: [
      { stage: 'Milestones', description: 'Planned vs. actual milestone trajectory' },
      { stage: 'Dependencies', description: 'Cross-team dependency health scored' },
      { stage: 'Defects & Releases', description: 'Quality and release signals aggregated' },
      { stage: 'Confidence Engine', description: 'Weighted signals blended into a confidence index' },
      { stage: 'Executive KPI', description: 'Delivery Confidence surfaced to portfolio leadership' },
    ],
    aiReasoning: {
      confidence: 84,
      drivers: ['3 cross-team dependencies at risk', 'One critical skill gap on the payments squad', 'Defect inflow is improving'],
      insights: ['Confidence is high and stable; dependency risk is the only material drag.'],
    },
    recommendations: [
      { priority: 'Medium', title: 'Resolve 3 at-risk cross-team dependencies', expectedBenefit: 'Confidence 82% → 86%', estimatedImpact: '2 sprints' },
      { priority: 'Low', title: 'Backfill critical payments skill gap', expectedBenefit: 'De-risks resource constraint', estimatedImpact: '1 hire' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 46 },
        { label: 'Feb', value: 63 },
        { label: 'Mar', value: 42 },
        { label: 'Apr', value: 97 },
        { label: 'May', value: 84 },
      ],
      target: 85,
      forecast: { value: 84, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 85%.'],
  },
  {
    keys: ['portfolio-governance.benefits-realization', 'benefits-realization', 'benefit-realization'],
    id: 'benefits-realization',
    name: 'Benefits Realization',
    suffix: '%',
    description:
      'Share of business benefits committed in approved business cases that have been independently verified as realized.',
    formula: {
      expression: 'Realized Benefits ÷ Committed Benefits × 100',
      components: [
        { name: 'Realized Benefits', weight: 100, value: 142, note: '₹Cr verified' },
        { name: 'Committed Benefits', weight: 0, value: 213, note: '₹Cr committed in business cases' },
      ],
      result: 67,
    },
    dataSources: ['Business case repository', 'Finance benefit-tracking', 'Value Realization engine'],
    contributingEntities: [
      { name: 'Digital Onboarding', type: 'Program', score: 92, note: 'benefits ahead of plan' },
      { name: 'Payments Modernization', type: 'Program', score: 64, note: 'partial realization' },
      { name: 'Branch Automation', type: 'Program', score: 48, note: 'benefits lagging' },
    ],
    traceability: [
      { stage: 'Business Cases', description: 'Committed benefits baselined at approval' },
      { stage: 'Finance Tracking', description: 'Realized benefits independently verified' },
      { stage: 'Executive KPI', description: 'Realized ÷ committed surfaced' },
    ],
    aiReasoning: {
      confidence: 82,
      drivers: ['Branch Automation benefits lagging by 2 quarters', 'Onboarding over-delivering offsets the lag'],
      insights: ['Realization risk is concentrated in one lagging program; targeted intervention can protect the portfolio number.'],
    },
    recommendations: [
      { priority: 'High', title: 'Recovery plan for Branch Automation benefits', expectedBenefit: '67% → 74%', estimatedImpact: '2 quarters' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 63 },
        { label: 'Feb', value: 47 },
        { label: 'Mar', value: 73 },
        { label: 'Apr', value: 88 },
        { label: 'May', value: 68 },
      ],
      target: 85,
      forecast: { value: 72, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 85%.', 'Only independently verified benefits count toward realization.'],
  },
  {
    keys: ['funding-gap'],
    id: 'funding-gap',
    name: 'Funding Gap',
    suffix: '%',
    description:
      'Percentage of approved portfolio demand that is currently unfunded, indicating the shortfall between strategic intent and allocated budget.',
    formula: {
      expression: '(Approved Demand − Allocated Funding) ÷ Approved Demand × 100',
      components: [
        { name: 'Approved Demand', weight: 0, value: 460, note: '₹Cr approved' },
        { name: 'Allocated Funding', weight: 0, value: 382, note: '₹Cr allocated' },
      ],
      result: 17,
    },
    dataSources: ['Demand management', 'Finance allocation', 'Portfolio Governance engine'],
    contributingEntities: [
      { name: 'Regulatory Programs', type: 'Demand', score: 0, note: 'fully funded' },
      { name: 'Growth Initiatives', type: 'Demand', score: 34, note: 'partially funded' },
      { name: 'Innovation Backlog', type: 'Demand', score: 61, note: 'largely unfunded' },
    ],
    traceability: [
      { stage: 'Demand Intake', description: 'Approved demand baselined' },
      { stage: 'Finance Allocation', description: 'Budget allocated by funding cycle' },
      { stage: 'Executive KPI', description: 'Unfunded gap percentage surfaced' },
    ],
    aiReasoning: {
      confidence: 80,
      drivers: ['Innovation backlog is 61% unfunded', 'Regulatory demand fully protected'],
      insights: ['The funding gap is a deliberate prioritization outcome, concentrated in discretionary innovation.'],
    },
    recommendations: [
      { priority: 'Medium', title: 'Stage-gate innovation backlog funding', expectedBenefit: 'Closes gap predictably', estimatedImpact: 'Next funding cycle' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 36 },
        { label: 'Feb', value: 58 },
        { label: 'Mar', value: 15 },
        { label: 'Apr', value: 88 },
        { label: 'May', value: 45 },
      ],
      target: 10,
      forecast: { value: 14, horizon: 'Next quarter' },
    },
    assumptions: ['Lower is better; target is below 10%.'],
  },
  {
    keys: ['strategic-alignment', 'demand-prioritization'],
    id: 'strategic-alignment',
    name: 'Strategic Alignment',
    suffix: '%',
    description:
      'Share of portfolio investment mapped to approved strategic objectives, indicating how well spend reflects enterprise strategy.',
    formula: {
      expression: 'Investment on Strategic Objectives ÷ Total Investment × 100',
      components: [
        { name: 'Aligned Investment', weight: 0, value: 318, note: '₹Cr on strategic themes' },
        { name: 'Total Investment', weight: 0, value: 420, note: '₹Cr total' },
      ],
      result: 76,
    },
    dataSources: ['Strategy objective register', 'Portfolio investment ledger'],
    contributingEntities: [
      { name: 'Customer Experience', type: 'Objective', score: 88 },
      { name: 'Resilience & Risk', type: 'Objective', score: 79 },
      { name: 'Operational Efficiency', type: 'Objective', score: 61 },
    ],
    traceability: [
      { stage: 'Strategy Objectives', description: 'Approved strategic themes published' },
      { stage: 'Investment Mapping', description: 'Spend mapped to objectives' },
      { stage: 'Executive KPI', description: 'Aligned ÷ total investment surfaced' },
    ],
    aiReasoning: {
      confidence: 81,
      drivers: ['24% of spend is run-the-bank, not strategy-aligned', 'Customer experience is well funded'],
      insights: ['Alignment is healthy; the unaligned portion is mostly mandatory run cost.'],
    },
    recommendations: [
      { priority: 'Low', title: 'Tag run-the-bank spend explicitly', expectedBenefit: 'Clarifies true alignment', estimatedImpact: 'Reporting change' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 41 },
        { label: 'Feb', value: 69 },
        { label: 'Mar', value: 56 },
        { label: 'Apr', value: 63 },
        { label: 'May', value: 86 },
      ],
      target: 85,
      forecast: { value: 79, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 85%.'],
  },
];
