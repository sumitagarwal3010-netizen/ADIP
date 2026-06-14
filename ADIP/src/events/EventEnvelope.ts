import type { EventCategory, EventEnvelope, EventSeverity } from '../types/events';
import { EventRegistry } from './EventRegistry';

let sequence = 0;

export function nextEventId(): string {
  sequence += 1;
  return `EVT-${Date.now()}-${String(sequence).padStart(4, '0')}`;
}

export function nextCorrelationId(prefix = 'COR'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export interface CreateEnvelopeParams {
  type: string;
  source: string;
  entityType: string;
  entityId: string;
  actor: string;
  severity?: EventSeverity;
  category?: EventCategory;
  correlationId?: string;
  message?: string;
  payload?: Record<string, unknown>;
  timestamp?: string;
  id?: string;
}

export function createEventEnvelope(
  params: CreateEnvelopeParams,
  registry: EventRegistry,
): EventEnvelope {
  const def = registry.get(params.type);
  const category = params.category ?? def?.category ?? 'governance';
  const severity = params.severity ?? def?.defaultSeverity ?? 'info';

  return {
    id: params.id ?? nextEventId(),
    type: params.type,
    category,
    source: params.source,
    entityType: params.entityType,
    entityId: params.entityId,
    severity,
    timestamp: params.timestamp ?? new Date().toISOString(),
    actor: params.actor,
    correlationId: params.correlationId ?? nextCorrelationId(),
    message: params.message ?? def?.label ?? params.type,
    payload: params.payload,
  };
}
