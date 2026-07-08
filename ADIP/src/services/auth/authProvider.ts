/**
 * Auth provider abstraction — demo implementation active by default.
 * OIDC provider is a config boundary; full IdP redirect flow is environment-gated.
 */
import type { AuthLoginResult, AuthProviderId, UserIdentity } from '../../types/auth';
import { DEMO_SESSION, DEMO_USER, createDemoSession, demoUserForPersona } from '../../config/demoMode';
import { MOCK_USER_MAP } from '../../data/authProviders';
import type { PersonaId } from '../../config/personaConfig';
import { getAuthMode, getOidcConfig, type AuthMode } from './authConfig';

export interface AuthProvider {
  readonly mode: AuthMode;
  login(providerId: AuthProviderId, username: string): Promise<AuthLoginResult>;
  logout(): AuthLoginResult;
  switchPersona(personaId: PersonaId): AuthLoginResult;
  refreshSession(): AuthLoginResult;
}

function toResult(user: UserIdentity): AuthLoginResult {
  const session = createDemoSession(user);
  return {
    user,
    session,
    auditEvent: {
      id: `auth-${Date.now()}`,
      type: 'login',
      userId: user.user_id,
      username: user.username,
      timestamp: new Date().toISOString(),
      detail: `Authenticated as ${user.display_name}`,
      providerId: session.providerId,
    },
  };
}

class DemoAuthProvider implements AuthProvider {
  readonly mode = 'demo' as const;

  async login(_providerId: AuthProviderId, username: string): Promise<AuthLoginResult> {
    void _providerId;
    const user = MOCK_USER_MAP[username] ?? DEMO_USER;
    return toResult(user);
  }

  logout(): AuthLoginResult {
    return toResult(DEMO_USER);
  }

  switchPersona(personaId: PersonaId): AuthLoginResult {
    return toResult(demoUserForPersona(personaId));
  }

  refreshSession(): AuthLoginResult {
    return { user: DEMO_USER, session: DEMO_SESSION, auditEvent: toResult(DEMO_USER).auditEvent };
  }
}

/** OIDC-ready stub — validates config; delegates to demo until IdP wiring is enabled. */
class OidcAuthProvider implements AuthProvider {
  readonly mode = 'oidc' as const;

  private ensureConfig() {
    const cfg = getOidcConfig();
    if (!cfg) throw new Error('OIDC is not configured. Set VITE_OIDC_ISSUER and VITE_OIDC_CLIENT_ID.');
    return cfg;
  }

  async login(providerId: AuthProviderId, username: string): Promise<AuthLoginResult> {
    this.ensureConfig();
    // Production seam: redirect to IdP authorization endpoint here.
    // Until wired, preserve demo UX so the platform remains usable.
    return new DemoAuthProvider().login(providerId, username);
  }

  logout(): AuthLoginResult {
    return new DemoAuthProvider().logout();
  }

  switchPersona(personaId: PersonaId): AuthLoginResult {
    return new DemoAuthProvider().switchPersona(personaId);
  }

  refreshSession(): AuthLoginResult {
    this.ensureConfig();
    return new DemoAuthProvider().refreshSession();
  }
}

let _provider: AuthProvider | null = null;

export function getAuthProvider(): AuthProvider {
  if (!_provider) {
    const mode = getAuthMode();
    _provider = mode === 'oidc' ? new OidcAuthProvider() : new DemoAuthProvider();
  }
  return _provider;
}
