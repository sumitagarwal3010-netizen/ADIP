import type { AuthAuditEvent, AuthSession, UserIdentity } from '../../types/auth';
import type { UnifiedLifecycleStatus, WorkflowHistoryEntry, WorkflowInstance } from '../../types/workflowOrchestration';
import type { AlertHistoryEntry, PlatformNotification } from '../../types/notificationCenter';
import type { AuditEvidence, AuditFinding, AuditObservation } from '../../types/auditCenter';
import type { Artifact } from '../../types/artifacts';
import { ENTITY_STORAGE_KEYS, EntityStore } from '../EntityStore';
import type { StorageAdapter } from '../adapters/StorageAdapter';
import { AUDIT_EVIDENCE, AUDIT_FINDINGS, AUDIT_OBSERVATIONS } from '../../data/auditCenterMock';
import { WORKFLOW_ORCHESTRATION_MOCK } from '../../data/workflowOrchestrationMock';

export class AuthRepository {
  private userStore: EntityStore;
  private sessionStore: EntityStore;
  private auditStore: EntityStore;

  constructor(adapter: StorageAdapter) {
    this.userStore = new EntityStore(adapter, 'AuthRepository', 'users', ENTITY_STORAGE_KEYS.auth_user);
    this.sessionStore = new EntityStore(adapter, 'AuthRepository', 'authentication', ENTITY_STORAGE_KEYS.auth_session);
    this.auditStore = new EntityStore(adapter, 'AuthRepository', 'authentication', ENTITY_STORAGE_KEYS.auth_audit);
  }

  saveSession(user: UserIdentity, session: AuthSession): void {
    this.userStore.write(user);
    this.sessionStore.write(session);
  }

  clearSession(): void {
    this.userStore.remove();
    this.sessionStore.remove();
  }

  readSession(): { user: UserIdentity; session: AuthSession } | null {
    const user = this.userStore.read<UserIdentity>();
    const session = this.sessionStore.read<AuthSession>();
    if (!user || !session) return null;
    if (session.expiresAt < Date.now()) return null;
    return { user, session };
  }

  appendAuditEvent(event: AuthAuditEvent): AuthAuditEvent[] {
    const existing = this.auditStore.read<AuthAuditEvent[]>() ?? [];
    const next = [event, ...existing].slice(0, 100);
    this.auditStore.write(next);
    return next;
  }

  readAuditEvents(): AuthAuditEvent[] {
    return this.auditStore.read<AuthAuditEvent[]>() ?? [];
  }

  getStores() {
    return [this.userStore, this.sessionStore, this.auditStore];
  }
}

export class WorkflowRepository {
  private workflowStore: EntityStore;
  private historyStore: EntityStore;

  constructor(adapter: StorageAdapter) {
    this.workflowStore = new EntityStore(adapter, 'WorkflowRepository', 'workflows', ENTITY_STORAGE_KEYS.workflows);
    this.historyStore = new EntityStore(adapter, 'WorkflowRepository', 'workflows', ENTITY_STORAGE_KEYS.workflow_history);
  }

  loadWorkflows(): WorkflowInstance[] | null {
    const parsed = this.workflowStore.read<WorkflowInstance[]>();
    if (!parsed) return null;
    return parsed.map((w) => ({
      ...w,
      lifecycleStatus: (w.lifecycleStatus ?? (w as { approvalState?: UnifiedLifecycleStatus }).approvalState ?? 'Draft') as UnifiedLifecycleStatus,
    }));
  }

  saveWorkflows(workflows: WorkflowInstance[]): void {
    this.workflowStore.write(workflows);
  }

  loadHistory(): WorkflowHistoryEntry[] {
    return this.historyStore.read<WorkflowHistoryEntry[]>() ?? [];
  }

  saveHistory(history: WorkflowHistoryEntry[]): void {
    this.historyStore.write(history);
  }

  getDefaultWorkflows(): WorkflowInstance[] {
    return WORKFLOW_ORCHESTRATION_MOCK;
  }

  getStores() {
    return [this.workflowStore, this.historyStore];
  }
}

export class ApprovalRepository {
  private cacheStore: EntityStore;

  constructor(adapter: StorageAdapter) {
    this.cacheStore = new EntityStore(adapter, 'ApprovalRepository', 'approvals', ENTITY_STORAGE_KEYS.approvals);
  }

  saveCache(data: unknown): void {
    this.cacheStore.write(data);
  }

  loadCache<T>(): T | null {
    return this.cacheStore.read<T>();
  }

  getStores() {
    return [this.cacheStore];
  }
}

export class AuditRepository {
  private findingsStore: EntityStore;
  private observationsStore: EntityStore;

  constructor(adapter: StorageAdapter) {
    this.findingsStore = new EntityStore(adapter, 'AuditRepository', 'audit_findings', ENTITY_STORAGE_KEYS.audit_findings);
    this.observationsStore = new EntityStore(adapter, 'AuditRepository', 'audit_observations', ENTITY_STORAGE_KEYS.audit_observations);
  }

  loadFindings(): AuditFinding[] {
    return this.findingsStore.read<AuditFinding[]>() ?? AUDIT_FINDINGS;
  }

  saveFindings(findings: AuditFinding[]): void {
    this.findingsStore.write(findings);
  }

  loadObservations(): AuditObservation[] {
    return this.observationsStore.read<AuditObservation[]>() ?? AUDIT_OBSERVATIONS;
  }

  saveObservations(observations: AuditObservation[]): void {
    this.observationsStore.write(observations);
  }

  getStores() {
    return [this.findingsStore, this.observationsStore];
  }
}

export class EvidenceRepository {
  private evidenceStore: EntityStore;

  constructor(adapter: StorageAdapter) {
    this.evidenceStore = new EntityStore(adapter, 'EvidenceRepository', 'evidence', ENTITY_STORAGE_KEYS.evidence);
  }

  loadEvidence(): AuditEvidence[] {
    return this.evidenceStore.read<AuditEvidence[]>() ?? AUDIT_EVIDENCE;
  }

  saveEvidence(evidence: AuditEvidence[]): void {
    this.evidenceStore.write(evidence);
  }

  getStores() {
    return [this.evidenceStore];
  }
}

export class NotificationRepository {
  private notificationStore: EntityStore;

  constructor(adapter: StorageAdapter) {
    this.notificationStore = new EntityStore(adapter, 'NotificationRepository', 'notifications', ENTITY_STORAGE_KEYS.notifications);
  }

  load(): { notifications: PlatformNotification[]; history: AlertHistoryEntry[] } | null {
    return this.notificationStore.read<{ notifications: PlatformNotification[]; history: AlertHistoryEntry[] }>();
  }

  save(state: { notifications: PlatformNotification[]; history: AlertHistoryEntry[] }): void {
    this.notificationStore.write(state);
  }

  getStores() {
    return [this.notificationStore];
  }
}

export class ArtifactRepository {
  private artifactStore: EntityStore;

  constructor(adapter: StorageAdapter) {
    this.artifactStore = new EntityStore(adapter, 'ArtifactRepository', 'artifacts', ENTITY_STORAGE_KEYS.artifacts);
  }

  loadArtifacts(): Artifact[] {
    return this.artifactStore.read<Artifact[]>() ?? [];
  }

  saveArtifacts(artifacts: Artifact[]): void {
    this.artifactStore.write(artifacts);
  }

  appendArtifact(artifact: Artifact): Artifact[] {
    const existing = this.loadArtifacts();
    const next = [artifact, ...existing].slice(0, 50);
    this.saveArtifacts(next);
    return next;
  }

  getStores() {
    return [this.artifactStore];
  }
}

export class TraceabilityRepository {
  private traceStore: EntityStore;

  constructor(adapter: StorageAdapter) {
    this.traceStore = new EntityStore(adapter, 'TraceabilityRepository', 'traceability', ENTITY_STORAGE_KEYS.traceability);
  }

  loadCache<T>(): T | null {
    return this.traceStore.read<T>();
  }

  saveCache<T>(data: T): void {
    this.traceStore.write(data);
  }

  getStores() {
    return [this.traceStore];
  }
}

export interface PersistenceLayer {
  adapter: StorageAdapter;
  auth: AuthRepository;
  workflow: WorkflowRepository;
  approval: ApprovalRepository;
  audit: AuditRepository;
  evidence: EvidenceRepository;
  notification: NotificationRepository;
  artifact: ArtifactRepository;
  traceability: TraceabilityRepository;
  allStores(): EntityStore[];
}

export function createPersistenceLayer(adapter: StorageAdapter): PersistenceLayer {
  const auth = new AuthRepository(adapter);
  const workflow = new WorkflowRepository(adapter);
  const approval = new ApprovalRepository(adapter);
  const audit = new AuditRepository(adapter);
  const evidence = new EvidenceRepository(adapter);
  const notification = new NotificationRepository(adapter);
  const artifact = new ArtifactRepository(adapter);
  const traceability = new TraceabilityRepository(adapter);

  return {
    adapter,
    auth,
    workflow,
    approval,
    audit,
    evidence,
    notification,
    artifact,
    traceability,
    allStores: () => [
      ...auth.getStores(),
      ...workflow.getStores(),
      ...approval.getStores(),
      ...audit.getStores(),
      ...evidence.getStores(),
      ...notification.getStores(),
      ...artifact.getStores(),
      ...traceability.getStores(),
    ],
  };
}
