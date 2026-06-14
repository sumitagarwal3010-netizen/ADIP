export type NotificationType =
  | 'Information'
  | 'Warning'
  | 'Critical'
  | 'Escalation'
  | 'Approval Request'
  | 'Review Request'
  | 'Audit Alert'
  | 'Compliance Alert'
  | 'Security Alert';

export type NotificationSeverity = 'low' | 'medium' | 'high' | 'critical';

export type NotificationStatus =
  | 'Open'
  | 'Acknowledged'
  | 'Escalated'
  | 'Resolved'
  | 'Dismissed'
  | 'Suppressed';

export type EscalationLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Executive Escalation';

export type NotificationSource =
  | 'Authentication'
  | 'RBAC'
  | 'Workflow Lifecycle'
  | 'Approval Workflow'
  | 'Evidence Repository'
  | 'Audit Findings'
  | 'Audit Observations'
  | 'Governance'
  | 'AI Governance'
  | 'Executive Control Tower';

export type EscalationTrigger =
  | 'Overdue Approval'
  | 'SLA Breach'
  | 'Critical Finding'
  | 'High Risk AI Incident'
  | 'Missing Evidence'
  | 'Compliance Violation'
  | 'Workflow Blocker';

export type MockDeliveryChannel = 'In-App' | 'Email (mock)' | 'SMS (mock)' | 'Teams (mock)' | 'Slack (mock)';

export type DeliveryStatus = 'Pending' | 'Delivered' | 'Read' | 'Failed' | 'Suppressed';

export interface NotificationDelivery {
  channel: MockDeliveryChannel;
  status: DeliveryStatus;
  deliveredAt: string | null;
  readAt: string | null;
}

export interface PlatformNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  source: NotificationSource;
  owner: string;
  ownerPersona: string;
  createdAt: string;
  status: NotificationStatus;
  escalationLevel: EscalationLevel;
  escalationTrigger: EscalationTrigger | null;
  read: boolean;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  dismissedAt: string | null;
  linkedWorkflow: string | null;
  linkedApproval: string | null;
  linkedFinding: string | null;
  linkedEvidence: string | null;
  linkedIncident: string | null;
  deliveries: NotificationDelivery[];
}

export type AlertHistoryAction =
  | 'Created'
  | 'Acknowledged'
  | 'Escalated'
  | 'Resolved'
  | 'Dismissed'
  | 'Suppressed'
  | 'Delivered'
  | 'Read';

export interface AlertHistoryEntry {
  id: string;
  notificationId: string;
  action: AlertHistoryAction;
  actor: string;
  timestamp: string;
  detail: string;
  fromLevel: EscalationLevel | null;
  toLevel: EscalationLevel | null;
}

export interface NotificationKpis {
  openAlerts: number;
  criticalAlerts: number;
  escalatedAlerts: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  slaBreaches: number;
  riskNotifications: number;
  unreadCount: number;
  bySeverity: { name: string; value: number; color: string }[];
  bySource: { name: string; value: number }[];
  escalationTrend: { month: string; count: number }[];
  deliveryRate: number;
}
