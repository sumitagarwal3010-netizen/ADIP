import type { PersonaId } from '../config/personaConfig';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type RiskStatus = 'open' | 'monitoring' | 'mitigating' | 'accepted' | 'closed';
export type RiskCategory =
  | 'operational'
  | 'technology'
  | 'cyber'
  | 'ai'
  | 'regulatory'
  | 'financial'
  | 'strategic'
  | 'third-party';
export type ControlEffectiveness = 'effective' | 'partially-effective' | 'ineffective' | 'not-tested';
export type FindingStatus = 'open' | 'in-remediation' | 'overdue' | 'closed';
export type AppetiteStatus = 'within' | 'approaching' | 'breached';
export type AssuranceStatus = 'planned' | 'in-progress' | 'completed' | 'deferred';

export interface EnterpriseRisk {
  id: string;
  title: string;
  category: RiskCategory;
  businessUnit: string;
  inherentScore: number;
  residualScore: number;
  severity: RiskLevel;
  likelihood: number;
  status: RiskStatus;
  owner: string;
  controlId: string;
  appetiteStatus: AppetiteStatus;
}

export interface TechnologyRiskItem {
  id: string;
  title: string;
  applicationArea: string;
  category: 'obsolescence' | 'availability' | 'capacity' | 'change' | 'data-integrity';
  severity: RiskLevel;
  residualScore: number;
  status: RiskStatus;
}

export interface CyberRiskItem {
  id: string;
  title: string;
  threatType: 'malware' | 'phishing' | 'ddos' | 'insider' | 'vulnerability' | 'data-breach' | 'ransomware';
  severity: RiskLevel;
  exposureScore: number;
  status: RiskStatus;
  assetArea: string;
}

export interface AiRiskItem {
  id: string;
  title: string;
  category: 'bias' | 'explainability' | 'drift' | 'privacy' | 'security' | 'governance' | 'hallucination';
  severity: RiskLevel;
  modelArea: string;
  residualScore: number;
  status: RiskStatus;
}

export interface RegulatoryRiskItem {
  id: string;
  title: string;
  regulation: string;
  regulator: string;
  severity: RiskLevel;
  exposureValue: number;
  status: RiskStatus;
  dueDate: string;
}

export interface RiskControl {
  id: string;
  name: string;
  category: RiskCategory;
  type: 'preventive' | 'detective' | 'corrective';
  effectiveness: ControlEffectiveness;
  automated: boolean;
  lastTested: string;
  coverage: number;
}

export interface AuditFinding {
  id: string;
  title: string;
  riskId: string;
  controlId: string;
  severity: RiskLevel;
  status: FindingStatus;
  source: 'internal-audit' | 'external-audit' | 'regulator' | 'self-assessment';
  dueDate: string;
  owner: string;
}

export interface RiskException {
  id: string;
  riskId: string;
  title: string;
  status: 'requested' | 'approved' | 'expired';
  riskLevel: RiskLevel;
  approver: string;
  expiresAt: string;
}

export interface AssuranceReview {
  id: string;
  name: string;
  type: 'first-line' | 'second-line' | 'third-line';
  category: RiskCategory;
  status: AssuranceStatus;
  coverage: number;
  scheduledFor: string;
}

export interface RiskAppetiteItem {
  id: string;
  category: RiskCategory;
  appetiteThreshold: number;
  currentExposure: number;
  status: AppetiteStatus;
  tolerance: number;
}

export interface RiskHistoryPoint {
  year: string;
  enterpriseRiskExposure: number;
  residualRisk: number;
  controlEffectiveness: number;
  assuranceCoverage: number;
  cyberRiskScore: number;
  aiRiskScore: number;
}

export interface RiskTraceabilityChain {
  stage: string;
  entity: string;
  link: string;
  outcome: string;
}

export type RiskAiCapabilityType =
  | 'risk-hotspot'
  | 'emerging-risk'
  | 'control-gap'
  | 'audit-correlation'
  | 'regulatory-exposure'
  | 'cyber-threat'
  | 'ai-governance-risk'
  | 'risk-appetite'
  | 'assurance-planning'
  | 'executive-summary';

export interface RiskAiInsight {
  id: string;
  capability: RiskAiCapabilityType;
  title: string;
  recommendation: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  relatedIds: string[];
}

export interface EnterpriseRiskKpis {
  enterpriseRiskExposure: number;
  residualRisk: number;
  controlEffectiveness: number;
  openCriticalRisks: number;
  riskAppetiteBreaches: number;
  regulatoryExposure: number;
  cyberRiskScore: number;
  aiRiskScore: number;
  auditRiskScore: number;
  assuranceCoverage: number;
}

export const ENTERPRISE_RISK_ALLOWED_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'enterprise-architect',
  'risk-officer',
  'compliance-officer',
  'ciso',
  'operations-manager',
  'release-manager',
  'application-owner',
];
