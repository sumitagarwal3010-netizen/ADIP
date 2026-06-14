import type {
  ActivityKpis,
  ActivityRecord,
  ActivityStreamQuery,
  EventEnvelope,
  EventLineageChain,
  EventSourceInfo,
} from '../types/events';
import { AUDIT_FINDINGS, AUDIT_OBSERVATIONS } from './auditCenterMock';
import { PLATFORM_NOTIFICATIONS } from './notificationCenterMock';
import { WORKFLOW_ORCHESTRATION_MOCK } from './workflowOrchestrationMock';

const MS_24H = 24 * 3_600_000;

export function filterEvents(events: EventEnvelope[], query: ActivityStreamQuery): EventEnvelope[] {
  const search = query.search?.toLowerCase().trim();
  return events.filter((e) => {
    if (query.category && query.category !== 'all' && e.category !== query.category) return false;
    if (query.severity && query.severity !== 'all' && e.severity !== query.severity) return false;
    if (query.source && e.source !== query.source) return false;
    if (query.entityType && e.entityType !== query.entityType) return false;
    if (query.entityId && e.entityId !== query.entityId) return false;
    if (query.actor && e.actor !== query.actor) return false;
    if (query.from && new Date(e.timestamp) < new Date(query.from)) return false;
    if (query.to && new Date(e.timestamp) > new Date(query.to)) return false;
    if (search) {
      const hay = `${e.type} ${e.message} ${e.source} ${e.entityType} ${e.entityId} ${e.actor}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

export function filterActivities(activities: ActivityRecord[], query: ActivityStreamQuery): ActivityRecord[] {
  const search = query.search?.toLowerCase().trim();
  return activities.filter((a) => {
    if (query.severity && query.severity !== 'all' && a.severity !== query.severity) return false;
    if (query.entityType && a.entityType !== query.entityType) return false;
    if (query.entityId && a.entityId !== query.entityId) return false;
    if (query.actor && a.actor !== query.actor) return false;
    if (search) {
      const hay = `${a.action} ${a.module} ${a.entityType} ${a.entityId} ${a.actor}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });
}

export function computeActivityKpis(events: EventEnvelope[]): ActivityKpis {
  const now = Date.now();
  const last24h = events.filter((e) => now - new Date(e.timestamp).getTime() <= MS_24H);
  const critical = events.filter((e) => e.severity === 'critical');
  const high = events.filter((e) => e.severity === 'high' || e.severity === 'critical');
  const sources = new Set(events.map((e) => e.source));
  const healthyRatio = events.length === 0 ? 100 : Math.round(((events.length - critical.length) / events.length) * 100);

  return {
    eventVolume: events.length,
    eventVolume24h: last24h.length,
    criticalEvents: critical.length,
    highRiskEvents: high.length,
    workflowActivity: events.filter((e) => e.category === 'workflow').length,
    approvalActivity: events.filter((e) => e.category === 'approval').length,
    auditActivity: events.filter((e) => e.category === 'audit' || e.category === 'evidence').length,
    notificationEvents: events.filter((e) => e.category === 'notification').length,
    uniqueSources: sources.size,
    platformEventHealth: Math.min(100, healthyRatio),
  };
}

export function computeEventSources(events: EventEnvelope[]): EventSourceInfo[] {
  const map = new Map<string, EventSourceInfo>();
  for (const e of events) {
    const existing = map.get(e.source);
    if (existing) {
      existing.eventCount += 1;
      if (!existing.lastEventAt || e.timestamp > existing.lastEventAt) {
        existing.lastEventAt = e.timestamp;
      }
    } else {
      map.set(e.source, {
        source: e.source,
        category: e.category,
        eventCount: 1,
        lastEventAt: e.timestamp,
        status: 'active',
      });
    }
  }
  return [...map.values()].sort((a, b) => b.eventCount - a.eventCount);
}

export function eventsByTypeChart(events: EventEnvelope[]): { name: string; value: number }[] {
  const counts = new Map<string, number>();
  for (const e of events) {
    counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));
}

export function eventsBySourceChart(events: EventEnvelope[]): { name: string; value: number }[] {
  return computeEventSources(events).slice(0, 8).map((s) => ({ name: s.source, value: s.eventCount }));
}

export function volumeTrend(events: EventEnvelope[]): { label: string; value: number }[] {
  const buckets = ['6d ago', '5d ago', '4d ago', '3d ago', '2d ago', 'Yesterday', 'Today'];
  const counts = new Array(7).fill(0);
  const now = Date.now();
  for (const e of events) {
    const ageDays = Math.floor((now - new Date(e.timestamp).getTime()) / (24 * 3_600_000));
    const idx = Math.min(6, Math.max(0, 6 - ageDays));
    counts[idx] += 1;
  }
  return buckets.map((label, i) => ({ label, value: counts[i] }));
}

export function getEventLineage(workflowId: string, events: EventEnvelope[]): EventLineageChain {
  const wf = WORKFLOW_ORCHESTRATION_MOCK.find((w) => w.id === workflowId) ?? WORKFLOW_ORCHESTRATION_MOCK[0];
  const wfEvents = events.filter(
    (e) => e.entityId === workflowId || e.payload?.workflowId === workflowId,
  );
  const notifs = PLATFORM_NOTIFICATIONS.filter((n) => n.linkedWorkflow === workflowId);
  const findings = AUDIT_FINDINGS.filter((f) => f.linkedWorkflow === workflowId);
  const observations = AUDIT_OBSERVATIONS.filter((o) =>
    findings.some((f) => f.id === o.linkedFinding),
  );

  const nodes: EventLineageChain['nodes'] = [
    { kind: 'workflow', id: wf.id, label: wf.title, status: wf.lifecycleStatus },
    ...wfEvents.slice(0, 12).map((e) => ({
      kind: 'event' as const,
      id: e.id,
      label: e.message,
      timestamp: e.timestamp,
      severity: e.severity,
    })),
    ...notifs.slice(0, 6).map((n) => ({
      kind: 'notification' as const,
      id: n.id,
      label: n.title,
      timestamp: n.createdAt,
      severity: n.severity === 'critical' ? 'critical' as const : 'medium' as const,
      status: n.status,
    })),
    ...findings.slice(0, 4).map((f) => ({
      kind: 'audit-finding' as const,
      id: f.id,
      label: f.description.slice(0, 60),
      timestamp: f.createdAt,
      severity: f.severity === 'Critical' ? 'critical' as const : 'high' as const,
      status: f.status,
    })),
    ...observations.slice(0, 3).map((o) => ({
      kind: 'audit-observation' as const,
      id: o.id,
      label: o.observation.slice(0, 60),
      timestamp: o.targetDate,
      severity: 'medium' as const,
      status: o.closureStatus,
    })),
  ];

  return { workflowId: wf.id, workflowTitle: wf.title, nodes };
}

import type { PersonaId } from '../config/personaConfig';

export const ACTIVITY_CENTER_PERSONAS: PersonaId[] = [
  'cio',
  'audit-head',
  'compliance-officer',
  'operations-manager',
];

export function canAccessActivityCenter(personaId: PersonaId): boolean {
  return ACTIVITY_CENTER_PERSONAS.includes(personaId);
}

export function lifecycleActionToEventType(action: string): string {
  const map: Record<string, string> = {
    Submit: 'workflow.submitted',
    'Advance Stage': 'workflow.stage.changed',
    Approve: 'approval.approved',
    Reject: 'approval.rejected',
    Escalate: 'approval.escalated',
    Release: 'approval.released',
    'Promote to Production': 'approval.production.promoted',
    'Assign Reviewer': 'approval.requested',
  };
  return map[action] ?? 'workflow.stage.changed';
}
