export type ApprovalWorkflowStatus =
  | 'Draft'
  | 'Submitted'
  | 'Assigned'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Changes Requested'
  | 'Escalated'
  | 'Closed';

export type ApprovalWorkflowAction =
  | 'Submit'
  | 'Assign Reviewer'
  | 'Reassign Reviewer'
  | 'Approve'
  | 'Reject'
  | 'Request Changes'
  | 'Escalate'
  | 'Close';

export type ApprovalStage =
  | 'Requirements'
  | 'Architecture'
  | 'Development'
  | 'Testing'
  | 'Release'
  | 'Operations'
  | 'Governance'
  | 'AI Governance'
  | 'Knowledge Management';

export type ApprovalPriority = 'critical' | 'high' | 'medium' | 'low';

export interface ApprovalReviewer {
  id: string;
  name: string;
  role: string;
  personaId: string;
}

export interface ApprovalRelatedArtifact {
  id: string;
  name: string;
  type: string;
}

export interface ApprovalTraceabilityLink {
  stage: string;
  nodeId: string;
  label: string;
}

export interface ApprovalHistoryEntry {
  id: string;
  approvalId: string;
  action: ApprovalWorkflowAction | 'Submitted';
  actor: string;
  timestamp: string;
  comment: string;
  previousStatus: ApprovalWorkflowStatus;
  newStatus: ApprovalWorkflowStatus;
}

export interface ApprovalRequest {
  id: string;
  title: string;
  itemType: string;
  stage: ApprovalStage;
  domain: string;
  submitter: string;
  assignedReviewer: string | null;
  status: ApprovalWorkflowStatus;
  priority: ApprovalPriority;
  submittedAt: string;
  submittedDate: string;
  dueDate: string;
  reviewNotes: string[];
  relatedArtifacts: ApprovalRelatedArtifact[];
  traceabilityChain: ApprovalTraceabilityLink[];
  traceNodeId?: string;
}

export const PENDING_STATUSES: ApprovalWorkflowStatus[] = [
  'Submitted',
  'Assigned',
  'Under Review',
  'Changes Requested',
  'Escalated',
];

export const IN_PROGRESS_STATUSES: ApprovalWorkflowStatus[] = [
  'Assigned',
  'Under Review',
];

export const REFERENCE_DATE = new Date('2026-06-06T12:00:00');

export function formatApprovalTimestamp(): string {
  return new Date().toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseDueDate(dueDate: string): Date {
  return new Date(`${dueDate} 23:59:59`);
}

export function isOverdue(request: ApprovalRequest): boolean {
  if (!PENDING_STATUSES.includes(request.status)) return false;
  return parseDueDate(request.dueDate) < REFERENCE_DATE;
}

function daysBetween(submittedAt: string): number {
  const submitted = new Date(submittedAt.replace(/(\w{3}) (\d+), (\d+)/, '$1 $2, $3'));
  const diff = REFERENCE_DATE.getTime() - submitted.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export function computeApprovalKpis(requests: ApprovalRequest[]) {
  const pending = requests.filter((r) => PENDING_STATUSES.includes(r.status));
  const overdue = pending.filter(isOverdue);
  const inProgress = requests.filter((r) => IN_PROGRESS_STATUSES.includes(r.status));
  const approved = requests.filter((r) => r.status === 'Approved' || r.status === 'Closed');
  const rejected = requests.filter((r) => r.status === 'Rejected');
  const escalated = requests.filter((r) => r.status === 'Escalated');
  const closedApproved = requests.filter((r) => r.status === 'Approved' || r.status === 'Closed');
  const averageApprovalTime = closedApproved.length
    ? Math.round((closedApproved.reduce((sum, r) => sum + daysBetween(r.submittedAt), 0) / closedApproved.length) * 10) / 10
    : 2.4;

  return {
    pendingApprovals: pending.length,
    overdueReviews: overdue.length,
    reviewsInProgress: inProgress.length,
    approvedItems: approved.length,
    rejectedItems: rejected.length,
    escalatedReviews: escalated.length,
    averageApprovalTime,
    slaBreaches: overdue.length,
  };
}

export function applyWorkflowAction(
  request: ApprovalRequest,
  action: ApprovalWorkflowAction,
  actor: string,
  comment: string,
  reviewer?: string,
): { request: ApprovalRequest; historyEntry: ApprovalHistoryEntry } {
  const previousStatus = request.status;
  let newStatus: ApprovalWorkflowStatus = request.status;
  let assignedReviewer = request.assignedReviewer;
  const notes = [...request.reviewNotes];

  switch (action) {
    case 'Submit':
      newStatus = 'Submitted';
      break;
    case 'Assign Reviewer':
      newStatus = 'Assigned';
      assignedReviewer = reviewer ?? assignedReviewer;
      break;
    case 'Reassign Reviewer':
      newStatus = request.status === 'Submitted' ? 'Assigned' : request.status;
      assignedReviewer = reviewer ?? assignedReviewer;
      break;
    case 'Approve':
      newStatus = 'Approved';
      break;
    case 'Reject':
      newStatus = 'Rejected';
      break;
    case 'Request Changes':
      newStatus = 'Changes Requested';
      break;
    case 'Escalate':
      newStatus = 'Escalated';
      break;
    case 'Close':
      newStatus = 'Closed';
      break;
    default:
      break;
  }

  if (comment.trim()) notes.push(`${action}: ${comment}`);

  const historyEntry: ApprovalHistoryEntry = {
    id: `HIST-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    approvalId: request.id,
    action,
    actor,
    timestamp: formatApprovalTimestamp(),
    comment: comment || `Action: ${action}`,
    previousStatus,
    newStatus,
  };

  return {
    request: {
      ...request,
      status: newStatus,
      assignedReviewer,
      reviewNotes: notes,
      submittedDate: request.submittedDate || request.submittedAt.split(' ').slice(0, 3).join(' '),
    },
    historyEntry,
  };
}

export function actionsForStatus(status: ApprovalWorkflowStatus): ApprovalWorkflowAction[] {
  switch (status) {
    case 'Draft':
      return ['Submit'];
    case 'Submitted':
      return ['Assign Reviewer', 'Escalate'];
    case 'Assigned':
      return ['Reassign Reviewer', 'Approve', 'Reject', 'Request Changes', 'Escalate'];
    case 'Under Review':
      return ['Reassign Reviewer', 'Approve', 'Reject', 'Request Changes', 'Escalate'];
    case 'Changes Requested':
      return ['Submit', 'Assign Reviewer', 'Escalate'];
    case 'Escalated':
      return ['Reassign Reviewer', 'Approve', 'Reject', 'Request Changes'];
    case 'Approved':
      return ['Close'];
    default:
      return [];
  }
}

export type ApprovalSortKey = 'dueDate' | 'priority' | 'submittedDate' | 'status';
export type ApprovalSortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<ApprovalPriority, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function filterApprovalRequests(
  requests: ApprovalRequest[],
  filters: { status?: string; stage?: string; domain?: string; search?: string },
): ApprovalRequest[] {
  return requests.filter((r) => {
    if (filters.status && filters.status !== 'all' && r.status !== filters.status) return false;
    if (filters.stage && filters.stage !== 'all' && r.stage !== filters.stage) return false;
    if (filters.domain && filters.domain !== 'all' && r.domain !== filters.domain) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const haystack = `${r.id} ${r.title} ${r.domain} ${r.itemType}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function sortApprovalRequests(
  requests: ApprovalRequest[],
  sortKey: ApprovalSortKey,
  sortDir: ApprovalSortDir,
): ApprovalRequest[] {
  const sorted = [...requests].sort((a, b) => {
    let cmp: number;
    if (sortKey === 'dueDate') cmp = parseDueDate(a.dueDate).getTime() - parseDueDate(b.dueDate).getTime();
    else if (sortKey === 'priority') cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    else if (sortKey === 'submittedDate') cmp = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
    else cmp = a.status.localeCompare(b.status);
    return sortDir === 'asc' ? cmp : -cmp;
  });
  return sorted;
}

export function approvalToDrilldownRecord(r: ApprovalRequest) {
  return {
    id: r.id,
    title: r.title,
    detail: `${r.stage} · ${r.domain}`,
    meta: `${r.status} · ${r.priority} · ${r.assignedReviewer ?? 'Unassigned'}`,
  };
}
