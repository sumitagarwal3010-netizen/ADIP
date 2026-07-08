# Security Policy

## Reporting a vulnerability

Please report security issues privately to the ADIP maintainers (do **not** open a
public issue). Include: affected component, reproduction steps, impact, and any
suggested remediation. You will receive an acknowledgement and a remediation
timeline.

## Supported versions

The `main`/stable branch receives security fixes. Pin to tagged releases for
production and track advisories.

## Security posture (summary)

ADIP is designed with the following controls; see `docs/15_Security/` for detail.

- **Mock-first, no secrets by default:** the platform runs offline with no
  external credentials (LLM optional, ADR-0003).
- **Input validation:** all request bodies are validated by Pydantic schemas.
- **Output/error hygiene:** consistent error envelope; correlation id per request;
  no stack traces leaked in production (`DEBUG=false`).
- **Rate limiting:** token-bucket middleware (enable `RATE_LIMIT_ENABLED=true`).
- **Additive migrations:** no destructive schema ops in a release (ADR-0006).
- **Dependency & secret scanning:** CI workflow `security-scan.yml`
  (pip-audit, npm audit, gitleaks, SBOM generation).
- **Containers:** slim base images, non-root recommended, healthchecks.

## Known future work (documented, not yet implemented)

- Authentication/authorization (OIDC/SSO) — seam documented in the threat model.
- Secrets management via a vault/operator (examples provided for K8s).
- Full distributed tracing.

See `docs/15_Security/Threat Model.md` and `docs/15_Security/OWASP Checklist.md`.
