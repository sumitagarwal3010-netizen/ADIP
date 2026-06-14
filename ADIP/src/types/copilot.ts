import type { PersonaId } from '../config/personaConfig';

export type CopilotDomain =
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'audit'
  | 'executive'
  | 'improvement';

export type RecommendationPriority = 'critical' | 'high' | 'medium' | 'low';
export type RecommendationStatus = 'open' | 'accepted' | 'implemented' | 'dismissed';
export type GoNoGo = 'Go' | 'No-Go' | 'Conditional Go';

export interface CopilotProject {
  id: string;
  name: string;
  domain: string;
  workflowId: string;
  owner: string;
  stage: string;
  healthScore: number;
  deliveryRisk: number;
  testingRisk: number;
  auditRisk: number;
  releaseRisk: number;
  executiveSummary: string;
  deliveryRecommendation: string;
}

export interface CopilotRecommendation {
  id: string;
  projectId: string;
  domain: CopilotDomain;
  category: string;
  title: string;
  insight: string;
  suggestedAction: string;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  impact: string;
  lifecycleStage: string;
  createdAt: string;
}

export interface RiskObservation {
  id: string;
  projectId: string;
  domain: CopilotDomain;
  module: string;
  observation: string;
  severity: RecommendationPriority;
  rootCause: string;
  linkedEntity: string;
}

export interface ImprovementAction {
  id: string;
  projectId: string;
  title: string;
  description: string;
  source: string;
  status: RecommendationStatus;
  predictedQualityGain: number;
  predictedRiskReduction: number;
  owner: string;
}

export interface RequirementInsight {
  id: string;
  requirementId: string;
  title: string;
  issue: 'ambiguous' | 'missing-ac' | 'missing-nfr' | 'missing-control' | 'frequently-changing';
  detail: string;
  suggestion: string;
  projectId: string;
}

export interface ReleaseReadiness {
  projectId: string;
  projectName: string;
  releaseReadinessScore: number;
  productionRiskScore: number;
  rollbackReadinessScore: number;
  defectRiskScore: number;
  auditRiskScore: number;
  operationalRiskScore: number;
  recommendation: GoNoGo;
  rationale: string;
}

export interface CopilotKpis {
  aiRecommendations: number;
  deliveryHealth: number;
  portfolioRisk: number;
  predictedQualityImprovement: number;
  openRecommendations: number;
  criticalRisks: number;
  improvementActions: number;
  projectsAtRisk: number;
}

export interface ExecutiveCopilotSummary {
  weeklyCioSummary: string;
  portfolioHealthSummary: string;
  deliveryBottlenecks: string[];
  governanceHotspots: string[];
  riskHotspots: string[];
}

export const COPILOT_ALLOWED_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'enterprise-architect',
  'application-owner',
  'developer',
  'tester',
  'release-manager',
  'audit-head',
  'compliance-officer',
];
