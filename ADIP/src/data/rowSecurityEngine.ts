import type { PersonaId } from '../config/personaConfig';
import type { AuditEvidence, AuditFinding, AuditObservation } from '../types/auditCenter';
import type { PlatformNotification } from '../types/notificationCenter';
import type { WorkflowInstance } from '../types/workflowOrchestration';
import type { TraceNode } from './traceabilityModel';
import type { ApprovalRequest } from './approvalWorkflowEngine';
import type { UserAttributes, VisibilityScope } from '../types/abac';
import { buildVisibilityScope, resolveUserAttributes } from './abacCatalog';
import { decideAccess, resolveResourceAttributes } from './abacEngine';
import { DOMAIN_APPLICATIONS } from '../types/abac';

function canView(
  personaId: PersonaId,
  resourceType: Parameters<typeof decideAccess>[1],
  entity: Record<string, unknown>,
  scope: VisibilityScope,
  user: UserAttributes,
): boolean {
  if (scope.global) return true;

  const resource = resolveResourceAttributes(resourceType, entity);

  if (scope.kind === 'application') {
    return user.applicationOwnership.includes(resource.application)
      || user.assignedDomains.includes(resource.domain)
      || (DOMAIN_APPLICATIONS[resource.domain] ?? []).some((a) => user.applicationOwnership.includes(a));
  }

  if (scope.kind === 'portfolio' || scope.kind === 'domain' || scope.kind === 'security-domains') {
    return scope.domains.includes(resource.domain);
  }

  return decideAccess(personaId, resourceType, entity).allowed;
}

export function filterWorkflowsByAbac(
  workflows: WorkflowInstance[],
  personaId: PersonaId,
): WorkflowInstance[] {
  const scope = buildVisibilityScope(personaId);
  const user = resolveUserAttributes(personaId);
  if (scope.global) return workflows;
  return workflows.filter((w) => canView(personaId, 'workflow', w as unknown as Record<string, unknown>, scope, user));
}

export function filterApprovalsByAbac(
  approvals: ApprovalRequest[],
  workflows: WorkflowInstance[],
  personaId: PersonaId,
): ApprovalRequest[] {
  const scope = buildVisibilityScope(personaId);
  if (scope.global) return approvals;
  const visibleDomains = new Set(filterWorkflowsByAbac(workflows, personaId).map((w) => w.domain));
  return approvals.filter((a) => visibleDomains.has(a.domain) || scope.domains.includes(a.domain));
}

export function filterNotificationsByAbac(
  notifications: PlatformNotification[],
  workflows: WorkflowInstance[],
  personaId: PersonaId,
): PlatformNotification[] {
  const scope = buildVisibilityScope(personaId);
  const user = resolveUserAttributes(personaId);
  if (scope.global) return notifications;

  const wfDomains = new Map(workflows.map((w) => [w.id, w.domain]));

  return notifications.filter((n) => {
    const domain = n.linkedWorkflow ? (wfDomains.get(n.linkedWorkflow) ?? 'Enterprise') : 'Enterprise';
    return canView(personaId, 'notification', {
      ...n,
      domain,
      ownerPersona: n.ownerPersona,
    } as unknown as Record<string, unknown>, scope, user);
  });
}

export function filterFindingsByAbac(
  findings: AuditFinding[],
  personaId: PersonaId,
): AuditFinding[] {
  const scope = buildVisibilityScope(personaId);
  const user = resolveUserAttributes(personaId);
  if (scope.global) return findings;
  return findings.filter((f) => canView(personaId, 'audit-finding', f as unknown as Record<string, unknown>, scope, user));
}

export function filterObservationsByAbac(
  observations: AuditObservation[],
  personaId: PersonaId,
): AuditObservation[] {
  const scope = buildVisibilityScope(personaId);
  const user = resolveUserAttributes(personaId);
  if (scope.global) return observations;
  return observations.filter((o) => canView(personaId, 'audit-observation', o as unknown as Record<string, unknown>, scope, user));
}

export function filterEvidenceByAbac(
  evidence: AuditEvidence[],
  personaId: PersonaId,
): AuditEvidence[] {
  const scope = buildVisibilityScope(personaId);
  const user = resolveUserAttributes(personaId);
  if (scope.global) return evidence;
  return evidence.filter((e) => canView(personaId, 'evidence', e as unknown as Record<string, unknown>, scope, user));
}

export function filterTraceNodesByAbac(
  nodes: TraceNode[],
  personaId: PersonaId,
): TraceNode[] {
  const scope = buildVisibilityScope(personaId);
  const user = resolveUserAttributes(personaId);
  if (scope.global) return nodes;
  return nodes.filter((n) => canView(personaId, 'traceability', {
    id: n.id,
    domain: n.domain,
    owner: n.owner,
    classification: n.type,
  } as unknown as Record<string, unknown>, scope, user));
}

export function countScopedResources(
  personaId: PersonaId,
  totals: { workflows: number; notifications: number; findings: number; evidence: number; traceNodes: number },
  scoped: { workflows: number; notifications: number; findings: number; evidence: number; traceNodes: number },
): { total: number; scoped: number } {
  const total = totals.workflows + totals.notifications + totals.findings + totals.evidence + totals.traceNodes;
  const scopedCount = scoped.workflows + scoped.notifications + scoped.findings + scoped.evidence + scoped.traceNodes;
  void personaId;
  return { total, scoped: scopedCount };
}
