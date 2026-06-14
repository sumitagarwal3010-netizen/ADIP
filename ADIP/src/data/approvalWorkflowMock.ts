import type {
  ApprovalHistoryEntry,
  ApprovalRequest,
  ApprovalReviewer,
  ApprovalStage,
} from './approvalWorkflowEngine';
import { PENDING_STATUSES } from './approvalWorkflowEngine';
import { WORKFLOW_ORCHESTRATION_MOCK } from './workflowOrchestrationMock';
import { deriveApprovalRequests } from './unifiedLifecycleEngine';

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

/** Unified lifecycle — approval queue derived from workflow instances (single source of truth). */
export const APPROVAL_REQUESTS: ApprovalRequest[] = deriveApprovalRequests(WORKFLOW_ORCHESTRATION_MOCK);

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
  'Unified approval and workflow lifecycle: 5 active gates embedded in SDLC workflows with shared state. UPI Release Under Review pending CIO sign-off. Escalated KYC architecture and overdue Biometric testing are primary bottlenecks. Recommended actions: approve UPI go/no-go, remediate TC-002, and convene architecture review for NPCI integration gap.';

export const APPROVAL_STAGES = STAGES;
export const APPROVAL_DOMAINS = DOMAINS;
