import type { EventCategory, EventTypeDefinition } from '../types/events';

const DEFINITIONS: EventTypeDefinition[] = [
  { type: 'auth.login.success', category: 'authentication', label: 'Login Success', description: 'User authenticated successfully', defaultSeverity: 'info' },
  { type: 'auth.login.failed', category: 'authentication', label: 'Login Failed', description: 'Authentication attempt failed', defaultSeverity: 'medium' },
  { type: 'auth.logout', category: 'authentication', label: 'Logout', description: 'User session terminated', defaultSeverity: 'info' },
  { type: 'auth.session.expired', category: 'authentication', label: 'Session Expired', description: 'Session TTL exceeded', defaultSeverity: 'low' },
  { type: 'rbac.grant.changed', category: 'rbac', label: 'Grant Changed', description: 'Role permission grant modified', defaultSeverity: 'high' },
  { type: 'rbac.role.assigned', category: 'rbac', label: 'Role Assigned', description: 'User assigned to RBAC role', defaultSeverity: 'medium' },
  { type: 'rbac.sod.violation', category: 'rbac', label: 'SoD Violation', description: 'Segregation of duties violation detected', defaultSeverity: 'critical' },
  { type: 'workflow.stage.changed', category: 'workflow', label: 'Stage Changed', description: 'Workflow advanced to new lifecycle stage', defaultSeverity: 'info' },
  { type: 'workflow.submitted', category: 'workflow', label: 'Workflow Submitted', description: 'Workflow submitted for review', defaultSeverity: 'info' },
  { type: 'workflow.blocked', category: 'workflow', label: 'Workflow Blocked', description: 'Workflow blocked at stage gate', defaultSeverity: 'high' },
  { type: 'workflow.sla.breach', category: 'workflow', label: 'SLA Breach', description: 'Workflow SLA threshold exceeded', defaultSeverity: 'critical' },
  { type: 'approval.requested', category: 'approval', label: 'Approval Requested', description: 'Approval task created', defaultSeverity: 'medium' },
  { type: 'approval.approved', category: 'approval', label: 'Approved', description: 'Approval granted', defaultSeverity: 'info' },
  { type: 'approval.rejected', category: 'approval', label: 'Rejected', description: 'Approval rejected', defaultSeverity: 'high' },
  { type: 'approval.escalated', category: 'approval', label: 'Escalated', description: 'Approval escalated to next level', defaultSeverity: 'high' },
  { type: 'approval.released', category: 'approval', label: 'Released', description: 'Release approved and executed', defaultSeverity: 'info' },
  { type: 'approval.production.promoted', category: 'approval', label: 'Production Promotion', description: 'Workflow promoted to production', defaultSeverity: 'medium' },
  { type: 'audit.finding.opened', category: 'audit', label: 'Finding Opened', description: 'New audit finding recorded', defaultSeverity: 'high' },
  { type: 'audit.finding.closed', category: 'audit', label: 'Finding Closed', description: 'Audit finding remediated', defaultSeverity: 'info' },
  { type: 'audit.observation.created', category: 'audit', label: 'Observation Created', description: 'Audit observation logged', defaultSeverity: 'medium' },
  { type: 'audit.compliance.changed', category: 'audit', label: 'Compliance Changed', description: 'Compliance posture updated', defaultSeverity: 'medium' },
  { type: 'evidence.uploaded', category: 'evidence', label: 'Evidence Uploaded', description: 'Evidence artifact attached', defaultSeverity: 'info' },
  { type: 'evidence.reviewed', category: 'evidence', label: 'Evidence Reviewed', description: 'Evidence review completed', defaultSeverity: 'info' },
  { type: 'evidence.rejected', category: 'evidence', label: 'Evidence Rejected', description: 'Evidence failed validation', defaultSeverity: 'high' },
  { type: 'notification.created', category: 'notification', label: 'Notification Created', description: 'Platform notification generated', defaultSeverity: 'info' },
  { type: 'notification.escalated', category: 'notification', label: 'Notification Escalated', description: 'Alert escalated', defaultSeverity: 'high' },
  { type: 'notification.resolved', category: 'notification', label: 'Notification Resolved', description: 'Alert resolved', defaultSeverity: 'info' },
  { type: 'governance.policy.violation', category: 'governance', label: 'Policy Violation', description: 'Governance policy breach detected', defaultSeverity: 'critical' },
  { type: 'governance.control.degraded', category: 'governance', label: 'Control Degraded', description: 'Control effectiveness below threshold', defaultSeverity: 'high' },
  { type: 'ai-governance.model.risk', category: 'ai-governance', label: 'Model Risk Event', description: 'AI model risk threshold breached', defaultSeverity: 'critical' },
  { type: 'ai-governance.prompt.violation', category: 'ai-governance', label: 'Prompt Violation', description: 'Prompt safety policy violation', defaultSeverity: 'high' },
  { type: 'artifact.generated', category: 'artifact', label: 'Artifact Generated', description: 'Hub artifact generated', defaultSeverity: 'info' },
  { type: 'artifact.approved', category: 'artifact', label: 'Artifact Approved', description: 'Generated artifact approved', defaultSeverity: 'info' },
];

export class EventRegistry {
  private byType = new Map<string, EventTypeDefinition>();

  constructor() {
    for (const def of DEFINITIONS) {
      this.byType.set(def.type, def);
    }
  }

  register(def: EventTypeDefinition): void {
    this.byType.set(def.type, def);
  }

  get(type: string): EventTypeDefinition | undefined {
    return this.byType.get(type);
  }

  all(): EventTypeDefinition[] {
    return [...this.byType.values()];
  }

  byCategory(category: EventCategory): EventTypeDefinition[] {
    return this.all().filter((d) => d.category === category);
  }

  isKnown(type: string): boolean {
    return this.byType.has(type);
  }
}
