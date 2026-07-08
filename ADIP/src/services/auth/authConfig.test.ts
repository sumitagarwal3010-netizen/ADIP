import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getAuthMode, getOidcConfig } from './authConfig';

describe('authConfig', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to demo mode', () => {
    expect(getAuthMode()).toBe('demo');
    expect(getOidcConfig()).toBeNull();
  });

  it('enables oidc mode when issuer and client are set', () => {
    vi.stubEnv('VITE_AUTH_MODE', 'oidc');
    vi.stubEnv('VITE_OIDC_ISSUER', 'https://login.example.com');
    vi.stubEnv('VITE_OIDC_CLIENT_ID', 'adip-client');
    expect(getAuthMode()).toBe('oidc');
    expect(getOidcConfig()?.issuer).toBe('https://login.example.com');
  });
});
