import type { PersonaId } from '../config/personaConfig';

export type TechLifecycleStage =
  | 'emerging'
  | 'approved'
  | 'preferred'
  | 'strategic'
  | 'legacy'
  | 'deprecated'
  | 'end-of-support'
  | 'retired';

export type TechCategory =
  | 'language'
  | 'framework'
  | 'database'
  | 'middleware'
  | 'integration'
  | 'cloud'
  | 'ai-ml'
  | 'security'
  | 'observability'
  | 'infrastructure';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type InvestmentStance = 'invest' | 'maintain' | 'tolerate' | 'eliminate';

export interface Technology {
  id: string;
  name: string;
  category: TechCategory;
  lifecycle: TechLifecycleStage;
  stance: InvestmentStance;
  adoptionRate: number;
  applicationCount: number;
  vendor: string;
  riskLevel: RiskLevel;
  strategicFit: number;
}

export interface StrategicPlatform {
  id: string;
  name: string;
  domain: string;
  lifecycle: TechLifecycleStage;
  adoptionRate: number;
  targetAdoption: number;
  applicationsOnboarded: number;
  annualInvestment: number;
}

export interface VendorProduct {
  id: string;
  vendor: string;
  product: string;
  category: TechCategory;
  contractValue: number;
  renewalYear: string;
  riskLevel: RiskLevel;
  lockInRisk: number;
  alternativesAvailable: number;
}

export interface TechnologyStandard {
  id: string;
  name: string;
  category: TechCategory;
  adoptionRate: number;
  mandatory: boolean;
  complianceRate: number;
}

export interface TechnologyRisk {
  id: string;
  technologyId: string;
  title: string;
  category: 'obsolescence' | 'vendor-lockin' | 'security' | 'skills-gap' | 'compliance' | 'concentration';
  severity: RiskLevel;
  likelihood: number;
  mitigationStatus: 'open' | 'planned' | 'in-progress' | 'mitigated';
}

export interface ModernizationInitiative {
  id: string;
  name: string;
  wave: 1 | 2 | 3;
  fromTechnology: string;
  toTechnology: string;
  status: 'planned' | 'in-progress' | 'completed' | 'at-risk';
  applicationsImpacted: number;
  investment: number;
  expectedBenefit: number;
  targetYear: string;
}

export interface CloudPlatform {
  id: string;
  name: string;
  provider: 'AWS' | 'Azure' | 'GCP' | 'Private Cloud';
  serviceType: string;
  adoptionRate: number;
  monthlySpend: number;
  approved: boolean;
}

export interface AiPlatform {
  id: string;
  name: string;
  category: 'llm' | 'ml-ops' | 'data-platform' | 'vector-db' | 'agent-framework' | 'governance';
  adoptionRate: number;
  maturity: number;
  approved: boolean;
  useCases: number;
}

export interface TechRoadmapPoint {
  year: string;
  technologyHealth: number;
  standardsAdoption: number;
  cloudAdoption: number;
  aiAdoption: number;
  modernizationProgress: number;
  technologyDebt: number;
}

export interface TechInvestment {
  id: string;
  name: string;
  category: TechCategory;
  stance: InvestmentStance;
  annualSpend: number;
  efficiencyScore: number;
  strategicFit: number;
}

export interface TechTraceabilityChain {
  stage: string;
  entity: string;
  link: string;
  outcome: string;
}

export type TechAiCapabilityType =
  | 'rationalization'
  | 'obsolescence'
  | 'vendor-risk'
  | 'cloud-strategy'
  | 'ai-platform'
  | 'investment'
  | 'modernization'
  | 'standards-compliance'
  | 'platform-consolidation'
  | 'innovation';

export interface TechAiInsight {
  id: string;
  capability: TechAiCapabilityType;
  title: string;
  recommendation: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  relatedIds: string[];
}

export interface TechnologyStrategyKpis {
  technologyHealth: number;
  standardsAdoption: number;
  strategicPlatformAdoption: number;
  cloudAdoption: number;
  aiPlatformAdoption: number;
  technologyRisk: number;
  modernizationProgress: number;
  technologyDebt: number;
  vendorConcentration: number;
  investmentEfficiency: number;
}

export const TECHNOLOGY_STRATEGY_ALLOWED_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'enterprise-architect',
  'application-owner',
  'release-manager',
  'operations-manager',
  'risk-officer',
  'compliance-officer',
];
