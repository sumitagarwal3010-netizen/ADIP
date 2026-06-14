import type { PersonaId } from '../config/personaConfig';

export type WorkflowLifecycleStage =
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'approval'
  | 'production';

/** Unified lifecycle — single model for workflow orchestration and approval gates. */
export type UnifiedLifecycleStatus =
  | 'Draft'
  | 'Submitted'
  | 'Assigned'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Changes Requested'
  | 'Escalated'
  | 'Released'
  | 'Production';

export type UnifiedLifecycleAction =
  | 'Submit'
  | 'Assign Reviewer'
  | 'Reassign Reviewer'
  | 'Approve'
  | 'Reject'
  | 'Request Changes'
  | 'Escalate'
  | 'Release'
  | 'Advance Stage';

export interface WorkflowApprovalTask {
  approvalId: string;
  stageGate: WorkflowLifecycleStage;
  assignedReviewer: string | null;
  reviewerPersona: PersonaId | null;
  reviewNotes: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  relatedArtifacts: { id: string; name: string; type: string }[];
}

export interface WorkflowTraceabilityLink {
  stage: WorkflowLifecycleStage;
  nodeId: string;
  label: string;
  status: 'complete' | 'in_progress' | 'pending' | 'blocked';
  approvalStatus?: UnifiedLifecycleStatus;
}

export interface WorkflowHistoryEntry {
  id: string;
  workflowId: string;
  action: UnifiedLifecycleAction | 'stage_advance';
  actor: string;
  timestamp: string;
  fromStage?: WorkflowLifecycleStage;
  toStage?: WorkflowLifecycleStage;
  fromStatus?: UnifiedLifecycleStatus;
  toStatus?: UnifiedLifecycleStatus;
  comment: string;
}

export interface WorkflowInstance {
  id: string;
  title: string;
  domain: string;
  currentStage: WorkflowLifecycleStage;
  previousStage: WorkflowLifecycleStage | null;
  nextStage: WorkflowLifecycleStage | null;
  lifecycleStatus: UnifiedLifecycleStatus;
  approvalTask: WorkflowApprovalTask;
  owner: string;
  ownerPersona: PersonaId;
  reviewer: string | null;
  reviewerPersona: PersonaId | null;
  completionPct: number;
  dueDate: string;
  submittedAt: string;
  stageEnteredAt: string;
  pendingActions: string[];
  traceabilityStatus: 'linked' | 'partial' | 'gap';
  traceabilityChain: WorkflowTraceabilityLink[];
  slaBreached: boolean;
  stageDurationHours: number;
  deliveryRisk: 'low' | 'medium' | 'high' | 'critical';
}

export interface UnifiedLifecycleKpis {
  activeWorkflows: number;
  avgCompletionPct: number;
  workflowBottlenecks: { stage: WorkflowLifecycleStage; count: number; avgHours: number }[];
  approvalBottlenecks: number;
  approvalDelays: number;
  completionRate: number;
  slaBreaches: number;
  deliveryRiskCount: number;
  pendingApprovals: number;
  escalatedReviews: number;
}

/** @deprecated Use UnifiedLifecycleStatus */
export type WorkflowApprovalState = UnifiedLifecycleStatus;

/** @deprecated Use UnifiedLifecycleAction */
export type WorkflowOrchestrationAction = UnifiedLifecycleAction;

/** @deprecated Use UnifiedLifecycleKpis */
export type WorkflowOrchestrationKpis = UnifiedLifecycleKpis;
