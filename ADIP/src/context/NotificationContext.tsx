import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { usePersona } from './PersonaContext';
import type { AlertHistoryEntry, PlatformNotification } from '../types/notificationCenter';
import {
  acknowledgeNotification,
  appendHistoryEntry,
  computeNotificationKpis,
  dismissNotification,
  escalateNotification,
  filterAlertHistory,
  filterEscalationQueue,
  filterNotifications,
  getNotificationById,
  getNotificationsForWorkflow,
  getWorkflowNotificationMetrics,
  resolveNotification,
  suppressNotification,
} from '../data/notificationCenterEngine';
import { ALERT_HISTORY, PLATFORM_NOTIFICATIONS } from '../data/notificationCenterMock';
import { getPersistenceLayer } from './PersistenceContext';

interface NotificationContextValue {
  notifications: PlatformNotification[];
  history: AlertHistoryEntry[];
  kpis: ReturnType<typeof computeNotificationKpis>;
  escalationQueue: PlatformNotification[];
  getNotification: (id: string) => PlatformNotification | undefined;
  getForWorkflow: (workflowId: string) => PlatformNotification[];
  getWorkflowMetrics: (workflowId: string) => ReturnType<typeof getWorkflowNotificationMetrics>;
  filterInbox: (query: Parameters<typeof filterNotifications>[0]) => PlatformNotification[];
  getHistory: (notificationId?: string) => AlertHistoryEntry[];
  acknowledge: (id: string) => void;
  resolve: (id: string) => void;
  dismiss: (id: string) => void;
  suppress: (id: string) => void;
  escalate: (id: string) => void;
  markRead: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { persona } = usePersona();
  const persisted = getPersistenceLayer().notification.load();
  const [notifications, setNotifications] = useState<PlatformNotification[]>(
    persisted?.notifications ?? PLATFORM_NOTIFICATIONS,
  );
  const [history, setHistory] = useState<AlertHistoryEntry[]>(
    persisted?.history ?? ALERT_HISTORY,
  );

  const actor = persona.label;

  const save = useCallback((next: PlatformNotification[], hist: AlertHistoryEntry[]) => {
    setNotifications(next);
    setHistory(hist);
    getPersistenceLayer().notification.save({ notifications: next, history: hist });
  }, []);

  const updateOne = useCallback((
    id: string,
    updater: (n: PlatformNotification) => PlatformNotification,
    historyAction: AlertHistoryEntry['action'],
    detail: string,
  ) => {
    const n = getNotificationById(id, notifications);
    if (!n) return;
    const updated = updater(n);
    const next = notifications.map((x) => (x.id === id ? updated : x));
    const hist = appendHistoryEntry(history, id, historyAction, actor, detail, n.escalationLevel, updated.escalationLevel);
    save(next, hist);
  }, [notifications, history, actor, save]);

  const acknowledge = useCallback((id: string) => {
    updateOne(id, acknowledgeNotification, 'Acknowledged', 'Notification acknowledged');
  }, [updateOne, actor]);

  const resolve = useCallback((id: string) => {
    updateOne(id, resolveNotification, 'Resolved', 'Notification resolved');
  }, [updateOne]);

  const dismiss = useCallback((id: string) => {
    updateOne(id, dismissNotification, 'Dismissed', 'Notification dismissed');
  }, [updateOne]);

  const suppress = useCallback((id: string) => {
    updateOne(id, suppressNotification, 'Suppressed', 'Notification suppressed');
  }, [updateOne]);

  const escalate = useCallback((id: string) => {
    updateOne(id, escalateNotification, 'Escalated', 'Notification escalated to next level');
  }, [updateOne]);

  const markRead = useCallback((id: string) => {
    const next = notifications.map((n) =>
      n.id === id ? { ...n, read: true, deliveries: n.deliveries.map((d) => d.channel === 'In-App' ? { ...d, status: 'Read' as const, readAt: new Date().toISOString() } : d) } : n,
    );
    save(next, history);
  }, [notifications, history, save]);

  const value = useMemo<NotificationContextValue>(() => ({
    notifications,
    history,
    kpis: computeNotificationKpis(notifications),
    escalationQueue: filterEscalationQueue(notifications),
    getNotification: (id) => getNotificationById(id, notifications),
    getForWorkflow: (wf) => getNotificationsForWorkflow(wf, notifications),
    getWorkflowMetrics: (wf) => getWorkflowNotificationMetrics(wf, notifications),
    filterInbox: (q) => filterNotifications(q, notifications),
    getHistory: (nid) => filterAlertHistory({ notificationId: nid }),
    acknowledge,
    resolve,
    dismiss,
    suppress,
    escalate,
    markRead,
  }), [notifications, history, acknowledge, resolve, dismiss, suppress, escalate, markRead]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
