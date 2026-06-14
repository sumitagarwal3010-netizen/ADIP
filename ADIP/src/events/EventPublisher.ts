import type { EventCategory, EventEnvelope } from '../types/events';
import type { EventBus } from './EventBus';
import type { CreateEnvelopeParams } from './EventEnvelope';

export class EventPublisher {
  private readonly bus: EventBus;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  publish(params: CreateEnvelopeParams): EventEnvelope {
    return this.bus.emit(params);
  }

  publishWorkflowEvent(
    type: string,
    workflowId: string,
    actor: string,
    message: string,
    payload?: Record<string, unknown>,
    correlationId?: string,
  ): EventEnvelope {
    return this.publish({
      type,
      source: 'WorkflowOrchestration',
      entityType: 'workflow',
      entityId: workflowId,
      actor,
      message,
      payload,
      correlationId,
      category: type.startsWith('approval.') ? 'approval' : 'workflow',
    });
  }

  publishAuditEvent(
    type: string,
    entityType: string,
    entityId: string,
    actor: string,
    message: string,
    severity?: CreateEnvelopeParams['severity'],
    payload?: Record<string, unknown>,
  ): EventEnvelope {
    return this.publish({
      type,
      source: 'AuditCenter',
      entityType,
      entityId,
      actor,
      message,
      severity,
      payload,
      category: entityType.includes('evidence') ? 'evidence' : 'audit',
    });
  }

  publishAuthEvent(type: string, userId: string, actor: string, message: string): EventEnvelope {
    return this.publish({
      type,
      source: 'Authentication',
      entityType: 'user',
      entityId: userId,
      actor,
      message,
      category: 'authentication',
    });
  }

  publishNotificationEvent(
    notificationId: string,
    actor: string,
    action: string,
    workflowId?: string,
  ): EventEnvelope {
    return this.publish({
      type: `notification.${action.toLowerCase()}`,
      source: 'NotificationCenter',
      entityType: 'notification',
      entityId: notificationId,
      actor,
      message: `Notification ${action}`,
      payload: workflowId ? { workflowId } : undefined,
      category: 'notification',
    });
  }

  publishCategoryEvent(
    category: EventCategory,
    type: string,
    source: string,
    entityType: string,
    entityId: string,
    actor: string,
    message: string,
  ): EventEnvelope {
    return this.publish({ type, source, entityType, entityId, actor, message, category });
  }
}

export function createPublisher(bus: EventBus): EventPublisher {
  return new EventPublisher(bus);
}
