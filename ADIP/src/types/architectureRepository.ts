import type { PersonaId } from '../config/personaConfig';

export type ArchitectureDomain =
  | 'business'
  | 'application'
  | 'data'
  | 'integration'
  | 'technology'
  | 'security'
  | 'cloud'
  | 'infrastructure'
  | 'ai'
  | 'reference';

export type TechnologyLifecycle =
  | 'current'
  | 'target'
  | 'deprecated'
  | 'retiring'
  | 'end-of-support'
  | 'end-of-life';

export type ComplianceState = 'compliant' | 'partial' | 'non-compliant' | 'exception';
export type ReviewStatus = 'queued' | 'in-review' | 'approved' | 'rejected' | 'conditional';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type FindingStatus = 'open' | 'in-remediation' | 'accepted' | 'closed';
export type ExceptionStatus = 'requested' | 'approved' | 'waiver' | 'risk-accepted' | 'expired';

export interface BusinessCapability {
  id: string;
  name: string;
  domainArea: string;
  maturity: number;
  applicationCount: number;
  criticality: RiskLevel;
  architectureHealth: number;
}

export interface ArchitectureApplication {
  id: string;
  name: string;
  capabilityId: string;
  domain: ArchitectureDomain;
  complianceState: ComplianceState;
  lifecycle: TechnologyLifecycle;
  cloudReadiness: number;
  aiReadiness: number;
  architectureRisk: number;
  standardsAdherence: number;
}

export interface ArchitectureIntegration {
  id: string;
  name: string;
  sourceAppId: string;
  targetAppId: string;
  pattern: 'api' | 'event' | 'batch' | 'file' | 'streaming';
  complianceState: ComplianceState;
  riskLevel: RiskLevel;
}

export interface ArchitectureApi {
  id: string;
  name: string;
  applicationId: string;
  style: 'rest' | 'graphql' | 'soap' | 'grpc' | 'event';
  standardsCompliant: boolean;
  version: string;
}

export interface ArchitectureDatabase {
  id: string;
  name: string;
  applicationId: string;
  engine: string;
  lifecycle: TechnologyLifecycle;
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
}

export interface TechnologyPlatform {
  id: string;
  name: string;
  category: string;
  lifecycle: TechnologyLifecycle;
  applicationCount: number;
  obsolescenceRisk: RiskLevel;
}

export interface CloudService {
  id: string;
  name: string;
  provider: 'AWS' | 'Azure' | 'GCP' | 'Private Cloud';
  category: string;
  adoptionLevel: number;
  approved: boolean;
}

export interface ArchitectureStandard {
  id: string;
  name: string;
  domain: ArchitectureDomain;
  category: string;
  adoptionRate: number;
  mandatory: boolean;
}

export interface ArchitecturePrinciple {
  id: string;
  name: string;
  domain: ArchitectureDomain;
  statement: string;
  adherence: number;
}

export interface ReferenceArchitecture {
  id: string;
  name: string;
  domain: ArchitectureDomain;
  adoptionRate: number;
  applicationsAligned: number;
}

export interface ArchitectureReview {
  id: string;
  title: string;
  applicationId: string;
  domain: ArchitectureDomain;
  status: ReviewStatus;
  submittedBy: string;
  reviewer: string;
  complianceScore: number;
  submittedAt: string;
}

export interface ArchitectureFinding {
  id: string;
  reviewId: string;
  applicationId: string;
  title: string;
  domain: ArchitectureDomain;
  severity: RiskLevel;
  status: FindingStatus;
}

export interface ArchitectureException {
  id: string;
  applicationId: string;
  standardId: string;
  title: string;
  status: ExceptionStatus;
  riskLevel: RiskLevel;
  expiresAt: string;
  approver: string;
}

export interface ArchitectureDecision {
  id: string;
  title: string;
  domain: ArchitectureDomain;
  decision: string;
  rationale: string;
  status: 'proposed' | 'accepted' | 'superseded';
  decidedAt: string;
}

export interface ArchitectureDebtItem {
  id: string;
  applicationId: string;
  title: string;
  category: 'obsolescence' | 'unsupported-platform' | 'violation' | 'risk' | 'modernization';
  domain: ArchitectureDomain;
  severity: RiskLevel;
  effortDays: number;
  remediationStatus: 'identified' | 'planned' | 'in-progress' | 'resolved';
}

export interface ArchitectureHistoryPoint {
  year: string;
  architectureHealth: number;
  standardsCompliance: number;
  architectureDebt: number;
  cloudReadiness: number;
  aiReadiness: number;
  referenceAdoption: number;
}

export interface ArchitectureTraceabilityChain {
  stage: string;
  entity: string;
  link: string;
  outcome: string;
}

export type ArchAiCapabilityType =
  | 'compliance'
  | 'reference-architecture'
  | 'obsolescence'
  | 'cloud-migration'
  | 'ai-architecture'
  | 'architecture-debt'
  | 'security-architecture'
  | 'integration-risk'
  | 'modernization'
  | 'rationalization';

export interface ArchAiInsight {
  id: string;
  capability: ArchAiCapabilityType;
  title: string;
  recommendation: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  relatedIds: string[];
}

export interface ArchitectureRepositoryKpis {
  architectureHealth: number;
  standardsCompliance: number;
  architectureDebt: number;
  technologyObsolescence: number;
  cloudReadiness: number;
  aiReadiness: number;
  architectureRisk: number;
  architectureExceptions: number;
  referenceAdoption: number;
  modernizationProgress: number;
}

export const ARCHITECTURE_REPOSITORY_ALLOWED_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'enterprise-architect',
  'application-owner',
  'release-manager',
  'operations-manager',
  'ciso',
  'risk-officer',
  'compliance-officer',
];
