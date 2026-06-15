import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  DEFAULT_PERSONA,
  PERSONA_MAP,
  type PersonaConfig,
  type PersonaId,
} from '../config/personaConfig';
import { useAuth } from './AuthContext';
import { entitlementResolverForPersona } from '../data/rbacEngine';
import type { Permission, ResourceType } from '../data/rbacCatalog';

interface PersonaContextValue {
  personaId: PersonaId;
  persona: PersonaConfig;
  setPersona: (id: PersonaId) => void;
  accessibleHubs: string[];
  accessibleReports: string[];
  accessibleActions: string[];
  canAccessRoute: (path: string) => boolean;
  can: (permission: Permission, resource: ResourceType) => boolean;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const { currentPersona, switchPersona } = useAuth();
  const personaId: PersonaId = currentPersona ?? DEFAULT_PERSONA;

  // Demo mode: persona switching is enabled for RBAC visibility (not security
  // enforcement). It updates the injected demo identity via AuthContext.
  const setPersona = useCallback((id: PersonaId) => {
    switchPersona(id);
  }, [switchPersona]);

  const value = useMemo<PersonaContextValue>(() => {
    const resolver = entitlementResolverForPersona(personaId);
    const effective = resolver.getEffectiveAccess();
    return {
      personaId,
      persona: PERSONA_MAP[personaId],
      setPersona,
      accessibleHubs: effective.accessibleHubs,
      accessibleReports: effective.accessibleReports,
      accessibleActions: effective.accessibleActions,
      canAccessRoute: resolver.canAccessRoute,
      can: resolver.can,
    };
  }, [personaId, setPersona]);

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error('usePersona must be used within PersonaProvider');
  return ctx;
}
