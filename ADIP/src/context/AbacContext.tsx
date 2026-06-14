import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { usePersona } from './PersonaContext';
import { useAuth } from './AuthContext';
import type {
  AbacAccessDecision,
  AbacKpis,
  AbacPolicy,
  AbacResourceType,
  DomainAssignment,
  EffectiveAccessSummary,
  UserAttributes,
  VisibilityScope,
} from '../types/abac';
import {
  ABAC_POLICIES,
  DOMAIN_ASSIGNMENTS,
  buildVisibilityScope,
  resolveUserAttributes,
  ABAC_EXEC_SUMMARY,
} from '../data/abacCatalog';
import {
  buildEffectiveAccessSummary,
  computeAbacKpis,
  decideAccess,
} from '../data/abacEngine';
import {
  filterApprovalsByAbac,
  filterEvidenceByAbac,
  filterFindingsByAbac,
  filterNotificationsByAbac,
  filterObservationsByAbac,
  filterTraceNodesByAbac,
  filterWorkflowsByAbac,
  countScopedResources,
} from '../data/rowSecurityEngine';
import { AUDIT_EVIDENCE, AUDIT_FINDINGS, AUDIT_OBSERVATIONS } from '../data/auditCenterMock';
import { PLATFORM_NOTIFICATIONS } from '../data/notificationCenterMock';
import { WORKFLOW_ORCHESTRATION_MOCK } from '../data/workflowOrchestrationMock';
import { TRACE_NODES } from '../data/traceabilityModel';
import { computeAuditKpis } from '../data/auditCenterEngine';
import { deriveApprovalRequests } from '../data/unifiedLifecycleEngine';
import type { AuditEvidence, AuditFinding, AuditObservation } from '../types/auditCenter';
import type { PlatformNotification } from '../types/notificationCenter';
import type { WorkflowInstance } from '../types/workflowOrchestration';
import type { TraceNode } from '../data/traceabilityModel';
import type { ApprovalRequest } from '../data/approvalWorkflowEngine';

interface AbacContextValue {
  userAttributes: UserAttributes;
  visibilityScope: VisibilityScope;
  policies: AbacPolicy[];
  domainAssignments: DomainAssignment[];
  effectiveAccess: EffectiveAccessSummary;
  kpis: AbacKpis;
  execSummary: string;
  scopedWorkflows: WorkflowInstance[];
  scopedNotifications: PlatformNotification[];
  scopedFindings: AuditFinding[];
  scopedObservations: AuditObservation[];
  scopedEvidence: AuditEvidence[];
  scopedTraceNodes: TraceNode[];
  scopedApprovals: ApprovalRequest[];
  scopedAuditKpis: ReturnType<typeof computeAuditKpis>;
  filterWorkflows: (workflows: WorkflowInstance[]) => WorkflowInstance[];
  filterNotifications: (notifications: PlatformNotification[], workflows?: WorkflowInstance[]) => PlatformNotification[];
  filterFindings: (findings: AuditFinding[]) => AuditFinding[];
  filterObservations: (observations: AuditObservation[]) => AuditObservation[];
  filterEvidence: (evidence: AuditEvidence[]) => AuditEvidence[];
  filterTraceNodes: (nodes: TraceNode[]) => TraceNode[];
  canAccessRow: (resourceType: AbacResourceType, entity: Record<string, unknown>) => boolean;
  evaluateAccess: (resourceType: AbacResourceType, entity: Record<string, unknown>) => AbacAccessDecision;
}

const AbacContext = createContext<AbacContextValue | null>(null);

export function AbacProvider({ children }: { children: ReactNode }) {
  const { personaId } = usePersona();
  const { currentUser } = useAuth();

  const userAttributes = useMemo(() => {
    const base = resolveUserAttributes(personaId);
    if (!currentUser) return base;
    return {
      ...base,
      userId: currentUser.user_id,
      department: currentUser.department,
      businessUnit: currentUser.department,
    };
  }, [personaId, currentUser]);

  const visibilityScope = useMemo(() => buildVisibilityScope(personaId), [personaId]);
  const effectiveAccess = useMemo(() => buildEffectiveAccessSummary(personaId), [personaId]);

  const scopedWorkflows = useMemo(
    () => filterWorkflowsByAbac(WORKFLOW_ORCHESTRATION_MOCK, personaId),
    [personaId],
  );
  const scopedNotifications = useMemo(
    () => filterNotificationsByAbac(PLATFORM_NOTIFICATIONS, WORKFLOW_ORCHESTRATION_MOCK, personaId),
    [personaId],
  );
  const scopedFindings = useMemo(() => filterFindingsByAbac(AUDIT_FINDINGS, personaId), [personaId]);
  const scopedObservations = useMemo(() => filterObservationsByAbac(AUDIT_OBSERVATIONS, personaId), [personaId]);
  const scopedEvidence = useMemo(() => filterEvidenceByAbac(AUDIT_EVIDENCE, personaId), [personaId]);
  const scopedTraceNodes = useMemo(() => filterTraceNodesByAbac(TRACE_NODES, personaId), [personaId]);
  const scopedApprovals = useMemo(
    () => filterApprovalsByAbac(deriveApprovalRequests(WORKFLOW_ORCHESTRATION_MOCK), WORKFLOW_ORCHESTRATION_MOCK, personaId),
    [personaId],
  );

  const scopedAuditKpis = useMemo(
    () => computeAuditKpis(scopedEvidence, scopedFindings, scopedObservations),
    [scopedEvidence, scopedFindings, scopedObservations],
  );

  const kpis = useMemo(() => {
    const { total, scoped } = countScopedResources(personaId, {
      workflows: WORKFLOW_ORCHESTRATION_MOCK.length,
      notifications: PLATFORM_NOTIFICATIONS.length,
      findings: AUDIT_FINDINGS.length,
      evidence: AUDIT_EVIDENCE.length,
      traceNodes: TRACE_NODES.length,
    }, {
      workflows: scopedWorkflows.length,
      notifications: scopedNotifications.length,
      findings: scopedFindings.length,
      evidence: scopedEvidence.length,
      traceNodes: scopedTraceNodes.length,
    });
    return computeAbacKpis(personaId, total, scoped);
  }, [personaId, scopedWorkflows, scopedNotifications, scopedFindings, scopedEvidence, scopedTraceNodes]);

  const filterWorkflows = useCallback(
    (workflows: WorkflowInstance[]) => filterWorkflowsByAbac(workflows, personaId),
    [personaId],
  );
  const filterNotifications = useCallback(
    (notifications: PlatformNotification[], workflows = WORKFLOW_ORCHESTRATION_MOCK) =>
      filterNotificationsByAbac(notifications, workflows, personaId),
    [personaId],
  );
  const filterFindings = useCallback(
    (findings: AuditFinding[]) => filterFindingsByAbac(findings, personaId),
    [personaId],
  );
  const filterObservations = useCallback(
    (observations: AuditObservation[]) => filterObservationsByAbac(observations, personaId),
    [personaId],
  );
  const filterEvidence = useCallback(
    (evidence: AuditEvidence[]) => filterEvidenceByAbac(evidence, personaId),
    [personaId],
  );
  const filterTraceNodes = useCallback(
    (nodes: TraceNode[]) => filterTraceNodesByAbac(nodes, personaId),
    [personaId],
  );

  const canAccessRow = useCallback(
    (resourceType: AbacResourceType, entity: Record<string, unknown>) =>
      decideAccess(personaId, resourceType, entity).allowed,
    [personaId],
  );

  const evaluateAccess = useCallback(
    (resourceType: AbacResourceType, entity: Record<string, unknown>) =>
      decideAccess(personaId, resourceType, entity),
    [personaId],
  );

  const value = useMemo<AbacContextValue>(() => ({
    userAttributes,
    visibilityScope,
    policies: ABAC_POLICIES,
    domainAssignments: DOMAIN_ASSIGNMENTS,
    effectiveAccess,
    kpis,
    execSummary: ABAC_EXEC_SUMMARY,
    scopedWorkflows,
    scopedNotifications,
    scopedFindings,
    scopedObservations,
    scopedEvidence,
    scopedTraceNodes,
    scopedApprovals,
    scopedAuditKpis,
    filterWorkflows,
    filterNotifications,
    filterFindings,
    filterObservations,
    filterEvidence,
    filterTraceNodes,
    canAccessRow,
    evaluateAccess,
  }), [
    userAttributes, visibilityScope, effectiveAccess, kpis,
    scopedWorkflows, scopedNotifications, scopedFindings, scopedObservations,
    scopedEvidence, scopedTraceNodes, scopedApprovals, scopedAuditKpis,
    filterWorkflows, filterNotifications, filterFindings, filterObservations,
    filterEvidence, filterTraceNodes, canAccessRow, evaluateAccess,
  ]);

  return <AbacContext.Provider value={value}>{children}</AbacContext.Provider>;
}

export function useAbac(): AbacContextValue {
  const ctx = useContext(AbacContext);
  if (!ctx) throw new Error('useAbac must be used within AbacProvider');
  return ctx;
}

export { AbacContext };
