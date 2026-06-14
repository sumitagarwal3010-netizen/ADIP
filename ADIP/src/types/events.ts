export type EventCategory =
  | 'authentication'
  | 'rbac'
  | 'workflow'
  | 'approval'
  | 'audit'
  | 'evidence'
  | 'notification'
  | 'governance'
  | 'ai-governance'
  | 'artifact';

export type EventSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface EventEnvelope {
  id: string;
  type: string;
  category: EventCategory;
  source: string;
  entityType: string;
  entityId: string;
  severity: EventSeverity;
  timestamp: string;
  actor: string;
  correlationId: string;
  message: string;
  payload?: Record<string, unknown>;
}

export interface ActivityRecord {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  module: string;
  severity: EventSeverity;
  entityType: string;
  entityId: string;
  eventId: string;
  correlationId: string;
}

export interface EventTypeDefinition {
  type: string;
  category: EventCategory;
  label: string;
  description: string;
  defaultSeverity: EventSeverity;
}

export interface EventSourceInfo {
  source: string;
  category: EventCategory;
  eventCount: number;
  lastEventAt: string | null;
  status: 'active' | 'idle' | 'degraded';
}

export interface ActivityKpis {
  eventVolume: number;
  eventVolume24h: number;
  criticalEvents: number;
  highRiskEvents: number;
  workflowActivity: number;
  approvalActivity: number;
  auditActivity: number;
  notificationEvents: number;
  uniqueSources: number;
  platformEventHealth: number;
}

export interface ActivityStreamQuery {
  search?: string;
  category?: EventCategory | 'all';
  severity?: EventSeverity | 'all';
  source?: string;
  entityType?: string;
  entityId?: string;
  actor?: string;
  from?: string;
  to?: string;
}

export interface EventLineageNode {
  kind: 'workflow' | 'event' | 'notification' | 'audit-finding' | 'audit-observation' | 'evidence';
  id: string;
  label: string;
  timestamp?: string;
  severity?: EventSeverity;
  status?: string;
}

export interface EventLineageChain {
  workflowId: string;
  workflowTitle: string;
  nodes: EventLineageNode[];
}
