import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  ActivityKpis,
  ActivityRecord,
  ActivityStreamQuery,
  EventEnvelope,
  EventLineageChain,
  EventSourceInfo,
} from '../types/events';
import { EventBus } from '../events/EventBus';
import { EventPublisher, createPublisher } from '../events/EventPublisher';
import { EventSubscriber, createSubscriber } from '../events/EventSubscriber';
import {
  computeActivityKpis,
  computeEventSources,
  eventsBySourceChart,
  eventsByTypeChart,
  filterActivities,
  filterEvents,
  getEventLineage,
  volumeTrend,
} from '../data/activityStreamEngine';
import { ACTIVITY_EXEC_SUMMARY, MOCK_ACTIVITIES, MOCK_EVENTS } from '../data/activityCenterMock';
import { dispatchEventNotification } from '../data/eventNotificationBridge';

interface EventContextValue {
  bus: EventBus;
  publisher: EventPublisher;
  subscriber: EventSubscriber;
  events: EventEnvelope[];
  activities: ActivityRecord[];
  kpis: ActivityKpis;
  sources: EventSourceInfo[];
  eventsByType: { name: string; value: number }[];
  eventsBySource: { name: string; value: number }[];
  volumeTrend: { label: string; value: number }[];
  filterEvents: (query: ActivityStreamQuery) => EventEnvelope[];
  filterActivities: (query: ActivityStreamQuery) => ActivityRecord[];
  getLineage: (workflowId: string) => EventLineageChain;
  refresh: () => void;
  execSummary: string;
}

const EventContext = createContext<EventContextValue | null>(null);

function createInitialBus(): EventBus {
  const bus = new EventBus();
  bus.seed(MOCK_EVENTS, MOCK_ACTIVITIES);
  return bus;
}

let defaultBus: EventBus = createInitialBus();

export function getEventBus(): EventBus {
  return defaultBus;
}

export function EventProvider({ children }: { children: ReactNode }) {
  const [bus] = useState<EventBus>(() => defaultBus);
  const [tick, setTick] = useState(0);

  const publisher = useMemo(() => createPublisher(bus), [bus]);
  const subscriber = useMemo(() => createSubscriber(bus), [bus]);

  useEffect(() => {
    defaultBus = bus;
    const unsubPublish = bus.onPublish(dispatchEventNotification);
    const unsubTick = bus.subscribe('*', () => setTick((t) => t + 1));
    return () => {
      unsubPublish();
      unsubTick();
    };
  }, [bus]);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const events = useMemo(() => bus.history.allEvents(), [bus, tick]);
  const activities = useMemo(() => bus.history.allActivities(), [bus, tick]);

  const value = useMemo<EventContextValue>(() => ({
    bus,
    publisher,
    subscriber,
    events,
    activities,
    kpis: computeActivityKpis(events),
    sources: computeEventSources(events),
    eventsByType: eventsByTypeChart(events),
    eventsBySource: eventsBySourceChart(events),
    volumeTrend: volumeTrend(events),
    filterEvents: (q) => filterEvents(events, q),
    filterActivities: (q) => filterActivities(activities, q),
    getLineage: (workflowId) => getEventLineage(workflowId, events),
    refresh,
    execSummary: ACTIVITY_EXEC_SUMMARY,
  }), [bus, publisher, subscriber, events, activities, refresh, tick]);

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

export function useEventBus(): EventContextValue {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEventBus must be used within EventProvider');
  return ctx;
}

export { EventContext };
