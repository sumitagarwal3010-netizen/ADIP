import type { ActivityRecord, EventCategory, EventEnvelope, EventSeverity } from '../types/events';
import { nextCorrelationId } from '../events/EventEnvelope';

const WORKFLOWS = ['WF-001', 'WF-002', 'WF-003', 'WF-004', 'WF-005', 'WF-006'];
const FINDINGS = Array.from({ length: 40 }, (_, i) => `FND-${String(i + 1).padStart(3, '0')}`);
const OBSERVATIONS = Array.from({ length: 25 }, (_, i) => `OBS-${String(i + 1).padStart(3, '0')}`);
const EVIDENCE = Array.from({ length: 75 }, (_, i) => `EVD-AUD-${String(i + 1).padStart(3, '0')}`);
const NOTIFICATIONS = Array.from({ length: 100 }, (_, i) => `NTF-${String(i + 1).padStart(4, '0')}`);
const APPROVALS = WORKFLOWS.map((w) => `APR-${w}-release`);
const ACTORS = ['CIO Office', 'Audit Office', 'Compliance Officer', 'Release Manager', 'Platform Administrator', 'CISO Office', 'Application Owner'];
const SOURCES = [
  'Authentication', 'RBAC', 'WorkflowOrchestration', 'ApprovalWorkflow', 'AuditCenter',
  'EvidenceRepository', 'NotificationCenter', 'GovernanceHub', 'AIGovernanceHub', 'ArtifactFramework',
];

type EventTemplate = {
  type: string;
  category: EventCategory;
  source: string;
  entityType: string;
  entityId: (i: number) => string;
  severity: EventSeverity;
  message: (i: number) => string;
  action: string;
  module: string;
};

const TEMPLATES: EventTemplate[] = [
  { type: 'auth.login.success', category: 'authentication', source: 'Authentication', entityType: 'user', entityId: (i) => `usr-${(i % 8) + 1}`, severity: 'info', message: () => 'User authenticated via SSO', action: 'Login', module: 'Authentication' },
  { type: 'rbac.sod.violation', category: 'rbac', source: 'RBAC', entityType: 'role', entityId: (i) => `role-${(i % 5) + 1}`, severity: 'critical', message: () => 'Segregation of duties violation detected', action: 'SoD Check', module: 'RBAC' },
  { type: 'workflow.stage.changed', category: 'workflow', source: 'WorkflowOrchestration', entityType: 'workflow', entityId: (i) => WORKFLOWS[i % WORKFLOWS.length], severity: 'info', message: (i) => `Stage advanced on ${WORKFLOWS[i % WORKFLOWS.length]}`, action: 'Stage Change', module: 'Workflow' },
  { type: 'approval.approved', category: 'approval', source: 'ApprovalWorkflow', entityType: 'approval', entityId: (i) => APPROVALS[i % APPROVALS.length], severity: 'info', message: (i) => `Approval granted for ${APPROVALS[i % APPROVALS.length]}`, action: 'Approve', module: 'Approval' },
  { type: 'approval.rejected', category: 'approval', source: 'ApprovalWorkflow', entityType: 'approval', entityId: (i) => APPROVALS[i % APPROVALS.length], severity: 'high', message: () => 'Approval rejected — remediation required', action: 'Reject', module: 'Approval' },
  { type: 'approval.escalated', category: 'approval', source: 'ApprovalWorkflow', entityType: 'approval', entityId: (i) => APPROVALS[i % APPROVALS.length], severity: 'high', message: () => 'Approval escalated to executive reviewer', action: 'Escalate', module: 'Approval' },
  { type: 'approval.released', category: 'approval', source: 'ApprovalWorkflow', entityType: 'workflow', entityId: (i) => WORKFLOWS[i % WORKFLOWS.length], severity: 'info', message: (i) => `Release executed for ${WORKFLOWS[i % WORKFLOWS.length]}`, action: 'Release', module: 'Approval' },
  { type: 'approval.production.promoted', category: 'approval', source: 'WorkflowOrchestration', entityType: 'workflow', entityId: (i) => WORKFLOWS[i % WORKFLOWS.length], severity: 'medium', message: (i) => `${WORKFLOWS[i % WORKFLOWS.length]} promoted to production`, action: 'Promote', module: 'Workflow' },
  { type: 'audit.finding.opened', category: 'audit', source: 'AuditCenter', entityType: 'audit-finding', entityId: (i) => FINDINGS[i % FINDINGS.length], severity: 'high', message: (i) => `Finding ${FINDINGS[i % FINDINGS.length]} opened`, action: 'Open Finding', module: 'Audit' },
  { type: 'audit.observation.created', category: 'audit', source: 'AuditCenter', entityType: 'audit-observation', entityId: (i) => OBSERVATIONS[i % OBSERVATIONS.length], severity: 'medium', message: (i) => `Observation ${OBSERVATIONS[i % OBSERVATIONS.length]} logged`, action: 'Create Observation', module: 'Audit' },
  { type: 'audit.compliance.changed', category: 'audit', source: 'AuditCenter', entityType: 'compliance-control', entityId: (i) => `CTL-${(i % 20) + 1}`, severity: 'medium', message: () => 'Compliance posture updated', action: 'Compliance Update', module: 'Audit' },
  { type: 'evidence.uploaded', category: 'evidence', source: 'EvidenceRepository', entityType: 'evidence', entityId: (i) => EVIDENCE[i % EVIDENCE.length], severity: 'info', message: (i) => `Evidence ${EVIDENCE[i % EVIDENCE.length]} uploaded`, action: 'Upload Evidence', module: 'Evidence' },
  { type: 'notification.created', category: 'notification', source: 'NotificationCenter', entityType: 'notification', entityId: (i) => NOTIFICATIONS[i % NOTIFICATIONS.length], severity: 'medium', message: (i) => `Notification ${NOTIFICATIONS[i % NOTIFICATIONS.length]} created from event`, action: 'Create Notification', module: 'Notification' },
  { type: 'governance.policy.violation', category: 'governance', source: 'GovernanceHub', entityType: 'policy', entityId: (i) => `POL-${(i % 12) + 1}`, severity: 'critical', message: () => 'Governance policy violation detected', action: 'Policy Check', module: 'Governance' },
  { type: 'ai-governance.model.risk', category: 'ai-governance', source: 'AIGovernanceHub', entityType: 'ai-model', entityId: (i) => `MDL-${(i % 15) + 1}`, severity: 'critical', message: () => 'Model risk threshold breached', action: 'Risk Alert', module: 'AI Governance' },
  { type: 'artifact.generated', category: 'artifact', source: 'ArtifactFramework', entityType: 'artifact', entityId: (i) => `ART-${(i % 30) + 1}`, severity: 'info', message: () => 'Hub artifact generated', action: 'Generate Artifact', module: 'Artifacts' },
  { type: 'workflow.sla.breach', category: 'workflow', source: 'WorkflowOrchestration', entityType: 'workflow', entityId: (i) => WORKFLOWS[i % WORKFLOWS.length], severity: 'critical', message: () => 'Workflow SLA breach detected', action: 'SLA Breach', module: 'Workflow' },
  { type: 'workflow.blocked', category: 'workflow', source: 'WorkflowOrchestration', entityType: 'workflow', entityId: (i) => WORKFLOWS[i % WORKFLOWS.length], severity: 'high', message: () => 'Workflow blocked at stage gate', action: 'Block', module: 'Workflow' },
];

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3_600_000).toISOString();
}

export function generateMockEvents(count = 250): EventEnvelope[] {
  const events: EventEnvelope[] = [];
  const correlationGroups = Array.from({ length: 30 }, () => nextCorrelationId('WF'));

  for (let i = 0; i < count; i++) {
    const tpl = TEMPLATES[i % TEMPLATES.length];
    const wf = WORKFLOWS[i % WORKFLOWS.length];
    const correlationId = tpl.category === 'workflow' || tpl.category === 'approval'
      ? correlationGroups[i % correlationGroups.length]
      : nextCorrelationId('COR');

    events.push({
      id: `EVT-MOCK-${String(i + 1).padStart(4, '0')}`,
      type: tpl.type,
      category: tpl.category,
      source: tpl.source,
      entityType: tpl.entityType,
      entityId: tpl.entityId(i),
      severity: tpl.severity,
      timestamp: hoursAgo(i * 0.8),
      actor: ACTORS[i % ACTORS.length],
      correlationId,
      message: tpl.message(i),
      payload: {
        workflowId: wf,
        notificationId: NOTIFICATIONS[i % NOTIFICATIONS.length],
        findingId: FINDINGS[i % FINDINGS.length],
        evidenceId: EVIDENCE[i % EVIDENCE.length],
      },
    });
  }

  return events;
}

export function generateMockActivities(events: EventEnvelope[], count = 100): ActivityRecord[] {
  return events.slice(0, count).map((e, i) => {
    const tpl = TEMPLATES.find((t) => t.type === e.type) ?? TEMPLATES[0];
    return {
      id: `ACT-${String(i + 1).padStart(4, '0')}`,
      timestamp: e.timestamp,
      actor: e.actor,
      action: tpl.action,
      module: tpl.module,
      severity: e.severity,
      entityType: e.entityType,
      entityId: e.entityId,
      eventId: e.id,
      correlationId: e.correlationId,
    };
  });
}

export const MOCK_EVENTS = generateMockEvents(250);
export const MOCK_ACTIVITIES = generateMockActivities(MOCK_EVENTS, 100);

export const ACTIVITY_EXEC_SUMMARY =
  'Platform event bus processed 250 events across 10 categories with 18 critical and 42 high-severity signals in the last 7 days. ' +
  'Workflow and approval events dominate volume (38%), followed by audit and evidence lineage (27%). Event-driven notifications are active with ' +
  'cross-linked traceability from workflows through events to audit records. Recommended: review 6 unresolved critical governance events.';

export { WORKFLOWS, FINDINGS, EVIDENCE, NOTIFICATIONS, SOURCES };
