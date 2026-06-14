import type { EntityType } from '../types/persistence';
import type { StorageAdapter } from './adapters/StorageAdapter';

export const ENTITY_STORAGE_KEYS: Record<string, string> = {
  auth_user: 'adip.auth.user',
  auth_session: 'adip.auth.session',
  auth_audit: 'adip.auth.audit',
  workflows: 'adip.unified.lifecycle',
  workflow_history: 'adip.workflow.history',
  notifications: 'adip.notifications',
  audit_findings: 'adip.audit.findings',
  audit_observations: 'adip.audit.observations',
  evidence: 'adip.audit.evidence',
  artifacts: 'adip.artifacts.generated',
  traceability: 'adip.traceability.cache',
  approvals: 'adip.approvals.cache',
};

export interface StoreActivity {
  id: string;
  repository: string;
  operation: 'read' | 'write' | 'delete' | 'clear';
  entityType: EntityType;
  timestamp: string;
  bytes: number;
  success: boolean;
}

export class EntityStore {
  private activity: StoreActivity[] = [];
  private readCounts = new Map<string, number>();
  private writeCounts = new Map<string, number>();
  private lastRead = new Map<string, string>();
  private lastWrite = new Map<string, string>();
  private errors = new Map<string, number>();
  private adapter: StorageAdapter;
  private repositoryName: string;
  private entityType: EntityType;
  private storageKey: string;

  constructor(
    adapter: StorageAdapter,
    repositoryName: string,
    entityType: EntityType,
    storageKey: string,
  ) {
    this.adapter = adapter;
    this.repositoryName = repositoryName;
    this.entityType = entityType;
    this.storageKey = storageKey;
  }

  get key(): string {
    return this.storageKey;
  }

  read<T>(): T | null {
    try {
      const raw = this.adapter.getItem(this.storageKey);
      this.record('read', raw?.length ?? 0, true);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      this.record('read', 0, false);
      this.errors.set(this.repositoryName, (this.errors.get(this.repositoryName) ?? 0) + 1);
      return null;
    }
  }

  write<T>(value: T): void {
    try {
      const serialized = JSON.stringify(value);
      this.adapter.setItem(this.storageKey, serialized);
      this.record('write', serialized.length, true);
    } catch {
      this.record('write', 0, false);
      this.errors.set(this.repositoryName, (this.errors.get(this.repositoryName) ?? 0) + 1);
    }
  }

  remove(): void {
    try {
      this.adapter.removeItem(this.storageKey);
      this.record('delete', 0, true);
    } catch {
      this.record('delete', 0, false);
    }
  }

  getStorageBytes(): number {
    const raw = this.adapter.getItem(this.storageKey);
    return raw ? new Blob([raw]).size : 0;
  }

  getRecordCount(): number {
    const data = this.read<unknown>();
    if (data == null) return 0;
    if (Array.isArray(data)) return data.length;
    if (typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.notifications)) return obj.notifications.length;
      if (Array.isArray(obj.workflows)) return obj.workflows.length;
      return Object.keys(obj).length;
    }
    return 1;
  }

  getStats() {
    const bytes = this.getStorageBytes();
    const count = this.getRecordCount();
    return {
      entityType: this.entityType,
      recordCount: count,
      storageBytes: bytes,
      lastModified: this.lastWrite.get(this.repositoryName) ?? this.lastRead.get(this.repositoryName) ?? null,
      health: count === 0 && bytes === 0 ? 'empty' as const : bytes > 500_000 ? 'warning' as const : 'healthy' as const,
    };
  }

  getActivity() {
    return {
      operationCount: (this.readCounts.get(this.repositoryName) ?? 0) + (this.writeCounts.get(this.repositoryName) ?? 0),
      errorCount: this.errors.get(this.repositoryName) ?? 0,
      lastRead: this.lastRead.get(this.repositoryName) ?? null,
      lastWrite: this.lastWrite.get(this.repositoryName) ?? null,
    };
  }

  getRecentActivity(limit = 20): StoreActivity[] {
    return this.activity.filter((a) => a.repository === this.repositoryName).slice(0, limit);
  }

  private record(operation: StoreActivity['operation'], bytes: number, success: boolean): void {
    const now = new Date().toISOString();
    if (operation === 'read') {
      this.readCounts.set(this.repositoryName, (this.readCounts.get(this.repositoryName) ?? 0) + 1);
      this.lastRead.set(this.repositoryName, now);
    } else if (operation === 'write') {
      this.writeCounts.set(this.repositoryName, (this.writeCounts.get(this.repositoryName) ?? 0) + 1);
      this.lastWrite.set(this.repositoryName, now);
    }
    this.activity.unshift({
      id: `${this.repositoryName}-${Date.now()}`,
      repository: this.repositoryName,
      operation,
      entityType: this.entityType,
      timestamp: now,
      bytes,
      success,
    });
    if (this.activity.length > 200) this.activity.length = 200;
  }

  static collectActivity(stores: EntityStore[]): StoreActivity[] {
    return stores.flatMap((s) => s.getRecentActivity(10)).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }
}
