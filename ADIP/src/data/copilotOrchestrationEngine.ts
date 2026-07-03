/**
 * Prompt-driven AI SDLC orchestration engine (mock / static logic only).
 *
 * ONE business prompt drives the entire AI SDLC experience. When the user
 * clicks Analyze in the Enterprise AI Authoring Studio, `orchestrateFromPrompt`
 * detects scenario keywords and produces prompt-relevant mock outputs for every
 * copilot (Requirements → Architecture → Development → Testing → Release →
 * Audit), an aggregate orchestrator summary, right-rail AI Advisor insights, a
 * traceability chain, and a prompt-specific artifact catalog.
 *
 * NO real LLM / backend / vector DB — this is deterministic mock content keyed
 * off detected keywords, designed to look and behave as if a prompt is driving
 * the AI workflow for an executive demo.
 */
import type { CopilotFinding, CopilotRecommendation } from '../components/copilot/CopilotSection';

export const DEFAULT_SDLC_PROMPT =
  'Generate end-to-end AI SDLC artifacts for UPI Transaction Auto-Reversal. A customer initiates a UPI payment from Mobile Banking. Customer account is debited, but beneficiary is not credited due to switch timeout or NPCI response failure. The system must identify failed/pending transactions, reconcile with UPI switch/NPCI, trigger auto-reversal, notify customer, update audit trail, and provide operational monitoring.';

export type SdlcPhase =
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'audit';

export interface DetectedScenario {
  /** Canonical scenario id — 'upi-auto-reversal' or 'generic'. */
  id: 'upi-auto-reversal' | 'generic';
  /** Short label for the detected scenario. */
  label: string;
  /** Keywords that were matched in the prompt. */
  matchedKeywords: string[];
  /** Domain tags derived from the prompt (UPI, Payments, Mobile Banking, ...). */
  domains: string[];
}

/** A single AI reasoning step shown as a checklist item on a copilot. */
export interface ReasoningStep {
  text: string;
}

/** AI reasoning block that opens each copilot ("why the AI concluded this"). */
export interface CopilotReasoning {
  steps: ReasoningStep[];
  confidence: number;
}

export interface CopilotPhaseOutput {
  phase: SdlcPhase;
  /** e.g. "Requirements Copilot". */
  title: string;
  /** One-line plain-English description of what AI analyzed for this prompt. */
  analyzedSubtitle: string;
  /** Scope chips. */
  analyzedScope: string[];
  /** AI reasoning checklist + confidence, shown at the top of each copilot. */
  reasoning: CopilotReasoning;
  findings: CopilotFinding[];
  recommendations: CopilotRecommendation[];
  /** 0–100 readiness/quality score for this phase. */
  score: number;
  scoreLabel: string;
  /** Readiness label derived from the score (Ready / On Track / Needs Attention). */
  readiness: 'Ready' | 'On Track' | 'Needs Attention';
}

/** AI prompt classification shown immediately after the prompt is analyzed. */
export interface PromptClassification {
  businessDomain: string;
  application: string;
  capability: string;
  technology: string;
  complexity: 'Low' | 'Medium' | 'High';
  estimatedStoryPoints: number;
  estimatedSprintCount: number;
  aiConfidence: number;
}

/** AI business-value metrics for the executive dashboard. */
export interface BusinessValue {
  documentationPages: number;
  manualEffortSavedDays: number;
  artifactsGenerated: number;
  complianceControlsIdentified: number;
  engineeringProductivityUpliftPct: number;
  aiConfidence: number;
}

export interface OrchestratorArtifact {
  name: string;
  description: string;
  phase: SdlcPhase;
  generatedBy: string;
}

export interface AdvisorInsight {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  text: string;
}

export interface TraceabilityStep {
  phase: SdlcPhase | 'prompt' | 'evidence';
  label: string;
  detail: string;
}

export interface OrchestratorSummary {
  overallScore: number;
  band: 'Ready' | 'Conditional' | 'At Risk';
  executiveSummary: string;
  crossPhaseRisks: string[];
  keyRecommendations: string[];
  artifactCount: number;
  estimatedEffortSavedDays: number;
  suggestedStakeholders: string[];
}

export interface SdlcOrchestration {
  prompt: string;
  scenario: DetectedScenario;
  runId: string;
  generatedAt: string;
  classification: PromptClassification;
  phases: Record<SdlcPhase, CopilotPhaseOutput>;
  orchestrator: OrchestratorSummary;
  businessValue: BusinessValue;
  advisorInsights: AdvisorInsight[];
  traceability: TraceabilityStep[];
  artifacts: OrchestratorArtifact[];
}

// ---------------------------------------------------------------------------
// Keyword detection
// ---------------------------------------------------------------------------

const UPI_KEYWORDS = [
  'upi',
  'auto-reversal',
  'auto reversal',
  'reversal',
  'failed debit',
  'beneficiary not credited',
  'not credited',
  'npci',
  'mobile banking',
  'payments',
  'switch timeout',
  'reconcile',
  'reconciliation',
];

const DOMAIN_KEYWORDS: { tag: string; patterns: string[] }[] = [
  { tag: 'UPI', patterns: ['upi'] },
  { tag: 'Payments', patterns: ['payment', 'neft', 'rtgs', 'imps'] },
  { tag: 'Mobile Banking', patterns: ['mobile banking', 'mobile app'] },
  { tag: 'Core Banking', patterns: ['core banking', 'ledger', 'account is debited', 'debited'] },
  { tag: 'NPCI', patterns: ['npci', 'switch'] },
  { tag: 'Risk & Fraud', patterns: ['fraud', 'risk'] },
  { tag: 'Operations', patterns: ['operational monitoring', 'monitoring', 'operations'] },
];

export function detectScenario(prompt: string): DetectedScenario {
  const lower = prompt.toLowerCase();
  const matched = UPI_KEYWORDS.filter((k) => lower.includes(k));
  const domains = DOMAIN_KEYWORDS.filter((d) => d.patterns.some((p) => lower.includes(p))).map((d) => d.tag);

  // Treat as the UPI auto-reversal scenario when we see UPI + a reversal/reconcile/NPCI signal.
  const isUpi =
    lower.includes('upi') &&
    (lower.includes('revers') || lower.includes('npci') || lower.includes('reconcil') || lower.includes('not credited'));

  if (isUpi) {
    return {
      id: 'upi-auto-reversal',
      label: 'UPI Transaction Auto-Reversal',
      matchedKeywords: matched.length ? matched : ['upi'],
      domains: domains.length ? domains : ['UPI', 'Payments', 'Mobile Banking', 'NPCI'],
    };
  }

  return {
    id: 'generic',
    label: 'Enterprise SDLC Scenario',
    matchedKeywords: matched,
    domains: domains.length ? domains : ['Enterprise'],
  };
}

// ---------------------------------------------------------------------------
// UPI Auto-Reversal — prompt-specific phase outputs
// ---------------------------------------------------------------------------

/** Map a 0–100 phase score to a readiness band label. */
function readinessFor(score: number): CopilotPhaseOutput['readiness'] {
  return score >= 82 ? 'Ready' : score >= 72 ? 'On Track' : 'Needs Attention';
}

/** Build a reasoning block from a list of checklist strings + confidence. */
function reason(steps: string[], confidence: number): CopilotReasoning {
  return { steps: steps.map((text) => ({ text })), confidence };
}

function upiRequirements(): CopilotPhaseOutput {
  const findings: CopilotFinding[] = [
    { id: 'req-1', badge: 'Business Objective', severity: 'info', title: 'Auto-reverse failed UPI debits where beneficiary is not credited', detail: 'Customer is debited from Mobile Banking but beneficiary credit fails due to switch timeout / NPCI response failure. System must detect, reconcile and auto-reverse within the mandated SLA and notify the customer.' },
    { id: 'req-2', badge: 'Functional · FR-01', severity: 'high', title: 'Detect failed / pending UPI transactions', detail: 'Identify debit-success / credit-pending transactions from the UPI switch and core banking ledger in near real-time.' },
    { id: 'req-3', badge: 'Functional · FR-02', severity: 'high', title: 'Reconcile with UPI switch / NPCI', detail: 'Match bank ledger against NPCI settlement / RGCS files to confirm the beneficiary was not credited before reversing.' },
    { id: 'req-4', badge: 'Functional · FR-03', severity: 'critical', title: 'Trigger auto-reversal and re-credit customer', detail: 'On confirmed mismatch, reverse the debit and re-credit the originating account with an idempotent, audited transaction.' },
    { id: 'req-5', badge: 'Functional · FR-04', severity: 'medium', title: 'Notify customer and update audit trail', detail: 'Push notification / SMS on reversal; write immutable audit evidence for every state transition.' },
    { id: 'req-6', badge: 'NFR', severity: 'high', title: 'Auto-reversal SLA ≤ T+ (per RBI TAT) with 99.95% availability', detail: 'Reversal must complete within the RBI Turn-Around-Time directive; reconciliation job must be idempotent and horizontally scalable.' },
    { id: 'req-7', badge: 'Regulatory', severity: 'critical', title: 'RBI TAT & NPCI circular compliance for failed transactions', detail: 'Failed-transaction auto-reversal and customer compensation must comply with the RBI harmonisation-of-TAT circular and NPCI dispute rules.' },
    { id: 'req-8', badge: 'Missing Info', severity: 'medium', title: 'Compensation / penalty policy not specified in prompt', detail: 'Prompt omits penalty crediting for SLA breach — confirm whether ₹100/day penalty auto-credit is in scope.' },
  ];
  const recommendations: CopilotRecommendation[] = [
    { id: 'req-r1', badge: 'Requirements', title: 'Model reversal as an idempotent saga with explicit states', rationale: 'DEBITED → CREDIT_PENDING → REVERSAL_INITIATED → REVERSED / CREDITED prevents double reversal.', impact: 'Eliminates double-reversal defect class' },
    { id: 'req-r2', badge: 'Dependencies', title: 'Confirm NPCI reconciliation file cadence and RGCS access', rationale: 'Auto-reversal accuracy depends on NPCI settlement/dispute feeds.', impact: 'Removes #1 requirement risk' },
    { id: 'req-r3', badge: 'Assumptions', title: 'Document assumption: originating debit is atomic and traceable by RRN', rationale: 'RRN/UPI txn id is the reconciliation key across systems.', impact: 'Ensures traceability' },
  ];
  return {
    phase: 'requirements',
    title: 'Requirements Copilot',
    analyzedSubtitle: 'AI analyzed the UPI Auto-Reversal prompt and derived business objective, functional / non-functional requirements, regulatory observations, assumptions, dependencies and missing information.',
    analyzedScope: ['UPI · Mobile Banking · NPCI', `${findings.length} requirements`, 'RBI TAT · NPCI dispute rules'],
    reasoning: reason([
      'Banking domain detected',
      'Payments workflow detected',
      'Customer-impacting feature',
      'RBI regulatory impact identified',
      'Compliance review required',
    ], 96),
    findings,
    recommendations,
    score: 82,
    scoreLabel: 'Requirement Quality Score',
    readiness: readinessFor(82),
  };
}

function upiArchitecture(): CopilotPhaseOutput {
  const findings: CopilotFinding[] = [
    { id: 'arch-1', badge: 'Impacted Systems', severity: 'info', title: 'Mobile Banking · UPI Switch · Core Banking · NPCI · Reconciliation · Notification', detail: 'End-to-end flow spans the mobile channel, UPI switch, core banking ledger, NPCI, a new reconciliation service and the notification platform.' },
    { id: 'arch-2', badge: 'Integration', severity: 'high', title: 'NPCI reconciliation integration is the critical dependency', detail: 'Reversal correctness hinges on NPCI settlement/dispute feeds; needs resilient, retryable integration with dead-letter handling.' },
    { id: 'arch-3', badge: 'API Flow', severity: 'info', title: 'Debit → credit-pending detection → reconcile → reverse → notify', detail: 'Synchronous debit path; asynchronous reconciliation + reversal path driven by events and NPCI files.' },
    { id: 'arch-4', badge: 'Event Flow', severity: 'medium', title: 'Event-driven reversal saga on the payments bus', detail: 'TxnDebited, CreditPending, ReconciliationMismatch, ReversalInitiated, ReversalCompleted events with replay-safe consumers.' },
    { id: 'arch-5', badge: 'Data Model', severity: 'high', title: 'Reconciliation ledger keyed by RRN / UPI txn id', detail: 'New reconciliation store links debit, credit-attempt, NPCI status and reversal outcome per transaction.' },
    { id: 'arch-6', badge: 'Resilience', severity: 'critical', title: 'Switch timeout & NPCI failure handling with idempotent retries', detail: 'Timeouts must not double-debit or double-reverse; circuit breakers + idempotency keys + saga compensation required.' },
  ];
  const recommendations: CopilotRecommendation[] = [
    { id: 'arch-r1', badge: 'Resilience', title: 'Implement the reversal saga with idempotency keys and DLQ', rationale: 'Guarantees exactly-once reversal despite switch/NPCI timeouts.', impact: 'Double-reversal risk → 0' },
    { id: 'arch-r2', badge: 'Integration', title: 'Add a resilient NPCI reconciliation adapter with replay', rationale: 'Decouples reversal from NPCI file availability spikes.', impact: 'Reconciliation reliability +' },
    { id: 'arch-r3', badge: 'Monitoring', title: 'Expose reversal-SLA and mismatch metrics to operations', rationale: 'Operational monitoring is an explicit prompt requirement.', impact: 'Faster incident detection' },
  ];
  return {
    phase: 'architecture',
    title: 'Architecture Copilot',
    analyzedSubtitle: 'AI mapped impacted systems, integration & API/event flows, data-model impact and resilience/timeout handling for UPI Auto-Reversal.',
    analyzedScope: ['6 impacted systems', 'Event-driven saga', 'NPCI integration'],
    reasoning: reason([
      'Event-driven architecture detected',
      'NPCI integration detected',
      'Retry strategy required',
      'Timeout handling required',
      'High availability recommended',
    ], 94),
    findings,
    recommendations,
    score: 78,
    scoreLabel: 'Architecture Readiness Score',
    readiness: readinessFor(78),
  };
}

function upiDevelopment(): CopilotPhaseOutput {
  const findings: CopilotFinding[] = [
    { id: 'dev-1', badge: 'Impacted Modules', severity: 'info', title: 'ReconciliationService · ReversalOrchestrator · NPCIAdapter · NotificationService', detail: 'New reconciliation + reversal orchestration modules; changes to the UPI switch adapter and notification service.' },
    { id: 'dev-2', badge: 'API', severity: 'high', title: 'New endpoints: /reconcile, /reversal, /reversal/{rrn}/status', detail: 'Reversal endpoints must be idempotent (Idempotency-Key header) and audited.' },
    { id: 'dev-3', badge: 'Validation', severity: 'high', title: 'Validate debit-success + credit-not-confirmed before reversal', detail: 'Guard clause: never reverse a transaction whose beneficiary credit is confirmed by NPCI.' },
    { id: 'dev-4', badge: 'Error Handling', severity: 'critical', title: 'Switch timeout / NPCI failure must not double-debit or double-reverse', detail: 'Compensating transactions + idempotency keys + retry-with-backoff on the reconciliation path.' },
    { id: 'dev-5', badge: 'Feature Flags', severity: 'medium', title: 'Gate auto-reversal behind flag upi.autoReversal.enabled', detail: 'Enables progressive rollout and instant kill-switch during incidents.' },
    { id: 'dev-6', badge: 'Secure Coding', severity: 'high', title: 'Mask account/RRN in logs; sign reversal events', detail: 'PII masking + tamper-evident audit events for reversal state transitions.' },
  ];
  const recommendations: CopilotRecommendation[] = [
    { id: 'dev-r1', badge: 'Reliability', title: 'Persist idempotency keys on all reversal mutations', rationale: 'Dedupe retries at the gateway and orchestrator.', impact: 'Double-reversal eliminated' },
    { id: 'dev-r2', badge: 'Security', title: 'Route account/RRN through the masked secure logger', rationale: 'Prevents PII leakage in reversal logs.', impact: 'Closes audit-blocking log risk' },
    { id: 'dev-r3', badge: 'Rollout', title: 'Ship behind a kill-switch feature flag', rationale: 'Auto-reversal can be disabled instantly during an NPCI incident.', impact: 'Safer production rollout' },
  ];
  return {
    phase: 'development',
    title: 'Development Copilot',
    analyzedSubtitle: 'AI derived impacted services/modules, API endpoints, validation, error handling, feature flags and a secure-coding checklist for UPI Auto-Reversal.',
    analyzedScope: ['4 impacted modules', '3 new endpoints', 'Idempotent reversal'],
    reasoning: reason([
      'New APIs required',
      'Existing payment service impacted',
      'Feature toggle recommended',
      'Idempotency & error handling required',
      'Secure coding checklist required',
    ], 92),
    findings,
    recommendations,
    score: 75,
    scoreLabel: 'Development Readiness Score',
    readiness: readinessFor(75),
  };
}

function upiTesting(): CopilotPhaseOutput {
  const findings: CopilotFinding[] = [
    { id: 'tst-1', badge: 'Functional', severity: 'info', title: 'TC-AR-001 Happy path: debit success, credit fail → auto-reversal', detail: 'Debit succeeds, beneficiary credit fails, reconciliation flags mismatch, reversal re-credits customer within SLA.' },
    { id: 'tst-2', badge: 'Negative', severity: 'high', title: 'TC-AR-010 Switch timeout must not double-debit', detail: 'Timeout on debit path → single debit; no phantom reversal.' },
    { id: 'tst-3', badge: 'Reconciliation', severity: 'high', title: 'TC-AR-020 NPCI file shows beneficiary credited → NO reversal', detail: 'Guard: confirmed credit must never be reversed.' },
    { id: 'tst-4', badge: 'Timeout/Failure', severity: 'critical', title: 'TC-AR-030 NPCI response failure → retry then reverse', detail: 'On NPCI failure the saga retries, then reverses if mismatch persists past SLA.' },
    { id: 'tst-5', badge: 'Regression', severity: 'medium', title: 'Regression scope: UPI collect/pay, Mobile Banking debit, notifications', detail: 'Auto-reversal must not regress existing UPI success flows.' },
    { id: 'tst-6', badge: 'Automation', severity: 'info', title: '18 automation candidates across positive/negative/reconciliation', detail: 'High-value candidates for the nightly automated pack.' },
  ];
  const recommendations: CopilotRecommendation[] = [
    { id: 'tst-r1', badge: 'Coverage', title: 'Add idempotency + double-reversal contract tests', rationale: 'Guards the highest-severity failure class.', impact: 'Blocks Sev1 double-reversal' },
    { id: 'tst-r2', badge: 'Reconciliation', title: 'Automate NPCI file-driven reconciliation scenarios', rationale: 'Covers the core prompt requirement deterministically.', impact: 'Reconciliation coverage +' },
  ];
  return {
    phase: 'testing',
    title: 'Testing Copilot',
    analyzedSubtitle: 'AI generated functional, negative, reconciliation and timeout/failure test cases, defined regression scope and automation candidates for UPI Auto-Reversal.',
    analyzedScope: ['Functional + negative', 'Reconciliation + timeout', '18 automation candidates'],
    reasoning: reason([
      'Reconciliation scenarios detected',
      'Negative & timeout paths required',
      'Double-debit / double-reversal risk identified',
      'Regression impact on UPI success flows',
      'High automation coverage recommended',
    ], 93),
    findings,
    recommendations,
    score: 80,
    scoreLabel: 'Testing Coverage Score',
    readiness: readinessFor(80),
  };
}

function upiRelease(): CopilotPhaseOutput {
  const findings: CopilotFinding[] = [
    { id: 'rel-1', badge: 'Deployment', severity: 'info', title: 'Blue-green deploy with feature flag defaulted OFF', detail: 'Auto-reversal enabled progressively per BU after PVT sign-off.' },
    { id: 'rel-2', badge: 'Rollback', severity: 'high', title: 'Instant rollback via kill-switch + saga drain', detail: 'Disable flag, drain in-flight reversals, revert adapter — no data loss.' },
    { id: 'rel-3', badge: 'CAB', severity: 'medium', title: 'CAB summary: customer-money-movement change → high scrutiny', detail: 'Requires Payments, Risk and Operations sign-off at CAB.' },
    { id: 'rel-4', badge: 'PVT', severity: 'high', title: 'PVT checklist: penny-test reversal in production window', detail: 'Controlled ₹1 debit/credit-fail → verify auto-reversal + notification.' },
    { id: 'rel-5', badge: 'Monitoring', severity: 'critical', title: 'Reversal-SLA, mismatch rate and NPCI latency dashboards required pre-go-live', detail: 'Operational monitoring is a launch gate for this change.' },
  ];
  const recommendations: CopilotRecommendation[] = [
    { id: 'rel-r1', badge: 'Safety', title: 'Gate go-live on live reversal-SLA dashboard', rationale: 'Monitoring readiness is an explicit prompt requirement.', impact: 'Prevents blind launch' },
    { id: 'rel-r2', badge: 'Rollback', title: 'Rehearse kill-switch + saga drain in staging', rationale: 'Proves instant, lossless rollback.', impact: 'Rollback confidence high' },
  ];
  return {
    phase: 'release',
    title: 'Release Copilot',
    analyzedSubtitle: 'AI produced the deployment checklist, rollback plan, CAB summary, PVT checklist and monitoring readiness for UPI Auto-Reversal.',
    analyzedScope: ['Blue-green + flag', 'Kill-switch rollback', 'Monitoring gate'],
    reasoning: reason([
      'Customer money-movement change detected',
      'CAB approval required',
      'Kill-switch rollback required',
      'Production verification (PVT) required',
      'Monitoring readiness is a go-live gate',
    ], 91),
    findings,
    recommendations,
    score: 76,
    scoreLabel: 'Release Readiness Score',
    readiness: readinessFor(76),
  };
}

function upiAudit(): CopilotPhaseOutput {
  const findings: CopilotFinding[] = [
    { id: 'aud-1', badge: 'Audit Evidence', severity: 'info', title: 'Immutable evidence per reversal state transition', detail: 'DEBITED → REVERSED chain captured with RRN, timestamps and actor.' },
    { id: 'aud-2', badge: 'Change Evidence', severity: 'medium', title: 'Change ticket, ARB approval and CAB minutes linked', detail: 'Full change lineage from requirement to deployment retained.' },
    { id: 'aud-3', badge: 'Approval Evidence', severity: 'medium', title: 'Payments, Risk, Compliance and Operations sign-offs', detail: 'Maker-checker approvals recorded for money-movement change.' },
    { id: 'aud-4', badge: 'Test Evidence', severity: 'high', title: 'Reconciliation & reversal test results attached to release', detail: 'Negative/timeout test evidence mapped to RBI TAT controls.' },
    { id: 'aud-5', badge: 'Reconciliation Logs', severity: 'high', title: 'NPCI reconciliation logs retained 7 years (immutable store)', detail: 'Supports dispute resolution and regulatory inspection.' },
    { id: 'aud-6', badge: 'Regulatory Mapping', severity: 'critical', title: 'Controls mapped to RBI TAT circular & NPCI dispute rules', detail: 'Every control has an evidence artifact for inspection readiness.' },
  ];
  const recommendations: CopilotRecommendation[] = [
    { id: 'aud-r1', badge: 'Evidence', title: 'Auto-attach reversal evidence to the audit trail', rationale: 'Debit/credit mismatch reversals need defensible evidence.', impact: 'Inspection-ready' },
    { id: 'aud-r2', badge: 'Retention', title: 'Enforce 7-year immutable retention on reconciliation logs', rationale: 'Aligns with NPCI decision-log expectations.', impact: 'Closes retention gap' },
  ];
  return {
    phase: 'audit',
    title: 'Audit Copilot',
    analyzedSubtitle: 'AI compiled the audit-evidence checklist, change/approval/test evidence, reconciliation logs and regulatory mapping for UPI Auto-Reversal.',
    analyzedScope: ['Evidence chain', 'RBI TAT · NPCI mapping', '7-year retention'],
    reasoning: reason([
      'Regulated money-movement change detected',
      'RBI TAT & NPCI control mapping required',
      'Immutable reversal evidence required',
      'Maker-checker approval evidence required',
      '7-year reconciliation log retention required',
    ], 95),
    findings,
    recommendations,
    score: 84,
    scoreLabel: 'Audit Readiness Score',
    readiness: readinessFor(84),
  };
}

const UPI_ARTIFACTS: OrchestratorArtifact[] = [
  { name: 'UPI Auto-Reversal Concept Note', description: 'Problem statement, objective and high-level approach for auto-reversing failed UPI debits.', phase: 'requirements', generatedBy: 'Requirements AI' },
  { name: 'UPI Auto-Reversal BRD', description: 'Business requirements: detect, reconcile, reverse, notify, audit and monitor.', phase: 'requirements', generatedBy: 'Requirements AI' },
  { name: 'UPI Auto-Reversal FRD', description: 'Functional requirements for reversal saga states and NPCI reconciliation.', phase: 'requirements', generatedBy: 'Requirements AI' },
  { name: 'UPI Auto-Reversal NFR', description: 'SLA, availability, idempotency and scalability non-functional requirements.', phase: 'requirements', generatedBy: 'Requirements AI' },
  { name: 'UPI Reconciliation HLD', description: 'High-level design of the reconciliation + reversal architecture.', phase: 'architecture', generatedBy: 'Architecture AI' },
  { name: 'UPI Reversal LLD', description: 'Low-level design: saga states, idempotency keys, DLQ and adapters.', phase: 'architecture', generatedBy: 'Architecture AI' },
  { name: 'NPCI Integration API Specification', description: 'API contract for NPCI settlement/dispute reconciliation and reversal.', phase: 'architecture', generatedBy: 'Architecture AI' },
  { name: 'Transaction Reconciliation Data Model', description: 'Reconciliation ledger keyed by RRN linking debit, credit-attempt and reversal.', phase: 'architecture', generatedBy: 'Architecture AI' },
  { name: 'Security & Fraud Controls', description: 'PII masking, signed reversal events and fraud guardrails.', phase: 'development', generatedBy: 'Development AI' },
  { name: 'UPI Auto-Reversal Test Strategy', description: 'Strategy across functional, negative, reconciliation and timeout scenarios.', phase: 'testing', generatedBy: 'Testing AI' },
  { name: 'UPI Auto-Reversal Test Cases', description: 'Executable positive/negative/reconciliation test cases.', phase: 'testing', generatedBy: 'Testing AI' },
  { name: 'Auto-Reversal Automation Test Pack', description: 'Automation-candidate pack for the nightly regression run.', phase: 'testing', generatedBy: 'Testing AI' },
  { name: 'Deployment Checklist', description: 'Blue-green deployment steps with feature-flag rollout.', phase: 'release', generatedBy: 'Release AI' },
  { name: 'Rollback Plan', description: 'Kill-switch + saga-drain rollback with zero data loss.', phase: 'release', generatedBy: 'Release AI' },
  { name: 'CAB Pack', description: 'Change Advisory Board summary for the money-movement change.', phase: 'release', generatedBy: 'Release AI' },
  { name: 'Operational Runbook', description: 'Reversal-SLA, mismatch and NPCI latency monitoring & response.', phase: 'release', generatedBy: 'Release AI' },
  { name: 'Audit Evidence Checklist', description: 'Evidence required for debit/credit-mismatch reversals.', phase: 'audit', generatedBy: 'Audit AI' },
  { name: 'Traceability Matrix', description: 'Requirement → design → code → test → release → evidence mapping.', phase: 'audit', generatedBy: 'Audit AI' },
  { name: 'Executive Summary', description: 'One-page executive summary of the UPI Auto-Reversal AI SDLC run.', phase: 'audit', generatedBy: 'Executive AI Advisor' },
];

function upiAdvisorInsights(): AdvisorInsight[] {
  return [
    { id: 'adv-1', severity: 'high', text: 'NPCI reconciliation dependency identified — reversal accuracy depends on NPCI settlement/dispute feeds.' },
    { id: 'adv-2', severity: 'critical', text: 'Customer impact risk is high — customers are debited without beneficiary credit until reversal completes.' },
    { id: 'adv-3', severity: 'high', text: 'Auto-reversal SLA must be monitored against the RBI TAT directive with a live dashboard.' },
    { id: 'adv-4', severity: 'medium', text: 'Audit evidence required for every debit/credit mismatch and reversal state transition.' },
    { id: 'adv-5', severity: 'info', text: 'Suggested stakeholders: Payments, Mobile Banking, Core Banking, Risk, Compliance, Operations.' },
  ];
}

function upiTraceability(): TraceabilityStep[] {
  return [
    { phase: 'prompt', label: 'Prompt', detail: 'UPI Transaction Auto-Reversal business scenario' },
    { phase: 'requirements', label: 'Requirement', detail: 'Detect · reconcile · reverse · notify · audit (RBI TAT)' },
    { phase: 'architecture', label: 'Architecture', detail: 'Event-driven reversal saga + NPCI reconciliation' },
    { phase: 'development', label: 'Development', detail: 'Idempotent reversal endpoints + secure logging' },
    { phase: 'testing', label: 'Testing', detail: 'Functional · negative · reconciliation · timeout' },
    { phase: 'release', label: 'Release', detail: 'Blue-green + kill-switch + monitoring gate' },
    { phase: 'evidence', label: 'Audit Evidence', detail: 'Reversal evidence mapped to RBI TAT / NPCI controls' },
  ];
}

// ---------------------------------------------------------------------------
// Generic fallback (non-UPI prompts) — still prompt-aware, lighter content
// ---------------------------------------------------------------------------

function genericPhase(phase: SdlcPhase, title: string, scoreLabel: string, prompt: string, score: number): CopilotPhaseOutput {
  const subject = prompt.trim().slice(0, 80) || 'the entered scenario';
  return {
    phase,
    title,
    analyzedSubtitle: `AI analyzed the prompt "${subject}${prompt.length > 80 ? '…' : ''}" for ${phase} findings and recommendations.`,
    analyzedScope: ['Prompt-driven', `${phase} analysis`],
    reasoning: reason([
      'Business prompt received',
      `${title.replace(' Copilot', '')} scope derived from prompt`,
      'Enterprise SDLC controls applied',
      'Refine prompt for a fully worked scenario',
    ], 82),
    findings: [
      { id: `${phase}-g1`, badge: title, severity: 'info', title: `${title} analysis derived from the prompt`, detail: `Key ${phase} considerations were extracted from the entered business prompt.` },
      { id: `${phase}-g2`, badge: 'Observation', severity: 'medium', title: `Primary ${phase} risk identified from prompt context`, detail: 'Refine the prompt with UPI / reconciliation / NPCI details for a fully worked scenario.' },
    ],
    recommendations: [
      { id: `${phase}-gr1`, badge: title, title: `Proceed with ${phase} deliverables for this prompt`, rationale: 'Outputs are seeded from the entered prompt.', impact: 'Prompt-relevant' },
    ],
    score,
    scoreLabel,
    readiness: readinessFor(score),
  };
}

// ---------------------------------------------------------------------------
// Classification + business value
// ---------------------------------------------------------------------------

function buildClassification(scenario: DetectedScenario): PromptClassification {
  if (scenario.id === 'upi-auto-reversal') {
    return {
      businessDomain: 'Payments · Retail Banking',
      application: 'UPI Switch · Mobile Banking · Core Banking',
      capability: 'Failed Transaction Auto-Reversal & Reconciliation',
      technology: 'Event-driven microservices · NPCI integration · Kafka',
      complexity: 'High',
      estimatedStoryPoints: 55,
      estimatedSprintCount: 2,
      aiConfidence: 95,
    };
  }
  return {
    businessDomain: scenario.domains.join(' · ') || 'Enterprise',
    application: 'Enterprise platform (derived from prompt)',
    capability: scenario.label,
    technology: 'Enterprise standard stack',
    complexity: 'Medium',
    estimatedStoryPoints: 34,
    estimatedSprintCount: 2,
    aiConfidence: 82,
  };
}

function buildBusinessValue(isUpi: boolean, artifactCount: number, complianceControls: number, overallScore: number): BusinessValue {
  return {
    documentationPages: isUpi ? 148 : 60,
    manualEffortSavedDays: isUpi ? 42 : 18,
    artifactsGenerated: artifactCount,
    complianceControlsIdentified: complianceControls,
    engineeringProductivityUpliftPct: isUpi ? 38 : 22,
    aiConfidence: Math.min(97, Math.round((overallScore + (isUpi ? 12 : 6)))),
  };
}

// ---------------------------------------------------------------------------
// Public orchestration entry point
// ---------------------------------------------------------------------------

function buildRunId(): string {
  return `AISDLC-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

export function orchestrateFromPrompt(promptInput: string): SdlcOrchestration {
  const prompt = promptInput.trim() || DEFAULT_SDLC_PROMPT;
  const scenario = detectScenario(prompt);
  const isUpi = scenario.id === 'upi-auto-reversal';

  const phases: Record<SdlcPhase, CopilotPhaseOutput> = isUpi
    ? {
        requirements: upiRequirements(),
        architecture: upiArchitecture(),
        development: upiDevelopment(),
        testing: upiTesting(),
        release: upiRelease(),
        audit: upiAudit(),
      }
    : {
        requirements: genericPhase('requirements', 'Requirements Copilot', 'Requirement Quality Score', prompt, 74),
        architecture: genericPhase('architecture', 'Architecture Copilot', 'Architecture Readiness Score', prompt, 72),
        development: genericPhase('development', 'Development Copilot', 'Development Readiness Score', prompt, 70),
        testing: genericPhase('testing', 'Testing Copilot', 'Testing Coverage Score', prompt, 73),
        release: genericPhase('release', 'Release Copilot', 'Release Readiness Score', prompt, 71),
        audit: genericPhase('audit', 'Audit Copilot', 'Audit Readiness Score', prompt, 75),
      };

  const artifacts = isUpi
    ? UPI_ARTIFACTS
    : [
        { name: 'Concept Note', description: 'Concept note derived from the entered prompt.', phase: 'requirements' as SdlcPhase, generatedBy: 'Requirements AI' },
        { name: 'Solution Design', description: 'Solution design derived from the entered prompt.', phase: 'architecture' as SdlcPhase, generatedBy: 'Architecture AI' },
        { name: 'Test Strategy', description: 'Test strategy derived from the entered prompt.', phase: 'testing' as SdlcPhase, generatedBy: 'Testing AI' },
        { name: 'Release Plan', description: 'Release plan derived from the entered prompt.', phase: 'release' as SdlcPhase, generatedBy: 'Release AI' },
        { name: 'Executive Summary', description: 'Executive summary of the AI SDLC run.', phase: 'audit' as SdlcPhase, generatedBy: 'Executive AI Advisor' },
      ];

  const phaseList = Object.values(phases);
  const overallScore = Math.round(phaseList.reduce((s, p) => s + p.score, 0) / phaseList.length);
  const band: OrchestratorSummary['band'] = overallScore >= 82 ? 'Ready' : overallScore >= 72 ? 'Conditional' : 'At Risk';

  const orchestrator: OrchestratorSummary = {
    overallScore,
    band,
    executiveSummary: isUpi
      ? `The requested UPI Auto-Reversal capability impacts Mobile Banking, Payments, Core Banking and NPCI integrations. All six SDLC phases have been analyzed and ${artifacts.length} implementation artifacts were generated. Estimated delivery effort is 2 sprints (~55 story points) with medium-to-high implementation risk. Overall AI SDLC readiness is ${overallScore}/100 (${band}); the critical path is NPCI reconciliation accuracy and idempotent reversal, with monitoring readiness gating go-live.`
      : `The requested "${scenario.label}" capability was analyzed across all six SDLC phases, generating ${artifacts.length} artifacts. Overall AI SDLC readiness is ${overallScore}/100 (${band}). Refine the prompt with concrete scenario details (systems, integrations, controls) to deepen each copilot's output.`,
    crossPhaseRisks: isUpi
      ? [
          'NPCI reconciliation dependency spans architecture, development and audit — single point of correctness.',
          'Idempotency must hold across development and testing to prevent double-reversal.',
          'Monitoring readiness is a release gate driven by the requirements NFR.',
          'Regulatory (RBI TAT) traceability must be evidenced end-to-end for audit.',
        ]
      : ['Prompt lacks scenario-specific detail; cross-phase risks are generic until refined.'],
    keyRecommendations: isUpi
      ? [
          'Model reversal as an idempotent saga with explicit states.',
          'Add a resilient NPCI reconciliation adapter with replay + DLQ.',
          'Gate go-live on a live reversal-SLA / mismatch dashboard.',
          'Auto-attach reversal evidence to the audit trail (7-year retention).',
        ]
      : ['Enrich the prompt to unlock scenario-specific recommendations.'],
    artifactCount: artifacts.length,
    estimatedEffortSavedDays: isUpi ? 42 : 18,
    suggestedStakeholders: isUpi
      ? ['Payments', 'Mobile Banking', 'Core Banking', 'Risk', 'Compliance', 'Operations']
      : ['Product', 'Engineering', 'QA', 'Operations'],
  };

  // Count compliance/regulatory controls surfaced across audit + requirements.
  const complianceControls = [...phases.audit.findings, ...phases.requirements.findings].filter((f) =>
    /regulat|complian|control|evidence|rbi|npci|pci|sox|aml/i.test(`${f.badge ?? ''} ${f.title}`),
  ).length || (isUpi ? 9 : 4);

  const classification = buildClassification(scenario);
  const businessValue = buildBusinessValue(isUpi, artifacts.length, complianceControls, overallScore);

  return {
    prompt,
    scenario,
    runId: buildRunId(),
    generatedAt: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' }),
    classification,
    phases,
    orchestrator,
    businessValue,
    advisorInsights: isUpi ? upiAdvisorInsights() : [
      { id: 'adv-g1', severity: 'info', text: 'AI Advisor insights are seeded from the entered prompt. Add UPI / NPCI / reconciliation detail for a fully worked advisory.' },
    ],
    traceability: isUpi ? upiTraceability() : [
      { phase: 'prompt', label: 'Prompt', detail: prompt.slice(0, 60) },
      { phase: 'requirements', label: 'Requirement', detail: 'Derived from prompt' },
      { phase: 'architecture', label: 'Architecture', detail: 'Derived from prompt' },
      { phase: 'development', label: 'Development', detail: 'Derived from prompt' },
      { phase: 'testing', label: 'Testing', detail: 'Derived from prompt' },
      { phase: 'release', label: 'Release', detail: 'Derived from prompt' },
      { phase: 'evidence', label: 'Audit Evidence', detail: 'Derived from prompt' },
    ],
    artifacts,
  };
}
