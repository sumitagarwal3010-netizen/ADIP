# Security Guide

## Demo/disabled mode (current prototype)

| Variable | Behavior |
|----------|----------|
| `ADIP_AUTH_MODE=demo` | Auth bypass, warnings logged |
| `ADIP_AUTH_MODE=disabled` | Explicit bypass |
| `VITE_AUTH_MODE` | Frontend mirror |

**Production must use `oidc`.** See `enterprise/connectivity/SECURITY_BYPASS_PROTOTYPE.md`.

## Future OIDC mode

`ADIP_AUTH_MODE=oidc` + `OIDC_ISSUER`, `OIDC_CLIENT_ID`. `AuthMiddleware` enforces Bearer tokens.

## RBAC/ABAC

Frontend: `rbacCatalog`, `rbacEngine`. Backend interfaces ready; enforcement gated on OIDC.

## Prompt injection

`app/core/prompt_security.py` — sanitization hooks. Review user-supplied prompts in workbench.

## Secret handling

- `.env.example` placeholders only
- Connector `credential_ref` → env/vault path
- Never commit `.env`, tokens, or API keys

## Audit logging

Connector `audit_event()`, auth audit in frontend `AuthContext`.

Cross-reference: `docs/15_Security/Threat Model.md`, `OWASP Checklist.md`, `API Hardening.md`.
