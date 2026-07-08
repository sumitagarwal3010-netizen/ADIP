/**
 * Authentication mode configuration — demo default with OIDC-ready boundary.
 */
export type AuthMode = 'demo' | 'oidc' | 'disabled';

export interface OidcConfig {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

function readEnv(key: string): string | undefined {
  const env = import.meta.env as Record<string, string | undefined>;
  return env[key];
}

/** Resolved auth mode: demo/disabled unless VITE_AUTH_MODE=oidc and issuer is configured. */
export function getAuthMode(): AuthMode {
  const mode = readEnv('VITE_AUTH_MODE');
  if (mode === 'disabled') return 'disabled';
  if (mode === 'oidc' && readEnv('VITE_OIDC_ISSUER') && readEnv('VITE_OIDC_CLIENT_ID')) {
    return 'oidc';
  }
  return 'demo';
}

export function getOidcConfig(): OidcConfig | null {
  if (getAuthMode() !== 'oidc') return null;
  const issuer = readEnv('VITE_OIDC_ISSUER');
  const clientId = readEnv('VITE_OIDC_CLIENT_ID');
  if (!issuer || !clientId) return null;
  return {
    issuer,
    clientId,
    redirectUri: readEnv('VITE_OIDC_REDIRECT_URI') ?? `${window.location.origin}/login`,
    scopes: (readEnv('VITE_OIDC_SCOPES') ?? 'openid profile email').split(/\s+/),
  };
}

export const isDemoAuthMode = (): boolean => getAuthMode() === 'demo';
