import type { PersonaId } from '../config/personaConfig';
import {
  APPROVAL_ACTION_PERMISSIONS,
  PERSONA_RBAC_ROLE,
  ROLE_CATALOG,
  ROLE_MAP,
  ROUTE_RESOURCE_MAP,
  type Permission,
  type RbacRoleId,
  type ResourceType,
  type RoleDefinition,
} from './rbacCatalog';
import { canAccessActivityCenter } from './activityStreamEngine';
import { canAccessCopilot } from './copilotEngine';
import { canAccessProductionIntelligence } from './productionIntelligenceEngine';
import { canAccessKnowledgeCenter } from './knowledgeCenterEngine';
import { canAccessValueRealization } from './valueRealizationEngine';
import { canAccessPortfolioGovernance } from './portfolioGovernanceEngine';
import { canAccessApplicationPortfolio } from './applicationPortfolioEngine';
import { canAccessArchitectureRepository } from './architectureRepositoryEngine';
import { canAccessTechnologyStrategy } from './technologyStrategyEngine';
import { canAccessTransformationPmo } from './transformationPmoEngine';
import { canAccessEnterpriseRisk } from './enterpriseRiskEngine';

const ACTIVITY_CENTER_PREFIX = '/governance/activity-center';
const AI_COPILOT_PREFIX = '/executive/ai-copilot';
const PRODUCTION_INTEL_PREFIX = '/production';
const KNOWLEDGE_CENTER_PREFIX = '/knowledge-center';
const VALUE_REALIZATION_PREFIX = '/executive/value-realization';
const PORTFOLIO_GOVERNANCE_PREFIX = '/executive/portfolio-governance';
const APPLICATION_PORTFOLIO_PREFIX = '/executive/application-portfolio';
const ARCHITECTURE_REPOSITORY_PREFIX = '/executive/architecture-repository';
const TECHNOLOGY_STRATEGY_PREFIX = '/executive/technology-strategy';
const TRANSFORMATION_PMO_PREFIX = '/executive/transformation-pmo';
const ENTERPRISE_RISK_PREFIX = '/executive/enterprise-risk';

export interface AccessDecision {
  allowed: boolean;
  roleId: RbacRoleId;
  roleLabel: string;
  permission: Permission;
  resource: ResourceType;
  reason: string;
}

export interface EffectiveAccess {
  role: RoleDefinition;
  accessibleHubs: string[];
  accessibleReports: string[];
  accessibleActions: string[];
  grantCount: number;
}

function grantSet(role: RoleDefinition): Map<ResourceType, Set<Permission>> {
  const map = new Map<ResourceType, Set<Permission>>();
  for (const g of role.grants) {
    map.set(g.resource, new Set(g.permissions));
  }
  return map;
}

export function resolveAccess(
  roleId: RbacRoleId,
  permission: Permission,
  resource: ResourceType,
): AccessDecision {
  const role = ROLE_MAP[roleId];
  if (!role) {
    return {
      allowed: false,
      roleId,
      roleLabel: 'Unknown',
      permission,
      resource,
      reason: `Role ${roleId} not found in catalog`,
    };
  }
  const grants = grantSet(role);
  const perms = grants.get(resource);
  const allowed = perms?.has(permission) ?? false;
  return {
    allowed,
    roleId,
    roleLabel: role.label,
    permission,
    resource,
    reason: allowed
      ? `${role.label} granted ${permission} on ${resource}`
      : `${role.label} denied ${permission} on ${resource}`,
  };
}

export function createEntitlementResolver(roleId: RbacRoleId, personaId?: PersonaId) {
  const role = ROLE_MAP[roleId];
  const grants = grantSet(role);

  return {
    roleId,
    role,
    can(permission: Permission, resource: ResourceType): boolean {
      return resolveAccess(roleId, permission, resource).allowed;
    },
    decide(permission: Permission, resource: ResourceType): AccessDecision {
      return resolveAccess(roleId, permission, resource);
    },
    canAccessRoute(path: string): boolean {
      if (path === ACTIVITY_CENTER_PREFIX || path.startsWith(`${ACTIVITY_CENTER_PREFIX}/`)) {
        return personaId ? canAccessActivityCenter(personaId) : false;
      }
      if (path === AI_COPILOT_PREFIX || path.startsWith(`${AI_COPILOT_PREFIX}/`)) {
        return personaId ? canAccessCopilot(personaId) : false;
      }
      if (path === PRODUCTION_INTEL_PREFIX || path.startsWith(`${PRODUCTION_INTEL_PREFIX}/`)) {
        return personaId ? canAccessProductionIntelligence(personaId) : false;
      }
      if (path === KNOWLEDGE_CENTER_PREFIX || path.startsWith(`${KNOWLEDGE_CENTER_PREFIX}/`) || path === '/learning') {
        return personaId ? canAccessKnowledgeCenter(personaId) : false;
      }
      if (path === VALUE_REALIZATION_PREFIX || path.startsWith(`${VALUE_REALIZATION_PREFIX}/`)) {
        return personaId ? canAccessValueRealization(personaId) : false;
      }
      if (path === PORTFOLIO_GOVERNANCE_PREFIX || path.startsWith(`${PORTFOLIO_GOVERNANCE_PREFIX}/`)) {
        return personaId ? canAccessPortfolioGovernance(personaId) : false;
      }
      if (path === APPLICATION_PORTFOLIO_PREFIX || path.startsWith(`${APPLICATION_PORTFOLIO_PREFIX}/`)) {
        return personaId ? canAccessApplicationPortfolio(personaId) : false;
      }
      if (path === ARCHITECTURE_REPOSITORY_PREFIX || path.startsWith(`${ARCHITECTURE_REPOSITORY_PREFIX}/`)) {
        return personaId ? canAccessArchitectureRepository(personaId) : false;
      }
      if (path === TECHNOLOGY_STRATEGY_PREFIX || path.startsWith(`${TECHNOLOGY_STRATEGY_PREFIX}/`)) {
        return personaId ? canAccessTechnologyStrategy(personaId) : false;
      }
      if (path === TRANSFORMATION_PMO_PREFIX || path.startsWith(`${TRANSFORMATION_PMO_PREFIX}/`)) {
        return personaId ? canAccessTransformationPmo(personaId) : false;
      }
      if (path === ENTERPRISE_RISK_PREFIX || path.startsWith(`${ENTERPRISE_RISK_PREFIX}/`)) {
        return personaId ? canAccessEnterpriseRisk(personaId) : false;
      }
      const entry = ROUTE_RESOURCE_MAP[path];
      if (!entry) return true;
      return resolveAccess(roleId, entry.permission, entry.resource).allowed;
    },
    canPerformApprovalAction(action: string): boolean {
      const perm = APPROVAL_ACTION_PERMISSIONS[action];
      if (!perm) return false;
      return resolveAccess(roleId, perm, 'approvals').allowed;
    },
    getEffectiveAccess(): EffectiveAccess {
      return {
        role,
        accessibleHubs: role.dashboards,
        accessibleReports: role.reports,
        accessibleActions: role.actions,
        grantCount: role.grants.reduce((sum, g) => sum + g.permissions.length, 0),
      };
    },
    listGrants() {
      return role.grants;
    },
    hasPermissionOn(resource: ResourceType, permission: Permission): boolean {
      return grants.get(resource)?.has(permission) ?? false;
    },
  };
}

export type EntitlementResolver = ReturnType<typeof createEntitlementResolver>;

export function entitlementResolverForPersona(personaId: PersonaId): EntitlementResolver {
  const roleId = PERSONA_RBAC_ROLE[personaId] ?? 'auditor';
  return createEntitlementResolver(roleId, personaId);
}

export { ROLE_CATALOG, ROLE_MAP, PERSONA_RBAC_ROLE };
