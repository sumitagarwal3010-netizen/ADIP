import type {
  AuditEvidence,
  AuditFinding,
  AuditObservation,
  AuditTimelineEvent,
  EvidenceType,
  FindingSeverity,
  FindingStatus,
  ObservationClosureStatus,
} from '../types/auditCenter';
import type { WorkflowLifecycleStage } from '../types/workflowOrchestration';

const DOMAINS = ['Payments', 'Mobile Banking', 'Cards', 'KYC/AML', 'Core Banking', 'Cloud Platform', 'AI/ML'];
const OWNERS = ['Evidence Office', 'Compliance Office', 'Security Office', 'Audit Office', 'Application Owner', 'Release Manager', 'Model Risk Office'];
const REVIEWERS = ['Internal Audit', 'External Audit', 'Compliance Officer', 'CISO Office', 'CIO Office'];
const WORKFLOWS = ['WF-001', 'WF-002', 'WF-003', 'WF-004', 'WF-005', 'WF-006'];
const TRACE_NODES = ['BR-001', 'BR-002', 'ARC-001', 'ARC-002', 'API-001', 'TC-001', 'TC-002', 'REL-246', 'REL-247', 'EVD-001', 'EVD-002', 'EVD-003', 'EVD-004', 'APR-001', 'APR-002'];
const ARTIFACTS = ['ART-001', 'ART-002', 'ART-003', 'ART-004', 'ART-005', 'ART-006', 'ART-007', 'ART-008'];

const EVIDENCE_TYPES: EvidenceType[] = [
  'Requirements Evidence', 'Architecture Evidence', 'Development Evidence', 'Testing Evidence',
  'Release Evidence', 'Approval Evidence', 'Governance Evidence', 'AI Governance Evidence', 'Production Evidence',
];

const STAGES: WorkflowLifecycleStage[] = ['requirements', 'architecture', 'development', 'testing', 'release', 'approval', 'production'];

const SEVERITIES: FindingSeverity[] = ['Critical', 'High', 'Medium', 'Low'];
const FINDING_STATUSES: FindingStatus[] = ['Open', 'In Progress', 'Mitigated', 'Risk Accepted', 'Closed'];
const EVIDENCE_STATUSES = ['Draft', 'Pending Review', 'Approved', 'Rejected', 'Expired'] as const;
const OBS_STATUSES: ObservationClosureStatus[] = ['Open', 'In Progress', 'Management Response', 'Closed'];

const CONTROL_AREAS = [
  'Access Management', 'Change Management', 'Data Protection', 'Incident Response',
  'AI Model Governance', 'Segregation of Duties', 'Business Continuity', 'Vendor Management',
  'Logging & Monitoring', 'Encryption', 'KYC/AML Controls', 'Release Governance',
];

const FINDING_TITLES = [
  'Privileged access review overdue beyond 90-day policy',
  'Missing segregation of duties on payment limit override',
  'PCI key rotation evidence gap in cardholder environment',
  'KYC document retention incomplete for digital onboarding',
  'DR drill sign-off not documented for core banking',
  'AI model bias testing evidence not linked to release',
  'VAPT closure evidence missing for internet DMZ hosts',
  'Maker-checker override approvals delayed beyond SLA',
  'Cloud IAM role excessive permissions in production',
  'Test evidence not approved before release gate',
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

function dateOffset(days: number): string {
  const d = new Date(2026, 5, 6);
  d.setDate(d.getDate() - days);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isoDate(days: number): string {
  const d = new Date(2026, 5, 6);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function buildEvidence(): AuditEvidence[] {
  const records: AuditEvidence[] = [];
  for (let i = 0; i < 75; i++) {
    const type = pick(EVIDENCE_TYPES, i);
    const stage = pick(STAGES, i);
    const wf = i % 4 === 0 ? null : pick(WORKFLOWS, i);
    const findingId = i % 5 === 0 ? `FND-${String((i % 40) + 1).padStart(3, '0')}` : null;
    const obsId = i % 7 === 0 ? `OBS-${String((i % 25) + 1).padStart(3, '0')}` : null;
    records.push({
      id: `EVD-AUD-${String(i + 1).padStart(3, '0')}`,
      evidenceType: type,
      title: `${type.replace(' Evidence', '')} — ${pick(['Control Validation', 'Sign-off Package', 'Test Results', 'Architecture Review', 'Approval Record', 'Production Log'], i)} #${i + 1}`,
      description: `Enterprise evidence artifact supporting ${type.toLowerCase()} for ${pick(DOMAINS, i)} domain audit cycle Q2 2026.`,
      domain: pick(DOMAINS, i),
      lifecycleStage: stage,
      owner: pick(OWNERS, i),
      reviewer: pick(REVIEWERS, i),
      uploadDate: dateOffset(i * 2),
      reviewDate: i % 3 === 0 ? null : dateOffset(i * 2 - 5),
      status: pick([...EVIDENCE_STATUSES], i),
      linkedWorkflow: wf,
      linkedArtifact: pick(ARTIFACTS, i),
      linkedFinding: findingId,
      linkedObservation: obsId,
      linkedTraceNode: pick(TRACE_NODES, i),
    });
  }
  return records;
}

function buildFindings(): AuditFinding[] {
  const records: AuditFinding[] = [];
  for (let i = 0; i < 40; i++) {
    const severity = pick(SEVERITIES, i + 3);
    const status = pick(FINDING_STATUSES, i);
    const wf = i % 3 === 0 ? null : pick(WORKFLOWS, i);
    const evidenceCount = 1 + (i % 3);
    const linkedEvidence = Array.from({ length: evidenceCount }, (_, j) =>
      `EVD-AUD-${String(((i + j) % 75) + 1).padStart(3, '0')}`,
    );
    records.push({
      id: `FND-${String(i + 1).padStart(3, '0')}`,
      severity,
      domain: pick(DOMAINS, i),
      controlArea: pick(CONTROL_AREAS, i),
      description: `${pick(FINDING_TITLES, i)} (${pick(DOMAINS, i)})`,
      owner: pick(OWNERS, i + 1),
      dueDate: dateOffset(-(i % 30) + 15),
      status,
      resolution: status === 'Closed' || status === 'Mitigated' ? 'Remediation completed with evidence attached and control re-tested.' : status === 'Risk Accepted' ? 'Risk accepted by business owner with compensating controls documented.' : null,
      linkedEvidence,
      linkedWorkflow: wf,
      createdAt: dateOffset(i * 3 + 10),
    });
  }
  return records;
}

function buildObservations(): AuditObservation[] {
  const records: AuditObservation[] = [];
  for (let i = 0; i < 25; i++) {
    const status = pick(OBS_STATUSES, i);
    const findingId = i % 2 === 0 ? `FND-${String((i % 40) + 1).padStart(3, '0')}` : null;
    records.push({
      id: `OBS-${String(i + 1).padStart(3, '0')}`,
      observation: `${pick(FINDING_TITLES, i + 2)} — audit observation for ${pick(DOMAINS, i)}.`,
      recommendation: `Implement automated evidence collection and monthly control attestation for ${pick(CONTROL_AREAS, i)}.`,
      managementResponse: status === 'Open' ? null : `Management agrees. Remediation plan submitted with target closure ${dateOffset(-10)}.`,
      targetDate: dateOffset(-(i % 20) + 30),
      closureStatus: status,
      linkedFinding: findingId,
      linkedEvidence: [`EVD-AUD-${String((i % 75) + 1).padStart(3, '0')}`, `EVD-AUD-${String(((i + 5) % 75) + 1).padStart(3, '0')}`],
      domain: pick(DOMAINS, i),
      owner: pick(OWNERS, i + 2),
    });
  }
  return records;
}

function buildTimeline(): AuditTimelineEvent[] {
  const events: AuditTimelineEvent[] = [];
  const categories = [
    { cat: 'Authentication' as const, actions: ['User login', 'Session refresh', 'MFA challenge', 'Logout', 'Failed login attempt'] },
    { cat: 'RBAC' as const, actions: ['Role assigned', 'Permission granted', 'Entitlement check', 'SoD violation flagged', 'Role revoked'] },
    { cat: 'Approval' as const, actions: ['Approval submitted', 'Reviewer assigned', 'Approved', 'Changes requested', 'Escalated'] },
    { cat: 'Workflow' as const, actions: ['Stage advanced', 'Workflow created', 'SLA breach flagged', 'Delivery risk elevated'] },
    { cat: 'Lifecycle' as const, actions: ['Lifecycle status changed', 'Production gate reached', 'Release published'] },
    { cat: 'Governance' as const, actions: ['Control tested', 'Policy violation detected', 'Compliance assessment', 'Risk accepted'] },
    { cat: 'AI Governance' as const, actions: ['Model approved', 'Prompt reviewed', 'AI incident logged', 'Bias test completed'] },
    { cat: 'Artifact' as const, actions: ['Artifact generated', 'Artifact approved', 'Evidence package exported'] },
  ];

  let idx = 0;
  for (const { cat, actions } of categories) {
    for (let j = 0; j < 8; j++) {
      events.push({
        id: `TL-${String(idx + 1).padStart(4, '0')}`,
        timestamp: isoDate(idx * 4 + j),
        category: cat,
        actor: pick(['Sanjay Verma', 'Priya Nair', 'Audit System', 'Compliance Bot', 'Security Office', 'Release Manager'], idx),
        action: pick(actions, j),
        detail: `${pick(actions, j)} on ${pick(DOMAINS, idx)} — ${pick(WORKFLOWS, idx)}`,
        linkedWorkflow: idx % 3 === 0 ? pick(WORKFLOWS, idx) : null,
        linkedArtifact: idx % 4 === 0 ? pick(ARTIFACTS, idx) : null,
        severity: idx % 11 === 0 ? 'High' : 'Info',
      });
      idx++;
    }
  }
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const AUDIT_EVIDENCE = buildEvidence();
export const AUDIT_FINDINGS = buildFindings();
export const AUDIT_OBSERVATIONS = buildObservations();
export const AUDIT_TIMELINE = buildTimeline();

export const AUDIT_EXEC_SUMMARY =
  'Audit health is at 82% readiness with 18 open findings (3 critical, 6 high) and evidence coverage at 87%. ' +
  'Primary gaps: PCI key rotation evidence, KYC retention controls, and AI model bias testing linkage. ' +
  'Compliance risk elevated in Payments and Mobile Banking domains. Recommended actions: close 4 overdue findings, ' +
  'complete EVD-AUD-012 through EVD-AUD-018 review cycle, and attach production evidence to WF-001 release gate.';
