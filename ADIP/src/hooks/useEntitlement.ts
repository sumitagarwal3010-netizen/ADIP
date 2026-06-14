import { useMemo } from 'react';
import { usePersona } from '../context/PersonaContext';
import { entitlementResolverForPersona, type EntitlementResolver } from '../data/rbacEngine';
import type { Permission, ResourceType } from '../data/rbacCatalog';

export function useEntitlement(): EntitlementResolver & { personaId: string } {
  const { personaId } = usePersona();
  const resolver = useMemo(() => entitlementResolverForPersona(personaId), [personaId]);
  return { ...resolver, personaId };
}

export function useCan(permission: Permission, resource: ResourceType): boolean {
  const { can } = useEntitlement();
  return can(permission, resource);
}
