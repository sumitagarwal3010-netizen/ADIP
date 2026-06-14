import type { PersonaId } from '../config/personaConfig';

export type WorkflowLifecycleStage =
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'approval'
  | 'production';

export type WorkflowApprovalState =
  | 'Not Started'
  | 'In Progress'
  | 'Pending Review'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Blocked';

export type WorkflowOrchestrationAction =
  | 'submit_for_review'
  | 'submit_for_approval'
  | 'move_to_next_stage'
  | 'approve'
  | 'reject';

export interface WorkflowTraceabilityLink {
  stage: WorkflowLifecycleStage;
  nodeId: string;
  label: string;
  status: 'complete' | 'in_progress' | 'pending' | 'blocked';
}

export interface WorkflowHistoryEntry {
  id: string;
  workflowId: string;
  action: WorkflowOrchestrationAction | 'stage_advance';
  actor: string;
  timestamp: string;
  fromStage?: WorkflowLifecycleStage;
  toStage?: WorkflowLifecycleStage;
  comment: string;
}

export interface WorkflowInstance {
  id: string;
  title: string;
  domain: string;
  currentStage: WorkflowLifecycleStage;
  previousStage: WorkflowLifecycleStage | null;
  nextStage: WorkflowLifecycleStage | null;
  approvalState: WorkflowApprovalState;
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
}

export interface WorkflowOrchestrationKpis {
  activeWorkflows: number;
  avgCompletionPct: number;
  bottlenecks: { stage: WorkflowLifecycleStage; count: number; avgHours: number }[];
  stageDurations: { stage: string; hours: number }[];
  approvalDelays: number;
  completionRate: number;
  slaBreaches: number;
}
