# Security Bypass for Prototype Mode

## Purpose

Allows local/pre-MVP development without IdP credentials.

## Enable (local only)

```bash
ADIP_AUTH_MODE=demo   # or disabled
VITE_AUTH_MODE=demo # or disabled
```

## Behavior

- Backend logs: `SECURITY BYPASS ACTIVE`
- `AuthMiddleware` passes requests without Bearer token
- Integration dashboard reports `security_bypassed: true`
- Frontend Integration Center shows warning badge

## Production

Set `ADIP_AUTH_MODE=oidc` and configure OIDC issuer/client. Bypass modes must **not** be used in production deployments.
