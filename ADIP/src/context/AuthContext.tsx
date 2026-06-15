/**
 * DEMO MODE authentication provider.
 *
 * No Azure AD / MSAL, no OAuth/OIDC, no JWT validation, no token refresh,
 * no session checks, and no network calls. A demo user is always injected so
 * the platform is permanently authenticated. Persona switching is preserved
 * for DEMO VISIBILITY (RBAC/ABAC are not security enforcement here).
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PersonaId } from '../config/personaConfig';
import type { Permission } from '../data/rbacCatalog';
import { createEntitlementResolver } from '../data/rbacEngine';
import {
  DEMO_SESSION,
  DEMO_USER,
  createDemoSession,
  demoUserForPersona,
} from '../config/demoMode';
import { MOCK_USER_MAP } from '../data/authProviders';
import { getEventBus } from './EventContext';
import type {
  AuthAuditEvent,
  AuthProviderId,
  AuthSession,
  UserIdentity,
} from '../types/auth';

interface AuthContextValue {
  /** Always true in demo mode. */
  authenticated: boolean;
  /** Always true in demo mode. */
  isAuthenticated: boolean;
  /** Always true in demo mode — no tokens are validated. */
  tokenValid: boolean;
  currentUser: UserIdentity | null;
  currentPersona: PersonaId | null;
  currentRoles: string[];
  currentPermissions: Permission[];
  session: AuthSession | null;
  sessionExpiresAt: number | null;
  auditEvents: AuthAuditEvent[];
  /** Demo persona switch — RBAC visibility only. */
  switchPersona: (personaId: PersonaId) => void;
  login: (providerId: AuthProviderId, username: string) => Promise<void>;
  logout: () => void;
  refreshSessionToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthenticationProvider({ children }: { children: ReactNode }) {
  // Demo mode: start permanently authenticated as the injected demo user.
  const [currentUser, setCurrentUser] = useState<UserIdentity>(DEMO_USER);
  const [session, setSession] = useState<AuthSession>(DEMO_SESSION);
  const [auditEvents] = useState<AuthAuditEvent[]>([]);

  const switchPersona = useCallback((personaId: PersonaId) => {
    const user = demoUserForPersona(personaId);
    setCurrentUser(user);
    setSession(createDemoSession(user));
    getEventBus().emit({
      type: 'auth.login.success',
      source: 'Authentication',
      entityType: 'user',
      entityId: user.user_id,
      actor: user.display_name,
      message: `Demo persona switched to ${user.role} (visibility only)`,
      category: 'authentication',
    });
  }, []);

  // Demo login: no network, no tokens — just swap to the requested mock/demo
  // identity so the existing login UI still functions.
  const login = useCallback(async (_providerId: AuthProviderId, username: string) => {
    void _providerId;
    const mockUser = MOCK_USER_MAP[username];
    const user = mockUser ?? DEMO_USER;
    setCurrentUser(user);
    setSession(createDemoSession(user));
  }, []);

  // Demo logout: reset to the default demo user (never deauthenticate).
  const logout = useCallback(() => {
    setCurrentUser(DEMO_USER);
    setSession(DEMO_SESSION);
  }, []);

  // No token refresh in demo mode.
  const refreshSessionToken = useCallback(() => {
    /* no-op — demo mode does not use tokens */
  }, []);

  const currentPermissions = useMemo<Permission[]>(() => {
    const resolver = createEntitlementResolver(currentUser.rbacRole);
    const perms = new Set<Permission>();
    for (const grant of resolver.listGrants()) {
      for (const p of grant.permissions) perms.add(p);
    }
    return [...perms];
  }, [currentUser]);

  const value = useMemo<AuthContextValue>(() => ({
    authenticated: true,
    isAuthenticated: true,
    tokenValid: true,
    currentUser,
    currentPersona: currentUser.persona,
    currentRoles: [currentUser.role, ...currentUser.groups],
    currentPermissions,
    session,
    sessionExpiresAt: session.expiresAt,
    auditEvents,
    switchPersona,
    login,
    logout,
    refreshSessionToken,
  }), [currentUser, session, currentPermissions, auditEvents, switchPersona, login, logout, refreshSessionToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthenticationProvider');
  return ctx;
}
