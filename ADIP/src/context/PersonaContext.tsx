import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  DEFAULT_PERSONA,
  PERSONA_MAP,
  type PersonaConfig,
  type PersonaId,
} from '../config/personaConfig';
import { entitlementResolverForPersona } from '../data/rbacEngine';
import type { Permission, ResourceType } from '../data/rbacCatalog';

const STORAGE_KEY = 'adip.activePersona';

function readInitialPersona(): PersonaId {
  if (typeof window === 'undefined') return DEFAULT_PERSONA;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) as PersonaId | null;
    if (stored && stored in PERSONA_MAP) return stored;
  } catch {
    /* ignore storage access errors */
  }
  return DEFAULT_PERSONA;
}

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
  const [personaId, setPersonaId] = useState<PersonaId>(readInitialPersona);

  const setPersona = useCallback((id: PersonaId) => {
    setPersonaId(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore storage access errors */
    }
  }, []);

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
