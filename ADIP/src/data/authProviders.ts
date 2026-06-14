import type { PersonaId } from '../config/personaConfig';
import { PERSONA_RBAC_ROLE } from './rbacCatalog';
import { getPersistenceLayer } from '../context/PersistenceContext';
import type {
  AuthAuditEvent,
  AuthLoginResult,
  AuthProviderDefinition,
  AuthProviderId,
  AuthSession,
  UserIdentity,
} from '../types/auth';

export const SESSION_TTL_MS = 30 * 60 * 1000;
export const REFRESH_TTL_MS = 30 * 60 * 1000;
export const STORAGE_SESSION_KEY = 'adip.auth.session';
export const STORAGE_USER_KEY = 'adip.auth.user';
export const STORAGE_AUDIT_KEY = 'adip.auth.audit';

export const AUTH_PROVIDERS: AuthProviderDefinition[] = [
  {
    id: 'azure-ad',
    label: 'Mock Azure AD',
    issuer: 'https://login.microsoftonline.com/{tenant}/v2.0',
    clientId: 'adip-enterprise-app',
    futureReady: 'Microsoft Entra ID OIDC — production tenant placeholder',
  },
  {
    id: 'okta',
    label: 'Mock Okta',
    issuer: 'https://{org}.okta.com/oauth2/default',
    clientId: 'adip-okta-client',
    futureReady: 'Okta OIDC authorization code flow',
  },
  {
    id: 'ping',
    label: 'Mock Ping Identity',
    issuer: 'https://ping.example.com/as/authorization.oauth2',
    clientId: 'adip-ping-client',
    futureReady: 'PingFederate OIDC integration',
  },
];

interface MockUserSeed {
  user_id: string;
  username: string;
  display_name: string;
  email: string;
  department: string;
  role: string;
  persona: PersonaId;
  groups: string[];
}

const USER_SEEDS: MockUserSeed[] = [
  { user_id: 'usr-cio', username: 'sverma', display_name: 'Sanjay Verma', email: 'sanjay.verma@bank.com', department: 'Executive Office', role: 'CIO', persona: 'cio', groups: ['Executive', 'Board-Reporting'] },
  { user_id: 'usr-ea', username: 'psharma', display_name: 'Priya Sharma', email: 'priya.sharma@bank.com', department: 'Enterprise Architecture', role: 'Enterprise Architect', persona: 'enterprise-architect', groups: ['Architecture-Guild', 'SDLC-Leads'] },
  { user_id: 'usr-cto', username: 'knair', display_name: 'Karthik Nair', email: 'karthik.nair@bank.com', department: 'Technology', role: 'Solution Architect', persona: 'cto', groups: ['Solution-Architecture', 'API-Governance'] },
  { user_id: 'usr-dev', username: 'mkrishnan', display_name: 'Meera Krishnan', email: 'meera.krishnan@bank.com', department: 'Engineering', role: 'Development Lead', persona: 'developer', groups: ['Payments-Engineering', 'Dev-Leads'] },
  { user_id: 'usr-test', username: 'drao', display_name: 'Deepak Rao', email: 'deepak.rao@bank.com', department: 'Quality Engineering', role: 'Test Lead', persona: 'tester', groups: ['QA-COE', 'Release-Gates'] },
  { user_id: 'usr-rm', username: 'vjoshi', display_name: 'Vikram Joshi', email: 'vikram.joshi@bank.com', department: 'Release Management', role: 'Release Manager', persona: 'release-manager', groups: ['Release-Managers', 'Go-NoGo'] },
  { user_id: 'usr-ciso', username: 'apatel', display_name: 'Arjun Patel', email: 'arjun.patel@bank.com', department: 'Information Security', role: 'Security Officer', persona: 'ciso', groups: ['CISO-Office', 'Security-Controls'] },
  { user_id: 'usr-co', username: 'rmehta', display_name: 'Raj Mehta', email: 'raj.mehta@bank.com', department: 'Regulatory Compliance', role: 'Compliance Officer', persona: 'compliance-officer', groups: ['Compliance', 'RBI-AI-Working-Group'] },
  { user_id: 'usr-mro', username: 'adesai', display_name: 'Anita Desai', email: 'anita.desai@bank.com', department: 'Enterprise Risk', role: 'Model Risk Officer', persona: 'risk-officer', groups: ['Model-Risk', 'AI-Governance'] },
  { user_id: 'usr-aud', username: 'liyer', display_name: 'Lakshmi Iyer', email: 'lakshmi.iyer@bank.com', department: 'Internal Audit', role: 'Auditor', persona: 'audit-head', groups: ['Internal-Audit', 'ITGC'] },
  { user_id: 'usr-ao', username: 'rbanerjee', display_name: 'Rohit Banerjee', email: 'rohit.banerjee@bank.com', department: 'Payments', role: 'Application Owner', persona: 'application-owner', groups: ['Payments-Apps', 'App-Owners'] },
  { user_id: 'usr-admin', username: 'opsadmin', display_name: 'Operations Admin', email: 'ops.admin@bank.com', department: 'Platform Engineering', role: 'Platform Administrator', persona: 'operations-manager', groups: ['Platform-Admins', 'ADIP-Operators'] },
  { user_id: 'usr-mo', username: 'siyer', display_name: 'Sneha Iyer', email: 'sneha.iyer@bank.com', department: 'AI Governance', role: 'Model Owner', persona: 'model-owner', groups: ['Model-Owners', 'AI-Governance'] },
];

export const MOCK_USERS: UserIdentity[] = USER_SEEDS.map((u) => ({
  ...u,
  rbacRole: PERSONA_RBAC_ROLE[u.persona] ?? 'auditor',
}));

export const MOCK_USER_MAP = Object.fromEntries(MOCK_USERS.map((u) => [u.username, u])) as Record<string, UserIdentity>;

function createToken(providerId: AuthProviderId, userId: string): AuthSession['token'] {
  const issuedAt = Date.now();
  return {
    accessToken: `mock.${providerId}.${userId}.${issuedAt}`,
    refreshToken: `refresh.${providerId}.${userId}.${issuedAt}`,
    tokenType: 'Bearer',
    expiresIn: SESSION_TTL_MS / 1000,
    issuedAt,
    scope: 'openid profile email adip.api',
  };
}

function createSession(providerId: AuthProviderId, user: UserIdentity): AuthSession {
  const now = Date.now();
  const token = createToken(providerId, user.user_id);
  return {
    sessionId: `sess-${now}-${user.user_id}`,
    userId: user.user_id,
    providerId,
    token,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
    lastRefreshedAt: now,
  };
}

function createAuditEvent(
  type: AuthAuditEvent['type'],
  user: UserIdentity,
  detail: string,
  providerId?: AuthProviderId,
): AuthAuditEvent {
  return {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    userId: user.user_id,
    username: user.username,
    timestamp: new Date().toLocaleString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    detail,
    providerId,
  };
}

export async function mockProviderLogin(
  providerId: AuthProviderId,
  username: string,
): Promise<AuthLoginResult> {
  await new Promise((r) => setTimeout(r, 600));
  const user = MOCK_USER_MAP[username];
  if (!user) throw new Error(`User ${username} not found in mock directory`);
  const session = createSession(providerId, user);
  const auditEvent = createAuditEvent(
    'login',
    user,
    `Authenticated via ${AUTH_PROVIDERS.find((p) => p.id === providerId)?.label} (mock OIDC)`,
    providerId,
  );
  return { user, session, auditEvent };
}

export function refreshSession(session: AuthSession, user: UserIdentity): {
  session: AuthSession;
  auditEvent: AuthAuditEvent;
} {
  const now = Date.now();
  const token = createToken(session.providerId, user.user_id);
  const refreshed: AuthSession = {
    ...session,
    token,
    expiresAt: now + REFRESH_TTL_MS,
    lastRefreshedAt: now,
  };
  return {
    session: refreshed,
    auditEvent: createAuditEvent('session_refresh', user, 'Session token refreshed (mock)', session.providerId),
  };
}

export function createRoleChangeAudit(
  user: UserIdentity,
  previousRole: string,
  newRole: string,
): AuthAuditEvent {
  return createAuditEvent('role_change', user, `Role changed: ${previousRole} → ${newRole}`);
}

export function createLogoutAudit(user: UserIdentity, providerId: AuthProviderId): AuthAuditEvent {
  return createAuditEvent('logout', user, 'User signed out', providerId);
}

export function createExpiryAudit(user: UserIdentity, providerId: AuthProviderId): AuthAuditEvent {
  return createAuditEvent('session_expiry', user, 'Session expired — re-authentication required', providerId);
}

export function persistSession(user: UserIdentity, session: AuthSession): void {
  getPersistenceLayer().auth.saveSession(user, session);
}

export function clearPersistedSession(): void {
  getPersistenceLayer().auth.clearSession();
}

export function readPersistedAuth(): { user: UserIdentity; session: AuthSession } | null {
  return getPersistenceLayer().auth.readSession();
}

export function appendAuditEvent(event: AuthAuditEvent): AuthAuditEvent[] {
  return getPersistenceLayer().auth.appendAuditEvent(event);
}

export function readAuditEvents(): AuthAuditEvent[] {
  return getPersistenceLayer().auth.readAuditEvents();
}

export const AUTH_HEALTH_MOCK = {
  activeSessions: 8,
  providersHealthy: 3,
  failedLogins24h: 2,
  avgSessionMinutes: 24,
};

export const AUTH_EXEC_SUMMARY =
  'Authentication health is stable across 3 mock OIDC providers with 8 active sessions. Azure AD is designated as the production identity path. Two failed login attempts in 24h from unknown usernames. Recommended action: complete Entra ID app registration and retire mock provider switch before production cutover.';
