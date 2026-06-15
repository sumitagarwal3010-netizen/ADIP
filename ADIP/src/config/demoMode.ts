/**
 * DEMO MODE configuration.
 *
 * ADIP runs as an executive demonstration environment. Authentication,
 * Azure AD / MSAL, OAuth/OIDC, JWT validation, token refresh, and session
 * checks are all disabled. A demo user is injected so every hub loads without
 * any login. RBAC/ABAC remain active for DEMO VISIBILITY ONLY — they shape
 * what each persona sees and are NOT security enforcement.
 *
 * Do not reintroduce tokens or real authentication here.
 */
import { DEFAULT_PERSONA, PERSONA_MAP, type PersonaId } from './personaConfig';
import { PERSONA_RBAC_ROLE } from '../data/rbacCatalog';
import type { AuthSession, UserIdentity } from '../types/auth';

/** Master switch — the platform is always in demo mode. */
export const DEMO_MODE = true;

/** Persona-switchable identities surfaced in the demo persona switcher. */
export const DEMO_SWITCHABLE_PERSONAS: PersonaId[] = [
  'cio',
  'cto',
  'audit-head',
  'compliance-officer',
  'application-owner',
  'enterprise-architect',
  'operations-manager',
  'ciso',
];

/** Builds a non-expiring, demo-safe identity for a given persona. */
export function demoUserForPersona(personaId: PersonaId): UserIdentity {
  const persona = PERSONA_MAP[personaId] ?? PERSONA_MAP[DEFAULT_PERSONA];
  return {
    user_id: `demo-${personaId}`,
    username: `demo.${personaId}`,
    display_name: personaId === DEFAULT_PERSONA ? 'Demo CIO' : `Demo ${persona.label}`,
    email: `demo.${personaId}@bank.local`,
    department: persona.title,
    role: persona.label,
    persona: personaId,
    rbacRole: PERSONA_RBAC_ROLE[personaId] ?? 'auditor',
    groups: ['Demo', 'Executive'],
  };
}

/** Default injected demo user — Demo CIO. */
export const DEMO_USER: UserIdentity = demoUserForPersona(DEFAULT_PERSONA);

/** A session that never expires — no session checks, no token refresh. */
export function createDemoSession(user: UserIdentity): AuthSession {
  const now = Date.now();
  const farFuture = now + 100 * 365 * 24 * 60 * 60 * 1000;
  return {
    sessionId: `demo-session-${user.user_id}`,
    userId: user.user_id,
    providerId: 'azure-ad',
    token: {
      accessToken: 'demo-mode-no-token',
      refreshToken: 'demo-mode-no-token',
      tokenType: 'Bearer',
      expiresIn: Number.MAX_SAFE_INTEGER,
      issuedAt: now,
      scope: 'demo',
    },
    createdAt: now,
    expiresAt: farFuture,
    lastRefreshedAt: now,
  };
}

export const DEMO_SESSION: AuthSession = createDemoSession(DEMO_USER);

export const DEMO_BANNER = {
  title: 'DEMO MODE',
  lines: ['Authentication Disabled', 'Mock Users Active', 'No Azure AD Required'],
} as const;
