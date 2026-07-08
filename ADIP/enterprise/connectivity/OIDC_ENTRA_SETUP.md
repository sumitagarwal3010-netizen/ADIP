# OIDC / Microsoft Entra ID Setup Guide

## Backend

```bash
ADIP_AUTH_MODE=oidc
OIDC_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0
OIDC_CLIENT_ID=<app-registration-client-id>
OIDC_AUDIENCE=<api-audience>
OIDC_JWKS_URI=https://login.microsoftonline.com/<tenant-id>/discovery/v2.0/keys
OIDC_GROUP_CLAIM=groups
OIDC_ROLE_CLAIM=roles
```

## Frontend

```bash
VITE_AUTH_MODE=oidc
VITE_OIDC_ISSUER=https://login.microsoftonline.com/<tenant-id>/v2.0
VITE_OIDC_CLIENT_ID=<spa-client-id>
VITE_OIDC_REDIRECT_URI=http://localhost:5173/login
```

## Production requirements

- `ADIP_AUTH_MODE` must **not** be `demo` or `disabled`
- Bearer tokens required on protected API routes
- Map Entra groups to ADIP RBAC roles in future enforcement layer

No secrets in source control — use env vars or secret manager references only.
