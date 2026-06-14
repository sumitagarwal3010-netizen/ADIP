import type { ActivityRecord, EventEnvelope } from '../types/events';
import { createEventEnvelope, type CreateEnvelopeParams } from './EventEnvelope';
import { EventHistory } from './EventHistory';
import { EventRegistry } from './EventRegistry';

export type EventHandler = (event: EventEnvelope) => void;

type PublishListener = (event: EventEnvelope) => void;

export class EventBus {
  readonly registry: EventRegistry;
  readonly history: EventHistory;
  private subscribers = new Map<string, Set<EventHandler>>();
  private publishListeners = new Set<PublishListener>();

  constructor(registry = new EventRegistry(), history = new EventHistory()) {
    this.registry = registry;
    this.history = history;
  }

  subscribe(pattern: string, handler: EventHandler): () => void {
    const key = pattern.toLowerCase();
    if (!this.subscribers.has(key)) this.subscribers.set(key, new Set());
    this.subscribers.get(key)!.add(handler);
    return () => this.subscribers.get(key)?.delete(handler);
  }

  onPublish(listener: PublishListener): () => void {
    this.publishListeners.add(listener);
    return () => this.publishListeners.delete(listener);
  }

  publish(envelope: EventEnvelope, activity?: ActivityRecord): EventEnvelope {
    const activityRecord = activity ?? activityFromEvent(envelope);
    this.history.append(envelope, activityRecord);
    this.dispatch(envelope);
    for (const listener of this.publishListeners) listener(envelope);
    return envelope;
  }

  emit(params: CreateEnvelopeParams, activity?: Parameters<EventHistory['append']>[1]): EventEnvelope {
    const envelope = createEventEnvelope(params, this.registry);
    return this.publish(envelope, activity);
  }

  private dispatch(event: EventEnvelope): void {
    const patterns = [
      '*',
      event.category,
      event.type,
      `${event.category}.*`,
      `${event.source}.*`,
    ];
    for (const pattern of patterns) {
      const handlers = this.subscribers.get(pattern.toLowerCase());
      if (handlers) {
        for (const handler of handlers) handler(event);
      }
    }
  }

  seed(events: EventEnvelope[], activities: ActivityRecord[]): void {
    this.history.seed(events, activities);
  }
}

function activityFromEvent(event: EventEnvelope): ActivityRecord {
  const moduleMap: Record<string, string> = {
    WorkflowOrchestration: 'Workflow',
    ApprovalWorkflow: 'Approval',
    AuditCenter: 'Audit',
    EvidenceRepository: 'Evidence',
    NotificationCenter: 'Notification',
    Authentication: 'Authentication',
    RBAC: 'RBAC',
    GovernanceHub: 'Governance',
    AIGovernanceHub: 'AI Governance',
    ArtifactFramework: 'Artifacts',
  };
  return {
    id: `ACT-${event.id}`,
    timestamp: event.timestamp,
    actor: event.actor,
    action: event.type.split('.').slice(-1)[0] ?? event.type,
    module: moduleMap[event.source] ?? event.source,
    severity: event.severity,
    entityType: event.entityType,
    entityId: event.entityId,
    eventId: event.id,
    correlationId: event.correlationId,
  };
}
