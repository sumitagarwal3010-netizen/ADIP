import type { PersonaId } from '../config/personaConfig';

export type SdlcDomain =
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'governance'
  | 'audit'
  | 'operations'
  | 'knowledge';
export type MaturityDimension =
  | 'sdlc'
  | 'governance'
  | 'audit'
  | 'ai'
  | 'operational'
  | 'transformation';
export type BenchmarkState = 'current' | 'traditional' | 'target' | 'ai-sdlc';

export interface BusinessUnit {
  id: string;
  name: string;
  head: string;
  programs: number;
  projects: number;
  annualValue: number;
}

export interface Portfolio {
  id: string;
  name: string;
  businessUnitId: string;
  programs: number;
  projects: number;
  valueRealized: number;
  roi: number;
}

export interface Program {
  id: string;
  name: string;
  portfolioId: string;
  businessUnitId: string;
  projects: number;
  hoursSaved: number;
  valueRealized: number;
  status: 'active' | 'completed' | 'planned';
}

export interface ValueProject {
  id: string;
  name: string;
  programId: string;
  portfolioId: string;
  businessUnitId: string;
  domain: string;
  hoursSaved: number;
  fteSavings: number;
  defectsPrevented: number;
  cycleTimeReduction: number;
  valueRealized: number;
}

export interface ValueTrendPoint {
  year: string;
  hoursSaved: number;
  valueRealized: number;
  productivityGain: number;
  riskReduction: number;
  roi: number;
}

export interface ProductivityGain {
  domain: SdlcDomain;
  hoursSaved: number;
  productivityPercent: number;
  fteEquivalent: number;
}

export interface MaturityScore {
  dimension: MaturityDimension;
  label: string;
  score: number;
  target: number;
  trend: number;
}

export interface BenchmarkMetric {
  metric: string;
  current: number;
  traditional: number;
  target: number;
  aiSdlc: number;
  unit: string;
}

export interface TraceabilityValueChain {
  capability: string;
  benefit: string;
  metric: string;
  kpi: string;
  value: string;
  outcome: string;
}

export interface RoiInputs {
  projectsPerYear: number;
  developers: number;
  testers: number;
  architects: number;
  auditors: number;
  complianceStaff: number;
  applications: number;
}

export interface RoiOutputs {
  annualSavings: number;
  threeYearSavings: number;
  roi: number;
  paybackMonths: number;
  transformationValue: number;
}

export interface BusinessCaseSummary {
  executiveNarrative: string;
  benefitsSummary: string;
  financialSummary: string;
  riskReductionSummary: string;
  transformationSummary: string;
  boardPresentationSummary: string;
}

export interface ValueRealizationKpis {
  hoursSaved: number;
  fteSavings: number;
  productivityGain: number;
  defectsPrevented: number;
  auditFindingsPrevented: number;
  riskReduction: number;
  cycleTimeReduction: number;
  releaseVelocityImprovement: number;
  approvalTimeReduction: number;
  evidenceCollectionReduction: number;
  costAvoidance: number;
  annualValueRealized: number;
  threeYearProjectedValue: number;
  annualValue: number;
  roi: number;
  transformationScore: number;
  auditEfficiency: number;
}

export const VALUE_REALIZATION_ALLOWED_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'ciso',
  'audit-head',
  'compliance-officer',
  'operations-manager',
  'application-owner',
  'release-manager',
  'enterprise-architect',
  'risk-officer',
];
