import type { EventCategory, EventEnvelope } from '../types/events';
import type { EventBus, EventHandler } from './EventBus';

export class EventSubscriber {
  private readonly bus: EventBus;

  constructor(bus: EventBus) {
    this.bus = bus;
  }

  on(pattern: string, handler: EventHandler): () => void {
    return this.bus.subscribe(pattern, handler);
  }

  onCategory(category: EventCategory, handler: EventHandler): () => void {
    return this.bus.subscribe(category, handler);
  }

  onType(eventType: string, handler: EventHandler): () => void {
    return this.bus.subscribe(eventType, handler);
  }

  onAll(handler: EventHandler): () => void {
    return this.bus.subscribe('*', handler);
  }

  onWorkflow(handler: EventHandler): () => void {
    return this.bus.subscribe('workflow', handler);
  }

  onApproval(handler: EventHandler): () => void {
    return this.bus.subscribe('approval', handler);
  }

  onAudit(handler: EventHandler): () => void {
    return this.bus.subscribe('audit', handler);
  }

  onNotification(handler: EventHandler): () => void {
    return this.bus.subscribe('notification', handler);
  }
}

export function createSubscriber(bus: EventBus): EventSubscriber {
  return new EventSubscriber(bus);
}

export type { EventHandler, EventEnvelope };
