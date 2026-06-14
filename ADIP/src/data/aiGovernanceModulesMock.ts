export interface ModelInventoryEntry {
  id: string;
  name: string;
  vendor: string;
  version: string;
  owner: string;
  riskRating: 'high' | 'medium' | 'low';
  status: 'Approved' | 'In Review' | 'Draft';
}

export interface AIRiskEntry {
  id: string;
  useCase: string;
  riskType: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  status: 'Open' | 'Mitigated' | 'Monitoring';
  riskScore: number;
}

export interface PromptGovernanceEntry {
  id: string;
  name: string;
  application: string;
  owner: string;
  lastReviewed: string;
  status: 'Approved' | 'Under Review' | 'Rejected';
}

export const MODEL_INVENTORY: ModelInventoryEntry[] = [
  { id: 'MDL-001', name: 'Fraud Detection Model', vendor: 'Internal ML Platform', version: 'v3.2.1', owner: 'Payments Risk', riskRating: 'high', status: 'Approved' },
  { id: 'MDL-002', name: 'Credit Scoring Model', vendor: 'Experian AI Suite', version: 'v5.1.0', owner: 'Retail Credit', riskRating: 'high', status: 'Approved' },
  { id: 'MDL-003', name: 'Customer Service Copilot', vendor: 'Azure OpenAI', version: 'gpt-4o-2026-04', owner: 'Digital CX', riskRating: 'medium', status: 'In Review' },
  { id: 'MDL-004', name: 'Transaction Anomaly Detection', vendor: 'Internal ML Platform', version: 'v2.8.4', owner: 'Financial Crime', riskRating: 'high', status: 'Approved' },
  { id: 'MDL-005', name: 'Document Classification', vendor: 'Google Document AI', version: 'v1.9.2', owner: 'Operations Automation', riskRating: 'medium', status: 'Approved' },
  { id: 'MDL-006', name: 'KYC Verification AI', vendor: 'Onfido Identity', version: 'v4.3.0', owner: 'Compliance', riskRating: 'high', status: 'In Review' },
  { id: 'MDL-007', name: 'Collections Assistant', vendor: 'Azure OpenAI', version: 'gpt-4o-mini-2026-03', owner: 'Collections', riskRating: 'medium', status: 'Approved' },
  { id: 'MDL-008', name: 'Risk Prediction Engine', vendor: 'Internal ML Platform', version: 'v6.0.2', owner: 'Enterprise Risk', riskRating: 'high', status: 'Approved' },
  { id: 'MDL-009', name: 'Compliance Monitoring AI', vendor: 'Palantir Foundry', version: 'v2.1.5', owner: 'Regulatory Affairs', riskRating: 'high', status: 'Draft' },
  { id: 'MDL-010', name: 'Merchant Recommendation Engine', vendor: 'AWS SageMaker', version: 'v1.4.7', owner: 'Merchant Banking', riskRating: 'low', status: 'Approved' },
];

export const AI_RISKS: AIRiskEntry[] = [
  { id: 'AIR-001', useCase: 'Credit Scoring Model', riskType: 'Bias', severity: 'critical', owner: 'Retail Credit', status: 'Open', riskScore: 92 },
  { id: 'AIR-002', useCase: 'Customer Service Copilot', riskType: 'Hallucination', severity: 'high', owner: 'Digital CX', status: 'Open', riskScore: 78 },
  { id: 'AIR-003', useCase: 'Customer Service Copilot', riskType: 'Data Leakage', severity: 'critical', owner: 'Information Security', status: 'Monitoring', riskScore: 88 },
  { id: 'AIR-004', useCase: 'Collections Assistant', riskType: 'Prompt Injection', severity: 'high', owner: 'Collections', status: 'Open', riskScore: 74 },
  { id: 'AIR-005', useCase: 'Fraud Detection Model', riskType: 'Model Drift', severity: 'medium', owner: 'Payments Risk', status: 'Mitigated', riskScore: 45 },
  { id: 'AIR-006', useCase: 'KYC Verification AI', riskType: 'Unauthorized Access', severity: 'critical', owner: 'Compliance', status: 'Open', riskScore: 95 },
  { id: 'AIR-007', useCase: 'Compliance Monitoring AI', riskType: 'Regulatory Noncompliance', severity: 'high', owner: 'Regulatory Affairs', status: 'Monitoring', riskScore: 71 },
  { id: 'AIR-008', useCase: 'Transaction Anomaly Detection', riskType: 'Model Drift', severity: 'medium', owner: 'Financial Crime', status: 'Mitigated', riskScore: 38 },
  { id: 'AIR-009', useCase: 'Document Classification', riskType: 'Data Leakage', severity: 'high', owner: 'Operations Automation', status: 'Mitigated', riskScore: 52 },
  { id: 'AIR-010', useCase: 'Merchant Recommendation Engine', riskType: 'Bias', severity: 'low', owner: 'Merchant Banking', status: 'Mitigated', riskScore: 28 },
];

export const PROMPT_REGISTRY: PromptGovernanceEntry[] = [
  { id: 'PRM-001', name: 'Account Balance Inquiry', application: 'Net Banking', owner: 'Digital CX', lastReviewed: 'May 28, 2026', status: 'Approved' },
  { id: 'PRM-002', name: 'Mobile Transfer Assistant', application: 'Mobile Banking', owner: 'Mobile Engineering', lastReviewed: 'Jun 2, 2026', status: 'Approved' },
  { id: 'PRM-003', name: 'UPI Dispute Resolution', application: 'Payments', owner: 'Payments Ops', lastReviewed: 'May 15, 2026', status: 'Under Review' },
  { id: 'PRM-004', name: 'Fraud Alert Triage', application: 'Fraud Monitoring', owner: 'Payments Risk', lastReviewed: 'Jun 1, 2026', status: 'Approved' },
  { id: 'PRM-005', name: 'Customer Complaint Handler', application: 'Customer Service', owner: 'Contact Center', lastReviewed: 'May 20, 2026', status: 'Approved' },
  { id: 'PRM-006', name: 'Loan Eligibility Explainer', application: 'Net Banking', owner: 'Retail Credit', lastReviewed: 'Apr 30, 2026', status: 'Under Review' },
  { id: 'PRM-007', name: 'Card Block Confirmation', application: 'Mobile Banking', owner: 'Card Services', lastReviewed: 'May 10, 2026', status: 'Approved' },
  { id: 'PRM-008', name: 'Suspicious Transaction Summary', application: 'Fraud Monitoring', owner: 'Financial Crime', lastReviewed: 'May 25, 2026', status: 'Rejected' },
  { id: 'PRM-009', name: 'NEFT/RTGS Status Lookup', application: 'Payments', owner: 'Payments Ops', lastReviewed: 'Jun 3, 2026', status: 'Approved' },
  { id: 'PRM-010', name: 'Collections Payment Reminder', application: 'Customer Service', owner: 'Collections', lastReviewed: 'May 5, 2026', status: 'Rejected' },
];

export function computeModelInventoryKpis(models: ModelInventoryEntry[]) {
  return {
    total: models.length,
    approved: models.filter((m) => m.status === 'Approved').length,
    inReview: models.filter((m) => m.status === 'In Review').length,
    highRisk: models.filter((m) => m.riskRating === 'high').length,
  };
}

export function computeAIRiskKpis(risks: AIRiskEntry[]) {
  const open = risks.filter((r) => r.status === 'Open');
  const mitigated = risks.filter((r) => r.status === 'Mitigated');
  const critical = risks.filter((r) => r.severity === 'critical');
  const avgScore = risks.length
    ? Math.round(risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length)
    : 0;
  return {
    open: open.length,
    critical: critical.length,
    mitigated: mitigated.length,
    avgScore,
  };
}

export function computePromptGovernanceKpis(prompts: PromptGovernanceEntry[]) {
  const approved = prompts.filter((p) => p.status === 'Approved').length;
  const underReview = prompts.filter((p) => p.status === 'Under Review').length;
  const rejected = prompts.filter((p) => p.status === 'Rejected').length;
  const complianceScore = prompts.length
    ? Math.round((approved / prompts.length) * 100)
    : 0;
  return { approved, underReview, rejected, complianceScore };
}

export type AIControlDomain = 'Human Review' | 'Model Monitoring' | 'Prompt Safety' | 'Regulatory' | 'General';
export type AIControlTestResult = 'Effective' | 'Failed' | 'Exception';

export interface AIControlEntry {
  id: string;
  name: string;
  controlType: 'Preventive' | 'Detective' | 'Technical';
  controlDomain: AIControlDomain;
  testResult: AIControlTestResult;
  owner: string;
  coverage: number;
  status: 'Active' | 'Gap Identified' | 'Under Review';
  requiresHumanReview: boolean;
  lastTested: string;
  linkedUseCase: string;
}

export type AIIncidentCategory = 'model' | 'prompt' | 'regulatory' | 'general';

export interface AIIncidentEntry {
  id: string;
  incidentType: string;
  application: string;
  category: AIIncidentCategory;
  regulatory: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  status: 'Open' | 'Resolved' | 'Monitoring';
  mttrHours: number;
  resolvedThisMonth: boolean;
  rootCause: string;
  impact: string;
  correctiveAction: string;
  preventiveAction: string;
}

export interface AIIncidentRcaHighlight {
  incidentId: string;
  incident: string;
  rootCause: string;
  impact: string;
  correctiveAction: string;
  preventiveAction: string;
  owner: string;
}

export const AI_CONTROLS: AIControlEntry[] = [
  { id: 'CTRL-001', name: 'Human Approval for High-Risk AI Decisions', controlType: 'Preventive', controlDomain: 'Human Review', testResult: 'Effective', owner: 'Enterprise Risk', coverage: 95, status: 'Active', requiresHumanReview: true, lastTested: 'Jun 4, 2026', linkedUseCase: 'Credit Scoring Model' },
  { id: 'CTRL-002', name: 'PII Masking Before LLM Processing', controlType: 'Technical', controlDomain: 'Prompt Safety', testResult: 'Effective', owner: 'Information Security', coverage: 88, status: 'Active', requiresHumanReview: false, lastTested: 'Jun 3, 2026', linkedUseCase: 'Customer Service Copilot' },
  { id: 'CTRL-003', name: 'Prompt Injection Detection', controlType: 'Detective', controlDomain: 'Prompt Safety', testResult: 'Effective', owner: 'Digital CX', coverage: 92, status: 'Active', requiresHumanReview: false, lastTested: 'Jun 5, 2026', linkedUseCase: 'Collections Assistant' },
  { id: 'CTRL-004', name: 'Output Validation Guardrail', controlType: 'Technical', controlDomain: 'Prompt Safety', testResult: 'Exception', owner: 'Digital CX', coverage: 78, status: 'Gap Identified', requiresHumanReview: true, lastTested: 'Jun 1, 2026', linkedUseCase: 'Customer Service Copilot' },
  { id: 'CTRL-005', name: 'Bias Review Control', controlType: 'Preventive', controlDomain: 'Human Review', testResult: 'Effective', owner: 'Retail Credit', coverage: 85, status: 'Active', requiresHumanReview: true, lastTested: 'May 30, 2026', linkedUseCase: 'Credit Scoring Model' },
  { id: 'CTRL-006', name: 'Model Drift Monitoring', controlType: 'Detective', controlDomain: 'Model Monitoring', testResult: 'Effective', owner: 'Payments Risk', coverage: 94, status: 'Active', requiresHumanReview: false, lastTested: 'Jun 5, 2026', linkedUseCase: 'Fraud Detection Model' },
  { id: 'CTRL-007', name: 'Model Performance Threshold Alerting', controlType: 'Detective', controlDomain: 'Model Monitoring', testResult: 'Failed', owner: 'Retail Credit', coverage: 71, status: 'Gap Identified', requiresHumanReview: false, lastTested: 'May 28, 2026', linkedUseCase: 'Credit Scoring Model' },
  { id: 'CTRL-008', name: 'Regulatory Disclosure Control', controlType: 'Preventive', controlDomain: 'Regulatory', testResult: 'Effective', owner: 'Regulatory Affairs', coverage: 90, status: 'Active', requiresHumanReview: false, lastTested: 'Jun 2, 2026', linkedUseCase: 'Compliance Monitoring AI' },
  { id: 'CTRL-009', name: 'RBI AI Circular Compliance Mapping', controlType: 'Preventive', controlDomain: 'Regulatory', testResult: 'Effective', owner: 'Compliance', coverage: 87, status: 'Active', requiresHumanReview: true, lastTested: 'Jun 4, 2026', linkedUseCase: 'KYC Verification AI' },
  { id: 'CTRL-010', name: 'Model Access Control', controlType: 'Technical', controlDomain: 'Model Monitoring', testResult: 'Effective', owner: 'Platform Engineering', coverage: 96, status: 'Active', requiresHumanReview: false, lastTested: 'Jun 5, 2026', linkedUseCase: 'Transaction Anomaly Detection' },
  { id: 'CTRL-011', name: 'Data Residency Control', controlType: 'Technical', controlDomain: 'Regulatory', testResult: 'Exception', owner: 'Compliance', coverage: 72, status: 'Under Review', requiresHumanReview: true, lastTested: 'May 25, 2026', linkedUseCase: 'Document Classification' },
  { id: 'CTRL-012', name: 'GenAI Response Human Escalation', controlType: 'Preventive', controlDomain: 'Human Review', testResult: 'Effective', owner: 'Contact Center', coverage: 91, status: 'Active', requiresHumanReview: true, lastTested: 'Jun 3, 2026', linkedUseCase: 'Customer Service Copilot' },
];

export const AI_INCIDENTS: AIIncidentEntry[] = [
  { id: 'AINC-001', incidentType: 'Hallucinated Customer Response', application: 'Customer Service Copilot', category: 'prompt', regulatory: false, severity: 'high', owner: 'Digital CX', status: 'Open', mttrHours: 0, resolvedThisMonth: false, rootCause: 'Insufficient output validation on policy-sensitive queries', impact: 'Incorrect fee waiver guidance provided to 3 customers', correctiveAction: 'Tightened guardrail rules and rolled back prompt v2.3', preventiveAction: 'Mandatory human review for policy advisory prompts' },
  { id: 'AINC-002', incidentType: 'Prompt Injection Attempt', application: 'Collections Assistant', category: 'prompt', regulatory: false, severity: 'critical', owner: 'Collections', status: 'Resolved', mttrHours: 4, resolvedThisMonth: true, rootCause: 'Adversarial payload in uploaded document bypassed initial filter', impact: 'Blocked before customer data exposure; 0 records leaked', correctiveAction: 'Updated injection detection patterns and blocked file type', preventiveAction: 'Weekly red-team prompt injection tests' },
  { id: 'AINC-003', incidentType: 'PII Exposure Blocked', application: 'Customer Service Copilot', category: 'regulatory', regulatory: true, severity: 'high', owner: 'Information Security', status: 'Resolved', mttrHours: 2, resolvedThisMonth: true, rootCause: 'Debug trace logging enabled in UAT config propagated to SIT', impact: 'PII masked before egress; regulatory notification not required', correctiveAction: 'Disabled debug traces and purged log buffers', preventiveAction: 'Config drift detection on LLM pipeline' },
  { id: 'AINC-004', incidentType: 'Incorrect Fraud Recommendation', application: 'Fraud Detection Model', category: 'model', regulatory: true, severity: 'critical', owner: 'Payments Risk', status: 'Open', mttrHours: 0, resolvedThisMonth: false, rootCause: 'Feature store lag caused stale merchant risk scores', impact: '142 false positives; 18 merchants temporarily blocked', correctiveAction: 'Rolled back model v3.2.1 to v3.1.9 champion', preventiveAction: 'Real-time feature freshness SLA monitoring' },
  { id: 'AINC-005', incidentType: 'Model Drift Alert', application: 'Credit Scoring Model', category: 'model', regulatory: false, severity: 'medium', owner: 'Retail Credit', status: 'Monitoring', mttrHours: 18, resolvedThisMonth: false, rootCause: 'Shift in applicant demographics post product launch', impact: 'Approval rate variance +4.2% vs baseline', correctiveAction: 'Triggered champion-challenger revalidation', preventiveAction: 'Monthly population stability index review' },
  { id: 'AINC-006', incidentType: 'Unauthorized Prompt Change', application: 'Mobile Banking', category: 'prompt', regulatory: false, severity: 'critical', owner: 'Mobile Engineering', status: 'Open', mttrHours: 0, resolvedThisMonth: false, rootCause: 'Prompt registry bypass via direct config push', impact: 'Unapproved prompt served for 47 minutes to 1.2K sessions', correctiveAction: 'Reverted prompt and enforced registry-only deployment', preventiveAction: 'CI gate requiring prompt governance sign-off' },
  { id: 'AINC-007', incidentType: 'Bias Alert in Credit Scoring', application: 'Net Banking', category: 'model', regulatory: true, severity: 'high', owner: 'Retail Credit', status: 'Resolved', mttrHours: 12, resolvedThisMonth: true, rootCause: 'Training data under-represented thin-file applicants', impact: 'Disparate impact ratio below internal threshold for one segment', correctiveAction: 'Retrained with rebalanced sample and fairness constraints', preventiveAction: 'Quarterly fairness audit across protected classes' },
  { id: 'AINC-008', incidentType: 'LLM Timeout in Customer Service Copilot', application: 'Customer Service', category: 'prompt', regulatory: false, severity: 'medium', owner: 'Digital CX', status: 'Resolved', mttrHours: 6, resolvedThisMonth: true, rootCause: 'Token limit exceeded on multi-turn conversation context', impact: '12% session fallback to IVR during peak hour', correctiveAction: 'Context window truncation and caching optimization', preventiveAction: 'Load test with 95th percentile conversation length' },
  { id: 'AINC-009', incidentType: 'NPCI Reporting Gap on AI Decision Log', application: 'UPI Fraud Detection', category: 'regulatory', regulatory: true, severity: 'high', owner: 'Regulatory Affairs', status: 'Open', mttrHours: 0, resolvedThisMonth: false, rootCause: 'Audit log retention policy not aligned to NPCI circular', impact: 'Potential regulatory observation on AI decision traceability', correctiveAction: 'Extended log retention to 7 years with immutable store', preventiveAction: 'Map all AI controls to regulatory evidence requirements' },
  { id: 'AINC-010', incidentType: 'Sanctions Screening Model Timeout', application: 'AML Transaction Monitoring', category: 'model', regulatory: true, severity: 'critical', owner: 'Financial Crime', status: 'Monitoring', mttrHours: 8, resolvedThisMonth: false, rootCause: 'Batch scoring queue saturation during EOD peak', impact: 'Delayed screening for 0.3% of transactions (auto-held)', correctiveAction: 'Scaled inference pods and prioritized real-time queue', preventiveAction: 'Capacity planning tied to settlement calendar' },
];

export const AI_CONTROLS_TREND = [
  { month: 'Jan', coverage: 82, effective: 7, exceptions: 2 },
  { month: 'Feb', coverage: 84, effective: 8, exceptions: 2 },
  { month: 'Mar', coverage: 86, effective: 8, exceptions: 1 },
  { month: 'Apr', coverage: 87, effective: 9, exceptions: 2 },
  { month: 'May', coverage: 88, effective: 9, exceptions: 2 },
  { month: 'Jun', coverage: 89, effective: 10, exceptions: 2 },
];

export const AI_INCIDENTS_TREND = [
  { day: 'Mon', open: 5, closed: 2 },
  { day: 'Tue', open: 4, closed: 3 },
  { day: 'Wed', open: 6, closed: 1 },
  { day: 'Thu', open: 4, closed: 4 },
  { day: 'Fri', open: 3, closed: 3 },
  { day: 'Sat', open: 2, closed: 1 },
  { day: 'Sun', open: 4, closed: 2 },
];

export const AI_INCIDENT_RCA_HIGHLIGHTS: AIIncidentRcaHighlight[] = [
  {
    incidentId: 'AINC-004',
    incident: 'Incorrect Fraud Recommendation',
    rootCause: 'Feature store lag caused stale merchant risk scores',
    impact: '142 false positives; 18 merchants temporarily blocked',
    correctiveAction: 'Rolled back model v3.2.1 to v3.1.9 champion',
    preventiveAction: 'Real-time feature freshness SLA monitoring',
    owner: 'Payments Risk',
  },
  {
    incidentId: 'AINC-006',
    incident: 'Unauthorized Prompt Change',
    rootCause: 'Prompt registry bypass via direct config push',
    impact: 'Unapproved prompt served for 47 minutes to 1.2K sessions',
    correctiveAction: 'Reverted prompt and enforced registry-only deployment',
    preventiveAction: 'CI gate requiring prompt governance sign-off',
    owner: 'Mobile Engineering',
  },
  {
    incidentId: 'AINC-009',
    incident: 'NPCI Reporting Gap on AI Decision Log',
    rootCause: 'Audit log retention policy not aligned to NPCI circular',
    impact: 'Potential regulatory observation on AI decision traceability',
    correctiveAction: 'Extended log retention to 7 years with immutable store',
    preventiveAction: 'Map all AI controls to regulatory evidence requirements',
    owner: 'Regulatory Affairs',
  },
];

export const AI_CONTROLS_EXEC_SUMMARY =
  'Overall AI control posture is stable at 89% coverage with 10 of 12 controls effective. Coverage improved 7 points since January. Regulatory controls are audit-ready; prompt safety remains the highest-risk area due to output validation exceptions. Recommended executive action: approve accelerated remediation of CTRL-004 and CTRL-007 before Q3 RBI inspection window.';

export const AI_INCIDENTS_EXEC_SUMMARY =
  'AI incident posture shows 4 open incidents including 2 critical model and prompt failures. Critical incident volume is down from last month but regulatory exposure increased with NPCI decision-log gap. Mean resolution time for closed incidents is 7 hours. Recommended executive action: convene AI war-room for AINC-004 and AINC-009 and mandate registry-only prompt deployments.';

export function computeAIControlsKpis(controls: AIControlEntry[]) {
  const active = controls.filter((c) => c.status === 'Active').length;
  const gaps = controls.filter((c) => c.status === 'Gap Identified').length;
  const humanReviews = controls.filter((c) => c.requiresHumanReview).length;
  const guardrailCoverage = controls.length
    ? Math.round(controls.reduce((sum, c) => sum + c.coverage, 0) / controls.length)
    : 0;
  return { active, gaps, humanReviews, guardrailCoverage };
}

export function computeAIControlsDashboardKpis(controls: AIControlEntry[]) {
  const controlCoverage = controls.length
    ? Math.round(controls.reduce((sum, c) => sum + c.coverage, 0) / controls.length)
    : 0;
  return {
    controlCoverage,
    effectiveControls: controls.filter((c) => c.testResult === 'Effective').length,
    failedControls: controls.filter((c) => c.testResult === 'Failed').length,
    controlExceptions: controls.filter((c) => c.testResult === 'Exception').length,
    humanReviewControls: controls.filter((c) => c.controlDomain === 'Human Review').length,
    modelMonitoringControls: controls.filter((c) => c.controlDomain === 'Model Monitoring').length,
    promptSafetyControls: controls.filter((c) => c.controlDomain === 'Prompt Safety').length,
    regulatoryControls: controls.filter((c) => c.controlDomain === 'Regulatory').length,
  };
}

export function computeAIIncidentsKpis(incidents: AIIncidentEntry[]) {
  const open = incidents.filter((i) => i.status === 'Open').length;
  const resolvedThisMonth = incidents.filter((i) => i.resolvedThisMonth).length;
  const critical = incidents.filter((i) => i.severity === 'critical').length;
  const resolved = incidents.filter((i) => i.status === 'Resolved');
  const avgMttr = resolved.length
    ? Math.round(resolved.reduce((sum, i) => sum + i.mttrHours, 0) / resolved.length)
    : 0;
  return { open, resolvedThisMonth, critical, avgMttr };
}

export function computeAIIncidentsDashboardKpis(incidents: AIIncidentEntry[]) {
  const resolved = incidents.filter((i) => i.status === 'Resolved');
  const meanResolutionTime = resolved.length
    ? Math.round((resolved.reduce((sum, i) => sum + i.mttrHours, 0) / resolved.length) * 10) / 10
    : 0;
  return {
    openIncidents: incidents.filter((i) => i.status === 'Open').length,
    closedIncidents: resolved.length,
    criticalIncidents: incidents.filter((i) => i.severity === 'critical').length,
    regulatoryIncidents: incidents.filter((i) => i.regulatory).length,
    modelFailures: incidents.filter((i) => i.category === 'model').length,
    promptFailures: incidents.filter((i) => i.category === 'prompt').length,
    meanResolutionTime,
  };
}
