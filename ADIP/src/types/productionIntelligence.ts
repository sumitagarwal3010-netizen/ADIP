import type { PersonaId } from '../config/personaConfig';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type LeakageStage =
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'production';
export type RcaPattern =
  | 'requirement-quality'
  | 'architecture-design'
  | 'coding-defect'
  | 'testing-gap'
  | 'release-error'
  | 'operational-issue'
  | 'third-party-issue';
export type FeedbackDomain =
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'governance'
  | 'audit';
export type ComplaintChannel = 'call-center' | 'branch' | 'complaint' | 'app-store' | 'nps';

export interface ProductionApplication {
  id: string;
  name: string;
  domain: string;
  owner: string;
  availability: number;
  reliability: number;
  performance: number;
  incidentCount: number;
  defectCount: number;
  auditFindings: number;
  complianceStatus: 'compliant' | 'at-risk' | 'non-compliant';
  riskScore: number;
}

export interface ProductionIncident {
  id: string;
  applicationId: string;
  application: string;
  businessDomain: string;
  severity: IncidentSeverity;
  environment: string;
  detectionTime: string;
  resolutionTime: string | null;
  rootCause: string;
  rcaPattern: RcaPattern;
  introducedRelease: string;
  linkedRequirement: string;
  linkedTestCycle: string;
  linkedApproval: string;
  linkedWorkflow: string;
  businessImpact: string;
  customerImpact: string;
  financialImpact: number;
  title: string;
  status: 'open' | 'resolved' | 'mitigated';
}

export interface ProductionDefect {
  id: string;
  applicationId: string;
  application: string;
  title: string;
  leakageStage: LeakageStage;
  severity: IncidentSeverity;
  introducedRelease: string;
  linkedRequirement: string;
  escapedToProduction: boolean;
  detectedAt: string;
}

export interface CustomerSignal {
  id: string;
  channel: ComplaintChannel;
  applicationId: string;
  application: string;
  summary: string;
  sentiment: 'negative' | 'neutral' | 'positive';
  rating?: number;
  npsScore?: number;
  reportedAt: string;
  painPoint: string;
}

export interface ReleaseEvent {
  id: string;
  name: string;
  applicationId: string;
  application: string;
  deployedAt: string;
  successRate: number;
  rollbackRate: number;
  incidentCreationRate: number;
  defectLeakageRate: number;
  customerImpact: number;
  businessImpact: number;
  goNoGo: 'Go' | 'No-Go' | 'Conditional Go';
}

export interface RcaRecord {
  id: string;
  incidentId: string;
  pattern: RcaPattern;
  summary: string;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  linkedRequirement: string;
  linkedRelease: string;
  createdAt: string;
}

export interface FeedbackRecommendation {
  id: string;
  domain: FeedbackDomain;
  applicationId: string;
  application: string;
  title: string;
  insight: string;
  suggestedAction: string;
  priority: IncidentSeverity;
  source: string;
  linkedIncidentId?: string;
  linkedRequirement: string;
  predictedImpact: string;
}

export interface TraceabilityChain {
  requirement: string;
  architecture: string;
  development: string;
  testing: string;
  release: string;
  incident: string;
  rca: string;
  recommendation: string;
}

export interface ProductionIntelligenceKpis {
  productionRisk: number;
  customerImpact: number;
  defectLeakage: number;
  incidentTrend: number;
  feedbackRecommendations: number;
  openIncidents: number;
  criticalIncidents: number;
  totalApplications: number;
  avgAvailability: number;
  escapedDefects: number;
  customerComplaints: number;
}

export const PRODUCTION_INTEL_ALLOWED_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'application-owner',
  'operations-manager',
  'audit-head',
  'compliance-officer',
  'enterprise-architect',
  'developer',
  'tester',
  'release-manager',
];
