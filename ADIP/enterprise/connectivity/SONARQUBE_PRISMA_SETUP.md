# SonarQube / Prisma Cloud Setup Guide

## SonarQube

```json
{
  "base_url": "https://sonar.example.com",
  "organization": "adip",
  "credential_ref": "SONAR_TOKEN_ENV",
  "mock_mode": true
}
```

Mock data includes: quality gate status, vulnerabilities, bugs, code smells.

## Prisma Cloud

```json
{
  "console_url": "https://app.prismacloud.io",
  "credential_ref": "PRISMA_ACCESS_KEY_VAULT_PATH",
  "mock_mode": true
}
```

Mock data includes: posture findings, policy violations, compliance mappings.

## Severity normalization

All findings pass through `normalize_severity()` → critical/high/medium/low/info.

## Artifact use case

Use `security_findings_report` in Connector Artifact Workbench with both connectors selected.
