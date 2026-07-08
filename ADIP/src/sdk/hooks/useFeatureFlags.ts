/**
 * Feature flags — reuses backend data source toggle (Role 8).
 */
import { useCallback, useSyncExternalStore } from 'react';
import { getDataSource, setDataSource, type DataSource } from '../../services/backend/apiConfig';

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  listeners.forEach((cb) => cb());
}

export function useFeatureFlags() {
  const dataSource = useSyncExternalStore(subscribe, getDataSource, () => 'mock' as DataSource);

  const setBackendMode = useCallback((enabled: boolean) => {
    setDataSource(enabled ? 'backend' : 'mock');
    notify();
    window.location.reload();
  }, []);

  return {
    dataSource,
    backendMode: dataSource === 'backend',
    mockMode: dataSource === 'mock',
    setBackendMode,
    flags: {
      aiWorkspace: true,
      orchestrator: dataSource === 'backend',
      promptWorkbench: dataSource === 'backend',
      streaming: dataSource === 'backend',
    },
  };
}
