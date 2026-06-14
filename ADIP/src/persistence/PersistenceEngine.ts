import type {
  AdapterKind,
  AdapterStatus,
  EntityStoreStats,
  PersistenceActivityEntry,
  PersistenceKpis,
  RepositoryHealth,
  StorageAdapterInfo,
} from '../types/persistence';
import type { PersistenceLayer } from './repositories';
import { EntityStore } from './EntityStore';
import { LocalStorageAdapter } from './adapters/LocalStorageAdapter';
import { MemoryAdapter } from './adapters/MemoryAdapter';
import { FutureApiAdapter } from './adapters/FutureApiAdapter';
import { FutureDatabaseAdapter } from './adapters/FutureDatabaseAdapter';
import { AUDIT_EVIDENCE, AUDIT_FINDINGS, AUDIT_OBSERVATIONS } from '../data/auditCenterMock';
import { PLATFORM_NOTIFICATIONS } from '../data/notificationCenterMock';
import { WORKFLOW_ORCHESTRATION_MOCK } from '../data/workflowOrchestrationMock';

const ENTITY_LABELS: Record<string, string> = {
  authentication: 'Authentication',
  users: 'Users',
  workflows: 'Workflows',
  approvals: 'Approvals',
  audit_findings: 'Audit Findings',
  audit_observations: 'Audit Observations',
  evidence: 'Evidence',
  notifications: 'Notifications',
  artifacts: 'Artifacts',
  traceability: 'Traceability',
};

const MOCK_COUNTS: Record<string, number> = {
  audit_findings: AUDIT_FINDINGS.length,
  audit_observations: AUDIT_OBSERVATIONS.length,
  evidence: AUDIT_EVIDENCE.length,
  workflows: WORKFLOW_ORCHESTRATION_MOCK.length,
  notifications: PLATFORM_NOTIFICATIONS.length,
};

export function getAdapterCatalog(): StorageAdapterInfo[] {
  return [
    { kind: 'localStorage', label: 'Local Storage', status: 'active', description: 'Browser localStorage — demo persistence', futureReady: 'Production: migrate to API/DB adapters' },
    { kind: 'memory', label: 'In-Memory', status: 'standby', description: 'Ephemeral session storage for testing', futureReady: 'Unit tests and isolated sandboxes' },
    { kind: 'future-api', label: 'REST API', status: 'stub', description: 'Future enterprise API persistence layer', futureReady: 'Spring Boot / .NET API with OAuth2' },
    { kind: 'future-database', label: 'Database', status: 'stub', description: 'Future relational/document database adapter', futureReady: 'PostgreSQL / MongoDB enterprise store' },
  ];
}

export function createAdapter(kind: AdapterKind) {
  switch (kind) {
    case 'memory': return new MemoryAdapter();
    case 'future-api': return new FutureApiAdapter();
    case 'future-database': return new FutureDatabaseAdapter();
    default: return new LocalStorageAdapter();
  }
}

export function computeEntityStats(layer: PersistenceLayer): EntityStoreStats[] {
  const stores = layer.allStores();
  const byType = new Map<string, EntityStoreStats>();

  for (const store of stores) {
    const stats = store.getStats();
    const existing = byType.get(stats.entityType);
    if (existing) {
      byType.set(stats.entityType, {
        ...existing,
        recordCount: existing.recordCount + stats.recordCount,
        storageBytes: existing.storageBytes + stats.storageBytes,
        lastModified: stats.lastModified ?? existing.lastModified,
        health: stats.health === 'warning' ? 'warning' : existing.health,
      });
    } else {
      byType.set(stats.entityType, {
        ...stats,
        label: ENTITY_LABELS[stats.entityType] ?? stats.entityType,
        recordCount: stats.recordCount || MOCK_COUNTS[stats.entityType] || 0,
      });
    }
  }

  return [...byType.values()];
}

export function computeRepositoryHealth(layer: PersistenceLayer): RepositoryHealth[] {
  const repos = [
    { name: 'AuthRepository', stores: layer.auth.getStores(), types: ['users', 'authentication'] as const },
    { name: 'WorkflowRepository', stores: layer.workflow.getStores(), types: ['workflows'] as const },
    { name: 'ApprovalRepository', stores: layer.approval.getStores(), types: ['approvals'] as const },
    { name: 'AuditRepository', stores: layer.audit.getStores(), types: ['audit_findings', 'audit_observations'] as const },
    { name: 'EvidenceRepository', stores: layer.evidence.getStores(), types: ['evidence'] as const },
    { name: 'NotificationRepository', stores: layer.notification.getStores(), types: ['notifications'] as const },
    { name: 'ArtifactRepository', stores: layer.artifact.getStores(), types: ['artifacts'] as const },
    { name: 'TraceabilityRepository', stores: layer.traceability.getStores(), types: ['traceability'] as const },
  ];

  return repos.map((r) => {
    const activity = r.stores.map((s) => s.getActivity());
    const totalOps = activity.reduce((sum, a) => sum + a.operationCount, 0);
    const totalErrors = activity.reduce((sum, a) => sum + a.errorCount, 0);
    const lastRead = activity.map((a) => a.lastRead).filter(Boolean).sort().reverse()[0] ?? null;
    const lastWrite = activity.map((a) => a.lastWrite).filter(Boolean).sort().reverse()[0] ?? null;
    return {
      name: r.name,
      entityTypes: [...r.types],
      status: totalErrors > 3 ? 'degraded' as const : layer.adapter.isAvailable() ? 'healthy' as const : 'offline' as const,
      lastRead,
      lastWrite,
      operationCount: totalOps,
      errorCount: totalErrors,
    };
  });
}

export function computePersistenceKpis(layer: PersistenceLayer): PersistenceKpis {
  const entities = computeEntityStats(layer);
  const repos = computeRepositoryHealth(layer);
  const totalBytes = entities.reduce((s, e) => s + e.storageBytes, 0);
  const totalRecords = entities.reduce((s, e) => s + e.recordCount, 0);
  const activity = repos.reduce((s, r) => s + r.operationCount, 0);
  const errors = repos.reduce((s, r) => s + r.errorCount, 0);
  const healthyRepos = repos.filter((r) => r.status === 'healthy').length;
  const persistenceHealth = Math.round((healthyRepos / Math.max(1, repos.length)) * 100 - errors * 2);
  const storageUtilization = Math.min(100, Math.round((totalBytes / 5_000_000) * 100));
  const dataQuality = Math.round(
    (entities.filter((e) => e.health === 'healthy').length / Math.max(1, entities.length)) * 100,
  );

  return {
    persistenceHealth: Math.max(0, Math.min(100, persistenceHealth)),
    storageUtilization,
    totalRecords,
    totalStorageBytes: totalBytes,
    repositoryActivity: activity,
    dataQualityScore: dataQuality,
    activeAdapter: layer.adapter.kind as PersistenceKpis['activeAdapter'],
    adapterStatus: layer.adapter.isAvailable() ? 'active' : 'unavailable',
  };
}

export function getRecentActivity(layer: PersistenceLayer, limit = 30): PersistenceActivityEntry[] {
  return EntityStore.collectActivity(layer.allStores()).slice(0, limit);
}

export function getAdapterStatus(kind: string): AdapterStatus {
  if (kind === 'localStorage' || kind === 'memory') return 'active';
  if (kind === 'future-api' || kind === 'future-database') return 'stub';
  return 'standby';
}

export const PERSISTENCE_EXEC_SUMMARY =
  'Persistence health is at 96% with LocalStorageAdapter active across 8 repositories. ' +
  'Storage utilization is within demo limits with workflows, notifications, and authentication entities persisted. ' +
  'Future API and Database adapters are stubbed for production cutover. Recommended: validate data quality on audit findings ' +
  'and evidence repositories before enabling enterprise API adapter.';
