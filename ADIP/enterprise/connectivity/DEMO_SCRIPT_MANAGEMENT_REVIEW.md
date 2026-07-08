# Demo Script — Management Review

**Duration:** 10 minutes  
**Branch:** `adip-ai-sdlc-june6-stable`  
**Prerequisites:** Backend running, `ADIP_AUTH_MODE=demo`

## 1. Integration Center (2 min)

1. Navigate to `/administration/integrations`
2. Note security bypass warning (prototype mode)
3. Click **Seed demo connectors** — 24 connectors appear
4. **Test** Jira and **Sync** SonarQube
5. Click **Artifact Workbench →**

## 2. Release readiness artifact (4 min)

1. Open `/ai-sdlc/connector-artifact-workbench`
2. Select **Release readiness report**
3. Click **Preview sources** — show Jira blockers, SonarQube gate, Teams decisions
4. Review **Prompt preview** — grounded template
5. Click **Generate artifact**
6. Highlight quality score, traceability, explainability section

## 3. Security findings (2 min)

1. Change type to **Security findings report**
2. Generate — show Prisma + SonarQube severities normalized
3. Copy artifact body

## 4. Executive summary (2 min)

1. Select **Executive SDLC summary**
2. Generate multi-source artifact
3. Emphasize: mock mode today, live connectors with vault creds in production

## Talking points

- No secrets in source code or DB
- OIDC/RBAC ready for production
- Extends existing connector framework — not a second integration layer
