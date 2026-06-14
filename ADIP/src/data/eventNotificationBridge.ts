import type { EventEnvelope } from '../types/events';
import type { PlatformNotification } from '../types/notificationCenter';

const NOTIFIABLE_TYPES = new Set([
  'approval.rejected',
  'approval.escalated',
  'workflow.sla.breach',
  'workflow.blocked',
  'audit.finding.opened',
  'governance.policy.violation',
  'ai-governance.model.risk',
  'rbac.sod.violation',
]);

const SEVERITY_MAP: Record<string, PlatformNotification['severity']> = {
  info: 'low',
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

const TYPE_MAP: Record<string, PlatformNotification['type']> = {
  'approval.rejected': 'Approval Request',
  'approval.escalated': 'Escalation',
  'workflow.sla.breach': 'Critical',
  'workflow.blocked': 'Warning',
  'audit.finding.opened': 'Audit Alert',
  'governance.policy.violation': 'Compliance Alert',
  'ai-governance.model.risk': 'Security Alert',
  'rbac.sod.violation': 'Security Alert',
};

export function shouldCreateNotificationFromEvent(event: EventEnvelope): boolean {
  if (event.id.startsWith('EVT-MOCK-')) return false;
  return NOTIFIABLE_TYPES.has(event.type) || event.severity === 'critical';
}

export function eventToNotification(event: EventEnvelope): PlatformNotification | null {
  if (!shouldCreateNotificationFromEvent(event)) return null;

  const workflowId = typeof event.payload?.workflowId === 'string' ? event.payload.workflowId : undefined;
  const now = new Date().toISOString();

  return {
    id: `NTF-EVT-${event.id}`,
    title: event.message,
    message: `Event-driven alert from ${event.source}: ${event.type}`,
    type: TYPE_MAP[event.type] ?? (event.severity === 'critical' ? 'Critical' : 'Warning'),
    severity: SEVERITY_MAP[event.severity] ?? 'medium',
    status: 'Open',
    source: event.source === 'WorkflowOrchestration' ? 'Workflow Lifecycle'
      : event.source === 'AuditCenter' ? 'Audit Findings'
      : event.source === 'RBAC' ? 'RBAC'
      : 'Governance',
    escalationLevel: event.severity === 'critical' ? 'Executive Escalation' : 'Level 1',
    escalationTrigger: event.type.includes('sla') ? 'SLA Breach'
      : event.type.includes('finding') ? 'Critical Finding'
      : event.type.includes('policy') ? 'Compliance Violation'
      : 'Workflow Blocker',
    owner: event.actor,
    ownerPersona: 'operations-manager',
    createdAt: now,
    read: false,
    acknowledgedAt: null,
    resolvedAt: null,
    dismissedAt: null,
    linkedWorkflow: workflowId ?? null,
    linkedApproval: typeof event.payload?.approvalId === 'string' ? event.payload.approvalId : null,
    linkedFinding: typeof event.payload?.findingId === 'string' ? event.payload.findingId : null,
    linkedEvidence: typeof event.payload?.evidenceId === 'string' ? event.payload.evidenceId : null,
    linkedIncident: null,
    deliveries: [{ channel: 'In-App', status: 'Delivered', deliveredAt: now, readAt: null }],
  };
}

export type NotificationFromEventHandler = (notification: PlatformNotification, event: EventEnvelope) => void;

let handler: NotificationFromEventHandler | null = null;

export function registerEventNotificationHandler(fn: NotificationFromEventHandler): void {
  handler = fn;
}

export function unregisterEventNotificationHandler(): void {
  handler = null;
}

export function dispatchEventNotification(event: EventEnvelope): void {
  if (!handler) return;
  const notification = eventToNotification(event);
  if (notification) handler(notification, event);
}
