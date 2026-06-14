import type {
  ApprovalHistoryEntry,
  ApprovalRequest,
  ApprovalReviewer,
  ApprovalStage,
  ApprovalTraceabilityLink,
  ApprovalWorkflowStatus,
} from './approvalWorkflowEngine';
import { PENDING_STATUSES } from './approvalWorkflowEngine';

export {
  PENDING_STATUSES,
  IN_PROGRESS_STATUSES,
  applyWorkflowAction,
  actionsForStatus,
  computeApprovalKpis,
  filterApprovalRequests,
  sortApprovalRequests,
  isOverdue,
  formatApprovalTimestamp,
  approvalToDrilldownRecord,
} from './approvalWorkflowEngine';

export type {
  ApprovalWorkflowStatus,
  ApprovalWorkflowAction,
  ApprovalStage,
  ApprovalRequest,
  ApprovalHistoryEntry,
  ApprovalReviewer,
  ApprovalSortKey,
  ApprovalSortDir,
} from './approvalWorkflowEngine';

export const APPROVAL_REVIEWERS: ApprovalReviewer[] = [
  { id: 'REV-CIO', name: 'Sanjay Verma — CIO', role: 'CIO', personaId: 'cio' },
  { id: 'REV-EA', name: 'Priya Sharma — Enterprise Architect', role: 'Enterprise Architect', personaId: 'enterprise-architect' },
  { id: 'REV-SA', name: 'Karthik Nair — Solution Architect', role: 'Solution Architect', personaId: 'enterprise-architect' },
  { id: 'REV-DL', name: 'Meera Krishnan — Development Lead', role: 'Development Lead', personaId: 'developer' },
  { id: 'REV-TL', name: 'Deepak Rao — Test Lead', role: 'Test Lead', personaId: 'tester' },
  { id: 'REV-RM', name: 'Vikram Joshi — Release Manager', role: 'Release Manager', personaId: 'release-manager' },
  { id: 'REV-SEC', name: 'Arjun Patel — Security Officer', role: 'Security Officer', personaId: 'ciso' },
  { id: 'REV-CO', name: 'Raj Mehta — Compliance Officer', role: 'Compliance Officer', personaId: 'compliance-officer' },
  { id: 'REV-MRO', name: 'Anita Desai — Model Risk Officer', role: 'Model Risk Officer', personaId: 'risk-officer' },
  { id: 'REV-AUD', name: 'Lakshmi Iyer — Auditor', role: 'Auditor', personaId: 'audit-head' },
  { id: 'REV-AO', name: 'Rohit Banerjee — Application Owner', role: 'Application Owner', personaId: 'application-owner' },
  { id: 'REV-MO', name: 'Sneha Iyer — Model Owner', role: 'Model Owner', personaId: 'model-owner' },
];

export const REVIEWERS = APPROVAL_REVIEWERS.map((r) => r.name);

const STAGES: ApprovalStage[] = [
  'Requirements', 'Architecture', 'Development', 'Testing', 'Release',
  'Operations', 'Governance', 'AI Governance', 'Knowledge Management',
];

const DOMAINS = [
  'Payments', 'Mobile Banking', 'Retail Credit', 'Digital CX', 'Compliance',
  'Financial Crime', 'Core Banking', 'Regulatory Affairs', 'Collections', 'Cards',
];

const ITEM_TYPES = [
  'BRD/FRD Package', 'Architecture Document', 'Code Change Set', 'Test Evidence',
  'Release Package', 'Runbook', 'Policy Exception', 'Model Artifact', 'Prompt Template',
  'Knowledge Article', 'Compliance Evidence', 'Control Policy',
];

const STATUSES_POOL: ApprovalWorkflowStatus[] = [
  'Submitted', 'Assigned', 'Under Review', 'Approved', 'Rejected',
  'Changes Requested', 'Escalated', 'Closed', 'Draft',
];

const TITLES: Record<ApprovalStage, string[]> = {
  Requirements: ['UPI Limit Enhancement BRD', 'KYC Onboarding FRD Update', 'NEFT Window Extension Spec'],
  Architecture: ['API Gateway Security Design', 'KYC Biometric API Architecture', 'Event Mesh Integration Pattern'],
  Development: ['OAuth Scope Change', 'Payment Router Refactor', 'Fraud Scoring Feature Store Update'],
  Testing: ['Regression Suite Sign-off', 'Fairness Test Evidence Pack', 'DR Failover Test Results'],
  Release: ['UPI Fraud Model v3.2.1 Release', 'Mobile Banking 5.9 Go-Live', 'Cards PIN Reset Hotfix'],
  Operations: ['EOD Batch Window Change', 'Capacity Scale-up Approval', 'Incident Runbook Update'],
  Governance: ['Policy Exception — Data Retention', 'Audit Evidence Pack', 'Risk Acceptance Memo'],
  'AI Governance': ['Copilot Prompt v2.3', 'AML Model Retrain', 'Guardrail Policy Update'],
  'Knowledge Management': ['UPI Settlement Playbook', 'PCI Logging Template', 'Onboarding Lessons Learned'],
};

function chainFor(stage: ApprovalStage, id: string): ApprovalTraceabilityLink[] {
  const idx = STAGES.indexOf(stage);
  const chain: ApprovalTraceabilityLink[] = STAGES.slice(0, idx + 1).map((s, i) => ({
    stage: s,
    nodeId: `${s.slice(0, 3).toUpperCase()}-${id}-${i}`,
    label: `${s} artifact for ${id}`,
  }));
  chain.push({ stage: 'Approval', nodeId: id, label: `Approval gate ${id}` });
  if (idx >= STAGES.indexOf('Release')) {
    chain.push({ stage: 'Production', nodeId: `PRD-${id}`, label: `Production deployment ${id}` });
  }
  return chain;
}

function buildRecord(index: number): ApprovalRequest {
  const stage = STAGES[index % STAGES.length];
  const id = `APR-${String(index + 1).padStart(3, '0')}`;
  const status = STATUSES_POOL[index % STATUSES_POOL.length];
  const reviewer = status === 'Submitted' || status === 'Draft'
    ? null
    : APPROVAL_REVIEWERS[index % APPROVAL_REVIEWERS.length].name;
  const titles = TITLES[stage];
  const title = `${titles[index % titles.length]} ${index > 9 ? `(v${(index % 5) + 1})` : ''}`.trim();
  const day = (index % 28) + 1;
  const month = index % 3 === 0 ? 'May' : 'Jun';
  const submittedAt = `${month} ${day}, 2026 ${8 + (index % 10)}:${(index * 7) % 60}`.replace(/:(\d)$/, ':0$1');
  const dueDay = day + (index % 5) + 1;
  const dueDate = `Jun ${Math.min(dueDay, 30)}, 2026`;
  const priority = (['critical', 'high', 'medium', 'low'] as const)[index % 4];

  return {
    id,
    title,
    itemType: ITEM_TYPES[index % ITEM_TYPES.length],
    stage,
    domain: DOMAINS[index % DOMAINS.length],
    submitter: `${DOMAINS[index % DOMAINS.length]} Team`,
    assignedReviewer: reviewer,
    status,
    priority,
    submittedAt,
    submittedDate: submittedAt.split(' ').slice(0, 3).join(' '),
    dueDate,
    reviewNotes: status === 'Under Review' ? ['Initial review in progress.'] : [],
    relatedArtifacts: [
      { id: `ART-${id}-1`, name: `${title} — Primary`, type: ITEM_TYPES[index % ITEM_TYPES.length] },
      { id: `ART-${id}-2`, name: `${title} — Evidence`, type: 'Supporting Document' },
    ],
    traceabilityChain: chainFor(stage, id),
    traceNodeId: chainFor(stage, id)[chainFor(stage, id).length - 1]?.nodeId,
  };
}

export const APPROVAL_REQUESTS: ApprovalRequest[] = Array.from({ length: 52 }, (_, i) => buildRecord(i));

export const APPROVAL_HISTORY: ApprovalHistoryEntry[] = [
  {
    id: 'HIST-001', approvalId: 'APR-001', action: 'Submitted', actor: 'Payments Team',
    timestamp: 'Jun 4, 2026 09:15', comment: 'Champion model ready for production with rollback plan.',
    previousStatus: 'Draft', newStatus: 'Submitted',
  },
  {
    id: 'HIST-002', approvalId: 'APR-001', action: 'Assign Reviewer', actor: 'Release Governance',
    timestamp: 'Jun 4, 2026 09:45', comment: 'Assigned to release manager for go/no-go review.',
    previousStatus: 'Submitted', newStatus: 'Assigned',
  },
  {
    id: 'HIST-003', approvalId: 'APR-004', action: 'Escalate', actor: 'Anita Desai — Model Risk Officer',
    timestamp: 'Jun 3, 2026 10:00', comment: 'Fairness threshold breach requires enterprise risk committee.',
    previousStatus: 'Under Review', newStatus: 'Escalated',
  },
  {
    id: 'HIST-004', approvalId: 'APR-002', action: 'Request Changes', actor: 'Sneha Iyer — Model Owner',
    timestamp: 'Jun 4, 2026 11:20', comment: 'Add PII masking clause and human escalation trigger.',
    previousStatus: 'Under Review', newStatus: 'Changes Requested',
  },
  {
    id: 'HIST-005', approvalId: 'APR-007', action: 'Approve', actor: 'Raj Mehta — Compliance Officer',
    timestamp: 'Jun 1, 2026 14:05', comment: 'Policy exception meets regulatory guidance.',
    previousStatus: 'Under Review', newStatus: 'Approved',
  },
  {
    id: 'HIST-006', approvalId: 'APR-008', action: 'Reject', actor: 'Priya Sharma — Enterprise Architect',
    timestamp: 'May 31, 2026 16:30', comment: 'Architecture impact not fully assessed.',
    previousStatus: 'Under Review', newStatus: 'Rejected',
  },
  {
    id: 'HIST-007', approvalId: 'APR-010', action: 'Close', actor: 'Vikram Joshi — Release Manager',
    timestamp: 'May 29, 2026 09:00', comment: 'Deployed to production; approval archived.',
    previousStatus: 'Approved', newStatus: 'Closed',
  },
];

export const APPROVAL_TREND = [
  { month: 'Jan', pending: 22, approved: 38, escalated: 4 },
  { month: 'Feb', pending: 20, approved: 41, escalated: 3 },
  { month: 'Mar', pending: 18, approved: 44, escalated: 5 },
  { month: 'Apr', pending: 15, approved: 47, escalated: 4 },
  { month: 'May', pending: 12, approved: 50, escalated: 3 },
  { month: 'Jun', pending: 9, approved: 32, escalated: 2 },
];

export const APPROVALS_BY_STAGE = STAGES.map((stage) => ({
  stage: stage === 'Knowledge Management' ? 'Knowledge' : stage === 'AI Governance' ? 'AI Gov' : stage.slice(0, 6),
  count: APPROVAL_REQUESTS.filter((r) => r.stage === stage && PENDING_STATUSES.includes(r.status)).length || Math.max(1, APPROVAL_REQUESTS.filter((r) => r.stage === stage).length % 8),
}));

export const APPROVAL_EXEC_SUMMARY =
  'Approval health is stable at 82% SLA adherence with 9 pending items and 3 overdue reviews concentrated in AI Governance and Release stages. Escalation volume declined 33% month-over-month. Release go/no-go and model risk reviews are the primary bottlenecks ahead of the UPI peak window. Recommended actions: assign reviewers to unowned Submitted items, convene risk committee for escalated fairness evidence, and enforce 48-hour SLA on critical-path release approvals.';

export const APPROVAL_STAGES = STAGES;
export const APPROVAL_DOMAINS = DOMAINS;
