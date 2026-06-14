import type { PersonaId } from '../config/personaConfig';
import type { Permission, RbacRoleId } from '../data/rbacCatalog';

export type AuthProviderId = 'azure-ad' | 'okta' | 'ping';

export type AuthAuditEventType = 'login' | 'logout' | 'session_expiry' | 'session_refresh' | 'role_change';

export interface UserIdentity {
  user_id: string;
  username: string;
  display_name: string;
  email: string;
  department: string;
  role: string;
  persona: PersonaId;
  rbacRole: RbacRoleId;
  groups: string[];
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  issuedAt: number;
  scope: string;
}

export interface AuthSession {
  sessionId: string;
  userId: string;
  providerId: AuthProviderId;
  token: AuthToken;
  createdAt: number;
  expiresAt: number;
  lastRefreshedAt: number;
}

export interface AuthAuditEvent {
  id: string;
  type: AuthAuditEventType;
  userId: string;
  username: string;
  timestamp: string;
  detail: string;
  providerId?: AuthProviderId;
}

export interface AuthLoginResult {
  user: UserIdentity;
  session: AuthSession;
  auditEvent: AuthAuditEvent;
}

export interface AuthProviderDefinition {
  id: AuthProviderId;
  label: string;
  issuer: string;
  clientId: string;
  futureReady: string;
}

export interface ActiveSessionView {
  sessionId: string;
  user: UserIdentity;
  providerId: AuthProviderId;
  expiresAt: number;
  lastRefreshedAt: number;
}

export interface AuthHealthKpis {
  activeSessions: number;
  uniqueUsers: number;
  loginsToday: number;
  sessionExpiries: number;
  roleDistribution: { role: string; count: number }[];
  privilegeDistribution: { permission: Permission; count: number }[];
}
