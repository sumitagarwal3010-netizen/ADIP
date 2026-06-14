/**
 * AI SDLC Traceability data model.
 *
 * A single directed graph links every artifact across the delivery lifecycle:
 *
 *   Business Requirement → Functional Requirement → User Story
 *     → AI Use Case → Prompt → Model
 *     → Architecture Component → API
 *     → Test Case → Release → Production Service
 *     → Incident → Risk → Control → Audit Evidence → Compliance
 *
 * Nodes reference realistic banking artifacts (UPI, Mobile Banking, AML, KYC,
 * Cards) and reuse IDs that appear elsewhere in the platform mock data
 * (e.g. MDL-xxx models, AIR-xxx risks, PRM-xxx prompts) so the lineage feels
 * consistent with the rest of ADIP.
 */

export type TraceNodeType =
  | 'businessRequirement'
  | 'functionalRequirement'
  | 'userStory'
  | 'aiUseCase'
  | 'prompt'
  | 'model'
  | 'architecture'
  | 'api'
  | 'testCase'
  | 'release'
  | 'production'
  | 'incident'
  | 'risk'
  | 'control'
  | 'evidence'
  | 'compliance';

export type TraceStatus =
  | 'Approved'
  | 'In Progress'
  | 'Pending Review'
  | 'Passed'
  | 'Failed'
  | 'Open'
  | 'Mitigated'
  | 'Deployed'
  | 'At Risk'
  | 'Resolved'
  | 'Compliant'
  | 'Gap';

export interface TraceNode {
  id: string;
  type: TraceNodeType;
  name: string;
  description: string;
  status: TraceStatus;
  owner: string;
  domain: 'Payments' | 'Mobile Banking' | 'Net Banking' | 'Cards' | 'Enterprise';
  riskRating?: 'critical' | 'high' | 'medium' | 'low';
  meta?: Record<string, string>;
}

export interface TraceLink {
  from: string;
  to: string;
  /** Optional semantic label, e.g. "implements", "verified by". */
  rel?: string;
}

/** Ordered SDLC stages used for lineage columns and coverage. */
export const TRACE_STAGE_ORDER: TraceNodeType[] = [
  'businessRequirement',
  'functionalRequirement',
  'userStory',
  'aiUseCase',
  'prompt',
  'model',
  'architecture',
  'api',
  'testCase',
  'release',
  'production',
  'incident',
  'risk',
  'control',
  'evidence',
  'compliance',
];

export const TRACE_TYPE_LABEL: Record<TraceNodeType, string> = {
  businessRequirement: 'Business Requirement',
  functionalRequirement: 'Functional Requirement',
  userStory: 'User Story',
  aiUseCase: 'AI Use Case',
  prompt: 'Prompt',
  model: 'Model',
  architecture: 'Architecture',
  api: 'API',
  testCase: 'Test Case',
  release: 'Release',
  production: 'Production',
  incident: 'Incident',
  risk: 'Risk',
  control: 'Control',
  evidence: 'Evidence',
  compliance: 'Compliance',
};

export const TRACE_TYPE_SHORT: Record<TraceNodeType, string> = {
  businessRequirement: 'BR',
  functionalRequirement: 'FR',
  userStory: 'US',
  aiUseCase: 'UC',
  prompt: 'PR',
  model: 'ML',
  architecture: 'ARC',
  api: 'API',
  testCase: 'TC',
  release: 'REL',
  production: 'PRD',
  incident: 'INC',
  risk: 'RSK',
  control: 'CTL',
  evidence: 'EVD',
  compliance: 'CMP',
};

/* ------------------------------------------------------------------ */
/* Nodes                                                              */
/* ------------------------------------------------------------------ */

export const TRACE_NODES: TraceNode[] = [
  /* ===== Chain 1: UPI Limit Enhancement ===== */
  { id: 'BR-001', type: 'businessRequirement', name: 'Enhance UPI transaction limits for KYC L2 customers', description: 'Increase verified customer daily UPI limits to ₹2L to reduce limit-related support tickets by 35%.', status: 'Approved', owner: 'Head of Payments', domain: 'Payments' },
  { id: 'FR-001', type: 'functionalRequirement', name: 'Tiered UPI limit model with self-service upgrade', description: 'System shall support tiered limits and self-service upgrade with NPCI compliance checks.', status: 'Approved', owner: 'Payments Product', domain: 'Payments' },
  { id: 'US-001', type: 'userStory', name: 'As a customer, I can request a UPI limit upgrade', description: 'Self-service UPI limit upgrade with audit trail.', status: 'Approved', owner: 'Payments Squad', domain: 'Payments' },
  { id: 'UC-001', type: 'aiUseCase', name: 'Real-time UPI Fraud Scoring', description: 'AI scoring of UPI transactions for fraud before limit upgrades are honored.', status: 'Approved', owner: 'Payments Risk', domain: 'Payments', riskRating: 'high' },
  { id: 'PRM-003', type: 'prompt', name: 'UPI Dispute Resolution', description: 'Prompt template guiding UPI dispute and limit explanation responses.', status: 'Pending Review', owner: 'Payments Ops', domain: 'Payments', riskRating: 'medium' },
  { id: 'MDL-001', type: 'model', name: 'Fraud Detection Model', description: 'UPI fraud scoring model v3.2.1.', status: 'Approved', owner: 'Payments Risk', domain: 'Payments', riskRating: 'high' },
  { id: 'ARC-001', type: 'architecture', name: 'UPI Limit Service (HLD/LLD)', description: 'Limit validation handler, settlement orchestrator, compliance audit emitter.', status: 'Approved', owner: 'Payments Architecture', domain: 'Payments' },
  { id: 'API-001', type: 'api', name: 'POST /v1/upi-limit-enhancement', description: 'OpenAPI 3.0 contract for UPI limit upgrade.', status: 'Approved', owner: 'Payments Engineering', domain: 'Payments' },
  { id: 'TC-001', type: 'testCase', name: 'UPI limit upgrade end-to-end', description: 'Validates valid upgrade, over-limit rejection, audit event emission.', status: 'Passed', owner: 'QA - Payments', domain: 'Payments' },
  { id: 'REL-246', type: 'release', name: 'UPI Release 24.6', description: 'Production release carrying UPI limit enhancement.', status: 'Deployed', owner: 'Release Management', domain: 'Payments' },
  { id: 'PRD-001', type: 'production', name: 'UPI Switch Service', description: 'Production UPI switch processing limit-enhanced transactions.', status: 'Deployed', owner: 'Production Operations', domain: 'Payments' },
  { id: 'INC-2847', type: 'incident', name: 'UPI Settlement Timeout', description: 'NPCI acknowledgment lag caused duplicate settlement retries.', status: 'Resolved', owner: 'Incident Management', domain: 'Payments', riskRating: 'high' },
  { id: 'AIR-005', type: 'risk', name: 'Fraud model drift on UPI P2M', description: 'Adversarial pattern evolution degrades fraud scoring over time.', status: 'Mitigated', owner: 'Payments Risk', domain: 'Payments', riskRating: 'medium' },
  { id: 'CTL-001', type: 'control', name: 'Human-in-the-loop for blocks >₹50,000', description: 'Mandatory human review control for high-value fraud blocks.', status: 'Approved', owner: 'AI Governance', domain: 'Payments' },
  { id: 'EVD-001', type: 'evidence', name: 'UPI Control Validation Evidence Pack', description: 'Evidence of fraud control effectiveness and RBI notification.', status: 'Approved', owner: 'Evidence Office', domain: 'Payments' },
  { id: 'CMP-RBI', type: 'compliance', name: 'RBI Digital Payment Security', description: 'RBI digital payments and KYC/AML circular adherence.', status: 'Compliant', owner: 'Compliance', domain: 'Payments' },

  /* ===== Chain 2: Mobile Biometric Login ===== */
  { id: 'BR-002', type: 'businessRequirement', name: 'Biometric login for Mobile Banking', description: 'Reduce password-reset support load and improve mobile security via biometric login.', status: 'Approved', owner: 'Head of Digital', domain: 'Mobile Banking' },
  { id: 'FR-002', type: 'functionalRequirement', name: 'Biometric authentication with fallback', description: 'Support fingerprint/face login with secure fallback and re-verification on limit changes.', status: 'Approved', owner: 'Mobile Product', domain: 'Mobile Banking' },
  { id: 'US-002', type: 'userStory', name: 'As a user, I can log in with biometrics', description: 'Biometric login with device binding.', status: 'In Progress', owner: 'Mobile Squad', domain: 'Mobile Banking' },
  { id: 'UC-003', type: 'aiUseCase', name: 'Customer Service Copilot', description: 'Conversational assistant for mobile banking support.', status: 'In Progress', owner: 'Digital CX', domain: 'Mobile Banking', riskRating: 'medium' },
  { id: 'PRM-002', type: 'prompt', name: 'Mobile Transfer Assistant', description: 'Prompt for guided mobile transfers and login help.', status: 'Approved', owner: 'Mobile Engineering', domain: 'Mobile Banking', riskRating: 'low' },
  { id: 'MDL-003', type: 'model', name: 'Customer Service Copilot', description: 'Azure OpenAI gpt-4o copilot model.', status: 'In Progress', owner: 'Digital CX', domain: 'Mobile Banking', riskRating: 'medium' },
  { id: 'ARC-002', type: 'architecture', name: 'Biometric Auth Gateway', description: 'Device binding, biometric token service, fallback handler.', status: 'Approved', owner: 'Mobile Architecture', domain: 'Mobile Banking' },
  { id: 'API-002', type: 'api', name: 'POST /v1/biometric-login', description: 'Biometric login API contract.', status: 'In Progress', owner: 'Mobile Engineering', domain: 'Mobile Banking' },
  { id: 'TC-002', type: 'testCase', name: 'Biometric login scenarios', description: 'Happy path, fallback, revoked device, replay attack.', status: 'Failed', owner: 'QA - Mobile', domain: 'Mobile Banking' },
  { id: 'REL-MOB59', type: 'release', name: 'Mobile Release 5.9', description: 'Mobile release candidate including biometric login.', status: 'At Risk', owner: 'Release Management', domain: 'Mobile Banking' },
  { id: 'PRD-002', type: 'production', name: 'Mobile API Gateway', description: 'Production mobile API gateway.', status: 'Deployed', owner: 'Production Operations', domain: 'Mobile Banking' },
  { id: 'INC-AI-012', type: 'incident', name: 'Hallucinated loan rate in chatbot', description: 'Stale prompt context produced incorrect loan rate.', status: 'Resolved', owner: 'AI Incident Response', domain: 'Mobile Banking', riskRating: 'high' },
  { id: 'AIR-002', type: 'risk', name: 'Copilot hallucination', description: 'LLM hallucination risk in customer-facing advice.', status: 'Open', owner: 'Digital CX', domain: 'Mobile Banking', riskRating: 'high' },
  { id: 'CTL-002', type: 'control', name: 'Output filtering + disclaimer', description: 'Response filtering and mandatory rate disclaimer control.', status: 'Approved', owner: 'AI Governance', domain: 'Mobile Banking' },
  { id: 'EVD-002', type: 'evidence', name: 'AI Incident Evidence Pack', description: 'Investigation timeline and corrective-action evidence.', status: 'Pending Review', owner: 'Evidence Office', domain: 'Mobile Banking' },
  { id: 'CMP-DPSC', type: 'compliance', name: 'DPSC Data Protection', description: 'Data protection assessment for biometric and PII handling.', status: 'Gap', owner: 'Compliance', domain: 'Mobile Banking' },

  /* ===== Chain 3: Merchant Auto Settlement / Cards ===== */
  { id: 'BR-003', type: 'businessRequirement', name: 'Automated merchant settlement', description: 'Reduce manual settlement effort and settlement-related disputes for merchants.', status: 'Approved', owner: 'Head of Merchant Banking', domain: 'Cards' },
  { id: 'FR-003', type: 'functionalRequirement', name: 'Event-driven settlement posting', description: 'Settlement posting via event bus with idempotency and reconciliation.', status: 'Approved', owner: 'Cards Product', domain: 'Cards' },
  { id: 'US-003', type: 'userStory', name: 'As a merchant, I receive auto settlements', description: 'Automated settlement with status visibility.', status: 'Approved', owner: 'Cards Squad', domain: 'Cards' },
  { id: 'UC-006', type: 'aiUseCase', name: 'AML Alert Prioritization', description: 'Prioritize AML alerts on high-value settlements.', status: 'Approved', owner: 'Financial Crime', domain: 'Cards', riskRating: 'high' },
  { id: 'PRM-004', type: 'prompt', name: 'Fraud Alert Triage', description: 'Prompt for triaging settlement and card fraud alerts.', status: 'Approved', owner: 'Payments Risk', domain: 'Cards', riskRating: 'medium' },
  { id: 'MDL-004', type: 'model', name: 'Transaction Anomaly Detection', description: 'Anomaly detection on settlement transactions.', status: 'Approved', owner: 'Financial Crime', domain: 'Cards', riskRating: 'high' },
  { id: 'ARC-003', type: 'architecture', name: 'Settlement Orchestration Design', description: 'Kafka settlement topic, idempotency guard, reconciliation service.', status: 'Approved', owner: 'Cards Architecture', domain: 'Cards' },
  { id: 'API-003', type: 'api', name: 'POST /v1/merchant-settlement', description: 'Merchant settlement API contract.', status: 'Approved', owner: 'Cards Engineering', domain: 'Cards' },
  { id: 'TC-003', type: 'testCase', name: 'Settlement reconciliation tests', description: 'Validates idempotency, retries, reconciliation accuracy.', status: 'Passed', owner: 'QA - Cards', domain: 'Cards' },
  { id: 'REL-PAY122', type: 'release', name: 'Payments Release 12.2', description: 'Release including merchant auto settlement.', status: 'Deployed', owner: 'Release Management', domain: 'Cards' },
  { id: 'PRD-003', type: 'production', name: 'Settlement Service', description: 'Production settlement orchestration service.', status: 'Deployed', owner: 'Production Operations', domain: 'Cards' },
  { id: 'AIR-009', type: 'risk', name: 'Settlement data leakage', description: 'Data leakage risk in settlement document handling.', status: 'Mitigated', owner: 'Operations Automation', domain: 'Cards', riskRating: 'high' },
  { id: 'CTL-003', type: 'control', name: 'PCI logging & key rotation', description: 'PCI-DSS aligned logging and encryption key rotation control.', status: 'Pending Review', owner: 'Information Security', domain: 'Cards' },
  { id: 'EVD-003', type: 'evidence', name: 'PCI Evidence Collection Package', description: 'Cardholder data environment control evidence.', status: 'Approved', owner: 'Evidence Office', domain: 'Cards' },
  { id: 'CMP-PCI', type: 'compliance', name: 'PCI-DSS 4.0', description: 'Cardholder data environment compliance.', status: 'Gap', owner: 'Compliance', domain: 'Cards' },

  /* ===== Chain 4: KYC Onboarding (Net Banking) ===== */
  { id: 'BR-004', type: 'businessRequirement', name: 'Faster digital KYC onboarding', description: 'Reduce onboarding time with automated document KYC for Net Banking.', status: 'Approved', owner: 'Head of Onboarding', domain: 'Net Banking' },
  { id: 'FR-004', type: 'functionalRequirement', name: 'Automated document verification', description: 'OCR-based KYC document verification with re-verification triggers.', status: 'Approved', owner: 'Onboarding Product', domain: 'Net Banking' },
  { id: 'US-004', type: 'userStory', name: 'As a new user, my KYC is verified instantly', description: 'Instant KYC document verification.', status: 'In Progress', owner: 'Onboarding Squad', domain: 'Net Banking' },
  { id: 'UC-008', type: 'aiUseCase', name: 'KYC Document Verification', description: 'AI verification of KYC identity documents.', status: 'Pending Review', owner: 'Compliance', domain: 'Net Banking', riskRating: 'high' },
  { id: 'MDL-006', type: 'model', name: 'KYC Verification AI', description: 'Onfido identity verification model.', status: 'In Progress', owner: 'Compliance', domain: 'Net Banking', riskRating: 'high' },
  { id: 'ARC-004', type: 'architecture', name: 'KYC Verification Pipeline', description: 'OCR pipeline, identity scoring, manual review queue.', status: 'In Progress', owner: 'Onboarding Architecture', domain: 'Net Banking' },
  { id: 'API-004', type: 'api', name: 'POST /v1/kyc-verify', description: 'KYC verification API contract.', status: 'In Progress', owner: 'Onboarding Engineering', domain: 'Net Banking' },
  { id: 'TC-004', type: 'testCase', name: 'KYC verification scenarios', description: 'Valid docs, forged docs, low-quality scans, manual fallback.', status: 'In Progress', owner: 'QA - Onboarding', domain: 'Net Banking' },
  { id: 'AIR-006', type: 'risk', name: 'KYC unauthorized access', description: 'Unauthorized access risk to KYC PII.', status: 'Open', owner: 'Compliance', domain: 'Net Banking', riskRating: 'critical' },
  { id: 'CTL-004', type: 'control', name: 'KYC PII access controls', description: 'Least-privilege access and audit logging for KYC PII.', status: 'Approved', owner: 'Information Security', domain: 'Net Banking' },
  { id: 'EVD-004', type: 'evidence', name: 'KYC Control Evidence', description: 'Access control and retention evidence for KYC.', status: 'Pending Review', owner: 'Evidence Office', domain: 'Net Banking' },
  { id: 'CMP-ISO', type: 'compliance', name: 'ISO 27001 Annex A', description: 'Information security controls for identity data.', status: 'Compliant', owner: 'Compliance', domain: 'Net Banking' },
];

/* ------------------------------------------------------------------ */
/* Links (directed, upstream -> downstream)                          */
/* ------------------------------------------------------------------ */

export const TRACE_LINKS: TraceLink[] = [
  /* Chain 1 — UPI Limit Enhancement */
  { from: 'BR-001', to: 'FR-001', rel: 'decomposes to' },
  { from: 'FR-001', to: 'US-001', rel: 'realized by' },
  { from: 'US-001', to: 'UC-001', rel: 'enabled by AI' },
  { from: 'UC-001', to: 'PRM-003', rel: 'uses prompt' },
  { from: 'UC-001', to: 'MDL-001', rel: 'uses model' },
  { from: 'US-001', to: 'ARC-001', rel: 'designed in' },
  { from: 'ARC-001', to: 'API-001', rel: 'exposes' },
  { from: 'API-001', to: 'TC-001', rel: 'verified by' },
  { from: 'MDL-001', to: 'TC-001', rel: 'verified by' },
  { from: 'TC-001', to: 'REL-246', rel: 'shipped in' },
  { from: 'REL-246', to: 'PRD-001', rel: 'deployed to' },
  { from: 'PRD-001', to: 'INC-2847', rel: 'incident on' },
  { from: 'INC-2847', to: 'AIR-005', rel: 'raises risk' },
  { from: 'MDL-001', to: 'AIR-005', rel: 'has risk' },
  { from: 'AIR-005', to: 'CTL-001', rel: 'mitigated by' },
  { from: 'CTL-001', to: 'EVD-001', rel: 'evidenced by' },
  { from: 'EVD-001', to: 'CMP-RBI', rel: 'supports' },

  /* Chain 2 — Mobile Biometric Login */
  { from: 'BR-002', to: 'FR-002', rel: 'decomposes to' },
  { from: 'FR-002', to: 'US-002', rel: 'realized by' },
  { from: 'US-002', to: 'UC-003', rel: 'enabled by AI' },
  { from: 'UC-003', to: 'PRM-002', rel: 'uses prompt' },
  { from: 'UC-003', to: 'MDL-003', rel: 'uses model' },
  { from: 'US-002', to: 'ARC-002', rel: 'designed in' },
  { from: 'ARC-002', to: 'API-002', rel: 'exposes' },
  { from: 'API-002', to: 'TC-002', rel: 'verified by' },
  { from: 'MDL-003', to: 'TC-002', rel: 'verified by' },
  { from: 'TC-002', to: 'REL-MOB59', rel: 'shipped in' },
  { from: 'REL-MOB59', to: 'PRD-002', rel: 'deployed to' },
  { from: 'PRD-002', to: 'INC-AI-012', rel: 'incident on' },
  { from: 'INC-AI-012', to: 'AIR-002', rel: 'raises risk' },
  { from: 'MDL-003', to: 'AIR-002', rel: 'has risk' },
  { from: 'AIR-002', to: 'CTL-002', rel: 'mitigated by' },
  { from: 'CTL-002', to: 'EVD-002', rel: 'evidenced by' },
  { from: 'EVD-002', to: 'CMP-DPSC', rel: 'supports' },

  /* Chain 3 — Merchant Auto Settlement */
  { from: 'BR-003', to: 'FR-003', rel: 'decomposes to' },
  { from: 'FR-003', to: 'US-003', rel: 'realized by' },
  { from: 'US-003', to: 'UC-006', rel: 'enabled by AI' },
  { from: 'UC-006', to: 'PRM-004', rel: 'uses prompt' },
  { from: 'UC-006', to: 'MDL-004', rel: 'uses model' },
  { from: 'US-003', to: 'ARC-003', rel: 'designed in' },
  { from: 'ARC-003', to: 'API-003', rel: 'exposes' },
  { from: 'API-003', to: 'TC-003', rel: 'verified by' },
  { from: 'MDL-004', to: 'TC-003', rel: 'verified by' },
  { from: 'TC-003', to: 'REL-PAY122', rel: 'shipped in' },
  { from: 'REL-PAY122', to: 'PRD-003', rel: 'deployed to' },
  { from: 'MDL-004', to: 'AIR-009', rel: 'has risk' },
  { from: 'PRD-003', to: 'AIR-009', rel: 'raises risk' },
  { from: 'AIR-009', to: 'CTL-003', rel: 'mitigated by' },
  { from: 'CTL-003', to: 'EVD-003', rel: 'evidenced by' },
  { from: 'EVD-003', to: 'CMP-PCI', rel: 'supports' },

  /* Chain 4 — KYC Onboarding */
  { from: 'BR-004', to: 'FR-004', rel: 'decomposes to' },
  { from: 'FR-004', to: 'US-004', rel: 'realized by' },
  { from: 'US-004', to: 'UC-008', rel: 'enabled by AI' },
  { from: 'UC-008', to: 'MDL-006', rel: 'uses model' },
  { from: 'US-004', to: 'ARC-004', rel: 'designed in' },
  { from: 'ARC-004', to: 'API-004', rel: 'exposes' },
  { from: 'API-004', to: 'TC-004', rel: 'verified by' },
  { from: 'MDL-006', to: 'TC-004', rel: 'verified by' },
  { from: 'MDL-006', to: 'AIR-006', rel: 'has risk' },
  { from: 'UC-008', to: 'AIR-006', rel: 'has risk' },
  { from: 'AIR-006', to: 'CTL-004', rel: 'mitigated by' },
  { from: 'CTL-004', to: 'EVD-004', rel: 'evidenced by' },
  { from: 'EVD-004', to: 'CMP-ISO', rel: 'supports' },
  // Note: Chain 4 intentionally has NO release/production node yet (coverage gap).
];

/** The four primary business-requirement "threads" for lineage views. */
export const TRACE_THREADS: { id: string; label: string; rootId: string }[] = [
  { id: 'thread-upi', label: 'UPI Limit Enhancement', rootId: 'BR-001' },
  { id: 'thread-biometric', label: 'Mobile Biometric Login', rootId: 'BR-002' },
  { id: 'thread-settlement', label: 'Merchant Auto Settlement', rootId: 'BR-003' },
  { id: 'thread-kyc', label: 'Digital KYC Onboarding', rootId: 'BR-004' },
];
