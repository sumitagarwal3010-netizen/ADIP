import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePersona } from './PersonaContext';
import {
  computeWorkflowKpis,
  filterWorkflowsByStage,
  filterWorkflowsForPersona,
  moveToNextStage,
  submitForApproval,
  submitForReview,
} from '../data/workflowOrchestrationEngine';
import { WORKFLOW_ORCHESTRATION_MOCK } from '../data/workflowOrchestrationMock';
import type {
  WorkflowHistoryEntry,
  WorkflowInstance,
  WorkflowLifecycleStage,
  WorkflowOrchestrationKpis,
} from '../types/workflowOrchestration';

const STORAGE_KEY = 'adip.workflow.orchestration';

function readPersisted(): WorkflowInstance[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkflowInstance[];
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
  kpis: WorkflowOrchestrationKpis;
  selectedWorkflowId: string | null;
  setSelectedWorkflowId: (id: string | null) => void;
  getWorkflow: (id: string) => WorkflowInstance | undefined;
  getWorkflowsForHub: (stage: WorkflowLifecycleStage) => WorkflowInstance[];
  getVisibleWorkflows: () => WorkflowInstance[];
  submitForReview: (workflowId: string) => void;
  submitForApproval: (workflowId: string) => void;
  moveToNextStage: (workflowId: string) => void;
}

const WorkflowContext = createContext<WorkflowContextValue | null>(null);

export function WorkflowProvider({ children }: { children: ReactNode }) {
  const { persona } = usePersona();
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

  const handleSubmitForReview = useCallback((workflowId: string) => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf) return;
    const result = submitForReview(wf, actor);
    updateWorkflow(result.workflow, result.history);
  }, [workflows, actor, updateWorkflow]);

  const handleSubmitForApproval = useCallback((workflowId: string) => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf) return;
    const result = submitForApproval(wf, actor);
    updateWorkflow(result.workflow, result.history);
  }, [workflows, actor, updateWorkflow]);

  const handleMoveToNextStage = useCallback((workflowId: string) => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf) return;
    const result = moveToNextStage(wf, actor);
    updateWorkflow(result.workflow, result.history);
  }, [workflows, actor, updateWorkflow]);

  const kpis = useMemo(() => computeWorkflowKpis(workflows), [workflows]);

  const value = useMemo<WorkflowContextValue>(() => ({
    workflows,
    history,
    kpis,
    selectedWorkflowId,
    setSelectedWorkflowId,
    getWorkflow,
    getWorkflowsForHub: (stage) => filterWorkflowsByStage(workflows, stage),
    getVisibleWorkflows: () => filterWorkflowsForPersona(workflows, persona.id),
    submitForReview: handleSubmitForReview,
    submitForApproval: handleSubmitForApproval,
    moveToNextStage: handleMoveToNextStage,
  }), [
    workflows, history, kpis, selectedWorkflowId, getWorkflow, persona.id,
    handleSubmitForReview, handleSubmitForApproval, handleMoveToNextStage,
  ]);

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
}

export function useWorkflow(): WorkflowContextValue {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used within WorkflowProvider');
  return ctx;
}
