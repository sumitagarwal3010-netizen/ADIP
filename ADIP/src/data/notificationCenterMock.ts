import type {
  AlertHistoryEntry,
  EscalationLevel,
  EscalationTrigger,
  MockDeliveryChannel,
  NotificationSource,
  NotificationType,
  PlatformNotification,
} from '../types/notificationCenter';

const TYPES: NotificationType[] = [
  'Information', 'Warning', 'Critical', 'Escalation', 'Approval Request',
  'Review Request', 'Audit Alert', 'Compliance Alert', 'Security Alert',
];

const SOURCES: NotificationSource[] = [
  'Authentication', 'RBAC', 'Workflow Lifecycle', 'Approval Workflow',
  'Evidence Repository', 'Audit Findings', 'Audit Observations', 'Governance',
  'AI Governance', 'Executive Control Tower',
];

const TRIGGERS: EscalationTrigger[] = [
  'Overdue Approval', 'SLA Breach', 'Critical Finding', 'High Risk AI Incident',
  'Missing Evidence', 'Compliance Violation', 'Workflow Blocker',
];

const LEVELS: EscalationLevel[] = ['Level 1', 'Level 2', 'Level 3', 'Executive Escalation'];
const WORKFLOWS = ['WF-001', 'WF-002', 'WF-003', 'WF-004', 'WF-005', 'WF-006'];
const FINDINGS = Array.from({ length: 40 }, (_, i) => `FND-${String(i + 1).padStart(3, '0')}`);
const EVIDENCE = Array.from({ length: 75 }, (_, i) => `EVD-AUD-${String(i + 1).padStart(3, '0')}`);
const CHANNELS: MockDeliveryChannel[] = ['In-App', 'Email (mock)', 'SMS (mock)', 'Teams (mock)', 'Slack (mock)'];
const OWNERS = ['Release Manager', 'Compliance Officer', 'CISO Office', 'Audit Office', 'Application Owner', 'CIO Office', 'Model Risk Office'];
const PERSONAS = ['cio', 'ciso', 'audit-head', 'compliance-officer', 'application-owner', 'release-manager', 'security-officer'];

const TITLES: Record<NotificationSource, string[]> = {
  Authentication: ['Failed login threshold exceeded', 'Session anomaly detected', 'MFA bypass attempt flagged'],
  RBAC: ['SoD violation detected', 'Privileged role assigned', 'Entitlement change requires review'],
  'Workflow Lifecycle': ['Stage advanced to Release', 'Workflow blocked at Architecture', 'SLA breach on testing gate'],
  'Approval Workflow': ['Approval request pending CIO sign-off', 'Approval rejected — changes required', 'Reviewer reassignment needed'],
  'Evidence Repository': ['Evidence pending review', 'Evidence rejected — resubmit required', 'Evidence coverage gap detected'],
  'Audit Findings': ['Critical finding opened', 'Overdue finding requires action', 'Finding escalated to executive'],
  'Audit Observations': ['Audit observation awaiting management response', 'Observation closure overdue'],
  Governance: ['Policy violation detected', 'Control effectiveness below threshold', 'Governance score degraded'],
  'AI Governance': ['AI incident severity elevated', 'Model risk threshold breached', 'Prompt safety violation detected'],
  'Executive Control Tower': ['Portfolio risk elevated', 'Delivery risk item requires escalation', 'Executive SLA breach'],
};

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function isoDate(daysAgo: number, hours = 0): string {
  const d = new Date(2026, 5, 6, 12 - hours, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function severityFor(type: NotificationType, i: number): PlatformNotification['severity'] {
  if (type === 'Critical' || type === 'Security Alert') return 'critical';
  if (type === 'Escalation' || type === 'Audit Alert' || type === 'Compliance Alert') return i % 3 === 0 ? 'critical' : 'high';
  if (type === 'Warning' || type === 'Approval Request' || type === 'Review Request') return i % 2 === 0 ? 'high' : 'medium';
  return i % 4 === 0 ? 'medium' : 'low';
}

function buildDeliveries(i: number): PlatformNotification['deliveries'] {
  const channels: MockDeliveryChannel[] = i % 5 === 0 ? [...CHANNELS] : [pick(CHANNELS, i), 'In-App'];
  return channels.map((channel, j) => ({
    channel,
    status: j === 0 && i % 7 === 0 ? 'Failed' as const : i % 3 === 0 ? 'Read' as const : i % 2 === 0 ? 'Delivered' as const : 'Pending' as const,
    deliveredAt: i % 2 === 0 ? isoDate(i % 10) : null,
    readAt: i % 3 === 0 ? isoDate(i % 10, 2) : null,
  }));
}

function buildNotifications(): PlatformNotification[] {
  const records: PlatformNotification[] = [];
  for (let i = 0; i < 100; i++) {
    const source = pick(SOURCES, i);
    const type = source === 'Audit Findings' ? 'Audit Alert'
      : source === 'Audit Observations' ? 'Audit Alert'
      : source === 'Approval Workflow' ? (i % 2 === 0 ? 'Approval Request' : 'Review Request')
      : source === 'AI Governance' ? (i % 3 === 0 ? 'Security Alert' : 'Warning')
      : source === 'Governance' ? 'Compliance Alert'
      : pick(TYPES, i);
    const severity = severityFor(type, i);
    const levelIdx = severity === 'critical' ? Math.min(3, 1 + (i % 3)) : i % 8 === 0 ? 2 : 0;
    const level = LEVELS[levelIdx];
    const isEscalated = levelIdx >= 1 || type === 'Escalation';
    let status: PlatformNotification['status'] = 'Open';
    if (i % 11 === 0) status = 'Resolved';
    else if (i % 9 === 0) status = 'Dismissed';
    else if (i % 7 === 0) status = 'Acknowledged';
    else if (isEscalated && i % 5 !== 0) status = 'Escalated';

    records.push({
      id: `NTF-${String(i + 1).padStart(4, '0')}`,
      title: `${pick(TITLES[source], i)} — ${pick(['Payments', 'Mobile Banking', 'Cards', 'KYC/AML', 'AI/ML'], i)}`,
      message: `Enterprise notification from ${source}: action required for ${pick(WORKFLOWS, i)}. ${pick(TRIGGERS, i)} detected.`,
      type,
      severity,
      source,
      owner: pick(OWNERS, i),
      ownerPersona: pick(PERSONAS, i),
      createdAt: isoDate(i % 30, i % 12),
      status,
      escalationLevel: level,
      escalationTrigger: isEscalated || i % 4 === 0 ? pick(TRIGGERS, i) : null,
      read: i % 3 === 0,
      acknowledgedAt: status === 'Acknowledged' || status === 'Resolved' ? isoDate(i % 5, 1) : null,
      resolvedAt: status === 'Resolved' ? isoDate(i % 3) : null,
      dismissedAt: status === 'Dismissed' ? isoDate(i % 4) : null,
      linkedWorkflow: i % 3 !== 0 ? pick(WORKFLOWS, i) : null,
      linkedApproval: source === 'Approval Workflow' ? `APR-${pick(WORKFLOWS, i)}-release` : null,
      linkedFinding: source.includes('Audit') ? pick(FINDINGS, i) : null,
      linkedEvidence: source === 'Evidence Repository' ? pick(EVIDENCE, i) : null,
      linkedIncident: source === 'AI Governance' ? `AIR-${String((i % 12) + 1).padStart(3, '0')}` : null,
      deliveries: buildDeliveries(i),
    });
  }
  return records;
}

function buildAlertHistory(notifications: PlatformNotification[]): AlertHistoryEntry[] {
  const entries: AlertHistoryEntry[] = [];
  let idx = 0;
  for (const n of notifications.slice(0, 50)) {
    entries.push({
      id: `HIST-${String(++idx).padStart(4, '0')}`,
      notificationId: n.id,
      action: 'Created',
      actor: 'Notification Engine',
      timestamp: n.createdAt,
      detail: `Notification created: ${n.title}`,
      fromLevel: null,
      toLevel: n.escalationLevel,
    });
    if (n.acknowledgedAt) {
      entries.push({
        id: `HIST-${String(++idx).padStart(4, '0')}`,
        notificationId: n.id,
        action: 'Acknowledged',
        actor: n.owner,
        timestamp: n.acknowledgedAt,
        detail: 'Notification acknowledged by owner',
        fromLevel: n.escalationLevel,
        toLevel: n.escalationLevel,
      });
    }
    if (n.status === 'Escalated' || n.escalationLevel !== 'Level 1') {
      entries.push({
        id: `HIST-${String(++idx).padStart(4, '0')}`,
        notificationId: n.id,
        action: 'Escalated',
        actor: 'Escalation Engine',
        timestamp: isoDate(2, 3),
        detail: `Escalated to ${n.escalationLevel}: ${n.escalationTrigger ?? 'SLA threshold'}`,
        fromLevel: 'Level 1',
        toLevel: n.escalationLevel,
      });
    }
    if (n.resolvedAt) {
      entries.push({
        id: `HIST-${String(++idx).padStart(4, '0')}`,
        notificationId: n.id,
        action: 'Resolved',
        actor: n.owner,
        timestamp: n.resolvedAt,
        detail: 'Notification resolved',
        fromLevel: n.escalationLevel,
        toLevel: null,
      });
    }
    if (n.dismissedAt) {
      entries.push({
        id: `HIST-${String(++idx).padStart(4, '0')}`,
        notificationId: n.id,
        action: 'Dismissed',
        actor: n.owner,
        timestamp: n.dismissedAt,
        detail: 'Notification dismissed',
        fromLevel: n.escalationLevel,
        toLevel: null,
      });
    }
  }
  return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const PLATFORM_NOTIFICATIONS = buildNotifications();
export const ESCALATION_NOTIFICATIONS = PLATFORM_NOTIFICATIONS.filter(
  (n) => n.escalationLevel !== 'Level 1' || n.status === 'Escalated' || n.type === 'Escalation',
).slice(0, 30);
export const ALERT_HISTORY = buildAlertHistory(PLATFORM_NOTIFICATIONS);

export const NOTIFICATION_EXEC_SUMMARY =
  'Alert health is at moderate risk with 42 open notifications (18 critical, 12 escalated). Primary hotspots: Payments approval bottlenecks, ' +
  'AI governance incidents, and overdue audit findings. SLA breaches: 8 across workflow and approval gates. Recommended actions: acknowledge 6 executive ' +
  'escalations, resolve WF-002 testing SLA breach, and close 3 overdue audit finding alerts. Mock delivery channels report 94% in-app delivery rate.';
