import type { PersonaId } from '../config/personaConfig';

export type LessonCategory =
  | 'incident'
  | 'audit'
  | 'release'
  | 'defect'
  | 'architecture'
  | 'copilot'
  | 'security';
export type BestPracticeDomain =
  | 'requirements'
  | 'architecture'
  | 'development'
  | 'testing'
  | 'release'
  | 'governance'
  | 'audit'
  | 'operations'
  | 'ai-governance';
export type PatternCategory =
  | 'microservices'
  | 'event-driven'
  | 'api-security'
  | 'authentication'
  | 'authorization'
  | 'resilience'
  | 'caching'
  | 'monitoring'
  | 'observability'
  | 'banking-integration'
  | 'payments'
  | 'upi'
  | 'cards'
  | 'kyc'
  | 'aml';
export type RcaArticleSource =
  | 'production-rca'
  | 'audit-finding'
  | 'control-failure'
  | 'release-failure'
  | 'security-incident';
export type PlaybookType =
  | 'requirement-review'
  | 'architecture-review'
  | 'secure-coding'
  | 'test-planning'
  | 'release-readiness'
  | 'audit-readiness'
  | 'production-readiness'
  | 'ai-model-governance';
export type ControlType =
  | 'preventive'
  | 'detective'
  | 'corrective'
  | 'compensating';
export type RecommendationType = 'article' | 'control' | 'playbook' | 'pattern';
export type KnowledgeSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface LessonLearned {
  id: string;
  title: string;
  category: LessonCategory;
  domain: string;
  application: string;
  rootCause: string;
  resolution: string;
  businessImpact: string;
  owner: string;
  date: string;
  tags: string[];
  relatedIncident?: string;
  relatedAuditFinding?: string;
  relatedRelease?: string;
  relatedRequirement?: string;
  reuseCount: number;
}

export interface BestPractice {
  id: string;
  title: string;
  domain: BestPracticeDomain;
  summary: string;
  guidance: string;
  owner: string;
  adoptionRate: number;
  tags: string[];
}

export interface ArchitecturePattern {
  id: string;
  name: string;
  category: PatternCategory;
  description: string;
  whenToUse: string;
  antiPatterns: string;
  relatedControls: string[];
  adoptionCount: number;
}

export interface RcaKnowledgeArticle {
  id: string;
  title: string;
  source: RcaArticleSource;
  rootCause: string;
  correctiveAction: string;
  preventiveAction: string;
  domain: string;
  application: string;
  linkedIncident?: string;
  linkedAuditFinding?: string;
  tags: string[];
}

export interface SdlcPlaybook {
  id: string;
  title: string;
  type: PlaybookType;
  description: string;
  steps: string[];
  owner: string;
  reuseCount: number;
  lastUsed: string;
}

export interface ReusableControl {
  id: string;
  name: string;
  type: ControlType;
  domain: string;
  description: string;
  framework: string;
  reuseCount: number;
  effectiveness: number;
}

export interface LearningRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  reason: string;
  source: string;
  targetId: string;
  priority: KnowledgeSeverity;
  relatedTheme: string;
}

export interface KnowledgeTraceabilityChain {
  requirement: string;
  architecture: string;
  development: string;
  testing: string;
  release: string;
  incident: string;
  rca: string;
  lessonLearned: string;
  bestPractice: string;
  playbook: string;
}

export interface KnowledgeCenterKpis {
  knowledgeCoverage: number;
  knowledgeReuse: number;
  topRiskThemes: number;
  mostReusedControls: number;
  mostReusedPlaybooks: number;
  learningAdoption: number;
  totalLessons: number;
  totalBestPractices: number;
  totalPatterns: number;
  totalPlaybooks: number;
}

export interface KnowledgeSearchFilters {
  query: string;
  category: string;
  domain: string;
  application: string;
  severity: string;
}

export const KNOWLEDGE_CENTER_ALLOWED_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'enterprise-architect',
  'developer',
  'tester',
  'release-manager',
  'application-owner',
  'audit-head',
  'compliance-officer',
  'ciso',
];
