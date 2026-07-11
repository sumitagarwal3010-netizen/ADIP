/**
 * Value Realization KPI Explainability catalog (Phase 5).
 * Shows formula, inputs, assumptions, cost & benefit components and the
 * calculation walkthrough for each financial / productivity KPI. Mock data.
 */

export const VALUE_REALIZATION_EXPLAINABILITY = [
  {
    keys: ['value-realization.roi', 'roi'],
    id: 'roi',
    name: 'Return on Investment (ROI)',
    suffix: '%',
    description:
      'Net financial return of the AI-enabled SDLC program relative to its total cost, expressed as a percentage.',
    formula: {
      expression: '(Annual Benefits − Annual Cost) ÷ Annual Cost × 100',
      components: [
        { name: 'Annual Benefits', weight: 0, value: 184, note: '₹M (savings + cost avoidance + productivity)' },
        { name: 'Annual Cost', weight: 0, value: 72, note: '₹M (platform + licences + run)' },
      ],
      result: 156,
    },
    dataSources: ['Value Realization engine', 'Finance ledger', 'Productivity telemetry', 'Licence & platform cost'],
    contributingEntities: [
      { name: 'Engineering Productivity', type: 'Benefit', score: 84, note: '₹84M' },
      { name: 'Defect & Rework Avoidance', type: 'Benefit', score: 56, note: '₹56M' },
      { name: 'Compliance Cost Avoidance', type: 'Benefit', score: 44, note: '₹44M' },
      { name: 'Platform & Licence Cost', type: 'Cost', score: 72, note: '₹72M' },
    ],
    traceability: [
      { stage: 'Cost Components', description: 'Platform, licence and run costs aggregated' },
      { stage: 'Benefit Components', description: 'Savings, avoidance and productivity gains quantified' },
      { stage: 'Calculation Engine', description: '(Benefits − Cost) ÷ Cost computed' },
      { stage: 'Executive KPI', description: 'Program ROI surfaced' },
    ],
    aiReasoning: {
      confidence: 87,
      drivers: ['Productivity gains are the largest benefit lever', 'Cost base is flat year-over-year'],
      insights: ['ROI is benefit-driven; sustaining productivity gains protects the headline number.'],
    },
    recommendations: [
      { priority: 'Low', title: 'Lock in productivity gains via adoption playbooks', expectedBenefit: 'Protects 156% ROI', estimatedImpact: 'Ongoing' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 128 },
        { label: 'Feb', value: 137 },
        { label: 'Mar', value: 144 },
        { label: 'Apr', value: 151 },
        { label: 'May', value: 156 },
      ],
      target: 180,
      forecast: { value: 168, horizon: 'Next quarter' },
    },
    assumptions: [
      'Benefits counted only when finance-verified.',
      'Higher is better; target is 180%.',
      'Costs include fully-loaded platform and run.',
    ],
  },
  {
    keys: ['value-realization.roi-annual', 'annual-savings', 'savings', 'value-realization.annual-value', 'annual-value'],
    id: 'annual-savings',
    name: 'Annual Savings',
    suffix: '',
    description:
      'Total verified cost savings realized in the trailing twelve months from automation, rework reduction and licence rationalization.',
    formula: {
      expression: 'Σ (Baseline Cost − Current Cost) across savings streams',
      components: [
        { name: 'Automation Savings', weight: 0, value: 62, note: '₹M' },
        { name: 'Rework Reduction', weight: 0, value: 38, note: '₹M' },
        { name: 'Licence Rationalization', weight: 0, value: 24, note: '₹M' },
      ],
      result: 124,
    },
    dataSources: ['Finance ledger', 'Automation telemetry', 'Licence management'],
    contributingEntities: [
      { name: 'Test Automation', type: 'Stream', score: 62, note: '₹62M' },
      { name: 'Defect Rework Reduction', type: 'Stream', score: 38, note: '₹38M' },
      { name: 'Licence Rationalization', type: 'Stream', score: 24, note: '₹24M' },
    ],
    traceability: [
      { stage: 'Savings Streams', description: 'Each stream baselined against prior-year cost' },
      { stage: 'Finance Verification', description: 'Savings independently reconciled' },
      { stage: 'Executive KPI', description: 'Trailing-12-month savings surfaced' },
    ],
    aiReasoning: {
      confidence: 85,
      drivers: ['Test automation is the dominant savings stream'],
      insights: ['Savings are diversified across three streams, reducing concentration risk.'],
    },
    recommendations: [
      { priority: 'Medium', title: 'Extend automation to integration test suites', expectedBenefit: '+₹18M annualized', estimatedImpact: '2 quarters' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 98 },
        { label: 'Feb', value: 106 },
        { label: 'Mar', value: 113 },
        { label: 'Apr', value: 119 },
        { label: 'May', value: 124 },
      ],
      target: 150,
      forecast: { value: 138, horizon: 'Next quarter' },
    },
    assumptions: ['Values in ₹M.', 'Higher is better; target is ₹150M.'],
  },
  {
    keys: ['value-realization.productivity', 'productivity', 'productivity-gain'],
    id: 'productivity-gain',
    name: 'Productivity Gain',
    suffix: '%',
    description:
      'Improvement in engineering throughput attributable to AI-assisted SDLC, normalized for team size and complexity.',
    formula: {
      expression: '(Current Throughput − Baseline Throughput) ÷ Baseline Throughput × 100',
      components: [
        { name: 'Current Throughput', weight: 0, value: 134, note: 'story points / sprint (indexed)' },
        { name: 'Baseline Throughput', weight: 0, value: 100, note: 'pre-AI baseline (indexed)' },
      ],
      result: 34,
    },
    dataSources: ['Delivery telemetry', 'Copilot adoption logs', 'Sprint analytics'],
    contributingEntities: [
      { name: 'Code Generation Copilot', type: 'Driver', score: 18, note: '+18pp' },
      { name: 'Automated Review', type: 'Driver', score: 9, note: '+9pp' },
      { name: 'Test Generation', type: 'Driver', score: 7, note: '+7pp' },
    ],
    traceability: [
      { stage: 'Baseline', description: 'Pre-AI throughput baselined per team' },
      { stage: 'Telemetry', description: 'Current throughput measured with adoption data' },
      { stage: 'Normalization', description: 'Adjusted for team size and complexity' },
      { stage: 'Executive KPI', description: 'Productivity gain surfaced' },
    ],
    aiReasoning: {
      confidence: 82,
      drivers: ['Code generation is the largest single driver', 'Gains plateau where adoption is below 60%'],
      insights: ['Closing the adoption gap on low-usage teams would extend the gain.'],
    },
    recommendations: [
      { priority: 'Medium', title: 'Targeted enablement for low-adoption teams', expectedBenefit: '34% → 40%', estimatedImpact: '1 quarter' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 65 },
        { label: 'Feb', value: 41 },
        { label: 'Mar', value: 39 },
        { label: 'Apr', value: 97 },
        { label: 'May', value: 45 },
      ],
      target: 45,
      forecast: { value: 39, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 45%.', 'Normalized for team size and complexity.'],
  },
  {
    keys: ['automation', 'automation-gains', 'testing.automation'],
    id: 'automation-gains',
    name: 'Automation Gains',
    suffix: '%',
    description:
      'Share of previously manual SDLC effort now automated across testing, deployment, evidence collection and reviews.',
    formula: {
      expression: 'Automated Effort ÷ Total Automatable Effort × 100',
      components: [
        { name: 'Test Automation', weight: 40, value: 78 },
        { name: 'Deployment Automation', weight: 30, value: 71 },
        { name: 'Evidence Automation', weight: 30, value: 64 },
      ],
      result: 72,
    },
    dataSources: ['CI/CD telemetry', 'Test management', 'Evidence collection logs'],
    contributingEntities: [
      { name: 'Test Automation', type: 'Domain', score: 78 },
      { name: 'Deployment Automation', type: 'Domain', score: 71 },
      { name: 'Evidence Automation', type: 'Domain', score: 64 },
    ],
    traceability: [
      { stage: 'Effort Inventory', description: 'Automatable effort catalogued per domain' },
      { stage: 'Telemetry', description: 'Automated execution measured' },
      { stage: 'Executive KPI', description: 'Weighted automation share surfaced' },
    ],
    aiReasoning: {
      confidence: 83,
      drivers: ['Evidence automation lags the other domains'],
      insights: ['Evidence automation is the clearest remaining headroom.'],
    },
    recommendations: [
      { priority: 'Medium', title: 'Automate audit evidence collection end-to-end', expectedBenefit: '72% → 78%', estimatedImpact: '2 quarters' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 47 },
        { label: 'Feb', value: 82 },
        { label: 'Mar', value: 42 },
        { label: 'Apr', value: 90 },
        { label: 'May', value: 49 },
      ],
      target: 85,
      forecast: { value: 77, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 85%.'],
  },
  {
    keys: ['cost-avoidance', 'value-realization.cost-avoidance'],
    id: 'cost-avoidance',
    name: 'Cost Avoidance',
    suffix: '',
    description:
      'Costs the enterprise did not incur because of AI-enabled prevention — avoided incidents, audit findings and unplanned rework.',
    formula: {
      expression: 'Σ (Avoided Events × Unit Cost) across avoidance categories',
      components: [
        { name: 'Audit Findings Prevented', weight: 0, value: 186, note: 'events' },
        { name: 'Incidents Prevented', weight: 0, value: 42, note: 'events' },
        { name: 'Rework Avoided', weight: 0, value: 310, note: 'defects' },
      ],
      result: 96,
    },
    dataSources: ['Audit center', 'Incident management', 'Quality engine', 'Finance unit-cost model'],
    contributingEntities: [
      { name: 'Audit Findings Prevented', type: 'Category', score: 52, note: '₹52M avoided' },
      { name: 'Incidents Prevented', type: 'Category', score: 28, note: '₹28M avoided' },
      { name: 'Rework Avoided', type: 'Category', score: 16, note: '₹16M avoided' },
    ],
    traceability: [
      { stage: 'Prevention Events', description: 'Prevented events counted per category' },
      { stage: 'Unit Cost Model', description: 'Finance-approved unit costs applied' },
      { stage: 'Executive KPI', description: 'Total cost avoidance surfaced' },
    ],
    aiReasoning: {
      confidence: 80,
      drivers: ['Audit finding prevention is the largest avoidance category'],
      insights: ['Cost avoidance is a defensible, finance-validated complement to hard savings.'],
    },
    recommendations: [
      { priority: 'Low', title: 'Publish unit-cost methodology for audit committee', expectedBenefit: 'Strengthens defensibility', estimatedImpact: 'Documentation' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 91 },
        { label: 'Feb', value: 58 },
        { label: 'Mar', value: 56 },
        { label: 'Apr', value: 62 },
        { label: 'May', value: 83 },
      ],
      target: 120,
      forecast: { value: 108, horizon: 'Next quarter' },
    },
    assumptions: ['Values in ₹M.', 'Higher is better; target is ₹120M.', 'Unit costs are finance-approved.'],
  },
];
