import type { PersonaId } from '../config/personaConfig';
import type {
  ApprovalHistoryEntry,
  ApprovalRequest,
  ApprovalWorkflowAction,
  ApprovalWorkflowStatus,
} from './approvalWorkflowEngine';
import {
  formatApprovalTimestamp,
} from './approvalWorkflowEngine';
import { APPROVAL_ACTION_PERMISSIONS } from './rbacCatalog';
import type { Permission } from './rbacCatalog';
import type {
  UnifiedLifecycleAction,
  UnifiedLifecycleKpis,
  UnifiedLifecycleStatus,
  WorkflowApprovalTask,
  WorkflowHistoryEntry,
  WorkflowInstance,
  WorkflowLifecycleStage,
  WorkflowTraceabilityLink,
} from '../types/workflowOrchestration';

export const HUB_STAGES: WorkflowLifecycleStage[] = [
  'requirements',
  'architecture',
  'development',
  'testing',
  'release',
];

export const WORKFLOW_STAGE_ORDER: WorkflowLifecycleStage[] = [
  'requirements',
  'architecture',
  'development',
  'testing',
  'release',
  'approval',
  'production',
];

export const WORKFLOW_STAGE_LABEL: Record<WorkflowLifecycleStage, string> = {
  requirements: 'Requirements',
  architecture: 'Architecture',
  development: 'Development',
  testing: 'Testing',
  release: 'Release',
  approval: 'Approval',
  production: 'Production',
};

export const STAGE_TO_APPROVAL_STAGE: Record<WorkflowLifecycleStage, string> = {
  requirements: 'Requirements',
  architecture: 'Architecture',
  development: 'Development',
  testing: 'Testing',
  release: 'Release',
  approval: 'Release',
  production: 'Operations',
};

export const STAGE_OWNER_PERSONA: Record<WorkflowLifecycleStage, PersonaId> = {
  requirements: 'application-owner',
  architecture: 'enterprise-architect',
  development: 'developer',
  testing: 'tester',
  release: 'release-manager',
  approval: 'release-manager',
  production: 'operations-manager',
};

export const STAGE_OWNER_LABEL: Record<WorkflowLifecycleStage, string> = {
  requirements: 'Application Owner',
  architecture: 'Enterprise Architect',
  development: 'Development Lead',
  testing: 'Test Lead',
  release: 'Release Manager',
  approval: 'Release Manager',
  production: 'Operations Manager',
};

const STAGE_REVIEWER: Partial<Record<WorkflowLifecycleStage, { name: string; persona: PersonaId }>> = {
  requirements: { name: 'Priya Sharma', persona: 'enterprise-architect' },
  architecture: { name: 'Karthik Nair', persona: 'cto' },
  development: { name: 'Deepak Rao', persona: 'tester' },
  testing: { name: 'Vikram Joshi', persona: 'release-manager' },
  release: { name: 'Sanjay Verma', persona: 'cio' },
  approval: { name: 'Vikram Joshi', persona: 'release-manager' },
};

const PENDING_LIFECYCLE: UnifiedLifecycleStatus[] = [
  'Submitted', 'Assigned', 'Under Review', 'Changes Requested', 'Escalated',
];

export function getPreviousStage(stage: WorkflowLifecycleStage): WorkflowLifecycleStage | null {
  const idx = WORKFLOW_STAGE_ORDER.indexOf(stage);
  return idx > 0 ? WORKFLOW_STAGE_ORDER[idx - 1] : null;
}

export function getNextHubStage(stage: WorkflowLifecycleStage): WorkflowLifecycleStage | null {
  const hubIdx = HUB_STAGES.indexOf(stage as (typeof HUB_STAGES)[number]);
  if (hubIdx >= 0 && hubIdx < HUB_STAGES.length - 1) return HUB_STAGES[hubIdx + 1];
  if (stage === 'release') return 'production';
  return null;
}

export function computeCompletionPct(
  stage: WorkflowLifecycleStage,
  status: UnifiedLifecycleStatus,
): number {
  const idx = WORKFLOW_STAGE_ORDER.indexOf(stage);
  const base = Math.round(((idx + 1) / WORKFLOW_STAGE_ORDER.length) * 100);
  if (status === 'Production') return 100;
  if (status === 'Released') return Math.min(base + 5, 98);
  if (status === 'Approved') return Math.min(base, 95);
  if (PENDING_LIFECYCLE.includes(status)) return base - 5;
  if (status === 'Rejected' || status === 'Changes Requested' || status === 'Escalated') return base - 10;
  return base;
}

export function computeDeliveryRisk(
  workflow: Pick<WorkflowInstance, 'lifecycleStatus' | 'slaBreached' | 'currentStage' | 'traceabilityStatus'>,
): WorkflowInstance['deliveryRisk'] {
  if (workflow.slaBreached && (workflow.lifecycleStatus === 'Escalated' || workflow.lifecycleStatus === 'Rejected')) return 'critical';
  if (workflow.slaBreached || workflow.lifecycleStatus === 'Escalated') return 'high';
  if (workflow.traceabilityStatus === 'gap' || workflow.lifecycleStatus === 'Changes Requested') return 'medium';
  return 'low';
}

function timestamp(): string {
  return formatApprovalTimestamp();
}

function historyEntry(
  workflowId: string,
  action: WorkflowHistoryEntry['action'],
  actor: string,
  comment: string,
  opts?: Partial<Pick<WorkflowHistoryEntry, 'fromStage' | 'toStage' | 'fromStatus' | 'toStatus'>>,
): WorkflowHistoryEntry {
  return {
    id: `wf-hist-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    workflowId,
    action,
    actor,
    timestamp: timestamp(),
    comment,
    ...opts,
  };
}

function createApprovalTask(
  workflow: WorkflowInstance,
): WorkflowApprovalTask {
  const reviewer = STAGE_REVIEWER[workflow.currentStage];
  return {
    approvalId: `APR-${workflow.id}-${workflow.currentStage}`,
    stageGate: workflow.currentStage,
    assignedReviewer: reviewer?.name ?? workflow.reviewer,
    reviewerPersona: reviewer?.persona ?? workflow.reviewerPersona,
    reviewNotes: workflow.approvalTask?.reviewNotes ?? [],
    priority: workflow.currentStage === 'release' ? 'critical' : 'high',
    relatedArtifacts: workflow.approvalTask?.relatedArtifacts ?? [
      { id: `${workflow.id}-art`, name: `${WORKFLOW_STAGE_LABEL[workflow.currentStage]} Package`, type: 'artifact' },
    ],
  };
}

function updateChainWithApproval(
  chain: WorkflowTraceabilityLink[],
  currentStage: WorkflowLifecycleStage,
  lifecycleStatus: UnifiedLifecycleStatus,
): WorkflowTraceabilityLink[] {
  const idx = WORKFLOW_STAGE_ORDER.indexOf(currentStage);
  return chain.map((link) => {
    const linkIdx = WORKFLOW_STAGE_ORDER.indexOf(link.stage);
    let status: WorkflowTraceabilityLink['status'];
    if (currentStage === 'production') {
      status = link.nodeId.includes('pending') ? 'pending' : 'complete';
    } else if (linkIdx < idx) {
      status = 'complete';
    } else if (linkIdx === idx) {
      status = lifecycleStatus === 'Rejected' || lifecycleStatus === 'Changes Requested' ? 'blocked' : 'in_progress';
    } else {
      status = 'pending';
    }
    const approvalStatus = link.stage === 'approval' || link.stage === currentStage
      ? lifecycleStatus
      : linkIdx < idx ? 'Approved' : undefined;
    return { ...link, status, approvalStatus };
  });
}

function advanceAfterApproval(
  workflow: WorkflowInstance,
  actor: string,
): { workflow: WorkflowInstance; history: WorkflowHistoryEntry } {
  if (workflow.currentStage === 'release') {
    const updated: WorkflowInstance = {
      ...workflow,
      lifecycleStatus: 'Released',
      completionPct: computeCompletionPct('release', 'Released'),
      pendingActions: ['Deploy to production', 'Verify smoke tests'],
      traceabilityChain: updateChainWithApproval(workflow.traceabilityChain, 'release', 'Released'),
      deliveryRisk: computeDeliveryRisk({ ...workflow, lifecycleStatus: 'Released' }),
    };
    return {
      workflow: updated,
      history: historyEntry(workflow.id, 'Release', actor, 'Release approved — ready for production deployment', {
        fromStatus: workflow.lifecycleStatus,
        toStatus: 'Released',
      }),
    };
  }

  const next = getNextHubStage(workflow.currentStage);
  if (!next) {
    return {
      workflow: { ...workflow, lifecycleStatus: 'Production', completionPct: 100 },
      history: historyEntry(workflow.id, 'Approve', actor, 'Lifecycle complete'),
    };
  }

  const reviewer = STAGE_REVIEWER[next];
  const draftTask = createApprovalTask({ ...workflow, currentStage: next });
  const updated: WorkflowInstance = {
    ...workflow,
    previousStage: workflow.currentStage,
    currentStage: next,
    nextStage: getNextHubStage(next),
    lifecycleStatus: 'Draft',
    owner: STAGE_OWNER_LABEL[next],
    ownerPersona: STAGE_OWNER_PERSONA[next],
    reviewer: reviewer?.name ?? null,
    reviewerPersona: reviewer?.persona ?? null,
    approvalTask: draftTask,
    stageEnteredAt: timestamp(),
    stageDurationHours: 0,
    pendingActions: [`Complete ${WORKFLOW_STAGE_LABEL[next]} deliverables`],
    completionPct: computeCompletionPct(next, 'Draft'),
    traceabilityChain: updateChainWithApproval(workflow.traceabilityChain, next, 'Draft'),
    deliveryRisk: computeDeliveryRisk({ ...workflow, currentStage: next, lifecycleStatus: 'Draft' }),
  };
  return {
    workflow: updated,
    history: historyEntry(workflow.id, 'Advance Stage', actor, `Advanced to ${WORKFLOW_STAGE_LABEL[next]}`, {
      fromStage: workflow.currentStage,
      toStage: next,
      fromStatus: 'Approved',
      toStatus: 'Draft',
    }),
  };
}

export function applyUnifiedLifecycleAction(
  workflow: WorkflowInstance,
  action: UnifiedLifecycleAction,
  actor: string,
  comment = '',
  reviewer?: string,
): { workflow: WorkflowInstance; history: WorkflowHistoryEntry } {
  const prevStatus = workflow.lifecycleStatus;
  let lifecycleStatus: UnifiedLifecycleStatus = workflow.lifecycleStatus;
  const approvalTask = { ...workflow.approvalTask };
  const notes = [...approvalTask.reviewNotes];
  if (comment.trim()) notes.push(`${action}: ${comment}`);

  switch (action) {
    case 'Submit':
      lifecycleStatus = 'Submitted';
      break;
    case 'Assign Reviewer':
      lifecycleStatus = 'Assigned';
      approvalTask.assignedReviewer = reviewer ?? approvalTask.assignedReviewer;
      break;
    case 'Reassign Reviewer':
      lifecycleStatus = workflow.lifecycleStatus === 'Submitted' ? 'Assigned' : workflow.lifecycleStatus;
      approvalTask.assignedReviewer = reviewer ?? approvalTask.assignedReviewer;
      break;
    case 'Approve':
      if (workflow.currentStage === 'release' && workflow.lifecycleStatus === 'Released') {
        lifecycleStatus = 'Production';
        break;
      }
      return advanceAfterApproval(workflow, actor);
    case 'Reject':
      lifecycleStatus = 'Rejected';
      break;
    case 'Request Changes':
      lifecycleStatus = 'Changes Requested';
      break;
    case 'Escalate':
      lifecycleStatus = 'Escalated';
      break;
    case 'Release':
      lifecycleStatus = 'Released';
      break;
    case 'Advance Stage':
      return advanceAfterApproval({ ...workflow, lifecycleStatus: 'Approved' }, actor);
    default:
      break;
  }

  const reviewerInfo = STAGE_REVIEWER[workflow.currentStage];
  const updated: WorkflowInstance = {
    ...workflow,
    lifecycleStatus,
    approvalTask: { ...approvalTask, reviewNotes: notes },
    reviewer: approvalTask.assignedReviewer ?? reviewerInfo?.name ?? workflow.reviewer,
    reviewerPersona: approvalTask.reviewerPersona ?? reviewerInfo?.persona ?? workflow.reviewerPersona,
    completionPct: computeCompletionPct(
      lifecycleStatus === 'Production' ? 'production' : workflow.currentStage,
      lifecycleStatus,
    ),
    currentStage: lifecycleStatus === 'Production' ? 'production' : workflow.currentStage,
    pendingActions: lifecycleStatus === 'Production' ? [] : workflow.pendingActions,
    traceabilityChain: updateChainWithApproval(workflow.traceabilityChain, workflow.currentStage, lifecycleStatus),
    deliveryRisk: computeDeliveryRisk({ ...workflow, lifecycleStatus }),
  };

  if (lifecycleStatus === 'Production') {
    updated.nextStage = null;
    updated.traceabilityChain = updateChainWithApproval(updated.traceabilityChain, 'production', 'Production');
  }

  return {
    workflow: updated,
    history: historyEntry(workflow.id, action, actor, comment || `Action: ${action}`, {
      fromStatus: prevStatus,
      toStatus: lifecycleStatus,
    }),
  };
}

export function lifecycleActionsFor(workflow: WorkflowInstance): UnifiedLifecycleAction[] {
  const { lifecycleStatus, currentStage } = workflow;
  switch (lifecycleStatus) {
    case 'Draft':
      return ['Submit'];
    case 'Submitted':
      return ['Assign Reviewer', 'Escalate'];
    case 'Assigned':
    case 'Under Review':
      return ['Reassign Reviewer', 'Approve', 'Reject', 'Request Changes', 'Escalate'];
    case 'Changes Requested':
      return ['Submit', 'Assign Reviewer', 'Escalate'];
    case 'Escalated':
      return ['Reassign Reviewer', 'Approve', 'Reject', 'Request Changes'];
    case 'Approved':
      return ['Advance Stage'];
    case 'Released':
      return currentStage === 'release' ? ['Approve'] : [];
    case 'Production':
      return [];
    case 'Rejected':
      return ['Submit'];
    default:
      return [];
  }
}

/** Map unified action to RBAC permission key. */
export function permissionForLifecycleAction(action: UnifiedLifecycleAction): Permission {
  if (action === 'Release' || action === 'Advance Stage') return 'approve';
  const mapped = APPROVAL_ACTION_PERMISSIONS[action as ApprovalWorkflowAction];
  return mapped ?? 'view';
}

export function workflowToApprovalRequest(workflow: WorkflowInstance): ApprovalRequest {
  const status = lifecycleStatusToApproval(workflow.lifecycleStatus);
  return {
    id: workflow.approvalTask.approvalId,
    title: `${workflow.title} — ${WORKFLOW_STAGE_LABEL[workflow.currentStage]} Gate`,
    itemType: `${WORKFLOW_STAGE_LABEL[workflow.currentStage]} Package`,
    stage: STAGE_TO_APPROVAL_STAGE[workflow.currentStage] as ApprovalRequest['stage'],
    domain: workflow.domain,
    submitter: workflow.owner,
    assignedReviewer: workflow.approvalTask.assignedReviewer,
    status,
    priority: workflow.approvalTask.priority,
    submittedAt: workflow.submittedAt,
    submittedDate: workflow.submittedAt.split(' ').slice(0, 3).join(' '),
    dueDate: workflow.dueDate,
    reviewNotes: workflow.approvalTask.reviewNotes,
    relatedArtifacts: workflow.approvalTask.relatedArtifacts,
    traceabilityChain: workflow.traceabilityChain.map((l) => ({
      stage: WORKFLOW_STAGE_LABEL[l.stage],
      nodeId: l.nodeId,
      label: l.label,
    })),
    traceNodeId: workflow.traceabilityChain.find((l) => l.stage === workflow.currentStage)?.nodeId,
  };
}

function lifecycleStatusToApproval(status: UnifiedLifecycleStatus): ApprovalWorkflowStatus {
  if (status === 'Released' || status === 'Production') return 'Approved';
  if (status === 'Draft') return 'Draft';
  return status as ApprovalWorkflowStatus;
}

export function deriveApprovalRequests(workflows: WorkflowInstance[]): ApprovalRequest[] {
  return workflows
    .filter((w) => w.lifecycleStatus !== 'Production')
    .map(workflowToApprovalRequest);
}

export function workflowHistoryToApprovalHistory(entries: WorkflowHistoryEntry[]): ApprovalHistoryEntry[] {
  return entries.map((e) => ({
    id: e.id,
    approvalId: e.workflowId,
    action: (e.action === 'stage_advance' ? 'Approve' : e.action) as ApprovalWorkflowAction,
    actor: e.actor,
    timestamp: e.timestamp,
    comment: e.comment,
    previousStatus: (e.fromStatus ? lifecycleStatusToApproval(e.fromStatus) : 'Draft'),
    newStatus: (e.toStatus ? lifecycleStatusToApproval(e.toStatus) : 'Submitted'),
  }));
}

export function filterWorkflowsByStage(workflows: WorkflowInstance[], stage: WorkflowLifecycleStage): WorkflowInstance[] {
  const hubStage = stage === 'approval' ? 'release' : stage;
  return workflows.filter((w) => w.currentStage === hubStage || (stage === 'approval' && w.lifecycleStatus === 'Released'));
}

export function filterWorkflowsForPersona(workflows: WorkflowInstance[], personaId: PersonaId): WorkflowInstance[] {
  if (personaId === 'cio') return workflows;
  return workflows.filter(
    (w) => w.ownerPersona === personaId || w.reviewerPersona === personaId || w.approvalTask.reviewerPersona === personaId
      || HUB_STAGES.find((s) => STAGE_OWNER_PERSONA[s] === personaId) === w.currentStage,
  );
}

export function computeUnifiedKpis(workflows: WorkflowInstance[]): UnifiedLifecycleKpis {
  const stageCounts = new Map<WorkflowLifecycleStage, { count: number; totalHours: number }>();
  for (const stage of WORKFLOW_STAGE_ORDER) stageCounts.set(stage, { count: 0, totalHours: 0 });
  for (const w of workflows) {
    const cur = stageCounts.get(w.currentStage)!;
    cur.count += 1;
    cur.totalHours += w.stageDurationHours;
  }
  const workflowBottlenecks = [...stageCounts.entries()]
    .map(([stage, { count, totalHours }]) => ({
      stage,
      count,
      avgHours: count > 0 ? Math.round(totalHours / count) : 0,
    }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.avgHours - a.avgHours);

  const pendingApprovals = workflows.filter((w) => PENDING_LIFECYCLE.includes(w.lifecycleStatus)).length;
  const approvalDelays = pendingApprovals;
  const completed = workflows.filter((w) => w.lifecycleStatus === 'Production').length;
  const slaBreaches = workflows.filter((w) => w.slaBreached).length;
  const deliveryRiskCount = workflows.filter((w) => w.deliveryRisk === 'high' || w.deliveryRisk === 'critical').length;
  const escalatedReviews = workflows.filter((w) => w.lifecycleStatus === 'Escalated').length;
  const approvalBottlenecks = workflows.filter(
    (w) => w.currentStage === 'release' && PENDING_LIFECYCLE.includes(w.lifecycleStatus),
  ).length;

  return {
    activeWorkflows: workflows.filter((w) => w.lifecycleStatus !== 'Production').length,
    avgCompletionPct: workflows.length ? Math.round(workflows.reduce((s, w) => s + w.completionPct, 0) / workflows.length) : 0,
    workflowBottlenecks,
    approvalBottlenecks,
    approvalDelays,
    completionRate: workflows.length ? Math.round((completed / workflows.length) * 100) : 0,
    slaBreaches,
    deliveryRiskCount,
    pendingApprovals,
    escalatedReviews,
  };
}

// Legacy aliases
export const computeWorkflowKpis = computeUnifiedKpis;
export function submitForReview(w: WorkflowInstance, actor: string) {
  return applyUnifiedLifecycleAction(w, 'Submit', actor);
}
export function submitForApproval(w: WorkflowInstance, actor: string) {
  return applyUnifiedLifecycleAction(w, 'Assign Reviewer', actor);
}
export function moveToNextStage(w: WorkflowInstance, actor: string) {
  return applyUnifiedLifecycleAction(w, 'Advance Stage', actor);
}
export function allowedActions(w: WorkflowInstance) {
  return lifecycleActionsFor(w);
}
export { createApprovalTask };
