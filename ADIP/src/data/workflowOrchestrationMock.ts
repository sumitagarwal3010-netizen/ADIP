import type { WorkflowInstance } from '../types/workflowOrchestration';
import type { WorkflowLifecycleStage, UnifiedLifecycleStatus } from '../types/workflowOrchestration';
import { computeCompletionPct, computeDeliveryRisk, WORKFLOW_STAGE_ORDER } from './unifiedLifecycleEngine';
import { getWorkflowAuditMetrics } from './auditCenterEngine';

function chainForStage(
  currentStage: WorkflowLifecycleStage,
  lifecycleStatus: UnifiedLifecycleStatus,
  nodes: Partial<Record<WorkflowLifecycleStage, { nodeId: string; label: string }>>,
  blocked?: boolean,
): WorkflowInstance['traceabilityChain'] {
  const idx = WORKFLOW_STAGE_ORDER.indexOf(currentStage);
  return WORKFLOW_STAGE_ORDER.map((stage, i) => {
    const node = nodes[stage];
    let status: 'complete' | 'in_progress' | 'pending' | 'blocked' = 'pending';
    if (blocked && i === idx) status = 'blocked';
    else if (currentStage === 'production' || lifecycleStatus === 'Production') status = node ? 'complete' : 'pending';
    else if (i < idx) status = 'complete';
    else if (i === idx) status = blocked ? 'blocked' : 'in_progress';
    const approvalStatus: UnifiedLifecycleStatus | undefined =
      stage === 'approval' ? (i < idx ? 'Approved' : lifecycleStatus)
      : stage === currentStage ? lifecycleStatus
      : i < idx ? 'Approved' : undefined;
    return {
      stage,
      nodeId: node?.nodeId ?? `${stage}-pending`,
      label: node?.label ?? `${stage} pending`,
      status,
      approvalStatus,
    };
  });
}

function task(
  workflowId: string,
  stage: WorkflowLifecycleStage,
  reviewer: string | null,
  reviewerPersona: WorkflowInstance['reviewerPersona'],
  priority: WorkflowInstance['approvalTask']['priority'] = 'high',
): WorkflowInstance['approvalTask'] {
  return {
    approvalId: `APR-${workflowId}-${stage}`,
    stageGate: stage,
    assignedReviewer: reviewer,
    reviewerPersona,
    reviewNotes: [],
    priority,
    relatedArtifacts: [{ id: `${workflowId}-${stage}-pkg`, name: `${stage} package`, type: 'artifact' }],
  };
}

type BaseWorkflow = Omit<
  WorkflowInstance,
  'evidenceCount' | 'openFindings' | 'openObservations' | 'auditStatus' | 'complianceStatus'
>;

const BASE_WORKFLOWS: BaseWorkflow[] = [
  {
    id: 'WF-001',
    title: 'UPI Limit Enhancement',
    domain: 'Payments',
    currentStage: 'release',
    previousStage: 'testing',
    nextStage: 'production',
    lifecycleStatus: 'Under Review',
    approvalTask: task('WF-001', 'release', 'Sanjay Verma', 'cio', 'critical'),
    owner: 'Release Manager',
    ownerPersona: 'release-manager',
    reviewer: 'Sanjay Verma',
    reviewerPersona: 'cio',
    completionPct: computeCompletionPct('release', 'Under Review'),
    dueDate: 'Jun 10, 2026',
    submittedAt: 'May 28, 2026',
    stageEnteredAt: 'Jun 4, 2026 14:00',
    pendingActions: ['Go/No-Go decision', 'RBI notification evidence'],
    traceabilityStatus: 'linked',
    slaBreached: false,
    stageDurationHours: 36,
    deliveryRisk: 'medium',
    traceabilityChain: chainForStage('release', 'Under Review', {
      requirements: { nodeId: 'BR-001', label: 'Enhance UPI transaction limits' },
      architecture: { nodeId: 'ARC-001', label: 'UPI Limit Service (HLD/LLD)' },
      development: { nodeId: 'API-001', label: 'POST /v1/upi-limit-enhancement' },
      testing: { nodeId: 'TC-001', label: 'UPI limit upgrade end-to-end' },
      release: { nodeId: 'REL-246', label: 'UPI Release 24.6' },
      approval: { nodeId: 'APR-001', label: 'UPI Release Go/No-Go' },
      production: { nodeId: 'PRD-001', label: 'UPI Switch Service' },
    }),
  },
  {
    id: 'WF-002',
    title: 'Biometric Login — Mobile Banking',
    domain: 'Mobile Banking',
    currentStage: 'testing',
    previousStage: 'development',
    nextStage: 'release',
    lifecycleStatus: 'Under Review',
    approvalTask: task('WF-002', 'testing', 'Vikram Joshi', 'release-manager'),
    owner: 'Test Lead',
    ownerPersona: 'tester',
    reviewer: 'Vikram Joshi',
    reviewerPersona: 'release-manager',
    completionPct: computeCompletionPct('testing', 'Under Review'),
    dueDate: 'Jun 12, 2026',
    submittedAt: 'Jun 1, 2026',
    stageEnteredAt: 'Jun 5, 2026 09:30',
    pendingActions: ['Remediate TC-002 failure', 'Regression sign-off'],
    traceabilityStatus: 'partial',
    slaBreached: true,
    stageDurationHours: 52,
    deliveryRisk: 'high',
    traceabilityChain: chainForStage('testing', 'Under Review', {
      requirements: { nodeId: 'BR-002', label: 'Biometric authentication for mobile login' },
      architecture: { nodeId: 'ARC-002', label: 'Mobile Auth Service' },
      development: { nodeId: 'API-002', label: 'POST /v2/mobile/biometric' },
      testing: { nodeId: 'TC-002', label: 'Biometric login regression' },
    }),
  },
  {
    id: 'WF-003',
    title: 'KYC Onboarding Digital Flow',
    domain: 'Net Banking',
    currentStage: 'architecture',
    previousStage: 'requirements',
    nextStage: 'development',
    lifecycleStatus: 'Escalated',
    approvalTask: task('WF-003', 'architecture', 'Karthik Nair', 'cto'),
    owner: 'Enterprise Architect',
    ownerPersona: 'enterprise-architect',
    reviewer: 'Karthik Nair',
    reviewerPersona: 'cto',
    completionPct: computeCompletionPct('architecture', 'Escalated'),
    dueDate: 'Jun 15, 2026',
    submittedAt: 'May 20, 2026',
    stageEnteredAt: 'Jun 2, 2026 11:00',
    pendingActions: ['Resolve NPCI integration gap', 'Security architecture review'],
    traceabilityStatus: 'gap',
    slaBreached: true,
    stageDurationHours: 72,
    deliveryRisk: 'critical',
    traceabilityChain: chainForStage('architecture', 'Escalated', {
      requirements: { nodeId: 'BR-004', label: 'Digital KYC onboarding' },
      architecture: { nodeId: 'ARC-004', label: 'KYC Orchestration Service' },
    }, true),
  },
  {
    id: 'WF-004',
    title: 'Merchant Auto Settlement',
    domain: 'Payments',
    currentStage: 'development',
    previousStage: 'architecture',
    nextStage: 'testing',
    lifecycleStatus: 'Draft',
    approvalTask: task('WF-004', 'development', 'Deepak Rao', 'tester'),
    owner: 'Development Lead',
    ownerPersona: 'developer',
    reviewer: 'Deepak Rao',
    reviewerPersona: 'tester',
    completionPct: computeCompletionPct('development', 'Draft'),
    dueDate: 'Jun 18, 2026',
    submittedAt: 'Jun 3, 2026',
    stageEnteredAt: 'Jun 6, 2026 08:00',
    pendingActions: ['API implementation', 'Unit test coverage ≥ 85%'],
    traceabilityStatus: 'linked',
    slaBreached: false,
    stageDurationHours: 18,
    deliveryRisk: 'low',
    traceabilityChain: chainForStage('development', 'Draft', {
      requirements: { nodeId: 'BR-003', label: 'Merchant auto settlement' },
      architecture: { nodeId: 'ARC-003', label: 'Settlement Orchestrator' },
      development: { nodeId: 'API-003', label: 'POST /v1/settlement/batch' },
    }),
  },
  {
    id: 'WF-005',
    title: 'Cards Fraud Model Refresh',
    domain: 'Cards',
    currentStage: 'requirements',
    previousStage: null,
    nextStage: 'architecture',
    lifecycleStatus: 'Draft',
    approvalTask: task('WF-005', 'requirements', 'Priya Sharma', 'enterprise-architect'),
    owner: 'Application Owner',
    ownerPersona: 'application-owner',
    reviewer: 'Priya Sharma',
    reviewerPersona: 'enterprise-architect',
    completionPct: computeCompletionPct('requirements', 'Draft'),
    dueDate: 'Jun 22, 2026',
    submittedAt: 'Jun 6, 2026',
    stageEnteredAt: 'Jun 6, 2026 10:00',
    pendingActions: ['Complete BRD', 'Regulatory impact assessment'],
    traceabilityStatus: 'partial',
    slaBreached: false,
    stageDurationHours: 8,
    deliveryRisk: 'low',
    traceabilityChain: chainForStage('requirements', 'Draft', {
      requirements: { nodeId: 'BR-005', label: 'Cards fraud model refresh' },
    }),
  },
  {
    id: 'WF-006',
    title: 'UPI Limit Enhancement — Production',
    domain: 'Payments',
    currentStage: 'production',
    previousStage: 'release',
    nextStage: null,
    lifecycleStatus: 'Production',
    approvalTask: task('WF-006', 'production', null, null, 'critical'),
    owner: 'Operations Manager',
    ownerPersona: 'operations-manager',
    reviewer: null,
    reviewerPersona: null,
    completionPct: 100,
    dueDate: 'Jun 8, 2026',
    submittedAt: 'May 28, 2026',
    stageEnteredAt: 'Jun 5, 2026 18:00',
    pendingActions: [],
    traceabilityStatus: 'linked',
    slaBreached: false,
    stageDurationHours: 12,
    deliveryRisk: 'low',
    traceabilityChain: chainForStage('production', 'Production', {
      requirements: { nodeId: 'BR-001', label: 'Enhance UPI transaction limits' },
      architecture: { nodeId: 'ARC-001', label: 'UPI Limit Service (HLD/LLD)' },
      development: { nodeId: 'API-001', label: 'POST /v1/upi-limit-enhancement' },
      testing: { nodeId: 'TC-001', label: 'UPI limit upgrade end-to-end' },
      release: { nodeId: 'REL-246', label: 'UPI Release 24.6' },
      approval: { nodeId: 'APR-001', label: 'UPI Release Go/No-Go' },
      production: { nodeId: 'PRD-001', label: 'UPI Switch Service' },
    }),
  },
];

export const WORKFLOW_ORCHESTRATION_MOCK: WorkflowInstance[] = BASE_WORKFLOWS.map((w) => ({
  ...w,
  ...getWorkflowAuditMetrics(w.id),
}));

export const WORKFLOW_EXEC_SUMMARY =
  'Unified lifecycle orchestration tracks 6 workflows with embedded approval gates. UPI Release at Under Review pending CIO sign-off. Two SLA breaches on Biometric testing and KYC architecture (Escalated). Approval and workflow bottlenecks concentrated at release and architecture gates. Delivery risk: 2 high/critical items require executive escalation.';

export const WORKFLOW_STAGE_DURATION_MOCK = [
  { name: 'Requirements', value: 48 },
  { name: 'Architecture', value: 72 },
  { name: 'Development', value: 96 },
  { name: 'Testing', value: 52 },
  { name: 'Release', value: 36 },
  { name: 'Approval', value: 24 },
  { name: 'Production', value: 12 },
];

// Recompute delivery risk from status
for (const w of WORKFLOW_ORCHESTRATION_MOCK) {
  w.deliveryRisk = computeDeliveryRisk(w);
}
