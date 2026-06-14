import type { PersonaId } from '../config/personaConfig';
import type {
  WorkflowApprovalState,
  WorkflowHistoryEntry,
  WorkflowInstance,
  WorkflowLifecycleStage,
  WorkflowOrchestrationAction,
  WorkflowOrchestrationKpis,
} from '../types/workflowOrchestration';

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

export function getPreviousStage(stage: WorkflowLifecycleStage): WorkflowLifecycleStage | null {
  const idx = WORKFLOW_STAGE_ORDER.indexOf(stage);
  return idx > 0 ? WORKFLOW_STAGE_ORDER[idx - 1] : null;
}

export function getNextStage(stage: WorkflowLifecycleStage): WorkflowLifecycleStage | null {
  const idx = WORKFLOW_STAGE_ORDER.indexOf(stage);
  return idx < WORKFLOW_STAGE_ORDER.length - 1 ? WORKFLOW_STAGE_ORDER[idx + 1] : null;
}

export function computeCompletionPct(stage: WorkflowLifecycleStage, approvalState: WorkflowApprovalState): number {
  const idx = WORKFLOW_STAGE_ORDER.indexOf(stage);
  const base = Math.round(((idx + 1) / WORKFLOW_STAGE_ORDER.length) * 100);
  if (approvalState === 'Approved' && stage !== 'production') return Math.min(base, 95);
  if (stage === 'production') return 100;
  if (approvalState === 'Pending Approval') return base - 5;
  if (approvalState === 'Blocked' || approvalState === 'Rejected') return base - 10;
  return base;
}

function timestamp(): string {
  return new Date().toLocaleString('en-IN', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function historyEntry(
  workflowId: string,
  action: WorkflowHistoryEntry['action'],
  actor: string,
  comment: string,
  fromStage?: WorkflowLifecycleStage,
  toStage?: WorkflowLifecycleStage,
): WorkflowHistoryEntry {
  return {
    id: `wf-hist-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    workflowId,
    action,
    actor,
    timestamp: timestamp(),
    fromStage,
    toStage,
    comment,
  };
}

function updateChainStatus(
  chain: WorkflowInstance['traceabilityChain'],
  currentStage: WorkflowLifecycleStage,
): WorkflowInstance['traceabilityChain'] {
  const idx = WORKFLOW_STAGE_ORDER.indexOf(currentStage);
  return chain.map((link) => {
    const linkIdx = WORKFLOW_STAGE_ORDER.indexOf(link.stage);
    if (linkIdx < idx) return { ...link, status: 'complete' as const };
    if (linkIdx === idx) return { ...link, status: 'in_progress' as const };
    return { ...link, status: 'pending' as const };
  });
}

export function submitForReview(
  workflow: WorkflowInstance,
  actor: string,
): { workflow: WorkflowInstance; history: WorkflowHistoryEntry } {
  const reviewer = STAGE_REVIEWER[workflow.currentStage];
  const updated: WorkflowInstance = {
    ...workflow,
    approvalState: 'Pending Review',
    reviewer: reviewer?.name ?? workflow.reviewer,
    reviewerPersona: reviewer?.persona ?? workflow.reviewerPersona,
    pendingActions: ['Awaiting reviewer sign-off', 'Complete stage checklist'],
    completionPct: computeCompletionPct(workflow.currentStage, 'Pending Review'),
    traceabilityChain: updateChainStatus(workflow.traceabilityChain, workflow.currentStage),
  };
  return {
    workflow: updated,
    history: historyEntry(workflow.id, 'submit_for_review', actor, `Submitted for review at ${WORKFLOW_STAGE_LABEL[workflow.currentStage]}`, workflow.currentStage),
  };
}

export function submitForApproval(
  workflow: WorkflowInstance,
  actor: string,
): { workflow: WorkflowInstance; history: WorkflowHistoryEntry } {
  const updated: WorkflowInstance = {
    ...workflow,
    approvalState: 'Pending Approval',
    pendingActions: ['Approval gate review', 'Verify traceability chain'],
    completionPct: computeCompletionPct(workflow.currentStage, 'Pending Approval'),
  };
  return {
    workflow: updated,
    history: historyEntry(workflow.id, 'submit_for_approval', actor, `Submitted for approval at ${WORKFLOW_STAGE_LABEL[workflow.currentStage]}`, workflow.currentStage),
  };
}

export function moveToNextStage(
  workflow: WorkflowInstance,
  actor: string,
): { workflow: WorkflowInstance; history: WorkflowHistoryEntry } {
  const next = getNextStage(workflow.currentStage);
  if (!next) return { workflow, history: historyEntry(workflow.id, 'stage_advance', actor, 'Already at final stage') };

  const reviewer = STAGE_REVIEWER[next];
  const updated: WorkflowInstance = {
    ...workflow,
    previousStage: workflow.currentStage,
    currentStage: next,
    nextStage: getNextStage(next),
    approvalState: next === 'production' ? 'Approved' : 'In Progress',
    owner: STAGE_OWNER_LABEL[next],
    ownerPersona: STAGE_OWNER_PERSONA[next],
    reviewer: reviewer?.name ?? null,
    reviewerPersona: reviewer?.persona ?? null,
    stageEnteredAt: timestamp(),
    stageDurationHours: 0,
    pendingActions: next === 'approval' ? ['Go/No-Go decision', 'Regulatory sign-off'] : [`Complete ${WORKFLOW_STAGE_LABEL[next]} deliverables`],
    completionPct: computeCompletionPct(next, 'In Progress'),
    traceabilityChain: updateChainStatus(workflow.traceabilityChain, next),
  };
  return {
    workflow: updated,
    history: historyEntry(workflow.id, 'move_to_next_stage', actor, `Advanced to ${WORKFLOW_STAGE_LABEL[next]}`, workflow.currentStage, next),
  };
}

export function filterWorkflowsByStage(workflows: WorkflowInstance[], stage: WorkflowLifecycleStage): WorkflowInstance[] {
  return workflows.filter((w) => w.currentStage === stage);
}

export function filterWorkflowsForPersona(workflows: WorkflowInstance[], personaId: PersonaId): WorkflowInstance[] {
  if (personaId === 'cio') return workflows;
  return workflows.filter(
    (w) => w.ownerPersona === personaId || w.reviewerPersona === personaId || w.currentStage === stageForPersona(personaId),
  );
}

function stageForPersona(personaId: PersonaId): WorkflowLifecycleStage | null {
  const entry = Object.entries(STAGE_OWNER_PERSONA).find(([, p]) => p === personaId);
  return entry ? (entry[0] as WorkflowLifecycleStage) : null;
}

export function computeWorkflowKpis(workflows: WorkflowInstance[]): WorkflowOrchestrationKpis {
  const stageCounts = new Map<WorkflowLifecycleStage, { count: number; totalHours: number }>();
  for (const stage of WORKFLOW_STAGE_ORDER) stageCounts.set(stage, { count: 0, totalHours: 0 });
  for (const w of workflows) {
    const cur = stageCounts.get(w.currentStage)!;
    cur.count += 1;
    cur.totalHours += w.stageDurationHours;
  }
  const bottlenecks = [...stageCounts.entries()]
    .map(([stage, { count, totalHours }]) => ({
      stage,
      count,
      avgHours: count > 0 ? Math.round(totalHours / count) : 0,
    }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.avgHours - a.avgHours);

  const approvalDelays = workflows.filter((w) => w.approvalState === 'Pending Approval' || w.approvalState === 'Pending Review').length;
  const completed = workflows.filter((w) => w.currentStage === 'production').length;
  const slaBreaches = workflows.filter((w) => w.slaBreached).length;

  return {
    activeWorkflows: workflows.filter((w) => w.currentStage !== 'production').length,
    avgCompletionPct: Math.round(workflows.reduce((s, w) => s + w.completionPct, 0) / workflows.length),
    bottlenecks,
    stageDurations: WORKFLOW_STAGE_ORDER.map((stage) => ({
      stage: WORKFLOW_STAGE_LABEL[stage],
      hours: stageCounts.get(stage)?.totalHours ?? 0,
    })),
    approvalDelays,
    completionRate: Math.round((completed / workflows.length) * 100),
    slaBreaches,
  };
}

export function allowedActions(workflow: WorkflowInstance): WorkflowOrchestrationAction[] {
  const actions: WorkflowOrchestrationAction[] = [];
  if (workflow.approvalState === 'In Progress' || workflow.approvalState === 'Not Started') {
    actions.push('submit_for_review');
  }
  if (workflow.approvalState === 'Pending Review') {
    actions.push('submit_for_approval');
  }
  if (workflow.approvalState === 'Approved' || workflow.approvalState === 'Pending Approval') {
    actions.push('move_to_next_stage');
  }
  return actions;
}
