import type { PersonaId } from '../config/personaConfig';
import type {
  AbacAccessDecision,
  AbacKpis,
  AbacPolicy,
  AbacResourceType,
  EffectiveAccessSummary,
  ResourceAttributes,
  UserAttributes,
  VisibilityScope,
} from '../types/abac';
import {
  ABAC_POLICIES,
  buildVisibilityScope,
  resolveUserAttributes,
} from './abacCatalog';
import { ROLE_MAP, PERSONA_RBAC_ROLE } from './rbacCatalog';
import { DOMAIN_APPLICATIONS } from '../types/abac';

export function resolveResourceAttributes(
  resourceType: AbacResourceType,
  entity: Record<string, unknown>,
): ResourceAttributes {
  const domain = String(entity.domain ?? entity.linkedDomain ?? 'Enterprise');
  const apps = DOMAIN_APPLICATIONS[domain] ?? ['ENT-CORE'];
  const application = String(entity.application ?? entity.linkedApplication ?? apps[0]);
  const ownerPersona = entity.ownerPersona as PersonaId | undefined;

  return {
    resourceType,
    resourceId: String(entity.id ?? entity.user_id ?? 'unknown'),
    domain,
    application,
    environment: inferEnvironment(entity),
    classification: String(entity.classification ?? entity.evidenceType ?? entity.type ?? 'operational'),
    sensitivity: inferSensitivity(entity),
    owner: String(entity.owner ?? entity.display_name ?? 'System'),
    ownerPersona,
  };
}

function inferEnvironment(entity: Record<string, unknown>): ResourceAttributes['environment'] {
  const stage = String(entity.currentStage ?? entity.lifecycleStage ?? entity.environment ?? '');
  if (stage.includes('production') || stage === 'production') return 'production';
  if (stage.includes('release')) return 'staging';
  if (stage.includes('governance') || stage.includes('audit')) return 'governance';
  return 'development';
}

function inferSensitivity(entity: Record<string, unknown>): ResourceAttributes['sensitivity'] {
  const sev = String(entity.severity ?? entity.classification ?? '').toLowerCase();
  if (sev.includes('critical') || sev.includes('restricted')) return 'restricted';
  if (sev.includes('high') || sev.includes('confidential')) return 'confidential';
  if (sev.includes('medium') || sev.includes('internal')) return 'internal';
  return 'public';
}

function domainMatchesApplication(domain: string, application: string, ownedApps: string[]): boolean {
  if (ownedApps.includes(application)) return true;
  const domainApps = DOMAIN_APPLICATIONS[domain] ?? [];
  return domainApps.some((a) => ownedApps.includes(a));
}

export function evaluatePolicies(
  user: UserAttributes,
  resource: ResourceAttributes,
  scope: VisibilityScope,
  policies: AbacPolicy[] = ABAC_POLICIES,
): AbacAccessDecision {
  const sorted = [...policies].filter((p) => p.enabled).sort((a, b) => b.priority - a.priority);
  const evaluatedAt = new Date().toISOString();

  for (const policy of sorted) {
    if (!policy.resourceTypes.includes(resource.resourceType)) continue;

    const match = evaluatePolicyCondition(policy, user, resource, scope);
    if (!match) continue;

    if (policy.effect === 'deny') {
      return {
        allowed: false,
        policyId: policy.id,
        policyName: policy.name,
        reason: `Denied by ${policy.name}: ${policy.condition}`,
        userAttributes: user,
        resourceAttributes: resource,
        evaluatedAt,
      };
    }

    return {
      allowed: true,
      policyId: policy.id,
      policyName: policy.name,
      reason: `Allowed by ${policy.name}`,
      userAttributes: user,
      resourceAttributes: resource,
      evaluatedAt,
    };
  }

  return {
    allowed: false,
    policyId: null,
    policyName: null,
    reason: 'No matching allow policy — default deny',
    userAttributes: user,
    resourceAttributes: resource,
    evaluatedAt,
  };
}

function evaluatePolicyCondition(
  policy: AbacPolicy,
  user: UserAttributes,
  resource: ResourceAttributes,
  scope: VisibilityScope,
): boolean {
  switch (policy.id) {
    case 'POL-GLOBAL-READ':
      return scope.global;
    case 'POL-APP-OWNER':
      return user.applicationOwnership.length > 0 && (
        user.applicationOwnership.includes(resource.application)
        || domainMatchesApplication(resource.domain, resource.application, user.applicationOwnership)
        || user.assignedDomains.includes(resource.domain)
      );
    case 'POL-VERTICAL-HEAD':
      return scope.domains.includes(resource.domain);
    case 'POL-COMPLIANCE-DOMAIN':
      return user.assignedDomains.includes(resource.domain);
    case 'POL-SECURITY-DOMAINS':
      return scope.kind === 'security-domains' && scope.domains.includes(resource.domain);
    case 'POL-SENSITIVITY-BLOCK':
      return resource.sensitivity === 'restricted' && !scope.global && scope.kind !== 'security-domains';
    case 'POL-PROD-ENV':
      if (resource.environment !== 'production') return true;
      return scope.global || scope.domains.includes(resource.domain);
    case 'POL-DEFAULT-DENY':
      return false;
    default:
      return scope.global || scope.domains.includes(resource.domain);
  }
}

export function decideAccess(
  personaId: PersonaId,
  resourceType: AbacResourceType,
  entity: Record<string, unknown>,
): AbacAccessDecision {
  const user = resolveUserAttributes(personaId);
  const scope = buildVisibilityScope(personaId);
  const resource = resolveResourceAttributes(resourceType, entity);
  return evaluatePolicies(user, resource, scope);
}

export function computeAbacKpis(
  personaId: PersonaId,
  totalResources: number,
  scopedResources: number,
  violations = 2,
): AbacKpis {
  const enabled = ABAC_POLICIES.filter((p) => p.enabled);
  const scope = buildVisibilityScope(personaId);
  const scopeDistribution = [
    { scope: 'Global', count: scope.global ? totalResources : 0 },
    { scope: 'Portfolio', count: scope.kind === 'portfolio' ? scopedResources : 0 },
    { scope: 'Application', count: scope.kind === 'application' ? scopedResources : 0 },
    { scope: 'Domain', count: scope.kind === 'domain' ? scopedResources : 0 },
    { scope: 'Security', count: scope.kind === 'security-domains' ? scopedResources : 0 },
  ].filter((s) => s.count > 0);

  return {
    policyCoverage: Math.round((enabled.length / ABAC_POLICIES.length) * 100),
    domainOwnershipCount: scope.domains.length,
    accessViolations: violations,
    scopeDistribution: scopeDistribution.length > 0 ? scopeDistribution : [{ scope: scope.label, count: scopedResources }],
    enabledPolicies: enabled.length,
    totalPolicies: ABAC_POLICIES.length,
    scopedResources,
    totalResources,
  };
}

export function buildEffectiveAccessSummary(personaId: PersonaId): EffectiveAccessSummary {
  const scope = buildVisibilityScope(personaId);
  const roleId = PERSONA_RBAC_ROLE[personaId] ?? 'auditor';
  return {
    personaId,
    roleLabel: ROLE_MAP[roleId].label,
    visibilityScope: scope,
    allowedDomains: scope.domains,
    allowedApplications: scope.applications,
    policyCount: ABAC_POLICIES.filter((p) => p.enabled).length,
    rowFilterActive: !scope.global,
  };
}

export { ABAC_POLICIES };
