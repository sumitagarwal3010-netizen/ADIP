import type { PersonaId } from '../config/personaConfig';

export type ProgramStatus = 'on-track' | 'at-risk' | 'off-track' | 'completed' | 'on-hold';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type MilestoneStatus = 'not-started' | 'in-progress' | 'completed' | 'delayed' | 'missed';
export type CommitmentStatus = 'committed' | 'in-progress' | 'met' | 'missed' | 'at-risk';
export type InitiativeStatus = 'planned' | 'in-flight' | 'delivered' | 'paused' | 'cancelled';

export interface StrategicObjective {
  id: string;
  name: string;
  pillar: string;
  targetYear: string;
  achievement: number;
  keyResults: number;
  keyResultsMet: number;
  owner: string;
}

export interface TransformationProgram {
  id: string;
  name: string;
  businessUnit: string;
  objectiveId: string;
  status: ProgramStatus;
  health: number;
  budget: number;
  spent: number;
  completion: number;
  benefitTarget: number;
  benefitRealized: number;
  sponsor: string;
  riskLevel: RiskLevel;
  startYear: string;
  targetYear: string;
}

export interface StrategicInitiative {
  id: string;
  name: string;
  programId: string;
  status: InitiativeStatus;
  priority: number;
  completion: number;
  businessUnit: string;
  expectedBenefit: number;
  owner: string;
}

export interface TransformationMilestone {
  id: string;
  name: string;
  programId: string;
  status: MilestoneStatus;
  dueDate: string;
  completion: number;
  critical: boolean;
}

export interface ExecutiveCommitment {
  id: string;
  title: string;
  programId: string;
  owner: string;
  stakeholder: string;
  status: CommitmentStatus;
  dueDate: string;
  confidence: number;
}

export interface TransformationBenefit {
  id: string;
  name: string;
  programId: string;
  category: 'revenue' | 'cost-reduction' | 'risk-reduction' | 'customer-experience' | 'efficiency';
  targetValue: number;
  realizedValue: number;
  status: 'on-track' | 'at-risk' | 'realized' | 'behind';
}

export interface CrossProgramDependency {
  id: string;
  name: string;
  fromProgramId: string;
  toProgramId: string;
  type: 'technical' | 'resource' | 'funding' | 'sequence' | 'data';
  status: 'satisfied' | 'pending' | 'blocked' | 'at-risk';
  riskLevel: RiskLevel;
}

export interface TransformationRisk {
  id: string;
  title: string;
  programId: string;
  category: 'delivery' | 'financial' | 'resource' | 'dependency' | 'adoption' | 'regulatory';
  severity: RiskLevel;
  likelihood: number;
  mitigationStatus: 'open' | 'planned' | 'in-progress' | 'mitigated';
}

export interface BusinessUnitPerformance {
  id: string;
  name: string;
  programCount: number;
  transformationHealth: number;
  benefitRealization: number;
  milestoneCompletion: number;
  budgetUtilization: number;
}

export interface TransformationHistoryPoint {
  year: string;
  transformationHealth: number;
  programDelivery: number;
  benefitsRealization: number;
  milestoneCompletion: number;
  transformationRoi: number;
}

export type AppHealthClass = 'healthy' | 'at-risk' | 'critical';

/**
 * Application-level transformation assessment — the contributing record behind
 * the Transformation Health KPI. Every application that participates in a
 * transformation program is assessed and classified.
 */
export interface TransformationAppAssessment {
  id: string;
  name: string;
  programId: string;
  domain: string;
  owner: string;
  health: number;
  healthClass: AppHealthClass;
  riskRating: RiskLevel;
  status: 'live' | 'in-migration' | 'remediation' | 'planned';
  lastAssessment: string;
}

/** A single input row shown in the explainable KPI breakdown ("Based on…"). */
export interface TransformationKpiInput {
  label: string;
  value: string;
}

/** Explainability summary surfaced inline next to each Transformation KPI. */
export interface TransformationKpiBreakdown {
  id: string;
  chartId: string;
  label: string;
  value: number;
  suffix: string;
  /** Which drill-down register backs this KPI. */
  register: 'applications' | 'benefits' | 'milestones' | 'dependencies' | 'roi';
  /** One-line "Based on …" justification. */
  basedOn: string;
  /** Human-readable formula expression. */
  formula: string;
  /** The numeric inputs that reconcile to the headline value. */
  inputs: TransformationKpiInput[];
  lastCalculated: string;
  changeSinceLast: string;
}

export interface TransformationTraceabilityChain {
  stage: string;
  entity: string;
  link: string;
  outcome: string;
}

export type TransformationAiCapabilityType =
  | 'program-recovery'
  | 'executive-risk'
  | 'dependency'
  | 'benefits-realization'
  | 'transformation-roi'
  | 'board-reporting'
  | 'objective-achievement'
  | 'milestone-forecast'
  | 'initiative-prioritization'
  | 'transformation-health';

export interface TransformationAiInsight {
  id: string;
  capability: TransformationAiCapabilityType;
  title: string;
  recommendation: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  relatedIds: string[];
}

export interface TransformationPmoKpis {
  transformationHealth: number;
  programDelivery: number;
  objectiveAchievement: number;
  benefitsRealization: number;
  milestoneCompletion: number;
  executiveCommitments: number;
  dependencyRisk: number;
  businessUnitPerformance: number;
  transformationRoi: number;
  boardReadiness: number;
}

export const TRANSFORMATION_PMO_ALLOWED_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'enterprise-architect',
  'application-owner',
  'release-manager',
  'operations-manager',
  'risk-officer',
  'compliance-officer',
];
