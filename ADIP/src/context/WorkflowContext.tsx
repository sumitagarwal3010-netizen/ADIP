import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePersona } from './PersonaContext';
import { useEntitlement } from '../hooks/useEntitlement';
import type { ApprovalHistoryEntry, ApprovalRequest, ApprovalWorkflowAction } from '../data/approvalWorkflowEngine';
import {
  applyUnifiedLifecycleAction,
  computeUnifiedKpis,
  deriveApprovalRequests,
  filterWorkflowsByStage,
  filterWorkflowsForPersona,
  permissionForLifecycleAction,
  workflowHistoryToApprovalHistory,
} from '../data/unifiedLifecycleEngine';
import { WORKFLOW_ORCHESTRATION_MOCK } from '../data/workflowOrchestrationMock';
import type {
  UnifiedLifecycleAction,
  UnifiedLifecycleKpis,
  UnifiedLifecycleStatus,
  WorkflowHistoryEntry,
  WorkflowInstance,
  WorkflowLifecycleStage,
} from '../types/workflowOrchestration';

const STORAGE_KEY = 'adip.unified.lifecycle';

function readPersisted(): WorkflowInstance[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkflowInstance[];
    return parsed.map((w) => ({
      ...w,
      lifecycleStatus: (w.lifecycleStatus ?? (w as { approvalState?: UnifiedLifecycleStatus }).approvalState ?? 'Draft') as UnifiedLifecycleStatus,
    }));
  } catch {
    return null;
  }
}

function persist(workflows: WorkflowInstance[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  } catch { /* ignore */ }
}

interface WorkflowContextValue {
  workflows: WorkflowInstance[];
  history: WorkflowHistoryEntry[];
  kpis: UnifiedLifecycleKpis;
  selectedWorkflowId: string | null;
  setSelectedWorkflowId: (id: string | null) => void;
  getWorkflow: (id: string) => WorkflowInstance | undefined;
  getWorkflowsForHub: (stage: WorkflowLifecycleStage) => WorkflowInstance[];
  getVisibleWorkflows: () => WorkflowInstance[];
  getApprovalRequests: () => ApprovalRequest[];
  getApprovalHistory: () => ApprovalHistoryEntry[];
  canPerformLifecycleAction: (action: UnifiedLifecycleAction) => boolean;
  applyLifecycleAction: (workflowId: string, action: UnifiedLifecycleAction, comment?: string, reviewer?: string) => void;
  /** @deprecated */ submitForReview: (workflowId: string) => void;
  /** @deprecated */ submitForApproval: (workflowId: string) => void;
  /** @deprecated */ moveToNextStage: (workflowId: string) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { persona } = usePersona();
  const entitlement = useEntitlement();
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>(() => readPersisted() ?? WORKFLOW_ORCHESTRATION_MOCK);
  const [history, setHistory] = useState<WorkflowHistoryEntry[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(WORKFLOW_ORCHESTRATION_MOCK[0]?.id ?? null);

  const actor = persona.label;

  const updateWorkflow = useCallback((updated: WorkflowInstance, entry: WorkflowHistoryEntry) => {
    setWorkflows((prev) => {
      const next = prev.map((w) => (w.id === updated.id ? updated : w));
      persist(next);
      return next;
    });
    setHistory((prev) => [entry, ...prev]);
  }, []);

  const getWorkflow = useCallback((id: string) => workflows.find((w) => w.id === id), [workflows]);

  const canPerformLifecycleAction = useCallback((action: UnifiedLifecycleAction) => {
    const perm = permissionForLifecycleAction(action);
    if (action === 'Approve' || action === 'Reject' || action === 'Escalate' || action === 'Release' || action === 'Advance Stage') {
      return entitlement.can(perm, 'approvals');
    }
    return entitlement.canPerformApprovalAction(action as ApprovalWorkflowAction);
  }, [entitlement]);

  const applyLifecycleAction = useCallback((
    workflowId: string,
    action: UnifiedLifecycleAction,
    comment = '',
    reviewer?: string,
  ) => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf || !canPerformLifecycleAction(action)) return;
    const result = applyUnifiedLifecycleAction(wf, action, actor, comment, reviewer);
    updateWorkflow(result.workflow, result.history);
  }, [workflows, actor, updateWorkflow, canPerformLifecycleAction]);

  const handleSubmitForReview = useCallback((workflowId: string) => {
    applyLifecycleAction(workflowId, 'Submit');
  }, [applyLifecycleAction]);

  const handleSubmitForApproval = useCallback((workflowId: string) => {
    applyLifecycleAction(workflowId, 'Assign Reviewer');
  }, [applyLifecycleAction]);

  const handleMoveToNextStage = useCallback((workflowId: string) => {
    applyLifecycleAction(workflowId, 'Advance Stage');
  }, [applyLifecycleAction]);

  const kpis = useMemo(() => computeUnifiedKpis(workflows), [workflows]);
  const approvalRequests = useMemo(() => deriveApprovalRequests(workflows), [workflows]);
  const approvalHistory = useMemo(() => workflowHistoryToApprovalHistory(history), [history]);

  const value = useMemo<WorkflowContextValue>(() => ({
    workflows,
    history,
    kpis,
    selectedWorkflowId,
    setSelectedWorkflowId,
    getWorkflow,
    getWorkflowsForHub: (stage) => filterWorkflowsByStage(workflows, stage),
    getVisibleWorkflows: () => filterWorkflowsForPersona(workflows, persona.id),
    getApprovalRequests: () => approvalRequests,
    getApprovalHistory: () => approvalHistory,
    canPerformLifecycleAction,
    applyLifecycleAction,
    submitForReview: handleSubmitForReview,
    submitForApproval: handleSubmitForApproval,
    moveToNextStage: handleMoveToNextStage,
  }), [
    workflows, history, kpis, selectedWorkflowId, getWorkflow, persona.id,
    approvalRequests, approvalHistory, canPerformLifecycleAction, applyLifecycleAction,
    handleSubmitForReview, handleSubmitForApproval, handleMoveToNextStage,
  ]);

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider');
  return ctx;
}
