import type {
  AuditEvidence,
  AuditFinding,
  AuditKpis,
  AuditObservation,
  AuditTimelineEvent,
  EvidenceLineageEntry,
  WorkflowAuditMetrics,
} from '../types/auditCenter';
import type { WorkflowLifecycleStage } from '../types/workflowOrchestration';
import {
  AUDIT_EVIDENCE,
  AUDIT_FINDINGS,
  AUDIT_OBSERVATIONS,
  AUDIT_TIMELINE,
} from './auditCenterMock';
import { WORKFLOW_STAGE_LABEL, WORKFLOW_STAGE_ORDER } from './unifiedLifecycleEngine';
import { colors } from '../theme/colors';

const OPEN_FINDING_STATUSES = new Set(['Open', 'In Progress']);
const OPEN_OBS_STATUSES = new Set(['Open', 'In Progress', 'Management Response']);

export function computeAuditKpis(
  evidence: AuditEvidence[] = AUDIT_EVIDENCE,
  findings: AuditFinding[] = AUDIT_FINDINGS,
  observations: AuditObservation[] = AUDIT_OBSERVATIONS,
): AuditKpis {
  const now = new Date('2026-06-06');
  const openFindings = findings.filter((f) => OPEN_FINDING_STATUSES.has(f.status));
  const overdueFindings = openFindings.filter((f) => new Date(f.dueDate) < now);

  const severityCounts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  for (const f of findings) severityCounts[f.severity]++;

  const domainMap = new Map<string, number>();
  for (const f of openFindings) domainMap.set(f.domain, (domainMap.get(f.domain) ?? 0) + 1);

  const agingBuckets = { '0-30d': 0, '31-60d': 0, '61-90d': 0, '90d+': 0 };
  for (const f of openFindings) {
    const age = Math.floor((now.getTime() - new Date(f.createdAt).getTime()) / 86400000);
    if (age <= 30) agingBuckets['0-30d']++;
    else if (age <= 60) agingBuckets['31-60d']++;
    else if (age <= 90) agingBuckets['61-90d']++;
    else agingBuckets['90d+']++;
  }

  const typeMap = new Map<string, number>();
  for (const e of evidence) typeMap.set(e.evidenceType, (typeMap.get(e.evidenceType) ?? 0) + 1);

  const approvedEvidence = evidence.filter((e) => e.status === 'Approved').length;
  const evidenceCoverage = Math.round((approvedEvidence / Math.max(1, evidence.length)) * 100);
  const closedFindings = findings.filter((f) => f.status === 'Closed' || f.status === 'Mitigated').length;
  const complianceCoverage = Math.round(
    ((closedFindings + findings.filter((f) => f.status === 'Risk Accepted').length) / Math.max(1, findings.length)) * 100,
  );
  const controlCoverage = Math.round(78 + (approvedEvidence / evidence.length) * 15);
  const auditReadinessScore = Math.round(
    evidenceCoverage * 0.4 + complianceCoverage * 0.35 + (100 - openFindings.length * 2) * 0.25,
  );

  return {
    openFindings: openFindings.length,
    highFindings: severityCounts.High,
    criticalFindings: severityCounts.Critical,
    closedFindings,
    overdueFindings: overdueFindings.length,
    evidenceCoverage,
    complianceCoverage,
    auditReadinessScore: Math.min(100, Math.max(0, auditReadinessScore)),
    controlCoverage: Math.min(100, controlCoverage),
    openObservations: observations.filter((o) => OPEN_OBS_STATUSES.has(o.closureStatus)).length,
    totalEvidence: evidence.length,
    findingsBySeverity: Object.entries(severityCounts).map(([name, value]) => ({ name, value })),
    findingsByDomain: [...domainMap.entries()].map(([name, value]) => ({ name, value })),
    findingsAging: Object.entries(agingBuckets).map(([bucket, count]) => ({ bucket, count })),
    evidenceByType: [...typeMap.entries()].map(([name, value]) => ({ name, value })),
    complianceTrend: [
      { month: 'Jan', score: 72 }, { month: 'Feb', score: 74 }, { month: 'Mar', score: 76 },
      { month: 'Apr', score: 79 }, { month: 'May', score: 81 }, { month: 'Jun', score: complianceCoverage },
    ],
    riskTrend: [
      { month: 'Jan', critical: 5, high: 12 }, { month: 'Feb', critical: 4, high: 11 },
      { month: 'Mar', critical: 4, high: 10 }, { month: 'Apr', critical: 3, high: 9 },
      { month: 'May', critical: 3, high: 8 }, { month: 'Jun', critical: severityCounts.Critical, high: severityCounts.High },
    ],
  };
}

export function getWorkflowAuditMetrics(workflowId: string): WorkflowAuditMetrics {
  const evidence = AUDIT_EVIDENCE.filter((e) => e.linkedWorkflow === workflowId);
  const findings = AUDIT_FINDINGS.filter((f) => f.linkedWorkflow === workflowId);
  const observations = AUDIT_OBSERVATIONS.filter((o) =>
    o.linkedEvidence.some((eid) => evidence.some((e) => e.id === eid)),
  );
  const openFindings = findings.filter((f) => OPEN_FINDING_STATUSES.has(f.status)).length;
  const openObservations = observations.filter((o) => OPEN_OBS_STATUSES.has(o.closureStatus)).length;
  const approved = evidence.filter((e) => e.status === 'Approved').length;

  let auditStatus: WorkflowAuditMetrics['auditStatus'] = 'Compliant';
  if (openFindings > 2 || findings.some((f) => f.severity === 'Critical' && OPEN_FINDING_STATUSES.has(f.status))) {
    auditStatus = 'Non-Compliant';
  } else if (openFindings > 0 || approved < evidence.length * 0.7) {
    auditStatus = 'Partial';
  } else if (evidence.some((e) => e.status === 'Pending Review')) {
    auditStatus = 'Under Review';
  }

  let complianceStatus: WorkflowAuditMetrics['complianceStatus'] = 'Compliant';
  if (auditStatus === 'Non-Compliant') complianceStatus = 'Non-Compliant';
  else if (auditStatus === 'Partial' || auditStatus === 'Under Review') complianceStatus = 'Partial';

  return {
    evidenceCount: evidence.length,
    openFindings,
    openObservations,
    auditStatus,
    complianceStatus,
  };
}

export function enrichAllWorkflowAuditMetrics(workflowIds: string[]): Record<string, WorkflowAuditMetrics> {
  return Object.fromEntries(workflowIds.map((id) => [id, getWorkflowAuditMetrics(id)]));
}

export function filterEvidence(query: {
  search?: string;
  type?: string;
  domain?: string;
  status?: string;
  workflow?: string;
}): AuditEvidence[] {
  const q = (query.search ?? '').toLowerCase();
  return AUDIT_EVIDENCE.filter((e) => {
    if (query.type && e.evidenceType !== query.type) return false;
    if (query.domain && e.domain !== query.domain) return false;
    if (query.status && e.status !== query.status) return false;
    if (query.workflow && e.linkedWorkflow !== query.workflow) return false;
    if (!q) return true;
    return (
      e.id.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      (e.linkedTraceNode?.toLowerCase().includes(q) ?? false)
    );
  });
}

export function filterFindings(query: {
  search?: string;
  severity?: string;
  domain?: string;
  status?: string;
}): AuditFinding[] {
  const q = (query.search ?? '').toLowerCase();
  return AUDIT_FINDINGS.filter((f) => {
    if (query.severity && f.severity !== query.severity) return false;
    if (query.domain && f.domain !== query.domain) return false;
    if (query.status && f.status !== query.status) return false;
    if (!q) return true;
    return f.id.toLowerCase().includes(q) || f.description.toLowerCase().includes(q) || f.controlArea.toLowerCase().includes(q);
  });
}

export function filterObservations(query: { search?: string; status?: string; domain?: string }): AuditObservation[] {
  const q = (query.search ?? '').toLowerCase();
  return AUDIT_OBSERVATIONS.filter((o) => {
    if (query.status && o.closureStatus !== query.status) return false;
    if (query.domain && o.domain !== query.domain) return false;
    if (!q) return true;
    return o.id.toLowerCase().includes(q) || o.observation.toLowerCase().includes(q);
  });
}

export function filterTimeline(query: { category?: string; search?: string }): AuditTimelineEvent[] {
  const q = (query.search ?? '').toLowerCase();
  return AUDIT_TIMELINE.filter((e) => {
    if (query.category && e.category !== query.category) return false;
    if (!q) return true;
    return e.action.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q);
  });
}

export function buildEvidenceLineage(workflowId?: string): EvidenceLineageEntry[] {
  const evidence = workflowId
    ? AUDIT_EVIDENCE.filter((e) => e.linkedWorkflow === workflowId)
    : AUDIT_EVIDENCE;

  return WORKFLOW_STAGE_ORDER.map((stage) => {
    const stageEvidence = evidence.filter((e) => e.lifecycleStage === stage);
    const approved = stageEvidence.filter((e) => e.status === 'Approved').length;
    let coverage: EvidenceLineageEntry['coverage'] = 'missing';
    if (stageEvidence.length > 0 && approved === stageEvidence.length) coverage = 'complete';
    else if (stageEvidence.length > 0) coverage = 'partial';

    return {
      stage,
      label: WORKFLOW_STAGE_LABEL[stage],
      nodeId: stageEvidence[0]?.linkedTraceNode ?? null,
      evidenceIds: stageEvidence.map((e) => e.id),
      coverage,
    };
  });
}

export function getMissingEvidenceStages(workflowId?: string): WorkflowLifecycleStage[] {
  return buildEvidenceLineage(workflowId)
    .filter((e) => e.coverage === 'missing')
    .map((e) => e.stage);
}

export function getEvidenceById(id: string): AuditEvidence | undefined {
  return AUDIT_EVIDENCE.find((e) => e.id === id);
}

export function getFindingById(id: string): AuditFinding | undefined {
  return AUDIT_FINDINGS.find((f) => f.id === id);
}

export function getObservationById(id: string): AuditObservation | undefined {
  return AUDIT_OBSERVATIONS.find((o) => o.id === id);
}

export const AUDIT_DOMAINS = [...new Set(AUDIT_EVIDENCE.map((e) => e.domain))].sort();
export const AUDIT_EVIDENCE_TYPES = [...new Set(AUDIT_EVIDENCE.map((e) => e.evidenceType))];

const SEVERITY_COLORS: Record<string, string> = {
  Critical: colors.critical,
  High: colors.warning,
  Medium: colors.info,
  Low: colors.text.muted,
};

export function findingsSeverityChartData() {
  const kpis = computeAuditKpis();
  return kpis.findingsBySeverity.map((d) => ({
    ...d,
    color: SEVERITY_COLORS[d.name] ?? colors.primary,
  }));
}
