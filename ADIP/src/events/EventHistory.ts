import type { ActivityRecord, EventEnvelope } from '../types/events';

const MAX_EVENTS = 2000;
const MAX_ACTIVITY = 500;

export class EventHistory {
  private events: EventEnvelope[] = [];
  private activities: ActivityRecord[] = [];

  append(event: EventEnvelope, activity?: ActivityRecord): void {
    this.events.unshift(event);
    if (this.events.length > MAX_EVENTS) this.events.length = MAX_EVENTS;
    if (activity) {
      this.activities.unshift(activity);
      if (this.activities.length > MAX_ACTIVITY) this.activities.length = MAX_ACTIVITY;
    }
  }

  seed(events: EventEnvelope[], activities: ActivityRecord[]): void {
    this.events = [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    this.activities = [...activities].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  allEvents(): EventEnvelope[] {
    return this.events;
  }

  allActivities(): ActivityRecord[] {
    return this.activities;
  }

  getEvent(id: string): EventEnvelope | undefined {
    return this.events.find((e) => e.id === id);
  }

  getByCorrelation(correlationId: string): EventEnvelope[] {
    return this.events.filter((e) => e.correlationId === correlationId);
  }

  getByEntity(entityType: string, entityId: string): EventEnvelope[] {
    return this.events.filter((e) => e.entityType === entityType && e.entityId === entityId);
  }

  count(): number {
    return this.events.length;
  }

  activityCount(): number {
    return this.activities.length;
  }
}
