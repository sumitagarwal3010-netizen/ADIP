/**
 * AI Governance KPI Explainability catalog (Phase 4).
 * For every AI score we expose prompt inputs, evaluation dataset, model used,
 * scoring logic, risk drivers and recommendations. Illustrative mock data.
 */

export const AI_GOVERNANCE_EXPLAINABILITY = [
  {
    keys: ['ai-explainability', 'ai-governance.explainability', 'ai-evaluation.explainability', 'explainability'],
    id: 'ai-explainability',
    name: 'AI Explainability',
    suffix: '%',
    description:
      'Degree to which model outputs across the AI estate can be explained, attributed and defended — combining feature attribution coverage, rationale completeness and human-review traceability.',
    formula: {
      expression: '(Attribution Coverage × 40%) + (Rationale Completeness × 35%) + (Review Traceability × 25%)',
      components: [
        { name: 'Attribution Coverage', weight: 40, value: 81, note: '% outputs with feature attribution' },
        { name: 'Rationale Completeness', weight: 35, value: 76, note: '% with complete rationale' },
        { name: 'Review Traceability', weight: 25, value: 74, note: '% with human-review trail' },
      ],
      result: 78,
    },
    dataSources: ['Model registry', 'Evaluation harness', 'Prompt registry', 'Human review logs'],
    contributingEntities: [
      { name: 'Requirement Copilot', type: 'Model', score: 86, note: 'GPT-class, full attribution' },
      { name: 'Fraud Scoring Model', type: 'Model', score: 72, note: 'gradient-boosted, partial rationale' },
      { name: 'Doc Summarizer', type: 'Model', score: 68, note: 'limited review trail' },
    ],
    traceability: [
      { stage: 'Prompt Inputs', description: 'Prompts and context windows captured in registry' },
      { stage: 'Evaluation Dataset', description: 'Curated explainability eval set (1,240 cases)' },
      { stage: 'Model Used', description: 'Per-model scoring against attribution rubric' },
      { stage: 'Scoring Logic', description: 'Weighted attribution + rationale + traceability' },
      { stage: 'Executive KPI', description: 'Estate explainability index surfaced' },
    ],
    aiReasoning: {
      confidence: 88,
      drivers: [
        'Doc Summarizer lacks a complete human-review trail',
        'Fraud model attribution is partial for edge cases',
        '19% of outputs still lack full rationale capture',
      ],
      insights: ['Explainability is strongest on language copilots and weakest on legacy scoring models.'],
    },
    recommendations: [
      { priority: 'High', title: 'Enable rationale capture on Doc Summarizer', expectedBenefit: '78% → 83%', estimatedImpact: '1 sprint' },
      { priority: 'Medium', title: 'Add SHAP attribution to fraud model edge cases', expectedBenefit: 'Closes attribution gap', estimatedImpact: '2 sprints' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 44 },
        { label: 'Feb', value: 61 },
        { label: 'Mar', value: 40 },
        { label: 'Apr', value: 97 },
        { label: 'May', value: 82 },
      ],
      target: 90,
      forecast: { value: 83, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 90%.', 'Evaluation dataset refreshed monthly.'],
  },
  {
    keys: ['model-risk', 'ai-governance.model-risk'],
    id: 'model-risk',
    name: 'Model Risk',
    suffix: '%',
    description:
      'Aggregate risk posed by deployed models, weighting materiality, drift, validation currency and control coverage.',
    formula: {
      expression: '(Materiality × 30%) + (Drift × 25%) + (Validation Staleness × 25%) + (Control Gaps × 20%)',
      components: [
        { name: 'Materiality', weight: 30, value: 52 },
        { name: 'Drift', weight: 25, value: 41 },
        { name: 'Validation Staleness', weight: 25, value: 33 },
        { name: 'Control Gaps', weight: 20, value: 30 },
      ],
      result: 41,
    },
    dataSources: ['Model inventory', 'Drift monitors', 'Validation calendar', 'AI control register'],
    contributingEntities: [
      { name: 'Fraud Scoring Model', type: 'Model', score: 74, note: 'high materiality, drift detected' },
      { name: 'Credit Decisioning', type: 'Model', score: 58, note: 'validation due' },
      { name: 'Churn Predictor', type: 'Model', score: 22, note: 'low materiality' },
    ],
    traceability: [
      { stage: 'Model Inventory', description: 'All production models registered with materiality' },
      { stage: 'Drift Monitors', description: 'Population & performance drift tracked' },
      { stage: 'Validation Calendar', description: 'Independent validation currency assessed' },
      { stage: 'Scoring Logic', description: 'Weighted risk model applied' },
      { stage: 'Executive KPI', description: 'Estate model-risk index surfaced' },
    ],
    aiReasoning: {
      confidence: 85,
      drivers: ['Fraud model drift exceeds threshold', 'Credit decisioning validation is overdue'],
      insights: ['Risk is concentrated in two high-materiality models; both have clear remediation paths.'],
    },
    recommendations: [
      { priority: 'High', title: 'Re-train & re-validate fraud scoring model', expectedBenefit: 'Risk 41% → 34%', estimatedImpact: '1 quarter' },
      { priority: 'High', title: 'Schedule overdue credit decisioning validation', expectedBenefit: 'Removes staleness penalty', estimatedImpact: '3 weeks' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 56 },
        { label: 'Feb', value: 40 },
        { label: 'Mar', value: 66 },
        { label: 'Apr', value: 81 },
        { label: 'May', value: 61 },
      ],
      target: 30,
      forecast: { value: 36, horizon: 'Next quarter' },
    },
    assumptions: ['Lower is better; target is below 30%.'],
  },
  {
    keys: ['bias', 'ai-governance.bias', 'fairness'],
    id: 'bias',
    name: 'Bias / Fairness',
    suffix: '%',
    description:
      'Fairness index measuring disparity in model outcomes across protected cohorts; higher means fairer (less disparity).',
    formula: {
      expression: '100 − (Max Cohort Disparity across evaluated segments)',
      components: [
        { name: 'Gender Disparity', weight: 0, value: 6 },
        { name: 'Geography Disparity', weight: 0, value: 11 },
        { name: 'Age-band Disparity', weight: 0, value: 9 },
      ],
      result: 89,
    },
    dataSources: ['Fairness evaluation harness', 'Cohort-labelled eval dataset', 'Model registry'],
    contributingEntities: [
      { name: 'Credit Decisioning', type: 'Model', score: 84, note: 'geography disparity 11%' },
      { name: 'Fraud Scoring Model', type: 'Model', score: 91 },
      { name: 'Marketing Propensity', type: 'Model', score: 92 },
    ],
    traceability: [
      { stage: 'Evaluation Dataset', description: 'Cohort-labelled fairness test set' },
      { stage: 'Disparity Metrics', description: 'Demographic parity & equal opportunity computed' },
      { stage: 'Scoring Logic', description: 'Worst-case cohort disparity inverted to a fairness score' },
      { stage: 'Executive KPI', description: 'Estate fairness index surfaced' },
    ],
    aiReasoning: {
      confidence: 83,
      drivers: ['Credit decisioning shows 11% geographic disparity'],
      insights: ['Overall fairness is strong; one model needs a geographic re-weighting review.'],
    },
    recommendations: [
      { priority: 'Medium', title: 'Re-weight credit model for geographic parity', expectedBenefit: 'Fairness 89% → 93%', estimatedImpact: '2 sprints' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 60 },
        { label: 'Feb', value: 82 },
        { label: 'Mar', value: 39 },
        { label: 'Apr', value: 97 },
        { label: 'May', value: 69 },
      ],
      target: 95,
      forecast: { value: 91, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 95%.'],
  },
  {
    keys: ['ai-evaluation.hallucination', 'hallucination', 'hallucination-score', 'ai-governance.hallucination'],
    id: 'hallucination',
    name: 'Hallucination Score',
    suffix: '%',
    description:
      'Rate at which generative outputs contain unsupported or fabricated claims, measured against a grounded reference dataset. Lower is better.',
    formula: {
      expression: 'Unsupported Claims ÷ Total Evaluated Claims × 100',
      components: [
        { name: 'Unsupported Claims', weight: 0, value: 47 },
        { name: 'Total Evaluated Claims', weight: 0, value: 1240 },
      ],
      result: 4,
    },
    dataSources: ['Grounded reference dataset', 'Evaluation harness', 'Prompt registry'],
    contributingEntities: [
      { name: 'Doc Summarizer', type: 'Model', score: 7, note: 'highest hallucination rate' },
      { name: 'Requirement Copilot', type: 'Model', score: 3 },
      { name: 'Knowledge Assistant', type: 'Model', score: 2 },
    ],
    traceability: [
      { stage: 'Prompt Inputs', description: 'Evaluation prompts drawn from production patterns' },
      { stage: 'Evaluation Dataset', description: '1,240 grounded claim references' },
      { stage: 'Scoring Logic', description: 'Claim-level grounding verification' },
      { stage: 'Executive KPI', description: 'Estate hallucination rate surfaced' },
    ],
    aiReasoning: {
      confidence: 86,
      drivers: ['Doc Summarizer accounts for 60% of unsupported claims'],
      insights: ['Retrieval grounding on the summarizer would materially cut the estate rate.'],
    },
    recommendations: [
      { priority: 'High', title: 'Add retrieval grounding to Doc Summarizer', expectedBenefit: '4% → 2.5%', estimatedImpact: '2 sprints' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 17 },
        { label: 'Feb', value: 45 },
        { label: 'Mar', value: 32 },
        { label: 'Apr', value: 39 },
        { label: 'May', value: 62 },
      ],
      target: 2,
      forecast: { value: 3, horizon: 'Next quarter' },
    },
    assumptions: ['Lower is better; target is below 2%.'],
  },
  {
    keys: ['ai-compliance', 'ai-governance.compliance', 'evaluation-score', 'ai-evaluation.score', 'prompt-risk', 'ai-governance.prompt-risk'],
    id: 'ai-compliance',
    name: 'AI Compliance & Evaluation',
    suffix: '%',
    description:
      'Adherence of the AI estate to policy controls and evaluation gates, combining control coverage, evaluation pass rate and prompt-risk screening.',
    formula: {
      expression: '(Control Coverage × 40%) + (Evaluation Pass Rate × 40%) + ((100 − Prompt Risk) × 20%)',
      components: [
        { name: 'Control Coverage', weight: 40, value: 88 },
        { name: 'Evaluation Pass Rate', weight: 40, value: 84 },
        { name: 'Inverse Prompt Risk', weight: 20, value: 79 },
      ],
      result: 85,
    },
    dataSources: ['AI control register', 'Evaluation harness', 'Prompt registry', 'Policy catalog'],
    contributingEntities: [
      { name: 'Control Coverage', type: 'Sub-KPI', score: 88 },
      { name: 'Evaluation Pass Rate', type: 'Sub-KPI', score: 84 },
      { name: 'Prompt Risk (inverse)', type: 'Sub-KPI', score: 79 },
    ],
    traceability: [
      { stage: 'Policy Catalog', description: 'Mandated AI controls and gates published' },
      { stage: 'Control & Eval Engine', description: 'Coverage and pass rates measured' },
      { stage: 'Prompt Registry', description: 'Prompt-risk screening applied' },
      { stage: 'Executive KPI', description: 'AI compliance index surfaced' },
    ],
    aiReasoning: {
      confidence: 84,
      drivers: ['Prompt risk is the weakest contributor', '16% of evaluations did not pass on first run'],
      insights: ['Tightening prompt-risk screening yields the largest compliance uplift.'],
    },
    recommendations: [
      { priority: 'Medium', title: 'Expand prompt-risk screening to all copilots', expectedBenefit: 'Compliance 85% → 89%', estimatedImpact: '1 quarter' },
    ],
    trends: {
      monthly: [
        { label: 'Jan', value: 83 },
        { label: 'Feb', value: 59 },
        { label: 'Mar', value: 57 },
        { label: 'Apr', value: 97 },
        { label: 'May', value: 63 },
      ],
      target: 95,
      forecast: { value: 88, horizon: 'Next quarter' },
    },
    assumptions: ['Higher is better; target is 95%.'],
  },
];
