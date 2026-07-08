/**
 * DEMO MODE authentication provider.
 *
 * Delegates to the auth provider abstraction (demo by default; OIDC-ready when
 * VITE_AUTH_MODE=oidc and issuer/client are configured). Demo UX is preserved.
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
import { DEMO_SESSION, DEMO_USER } from '../config/demoMode';
import { getEventBus } from './EventContext';
import { getAuthProvider } from '../services/auth/authProvider';
import { getAuthMode, type AuthMode } from '../services/auth/authConfig';
import type {
  AuthAuditEvent,
  AuthProviderId,
  AuthSession,
  UserIdentity,
} from '../types/auth';

interface AuthContextValue {
  authMode: AuthMode;
  authenticated: boolean;
  isAuthenticated: boolean;
  tokenValid: boolean;
  currentUser: UserIdentity | null;
  currentPersona: PersonaId | null;
  currentRoles: string[];
  currentPermissions: Permission[];
  session: AuthSession | null;
  sessionExpiresAt: number | null;
  auditEvents: AuthAuditEvent[];
  switchPersona: (personaId: PersonaId) => void;
  login: (providerId: AuthProviderId, username: string) => Promise<void>;
  logout: () => void;
  refreshSessionToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthenticationProvider({ children }: { children: ReactNode }) {
  const provider = useMemo(() => getAuthProvider(), []);
  const [currentUser, setCurrentUser] = useState<UserIdentity>(DEMO_USER);
  const [session, setSession] = useState<AuthSession>(DEMO_SESSION);
  const [auditEvents, setAuditEvents] = useState<AuthAuditEvent[]>([]);

  const switchPersona = useCallback((personaId: PersonaId) => {
    const result = provider.switchPersona(personaId);
    setCurrentUser(result.user);
    setSession(result.session);
    setAuditEvents((prev) => [result.auditEvent, ...prev].slice(0, 50));
    getEventBus().emit({
      type: 'auth.login.success',
      source: 'Authentication',
      entityType: 'user',
      entityId: result.user.user_id,
      actor: result.user.display_name,
      message: `Persona switched to ${result.user.role}`,
      category: 'authentication',
    });
  }, [provider]);

  const login = useCallback(async (providerId: AuthProviderId, username: string) => {
    const result = await provider.login(providerId, username);
    setCurrentUser(result.user);
    setSession(result.session);
    setAuditEvents((prev) => [result.auditEvent, ...prev].slice(0, 50));
  }, [provider]);

  const logout = useCallback(() => {
    const result = provider.logout();
    setCurrentUser(result.user);
    setSession(result.session);
    setAuditEvents((prev) => [result.auditEvent, ...prev].slice(0, 50));
  }, [provider]);

  const refreshSessionToken = useCallback(() => {
    const result = provider.refreshSession();
    setSession(result.session);
  }, [provider]);

  const currentPermissions = useMemo<Permission[]>(() => {
    const resolver = createEntitlementResolver(currentUser.rbacRole);
    const perms = new Set<Permission>();
    for (const grant of resolver.listGrants()) {
      for (const p of grant.permissions) perms.add(p);
    }
    return [...perms];
  }, [currentUser]);

  const value = useMemo<AuthContextValue>(() => ({
    authMode: getAuthMode(),
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
