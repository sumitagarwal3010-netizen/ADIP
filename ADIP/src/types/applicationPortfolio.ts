import type { PersonaId } from '../config/personaConfig';

export type LifecycleStage = 'emerging' | 'growth' | 'mature' | 'declining' | 'retiring' | 'retired';
export type CriticalityLevel = 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4';
export type ComplianceStatus = 'compliant' | 'partial' | 'non-compliant' | 'remediation';
export type AuditStatus = 'passed' | 'findings' | 'in-progress' | 'not-audited';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ApmBusinessUnit {
  id: string;
  name: string;
  head: string;
  applicationCount: number;
  annualCost: number;
}

export interface ApmPortfolio {
  id: string;
  name: string;
  businessUnitId: string;
  applicationCount: number;
  avgHealth: number;
}

export interface ApmDomain {
  id: string;
  name: string;
  applicationCount: number;
  avgCriticality: number;
}

export interface TechnologyStack {
  id: string;
  name: string;
  category: string;
  obsolescenceRisk: RiskLevel;
  applicationCount: number;
}

export interface ApplicationIntegration {
  id: string;
  sourceAppId: string;
  targetAppId: string;
  type: 'api' | 'batch' | 'event' | 'file';
  criticality: CriticalityLevel;
}

export interface TechnologyRisk {
  id: string;
  applicationId: string;
  title: string;
  category: string;
  severity: RiskLevel;
  status: 'open' | 'mitigated' | 'accepted';
}

export interface TechnicalDebtItem {
  id: string;
  applicationId: string;
  title: string;
  category: string;
  score: number;
  effortDays: number;
  priority: 'high' | 'medium' | 'low';
}

export interface ModernizationOpportunity {
  id: string;
  applicationId: string;
  title: string;
  approach: string;
  savingsEstimate: number;
  readinessScore: number;
}

export interface CloudAssessment {
  id: string;
  applicationId: string;
  readinessScore: number;
  targetState: 'rehost' | 'replatform' | 'refactor' | 'retain' | 'retire';
  blockers: string[];
}

export interface AiReadinessAssessment {
  id: string;
  applicationId: string;
  readinessScore: number;
  dataQuality: number;
  apiMaturity: number;
  governanceScore: number;
  useCases: string[];
}

export interface ApplicationRecord {
  id: string;
  name: string;
  businessOwner: string;
  technologyOwner: string;
  domainId: string;
  portfolioId: string;
  businessUnitId: string;
  criticality: CriticalityLevel;
  availability: number;
  technologyStackId: string;
  interfaceCount: number;
  supportCost: number;
  annualCost: number;
  vendor: string;
  lifecycleStage: LifecycleStage;
  technicalDebtScore: number;
  cloudReadinessScore: number;
  aiReadinessScore: number;
  riskScore: number;
  complianceStatus: ComplianceStatus;
  auditStatus: AuditStatus;
  productionHealth: number;
  linkedProjectId?: string;
  linkedDemandId?: string;
  linkedWorkflowId?: string;
  linkedIncidentCount: number;
  valueRealized: number;
}

export interface LifecycleHistoryPoint {
  year: string;
  applicationCount: number;
  avgHealth: number;
  technicalDebt: number;
  cloudReadiness: number;
  aiReadiness: number;
  annualCost: number;
  rationalizationSavings: number;
}

export interface ApmTraceabilityChain {
  stage: string;
  entity: string;
  link: string;
  outcome: string;
}

export type ApmAiCapabilityType =
  | 'rationalization'
  | 'duplicate-capability'
  | 'obsolescence'
  | 'cloud-migration'
  | 'ai-readiness'
  | 'debt-prioritization'
  | 'risk-hotspot'
  | 'cost-optimization'
  | 'retirement'
  | 'modernization';

export interface ApmAiInsight {
  id: string;
  capability: ApmAiCapabilityType;
  title: string;
  recommendation: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  relatedIds: string[];
}

export interface ApplicationPortfolioKpis {
  applicationHealth: number;
  criticalApplications: number;
  technicalDebt: number;
  modernizationReadiness: number;
  cloudReadiness: number;
  aiReadiness: number;
  riskExposure: number;
  annualCost: number;
  rationalizationSavings: number;
  technologyObsolescence: number;
}

export const APPLICATION_PORTFOLIO_ALLOWED_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'ciso',
  'enterprise-architect',
  'application-owner',
  'release-manager',
  'operations-manager',
  'risk-officer',
  'compliance-officer',
  'audit-head',
];
