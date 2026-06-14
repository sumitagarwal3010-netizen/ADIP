import type { WorkflowLifecycleStage } from './workflowOrchestration';

export type EvidenceType =
  | 'Requirements Evidence'
  | 'Architecture Evidence'
  | 'Development Evidence'
  | 'Testing Evidence'
  | 'Release Evidence'
  | 'Approval Evidence'
  | 'Governance Evidence'
  | 'AI Governance Evidence'
  | 'Production Evidence';

export type EvidenceStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Expired';

export type FindingSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type FindingStatus = 'Open' | 'In Progress' | 'Mitigated' | 'Risk Accepted' | 'Closed';

export type ObservationClosureStatus = 'Open' | 'In Progress' | 'Management Response' | 'Closed';

export type AuditStatusLabel = 'Compliant' | 'Partial' | 'Non-Compliant' | 'Under Review';

export type ComplianceStatusLabel = 'Compliant' | 'Partial' | 'Non-Compliant';

export interface AuditEvidence {
  id: string;
  evidenceType: EvidenceType;
  title: string;
  description: string;
  domain: string;
  lifecycleStage: WorkflowLifecycleStage;
  owner: string;
  reviewer: string;
  uploadDate: string;
  reviewDate: string | null;
  status: EvidenceStatus;
  linkedWorkflow: string | null;
  linkedArtifact: string | null;
  linkedFinding: string | null;
  linkedObservation: string | null;
  linkedTraceNode: string | null;
}

export interface AuditFinding {
  id: string;
  severity: FindingSeverity;
  domain: string;
  controlArea: string;
  description: string;
  owner: string;
  dueDate: string;
  status: FindingStatus;
  resolution: string | null;
  linkedEvidence: string[];
  linkedWorkflow: string | null;
  createdAt: string;
}

export interface AuditObservation {
  id: string;
  observation: string;
  recommendation: string;
  managementResponse: string | null;
  targetDate: string;
  closureStatus: ObservationClosureStatus;
  linkedFinding: string | null;
  linkedEvidence: string[];
  domain: string;
  owner: string;
}

export type AuditTimelineCategory =
  | 'Authentication'
  | 'RBAC'
  | 'Approval'
  | 'Workflow'
  | 'Lifecycle'
  | 'Governance'
  | 'AI Governance'
  | 'Artifact';

export interface AuditTimelineEvent {
  id: string;
  timestamp: string;
  category: AuditTimelineCategory;
  actor: string;
  action: string;
  detail: string;
  linkedWorkflow: string | null;
  linkedArtifact: string | null;
  severity?: FindingSeverity | 'Info';
}

export interface AuditKpis {
  openFindings: number;
  highFindings: number;
  criticalFindings: number;
  closedFindings: number;
  overdueFindings: number;
  evidenceCoverage: number;
  complianceCoverage: number;
  auditReadinessScore: number;
  controlCoverage: number;
  openObservations: number;
  totalEvidence: number;
  findingsBySeverity: { name: string; value: number }[];
  findingsByDomain: { name: string; value: number }[];
  findingsAging: { bucket: string; count: number }[];
  evidenceByType: { name: string; value: number }[];
  complianceTrend: { month: string; score: number }[];
  riskTrend: { month: string; critical: number; high: number }[];
}

export interface WorkflowAuditMetrics {
  evidenceCount: number;
  openFindings: number;
  openObservations: number;
  auditStatus: AuditStatusLabel;
  complianceStatus: ComplianceStatusLabel;
}

export interface EvidenceLineageEntry {
  stage: WorkflowLifecycleStage;
  label: string;
  nodeId: string | null;
  evidenceIds: string[];
  coverage: 'complete' | 'partial' | 'missing';
}
