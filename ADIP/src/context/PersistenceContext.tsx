import { useEffect } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AdapterKind, EntityStoreStats, PersistenceActivityEntry, PersistenceKpis, RepositoryHealth, StorageAdapterInfo } from '../types/persistence';
import type { PersistenceLayer } from '../persistence/repositories';
import { createPersistenceLayer } from '../persistence/repositories';
import {
  computeEntityStats,
  computePersistenceKpis,
  computeRepositoryHealth,
  createAdapter,
  getAdapterCatalog,
  getRecentActivity,
  PERSISTENCE_EXEC_SUMMARY,
} from '../persistence/PersistenceEngine';
import { LocalStorageAdapter } from '../persistence/adapters/LocalStorageAdapter';

interface PersistenceContextValue {
  layer: PersistenceLayer;
  kpis: PersistenceKpis;
  entities: EntityStoreStats[];
  repositories: RepositoryHealth[];
  adapters: StorageAdapterInfo[];
  activity: PersistenceActivityEntry[];
  activeAdapter: AdapterKind;
  setActiveAdapter: (kind: AdapterKind) => void;
  refreshStats: () => void;
  execSummary: string;
}

const PersistenceContext = createContext<PersistenceContextValue | null>(null);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [activeAdapter, setActiveKind] = useState<AdapterKind>('localStorage');
  const [layer, setLayer] = useState<PersistenceLayer>(() => createPersistenceLayer(new LocalStorageAdapter()));
  const [tick, setTick] = useState(0);

  const setActiveAdapter = useCallback((kind: AdapterKind) => {
    if (kind === 'future-api' || kind === 'future-database') return;
    setActiveKind(kind);
    setLayer(createPersistenceLayer(createAdapter(kind)));
    setTick((t) => t + 1);
  }, []);

  const refreshStats = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    setPersistenceLayer(layer);
  }, [layer]);

  const value = useMemo<PersistenceContextValue>(() => ({
    layer,
    kpis: computePersistenceKpis(layer),
    entities: computeEntityStats(layer),
    repositories: computeRepositoryHealth(layer),
    adapters: getAdapterCatalog().map((a) => ({
      ...a,
      status: a.kind === activeAdapter ? 'active' : a.status,
    })),
    activity: getRecentActivity(layer),
    activeAdapter,
    setActiveAdapter,
    refreshStats,
    execSummary: PERSISTENCE_EXEC_SUMMARY,
  }), [layer, activeAdapter, setActiveAdapter, refreshStats, tick]);

  return (
    <PersistenceContext.Provider value={value}>
      {children}
    </PersistenceContext.Provider>
  );
}

export function usePersistence(): PersistenceContextValue {
  const ctx = useContext(PersistenceContext);
  if (!ctx) throw new Error('usePersistence must be used within StorageProvider');
  return ctx;
}

/** Direct repository access for non-React modules (auth providers, etc.). */
let defaultLayer: PersistenceLayer = createPersistenceLayer(new LocalStorageAdapter());

export function getPersistenceLayer(): PersistenceLayer {
  return defaultLayer;
}

export function setPersistenceLayer(layer: PersistenceLayer): void {
  defaultLayer = layer;
}

export { PersistenceContext };
