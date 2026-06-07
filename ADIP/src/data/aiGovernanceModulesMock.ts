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

export interface AIControlEntry {
  id: string;
  name: string;
  controlType: 'Preventive' | 'Detective' | 'Technical';
  owner: string;
  coverage: number;
  status: 'Active' | 'Gap Identified' | 'Under Review';
  requiresHumanReview: boolean;
}

export interface AIIncidentEntry {
  id: string;
  incidentType: string;
  application: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  owner: string;
  status: 'Open' | 'Resolved' | 'Monitoring';
  mttrHours: number;
  resolvedThisMonth: boolean;
}

export const AI_CONTROLS: AIControlEntry[] = [
  { id: 'CTRL-001', name: 'Human Approval for High-Risk AI Decisions', controlType: 'Preventive', owner: 'Enterprise Risk', coverage: 95, status: 'Active', requiresHumanReview: true },
  { id: 'CTRL-002', name: 'PII Masking Before LLM Processing', controlType: 'Technical', owner: 'Information Security', coverage: 88, status: 'Active', requiresHumanReview: false },
  { id: 'CTRL-003', name: 'Prompt Injection Detection', controlType: 'Detective', owner: 'Digital CX', coverage: 92, status: 'Active', requiresHumanReview: false },
  { id: 'CTRL-004', name: 'Output Validation Guardrail', controlType: 'Technical', owner: 'Digital CX', coverage: 78, status: 'Gap Identified', requiresHumanReview: true },
  { id: 'CTRL-005', name: 'Bias Review Control', controlType: 'Preventive', owner: 'Retail Credit', coverage: 85, status: 'Active', requiresHumanReview: true },
  { id: 'CTRL-006', name: 'Model Access Control', controlType: 'Technical', owner: 'Platform Engineering', coverage: 96, status: 'Active', requiresHumanReview: false },
  { id: 'CTRL-007', name: 'Data Residency Control', controlType: 'Technical', owner: 'Compliance', coverage: 72, status: 'Under Review', requiresHumanReview: true },
  { id: 'CTRL-008', name: 'Regulatory Disclosure Control', controlType: 'Preventive', owner: 'Regulatory Affairs', coverage: 90, status: 'Active', requiresHumanReview: false },
];

export const AI_INCIDENTS: AIIncidentEntry[] = [
  { id: 'INC-001', incidentType: 'Hallucinated Customer Response', application: 'Customer Service Copilot', severity: 'high', owner: 'Digital CX', status: 'Open', mttrHours: 0, resolvedThisMonth: false },
  { id: 'INC-002', incidentType: 'Prompt Injection Attempt', application: 'Collections Assistant', severity: 'critical', owner: 'Collections', status: 'Resolved', mttrHours: 4, resolvedThisMonth: true },
  { id: 'INC-003', incidentType: 'PII Exposure Blocked', application: 'Customer Service Copilot', severity: 'high', owner: 'Information Security', status: 'Resolved', mttrHours: 2, resolvedThisMonth: true },
  { id: 'INC-004', incidentType: 'Incorrect Fraud Recommendation', application: 'Fraud Detection Model', severity: 'critical', owner: 'Payments Risk', status: 'Open', mttrHours: 0, resolvedThisMonth: false },
  { id: 'INC-005', incidentType: 'Model Drift Alert', application: 'Credit Scoring Model', severity: 'medium', owner: 'Retail Credit', status: 'Monitoring', mttrHours: 18, resolvedThisMonth: false },
  { id: 'INC-006', incidentType: 'Unauthorized Prompt Change', application: 'Mobile Banking', severity: 'critical', owner: 'Mobile Engineering', status: 'Open', mttrHours: 0, resolvedThisMonth: false },
  { id: 'INC-007', incidentType: 'Bias Alert in Credit Scoring', application: 'Net Banking', severity: 'high', owner: 'Retail Credit', status: 'Resolved', mttrHours: 12, resolvedThisMonth: true },
  { id: 'INC-008', incidentType: 'LLM Timeout in Customer Service Copilot', application: 'Customer Service', severity: 'medium', owner: 'Digital CX', status: 'Resolved', mttrHours: 6, resolvedThisMonth: true },
];

export function computeAIControlsKpis(controls: AIControlEntry[]) {
  const active = controls.filter((c) => c.status === 'Active').length;
  const gaps = controls.filter((c) => c.status === 'Gap Identified').length;
  const humanReviews = controls.filter((c) => c.requiresHumanReview).length;
  const guardrailCoverage = controls.length
    ? Math.round(controls.reduce((sum, c) => sum + c.coverage, 0) / controls.length)
    : 0;
  return { active, gaps, humanReviews, guardrailCoverage };
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
