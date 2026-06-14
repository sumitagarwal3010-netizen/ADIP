export type EntityType =
  | 'authentication'
  | 'users'
  | 'workflows'
  | 'approvals'
  | 'audit_findings'
  | 'audit_observations'
  | 'evidence'
  | 'notifications'
  | 'artifacts'
  | 'traceability';

export type AdapterKind = 'localStorage' | 'memory' | 'future-api' | 'future-database';

export type AdapterStatus = 'active' | 'standby' | 'stub' | 'degraded' | 'unavailable';

export interface StorageAdapterInfo {
  kind: AdapterKind;
  label: string;
  status: AdapterStatus;
  description: string;
  futureReady: string;
}

export interface EntityStoreStats {
  entityType: EntityType;
  label: string;
  recordCount: number;
  storageBytes: number;
  lastModified: string | null;
  health: 'healthy' | 'warning' | 'empty';
}

export interface RepositoryHealth {
  name: string;
  entityTypes: EntityType[];
  status: 'healthy' | 'degraded' | 'offline';
  lastRead: string | null;
  lastWrite: string | null;
  operationCount: number;
  errorCount: number;
}

export interface PersistenceKpis {
  persistenceHealth: number;
  storageUtilization: number;
  totalRecords: number;
  totalStorageBytes: number;
  repositoryActivity: number;
  dataQualityScore: number;
  activeAdapter: AdapterKind;
  adapterStatus: AdapterStatus;
}

export interface PersistenceActivityEntry {
  id: string;
  repository: string;
  operation: 'read' | 'write' | 'delete' | 'clear';
  entityType: EntityType;
  timestamp: string;
  bytes: number;
  success: boolean;
}
