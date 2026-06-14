import type { PersonaId } from '../config/personaConfig';
import type { RbacRoleId } from '../data/rbacCatalog';

export type AbacResourceType =
  | 'workflow'
  | 'approval'
  | 'evidence'
  | 'audit-finding'
  | 'audit-observation'
  | 'notification'
  | 'traceability';

export type VisibilityScopeKind =
  | 'global'
  | 'portfolio'
  | 'application'
  | 'domain'
  | 'security-domains';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type SensitivityLevel = 'public' | 'internal' | 'confidential' | 'restricted';
export type PolicyEffect = 'allow' | 'deny';

export interface UserAttributes {
  userId: string;
  personaId: PersonaId;
  roleId: RbacRoleId;
  department: string;
  businessUnit: string;
  portfolios: string[];
  applicationOwnership: string[];
  assignedDomains: string[];
  region: string;
  riskLevel: RiskLevel;
}

export interface ResourceAttributes {
  resourceType: AbacResourceType;
  resourceId: string;
  domain: string;
  application: string;
  environment: 'development' | 'staging' | 'production' | 'governance';
  classification: string;
  sensitivity: SensitivityLevel;
  owner: string;
  ownerPersona?: PersonaId;
}

export interface AbacPolicy {
  id: string;
  name: string;
  description: string;
  effect: PolicyEffect;
  resourceTypes: AbacResourceType[];
  condition: string;
  priority: number;
  enabled: boolean;
}

export interface VisibilityScope {
  kind: VisibilityScopeKind;
  label: string;
  portfolios: string[];
  applications: string[];
  domains: string[];
  global: boolean;
}

export interface DomainAssignment {
  personaId: PersonaId;
  personaLabel: string;
  domains: string[];
  applications: string[];
  scopeKind: VisibilityScopeKind;
}

export interface AbacAccessDecision {
  allowed: boolean;
  policyId: string | null;
  policyName: string | null;
  reason: string;
  userAttributes: UserAttributes;
  resourceAttributes: ResourceAttributes;
  evaluatedAt: string;
}

export interface AbacKpis {
  policyCoverage: number;
  domainOwnershipCount: number;
  accessViolations: number;
  scopeDistribution: { scope: string; count: number }[];
  enabledPolicies: number;
  totalPolicies: number;
  scopedResources: number;
  totalResources: number;
}

export interface EffectiveAccessSummary {
  personaId: PersonaId;
  roleLabel: string;
  visibilityScope: VisibilityScope;
  allowedDomains: string[];
  allowedApplications: string[];
  policyCount: number;
  rowFilterActive: boolean;
}

export const SECURITY_DOMAINS = ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'];

export const PORTFOLIO_DOMAINS: Record<string, string[]> = {
  'Payments Portfolio': ['Payments'],
  'Digital Banking Portfolio': ['Mobile Banking', 'Net Banking'],
  'Cards Portfolio': ['Cards'],
  'Enterprise Portfolio': ['Enterprise'],
  'Technology Portfolio': ['Mobile Banking', 'Net Banking', 'Enterprise'],
};

export const DOMAIN_APPLICATIONS: Record<string, string[]> = {
  Payments: ['PAY-UPI', 'PAY-NEFT', 'PAY-IMPS', 'PAY-RTGS'],
  'Mobile Banking': ['MOB-IOS', 'MOB-ANDROID', 'MOB-API'],
  'Net Banking': ['NET-PORTAL', 'NET-API'],
  Cards: ['CRD-CORE', 'CRD-REWARDS'],
  Enterprise: ['ENT-AML', 'ENT-KYC', 'ENT-CORE'],
};
