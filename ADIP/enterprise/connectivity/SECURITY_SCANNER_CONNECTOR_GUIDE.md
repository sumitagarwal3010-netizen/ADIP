# Security Scanner Connector Guide

Security scanner connectors ingest findings and normalize severity for ADIP AI SDLC risk views.

## Supported scanners

SonarQube, Checkmarx, Prisma Cloud, Snyk, Veracode, Trivy, Dependency-Track.

## Normalized finding fields

- `external_id`, `title`, `severity` (critical/high/medium/low/info)
- `cve_id`, `component`, `rule_id`, `status`
- `raw_payload` (vendor JSON, for audit)

Severity mapping lives in `backend/app/connectors/normalizers.py`.

## Configuration example (Snyk)

```json
{
  "organization_id": "your-org",
  "credential_ref": "SNYK_TOKEN",
  "mock_mode": true
}
```

## Sync output

Sync jobs populate `connector_findings` and link to evidence via `connector_evidence_links` when configured.

## Production notes

- Use read-only API tokens scoped to project/org.
- Enable `ADIP_AUTH_MODE=oidc` before exposing connector APIs externally.
