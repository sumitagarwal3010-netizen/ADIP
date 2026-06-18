/**
 * Executive Control Tower KPI Explainability catalog.
 * Top-of-house pillars that roll up the domain KPIs. Mock data.
 */

export const EXECUTIVE_EXPLAINABILITY = [
  {
    keys: ['executive.delivery-health', 'delivery-health', 'ai-sdlc-copilot', 'delivery-confidence-exec'],
    id: 'delivery-health',
    name: 'Delivery Health',
    suffix: '%',
    description:
      'Executive pillar summarizing the health of AI-enabled delivery across the SDLC, blending copilot quality, flow efficiency and delivery confidence.',
    formula: {
      expression: '(Delivery Confidence × 40%) + (Flow Efficiency × 30%) + (Copilot Quality × 30%)',
      components: [
        { name: 'Delivery Confidence', weight: 40, value: 82 },
        { name: 'Flow Efficiency', weight: 30, value: 74 },
        { name: 'Copilot Quality', weight: 30, value: 79 },
      ],
      result: 79,
    },
    dataSources: ['Portfolio Governance', 'Copilot engine', 'Delivery telemetry'],
    contributingEntities: [
      { name: 'Delivery Confidence', type: 'Sub-KPI', score: 82 },
      { name: 'Flow Efficiency', type: 'Sub-KPI', score: 74 },
      { name: 'Copilot Quality', type: 'Sub-KPI', score: 79 },
    ],
    traceability: [
      { stage: 'Domain KPIs', description: 'Delivery, flow and copilot signals computed' },
      { stage: 'Weighted Rollup', description: 'Executive weights applied' },
      { stage: 'Control Tower', description: 'Delivery Health pillar surfaced' },
    ],
    aiReasoning: {
      confidence: 86,
      drivers: ['Flow efficiency is the weakest contributor'],
      insights: ['Delivery Health is solid; flow efficiency is the improvement lever.'],
    },
    recommendations: [
      { priority: 'Medium', title: 'Reduce work-in-progress to lift flow efficiency', expectedBenefit: 'Health 79% → 83%', estimatedImpact: '1 quarter' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 74 },
        { label: 'Feb', value: 76 },
        { label: 'Mar', value: 77 },
        { label: 'Apr', value: 78 },
        { label: 'May', value: 79 },
      ],
      target: 85,
      forecast: { value: 82, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 85%.'],
  },
  {
    keys: ['executive.risk-posture', 'risk-posture', 'risk-score', 'portfolio-governance.risk-exposure', 'risk-exposure', 'application-portfolio.risk-exposure'],
    id: 'risk-posture',
    name: 'Risk Posture',
    suffix: '%',
    description:
      'Enterprise risk index spanning delivery, technology, security and compliance risk. Lower is better.',
    formula: {
      expression: '(Delivery Risk × 25%) + (Technology Risk × 25%) + (Security Risk × 25%) + (Compliance Risk × 25%)',
      components: [
        { name: 'Delivery Risk', weight: 25, value: 38 },
        { name: 'Technology Risk', weight: 25, value: 41 },
        { name: 'Security Risk', weight: 25, value: 46 },
        { name: 'Compliance Risk', weight: 25, value: 39 },
      ],
      result: 41,
    },
    dataSources: ['Enterprise Risk engine', 'Security posture', 'Compliance register', 'Portfolio risk'],
    contributingEntities: [
      { name: 'Security Risk', type: 'Sub-KPI', score: 46, note: 'highest contributor' },
      { name: 'Technology Risk', type: 'Sub-KPI', score: 41 },
      { name: 'Compliance Risk', type: 'Sub-KPI', score: 39 },
      { name: 'Delivery Risk', type: 'Sub-KPI', score: 38 },
    ],
    traceability: [
      { stage: 'Risk Domains', description: 'Four risk domains scored independently' },
      { stage: 'Equal-weighted Blend', description: 'Domains combined per risk policy' },
      { stage: 'Control Tower', description: 'Risk Posture pillar surfaced' },
    ],
    aiReasoning: {
      confidence: 85,
      drivers: ['Security risk is the largest contributor', 'Vulnerability backlog drives security risk'],
      insights: ['Risk posture improves fastest by burning down the security vulnerability backlog.'],
    },
    recommendations: [
      { priority: 'High', title: 'Burn down critical security vulnerability backlog', expectedBenefit: 'Risk 41% → 36%', estimatedImpact: '1 quarter' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 46 },
        { label: 'Feb', value: 44 },
        { label: 'Mar', value: 43 },
        { label: 'Apr', value: 42 },
        { label: 'May', value: 41 },
      ],
      target: 30,
      forecast: { value: 37, horizon: 'Next quarter' },
    },
    assumptions: ['Lower is better; target is below 30%.'],
  },
  {
    keys: ['executive.value-realized', 'value-realized'],
    id: 'value-realized',
    name: 'Value Realized',
    suffix: '%',
    description:
      'Executive pillar tracking the proportion of committed program value that has been realized and finance-verified.',
    formula: {
      expression: '(Benefits Realization × 50%) + (ROI Attainment × 30%) + (Savings Attainment × 20%)',
      components: [
        { name: 'Benefits Realization', weight: 50, value: 67 },
        { name: 'ROI Attainment', weight: 30, value: 87 },
        { name: 'Savings Attainment', weight: 20, value: 83 },
      ],
      result: 76,
    },
    dataSources: ['Value Realization engine', 'Finance ledger', 'Portfolio Governance'],
    contributingEntities: [
      { name: 'Benefits Realization', type: 'Sub-KPI', score: 67 },
      { name: 'ROI Attainment', type: 'Sub-KPI', score: 87 },
      { name: 'Savings Attainment', type: 'Sub-KPI', score: 83 },
    ],
    traceability: [
      { stage: 'Value KPIs', description: 'Benefits, ROI and savings attainment computed' },
      { stage: 'Weighted Rollup', description: 'Executive weights applied' },
      { stage: 'Control Tower', description: 'Value Realized pillar surfaced' },
    ],
    aiReasoning: {
      confidence: 84,
      drivers: ['Benefits realization at 67% caps the pillar despite strong ROI'],
      insights: ['Value Realized is gated by benefits realization, not by ROI or savings.'],
    },
    recommendations: [
      { priority: 'High', title: 'Accelerate lagging benefit streams', expectedBenefit: 'Value 76% → 81%', estimatedImpact: '2 quarters' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 70 },
        { label: 'Feb', value: 72 },
        { label: 'Mar', value: 73 },
        { label: 'Apr', value: 75 },
        { label: 'May', value: 76 },
      ],
      target: 85,
      forecast: { value: 80, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 85%.'],
  },
  {
    keys: ['enterprise-ai-health', 'executive.enterprise-ai-health'],
    id: 'enterprise-ai-health',
    name: 'Enterprise AI Health',
    suffix: '%',
    description:
      'Single rollup of the four executive pillars — Delivery Health, Technology Health, Value Realized and the inverse of Risk Posture.',
    formula: {
      expression: '(Delivery Health × 25%) + (Technology Health × 25%) + (Value Realized × 25%) + ((100 − Risk Posture) × 25%)',
      components: [
        { name: 'Delivery Health', weight: 25, value: 79 },
        { name: 'Technology Health', weight: 25, value: 54 },
        { name: 'Value Realized', weight: 25, value: 76 },
        { name: 'Inverse Risk Posture', weight: 25, value: 59 },
      ],
      result: 67,
    },
    dataSources: ['Executive Control Tower pillars'],
    contributingEntities: [
      { name: 'Delivery Health', type: 'Pillar', score: 79 },
      { name: 'Value Realized', type: 'Pillar', score: 76 },
      { name: 'Risk Posture (inverse)', type: 'Pillar', score: 59 },
      { name: 'Technology Health', type: 'Pillar', score: 54 },
    ],
    traceability: [
      { stage: 'Four Pillars', description: 'Delivery, Technology, Value and Risk pillars computed' },
      { stage: 'Equal-weighted Rollup', description: 'Pillars blended into a single index' },
      { stage: 'Control Tower', description: 'Enterprise AI Health surfaced as the headline' },
    ],
    aiReasoning: {
      confidence: 86,
      drivers: ['Technology Health is the lowest pillar and the binding constraint'],
      insights: ['Lifting Technology Health has the highest marginal impact on the enterprise headline.'],
    },
    recommendations: [
      { priority: 'High', title: 'Prioritize technology modernization & cloud', expectedBenefit: 'Enterprise 67% → 72%', estimatedImpact: '2 quarters' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 62 },
        { label: 'Feb', value: 63 },
        { label: 'Mar', value: 65 },
        { label: 'Apr', value: 66 },
        { label: 'May', value: 67 },
      ],
      target: 80,
      forecast: { value: 71, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 80%.'],
  },
];
