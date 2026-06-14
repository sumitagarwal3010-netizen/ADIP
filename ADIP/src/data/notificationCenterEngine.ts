import type {
  AlertHistoryEntry,
  EscalationLevel,
  NotificationKpis,
  NotificationSource,
  PlatformNotification,
} from '../types/notificationCenter';
import { ALERT_HISTORY, PLATFORM_NOTIFICATIONS } from './notificationCenterMock';
import { colors } from '../theme/colors';

const OPEN_STATUSES_FIXED = new Set(['Open', 'Escalated', 'Acknowledged']);

const SEVERITY_COLORS: Record<string, string> = {
  critical: colors.critical,
  high: colors.warning,
  medium: colors.info,
  low: colors.text.muted,
};

const NEXT_LEVEL: Record<EscalationLevel, EscalationLevel> = {
  'Level 1': 'Level 2',
  'Level 2': 'Level 3',
  'Level 3': 'Executive Escalation',
  'Executive Escalation': 'Executive Escalation',
};

export function computeNotificationKpis(notifications: PlatformNotification[] = PLATFORM_NOTIFICATIONS): NotificationKpis {
  const open = notifications.filter((n) => OPEN_STATUSES_FIXED.has(n.status));
  const critical = notifications.filter((n) => n.severity === 'critical' && n.status !== 'Resolved' && n.status !== 'Dismissed');
  const escalated = notifications.filter((n) => n.status === 'Escalated' || n.escalationLevel !== 'Level 1');
  const acknowledged = notifications.filter((n) => n.status === 'Acknowledged' || n.acknowledgedAt);
  const resolved = notifications.filter((n) => n.status === 'Resolved');
  const slaBreaches = notifications.filter((n) => n.escalationTrigger === 'SLA Breach' && n.status !== 'Resolved');
  const risk = notifications.filter((n) =>
    n.severity === 'critical' || n.severity === 'high' || n.type === 'Escalation',
  ).filter((n) => n.status !== 'Resolved' && n.status !== 'Dismissed');

  const sevMap = new Map<string, number>();
  for (const n of open) sevMap.set(n.severity, (sevMap.get(n.severity) ?? 0) + 1);

  const srcMap = new Map<string, number>();
  for (const n of open) srcMap.set(n.source, (srcMap.get(n.source) ?? 0) + 1);

  const delivered = notifications.flatMap((n) => n.deliveries).filter((d) => d.status === 'Delivered' || d.status === 'Read').length;
  const totalDeliveries = notifications.flatMap((n) => n.deliveries).length;

  return {
    openAlerts: open.length,
    criticalAlerts: critical.length,
    escalatedAlerts: escalated.length,
    acknowledgedAlerts: acknowledged.length,
    resolvedAlerts: resolved.length,
    slaBreaches: slaBreaches.length,
    riskNotifications: risk.length,
    unreadCount: notifications.filter((n) => !n.read && n.status !== 'Resolved' && n.status !== 'Dismissed').length,
    bySeverity: [...sevMap.entries()].map(([name, value]) => ({
      name,
      value,
      color: SEVERITY_COLORS[name] ?? colors.primary,
    })),
    bySource: [...srcMap.entries()].map(([name, value]) => ({ name, value })),
    escalationTrend: [
      { month: 'Jan', count: 8 }, { month: 'Feb', count: 10 }, { month: 'Mar', count: 12 },
      { month: 'Apr', count: 14 }, { month: 'May', count: 16 }, { month: 'Jun', count: escalated.length },
    ],
    deliveryRate: totalDeliveries > 0 ? Math.round((delivered / totalDeliveries) * 100) : 0,
  };
}

export function filterNotifications(query: {
  search?: string;
  type?: string;
  severity?: string;
  source?: string;
  status?: string;
  escalationLevel?: string;
}, notifications: PlatformNotification[] = PLATFORM_NOTIFICATIONS): PlatformNotification[] {
  const q = (query.search ?? '').toLowerCase();
  return notifications.filter((n) => {
    if (query.type && n.type !== query.type) return false;
    if (query.severity && n.severity !== query.severity) return false;
    if (query.source && n.source !== query.source) return false;
    if (query.status && n.status !== query.status) return false;
    if (query.escalationLevel && n.escalationLevel !== query.escalationLevel) return false;
    if (!q) return true;
    return n.id.toLowerCase().includes(q) || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
  });
}

export function filterEscalationQueue(notifications: PlatformNotification[] = PLATFORM_NOTIFICATIONS): PlatformNotification[] {
  return notifications.filter(
    (n) => n.status === 'Escalated' || n.escalationLevel !== 'Level 1' || n.type === 'Escalation',
  ).filter((n) => n.status !== 'Resolved' && n.status !== 'Dismissed');
}

export function filterAlertHistory(query: { notificationId?: string; action?: string }): AlertHistoryEntry[] {
  return ALERT_HISTORY.filter((h) => {
    if (query.notificationId && h.notificationId !== query.notificationId) return false;
    if (query.action && h.action !== query.action) return false;
    return true;
  });
}

export function getNotificationById(id: string, notifications: PlatformNotification[] = PLATFORM_NOTIFICATIONS): PlatformNotification | undefined {
  return notifications.find((n) => n.id === id);
}

export function getNotificationsForWorkflow(workflowId: string, notifications: PlatformNotification[] = PLATFORM_NOTIFICATIONS): PlatformNotification[] {
  return notifications.filter((n) => n.linkedWorkflow === workflowId);
}

export function getWorkflowNotificationMetrics(workflowId: string, notifications: PlatformNotification[] = PLATFORM_NOTIFICATIONS) {
  const wf = getNotificationsForWorkflow(workflowId, notifications);
  const open = wf.filter((n) => OPEN_STATUSES_FIXED.has(n.status));
  return {
    notificationCount: wf.length,
    openNotifications: open.length,
    criticalNotifications: open.filter((n) => n.severity === 'critical').length,
    escalatedNotifications: open.filter((n) => n.status === 'Escalated' || n.escalationLevel !== 'Level 1').length,
  };
}

export function acknowledgeNotification(n: PlatformNotification): PlatformNotification {
  const now = new Date().toISOString();
  return {
    ...n,
    status: 'Acknowledged',
    read: true,
    acknowledgedAt: now,
    deliveries: n.deliveries.map((d) => d.channel === 'In-App' ? { ...d, status: 'Read', readAt: now } : d),
  };
}

export function resolveNotification(n: PlatformNotification): PlatformNotification {
  return { ...n, status: 'Resolved', read: true, resolvedAt: new Date().toISOString() };
}

export function dismissNotification(n: PlatformNotification): PlatformNotification {
  return { ...n, status: 'Dismissed', read: true, dismissedAt: new Date().toISOString() };
}

export function suppressNotification(n: PlatformNotification): PlatformNotification {
  return {
    ...n,
    status: 'Suppressed',
    deliveries: n.deliveries.map((d) => ({ ...d, status: 'Suppressed' as const })),
  };
}

export function escalateNotification(n: PlatformNotification): PlatformNotification {
  const next = NEXT_LEVEL[n.escalationLevel];
  return {
    ...n,
    status: 'Escalated',
    escalationLevel: next,
    type: n.type === 'Information' ? 'Escalation' : n.type,
  };
}

export function appendHistoryEntry(
  history: AlertHistoryEntry[],
  notificationId: string,
  action: AlertHistoryEntry['action'],
  actor: string,
  detail: string,
  fromLevel: EscalationLevel | null = null,
  toLevel: EscalationLevel | null = null,
): AlertHistoryEntry[] {
  const entry: AlertHistoryEntry = {
    id: `HIST-${String(history.length + 1).padStart(4, '0')}`,
    notificationId,
    action,
    actor,
    timestamp: new Date().toISOString(),
    detail,
    fromLevel,
    toLevel,
  };
  return [entry, ...history];
}

export const NOTIFICATION_SOURCES: NotificationSource[] = [
  'Authentication', 'RBAC', 'Workflow Lifecycle', 'Approval Workflow',
  'Evidence Repository', 'Audit Findings', 'Audit Observations', 'Governance',
  'AI Governance', 'Executive Control Tower',
];

export const NOTIFICATION_TYPES_LIST = [
  'Information', 'Warning', 'Critical', 'Escalation', 'Approval Request',
  'Review Request', 'Audit Alert', 'Compliance Alert', 'Security Alert',
] as const;

export function severityChartData(notifications: PlatformNotification[] = PLATFORM_NOTIFICATIONS) {
  return computeNotificationKpis(notifications).bySeverity;
}
