import type { PersonaId } from '../config/personaConfig';

export type DemandStatus =
  | 'submitted'
  | 'under-review'
  | 'business-case'
  | 'funding-pending'
  | 'approved'
  | 'rejected'
  | 'on-hold';
export type FundingStatus = 'requested' | 'approved' | 'partial' | 'denied' | 'released';
export type ProjectStatus = 'active' | 'planned' | 'on-hold' | 'completed' | 'at-risk' | 'kill-candidate';
export type ProgramStatus = 'active' | 'planned' | 'completed' | 'at-risk';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ResourceSkill =
  | 'developer'
  | 'architect'
  | 'tester'
  | 'business-analyst'
  | 'project-manager'
  | 'data-engineer'
  | 'devops'
  | 'security';

export interface BusinessUnit {
  id: string;
  name: string;
  head: string;
  portfolioCount: number;
  programCount: number;
  projectCount: number;
  annualBudget: number;
}

export interface Portfolio {
  id: string;
  name: string;
  businessUnitId: string;
  programCount: number;
  projectCount: number;
  healthScore: number;
  fundingUtilization: number;
  strategicAlignment: number;
}

export interface StrategicProgram {
  id: string;
  name: string;
  portfolioId: string;
  businessUnitId: string;
  objectiveId: string;
  projectCount: number;
  status: ProgramStatus;
  healthScore: number;
  benefitsForecast: number;
  riskLevel: RiskLevel;
}

export interface PortfolioProject {
  id: string;
  name: string;
  programId: string;
  portfolioId: string;
  businessUnitId: string;
  demandId: string;
  status: ProjectStatus;
  deliveryConfidence: number;
  prioritizationScore: number;
  riskLevel: RiskLevel;
  fundingApproved: number;
  benefitsRealized: number;
  benefitsForecast: number;
}

export interface DemandRequest {
  id: string;
  title: string;
  businessUnitId: string;
  portfolioId: string;
  submitter: string;
  status: DemandStatus;
  prioritizationScore: number;
  strategicAlignment: number;
  estimatedCost: number;
  benefitForecast: number;
  riskLevel: RiskLevel;
  submittedAt: string;
  duplicateOf?: string;
}

export interface FundingRequest {
  id: string;
  demandId: string;
  projectId?: string;
  portfolioId: string;
  amount: number;
  approvedAmount: number;
  status: FundingStatus;
  fiscalYear: string;
  approver: string;
}

export interface StrategicObjective {
  id: string;
  name: string;
  businessUnitId: string;
  weight: number;
  alignmentScore: number;
  programsAligned: number;
}

export interface Resource {
  id: string;
  name: string;
  skill: ResourceSkill;
  businessUnitId: string;
  portfolioId: string;
  utilization: number;
  capacityHours: number;
  allocatedHours: number;
  bottleneckRisk: RiskLevel;
}

export interface CapacityPlan {
  id: string;
  portfolioId: string;
  quarter: string;
  demandHours: number;
  availableHours: number;
  utilization: number;
  bottleneckSkills: ResourceSkill[];
}

export interface PortfolioHistoryPoint {
  quarter: string;
  portfolioHealth: number;
  fundingUtilization: number;
  capacityUtilization: number;
  demandBacklog: number;
  benefitsRealized: number;
  strategicAlignment: number;
}

export interface BenefitForecast {
  projectId: string;
  projectName: string;
  forecast: number;
  realized: number;
  confidence: number;
  quarter: string;
}

export interface PortfolioTraceabilityChain {
  stage: string;
  entity: string;
  link: string;
  outcome: string;
}

export type AiCapabilityType =
  | 'demand-prioritization'
  | 'portfolio-optimization'
  | 'funding-recommendation'
  | 'resource-bottleneck'
  | 'capacity-forecast'
  | 'benefits-predictor'
  | 'alignment-scoring'
  | 'kill-recommendation'
  | 'duplicate-detection';

export interface AiInsight {
  id: string;
  capability: AiCapabilityType;
  title: string;
  recommendation: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  relatedIds: string[];
}

export interface PortfolioGovernanceKpis {
  portfolioHealth: number;
  strategicAlignment: number;
  fundingUtilization: number;
  capacityUtilization: number;
  deliveryConfidence: number;
  benefitsRealization: number;
  riskExposure: number;
  demandBacklog: number;
  investmentEfficiency: number;
  transformationProgress: number;
}

export const PORTFOLIO_GOVERNANCE_ALLOWED_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'enterprise-architect',
  'application-owner',
  'release-manager',
  'operations-manager',
  'risk-officer',
  'compliance-officer',
];
