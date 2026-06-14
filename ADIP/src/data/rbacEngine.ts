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

export function createEntitlementResolver(roleId: RbacRoleId) {
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
  return createEntitlementResolver(roleId);
}

export { ROLE_CATALOG, ROLE_MAP, PERSONA_RBAC_ROLE };
