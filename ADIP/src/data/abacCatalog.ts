import type { PersonaId } from '../config/personaConfig';
import { PERSONA_RBAC_ROLE } from './rbacCatalog';
import { MOCK_USERS } from './authProviders';
import type {
  AbacPolicy,
  DomainAssignment,
  UserAttributes,
  VisibilityScope,
  VisibilityScopeKind,
} from '../types/abac';
import { DOMAIN_APPLICATIONS, PORTFOLIO_DOMAINS, SECURITY_DOMAINS } from '../types/abac';

const PERSONA_USER_MAP = Object.fromEntries(MOCK_USERS.map((u) => [u.persona, u]));

const USER_ATTR_OVERRIDES: Partial<Record<PersonaId, Partial<UserAttributes>>> = {
  cio: {
    portfolios: ['Payments Portfolio', 'Digital Banking Portfolio', 'Cards Portfolio', 'Enterprise Portfolio'],
    applicationOwnership: [],
    assignedDomains: ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'],
    riskLevel: 'medium',
  },
  'audit-head': {
    portfolios: ['Payments Portfolio', 'Digital Banking Portfolio', 'Cards Portfolio', 'Enterprise Portfolio'],
    applicationOwnership: [],
    assignedDomains: ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'],
    riskLevel: 'low',
  },
  'application-owner': {
    businessUnit: 'Payments',
    portfolios: ['Payments Portfolio'],
    applicationOwnership: ['PAY-UPI', 'PAY-NEFT', 'PAY-IMPS'],
    assignedDomains: ['Payments'],
    riskLevel: 'medium',
  },
  cto: {
    businessUnit: 'Technology',
    portfolios: ['Technology Portfolio', 'Digital Banking Portfolio'],
    applicationOwnership: ['MOB-IOS', 'MOB-ANDROID', 'NET-PORTAL'],
    assignedDomains: ['Mobile Banking', 'Net Banking', 'Enterprise'],
    riskLevel: 'medium',
  },
  'compliance-officer': {
    businessUnit: 'Regulatory Compliance',
    portfolios: ['Payments Portfolio', 'Cards Portfolio'],
    applicationOwnership: [],
    assignedDomains: ['Payments', 'Cards', 'Enterprise'],
    riskLevel: 'high',
  },
  ciso: {
    businessUnit: 'Information Security',
    portfolios: ['Payments Portfolio', 'Digital Banking Portfolio', 'Cards Portfolio', 'Enterprise Portfolio'],
    applicationOwnership: [],
    assignedDomains: [...SECURITY_DOMAINS],
    riskLevel: 'critical',
  },
  'operations-manager': {
    portfolios: ['Payments Portfolio', 'Digital Banking Portfolio', 'Cards Portfolio', 'Enterprise Portfolio'],
    applicationOwnership: [],
    assignedDomains: ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'],
    riskLevel: 'medium',
  },
};

export const ABAC_POLICIES: AbacPolicy[] = [
  {
    id: 'POL-GLOBAL-READ',
    name: 'Global Read Visibility',
    description: 'CIO and Auditor personas receive enterprise-wide row visibility',
    effect: 'allow',
    resourceTypes: ['workflow', 'approval', 'evidence', 'audit-finding', 'audit-observation', 'notification', 'traceability'],
    condition: 'persona in (cio, audit-head)',
    priority: 100,
    enabled: true,
  },
  {
    id: 'POL-APP-OWNER',
    name: 'Application Owner Scope',
    description: 'Application owners see only owned applications and linked domains',
    effect: 'allow',
    resourceTypes: ['workflow', 'approval', 'evidence', 'audit-finding', 'audit-observation', 'notification', 'traceability'],
    condition: 'resource.application in user.applicationOwnership OR resource.domain matches owned apps',
    priority: 80,
    enabled: true,
  },
  {
    id: 'POL-VERTICAL-HEAD',
    name: 'Vertical Head Portfolio Scope',
    description: 'Vertical heads see resources within owned portfolio domains',
    effect: 'allow',
    resourceTypes: ['workflow', 'approval', 'evidence', 'audit-finding', 'audit-observation', 'notification', 'traceability'],
    condition: 'resource.domain in portfolio.domains',
    priority: 75,
    enabled: true,
  },
  {
    id: 'POL-COMPLIANCE-DOMAIN',
    name: 'Compliance Domain Assignment',
    description: 'Compliance officers see assigned regulatory domains only',
    effect: 'allow',
    resourceTypes: ['workflow', 'evidence', 'audit-finding', 'audit-observation', 'notification', 'traceability'],
    condition: 'resource.domain in user.assignedDomains',
    priority: 70,
    enabled: true,
  },
  {
    id: 'POL-SECURITY-DOMAINS',
    name: 'Security Domain Scope',
    description: 'Security officers see all security-classified domains',
    effect: 'allow',
    resourceTypes: ['workflow', 'evidence', 'audit-finding', 'audit-observation', 'notification', 'traceability'],
    condition: 'resource.domain in security.domains',
    priority: 72,
    enabled: true,
  },
  {
    id: 'POL-SENSITIVITY-BLOCK',
    name: 'Restricted Sensitivity Deny',
    description: 'Deny restricted resources unless global or security scope',
    effect: 'deny',
    resourceTypes: ['evidence', 'audit-finding', 'notification'],
    condition: 'resource.sensitivity = restricted AND NOT global scope',
    priority: 90,
    enabled: true,
  },
  {
    id: 'POL-PROD-ENV',
    name: 'Production Environment Guard',
    description: 'Non-global users require domain match for production workflows',
    effect: 'allow',
    resourceTypes: ['workflow', 'approval'],
    condition: 'resource.environment = production implies domain match',
    priority: 60,
    enabled: true,
  },
  {
    id: 'POL-DEFAULT-DENY',
    name: 'Default Deny Outside Scope',
    description: 'Implicit deny when no allow policy matches user attributes',
    effect: 'deny',
    resourceTypes: ['workflow', 'approval', 'evidence', 'audit-finding', 'audit-observation', 'notification', 'traceability'],
    condition: 'no matching allow policy',
    priority: 10,
    enabled: true,
  },
];

export const DOMAIN_ASSIGNMENTS: DomainAssignment[] = [
  { personaId: 'application-owner', personaLabel: 'Application Owner', domains: ['Payments'], applications: ['PAY-UPI', 'PAY-NEFT', 'PAY-IMPS'], scopeKind: 'application' },
  { personaId: 'cto', personaLabel: 'Vertical Head (CTO)', domains: ['Mobile Banking', 'Net Banking', 'Enterprise'], applications: ['MOB-IOS', 'MOB-ANDROID', 'NET-PORTAL'], scopeKind: 'portfolio' },
  { personaId: 'compliance-officer', personaLabel: 'Compliance Officer', domains: ['Payments', 'Cards', 'Enterprise'], applications: [], scopeKind: 'domain' },
  { personaId: 'ciso', personaLabel: 'Security Officer (CISO)', domains: [...SECURITY_DOMAINS], applications: [], scopeKind: 'security-domains' },
  { personaId: 'audit-head', personaLabel: 'Auditor', domains: ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'], applications: [], scopeKind: 'global' },
  { personaId: 'cio', personaLabel: 'CIO', domains: ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise'], applications: [], scopeKind: 'global' },
];

export function resolveUserAttributes(personaId: PersonaId): UserAttributes {
  const user = PERSONA_USER_MAP[personaId];
  const override = USER_ATTR_OVERRIDES[personaId] ?? {};
  const roleId = PERSONA_RBAC_ROLE[personaId] ?? 'auditor';

  return {
    userId: user?.user_id ?? `usr-${personaId}`,
    personaId,
    roleId,
    department: user?.department ?? 'Enterprise',
    businessUnit: override.businessUnit ?? user?.department ?? 'Enterprise',
    portfolios: override.portfolios ?? ['Enterprise Portfolio'],
    applicationOwnership: override.applicationOwnership ?? [],
    assignedDomains: override.assignedDomains ?? ['Enterprise'],
    region: 'APAC-IN',
    riskLevel: override.riskLevel ?? 'medium',
  };
}

export function getVisibilityScopeKind(personaId: PersonaId): VisibilityScopeKind {
  if (personaId === 'cio' || personaId === 'audit-head') return 'global';
  if (personaId === 'application-owner') return 'application';
  if (personaId === 'cto') return 'portfolio';
  if (personaId === 'compliance-officer') return 'domain';
  if (personaId === 'ciso') return 'security-domains';
  if (personaId === 'operations-manager') return 'global';
  return 'domain';
}

export function buildVisibilityScope(personaId: PersonaId): VisibilityScope {
  const attrs = resolveUserAttributes(personaId);
  const kind = getVisibilityScopeKind(personaId);
  const domains = kind === 'global'
    ? ['Payments', 'Mobile Banking', 'Net Banking', 'Cards', 'Enterprise']
    : kind === 'security-domains'
      ? [...SECURITY_DOMAINS]
      : kind === 'portfolio'
        ? attrs.assignedDomains
        : attrs.assignedDomains;

  const applications = attrs.applicationOwnership.length > 0
    ? attrs.applicationOwnership
    : domains.flatMap((d) => DOMAIN_APPLICATIONS[d] ?? []).slice(0, 6);

  const labels: Record<VisibilityScopeKind, string> = {
    global: 'Global Enterprise Visibility',
    portfolio: 'Portfolio-Scoped Visibility',
    application: 'Application-Scoped Visibility',
    domain: 'Domain-Assigned Visibility',
    'security-domains': 'Security Domain Visibility',
  };

  return {
    kind,
    label: labels[kind],
    portfolios: attrs.portfolios,
    applications,
    domains,
    global: kind === 'global',
  };
}

export const ABAC_EXEC_SUMMARY =
  'ABAC extends RBAC with attribute-based row filters across 8 policies. Application owners are scoped to Payments applications; ' +
  'vertical heads to digital banking portfolio; compliance to assigned domains; security officers to all security domains; ' +
  'CIO and auditors retain global visibility. Two access violations detected in mock evaluation — restricted evidence outside assigned domain.';

export { PERSONA_USER_MAP, PORTFOLIO_DOMAINS, DOMAIN_APPLICATIONS };
