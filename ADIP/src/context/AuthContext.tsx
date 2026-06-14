import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { PersonaId } from '../config/personaConfig';
import type { Permission } from '../data/rbacCatalog';
import { createEntitlementResolver } from '../data/rbacEngine';
import type { AuthProviderId } from '../types/auth';
import {
  appendAuditEvent,
  clearPersistedSession,
  createExpiryAudit,
  createLogoutAudit,
  mockProviderLogin,
  persistSession,
  readAuditEvents,
  readPersistedAuth,
  refreshSession,
} from '../data/authProviders';
import { getEventBus } from './EventContext';
import type {
  AuthAuditEvent,
  AuthSession,
  UserIdentity,
} from '../types/auth';

interface AuthContextValue {
  isAuthenticated: boolean;
  currentUser: UserIdentity | null;
  currentPersona: PersonaId | null;
  currentRoles: string[];
  currentPermissions: Permission[];
  session: AuthSession | null;
  sessionExpiresAt: number | null;
  auditEvents: AuthAuditEvent[];
  login: (providerId: AuthProviderId, username: string) => Promise<void>;
  logout: () => void;
  refreshSessionToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthenticationProvider({ children }: { children: ReactNode }) {
  const restored = readPersistedAuth();
  const [currentUser, setCurrentUser] = useState<UserIdentity | null>(restored?.user ?? null);
  const [session, setSession] = useState<AuthSession | null>(restored?.session ?? null);
  const [auditEvents, setAuditEvents] = useState<AuthAuditEvent[]>(() => readAuditEvents());
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearExpiryTimer = () => {
    if (expiryTimer.current) clearTimeout(expiryTimer.current);
    expiryTimer.current = null;
  };

  const scheduleExpiry = useCallback((sess: AuthSession, user: UserIdentity) => {
    clearExpiryTimer();
    const ms = sess.expiresAt - Date.now();
    if (ms <= 0) return;
    expiryTimer.current = setTimeout(() => {
      const audit = createExpiryAudit(user, sess.providerId);
      appendAuditEvent(audit);
      setAuditEvents((prev) => [audit, ...prev]);
      clearPersistedSession();
      setCurrentUser(null);
      setSession(null);
    }, ms);
  }, []);

  useEffect(() => {
    if (currentUser && session) scheduleExpiry(session, currentUser);
    return clearExpiryTimer;
  }, [currentUser, session, scheduleExpiry]);

  const login = useCallback(async (providerId: AuthProviderId, username: string) => {
    const result = await mockProviderLogin(providerId, username);
    setCurrentUser(result.user);
    setSession(result.session);
    persistSession(result.user, result.session);
    const events = appendAuditEvent(result.auditEvent);
    setAuditEvents(events);
    scheduleExpiry(result.session, result.user);
    getEventBus().emit({
      type: 'auth.login.success',
      source: 'Authentication',
      entityType: 'user',
      entityId: result.user.user_id,
      actor: result.user.display_name,
      message: `${result.user.display_name} authenticated via ${providerId}`,
      category: 'authentication',
    });
  }, [scheduleExpiry]);

  const logout = useCallback(() => {
    if (currentUser && session) {
      const audit = createLogoutAudit(currentUser, session.providerId);
      const events = appendAuditEvent(audit);
      setAuditEvents(events);
      getEventBus().emit({
        type: 'auth.logout',
        source: 'Authentication',
        entityType: 'user',
        entityId: currentUser.user_id,
        actor: currentUser.display_name,
        message: `${currentUser.display_name} logged out`,
        category: 'authentication',
      });
    }
    clearExpiryTimer();
    clearPersistedSession();
    setCurrentUser(null);
    setSession(null);
  }, [currentUser, session]);

  const refreshSessionToken = useCallback(() => {
    if (!currentUser || !session) return;
    const { session: refreshed, auditEvent } = refreshSession(session, currentUser);
    setSession(refreshed);
    persistSession(currentUser, refreshed);
    const events = appendAuditEvent(auditEvent);
    setAuditEvents(events);
    scheduleExpiry(refreshed, currentUser);
  }, [currentUser, session, scheduleExpiry]);

  const currentPermissions = useMemo<Permission[]>(() => {
    if (!currentUser) return [];
    const resolver = createEntitlementResolver(currentUser.rbacRole);
    const perms = new Set<Permission>();
    for (const grant of resolver.listGrants()) {
      for (const p of grant.permissions) perms.add(p);
    }
    return [...perms];
  }, [currentUser]);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: Boolean(currentUser && session),
    currentUser,
    currentPersona: currentUser?.persona ?? null,
    currentRoles: currentUser
      ? [currentUser.role, ...currentUser.groups]
      : [],
    currentPermissions,
    session,
    sessionExpiresAt: session?.expiresAt ?? null,
    auditEvents,
    login,
    logout,
    refreshSessionToken,
  }), [currentUser, session, currentPermissions, auditEvents, login, logout, refreshSessionToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthenticationProvider');
  return ctx;
}
