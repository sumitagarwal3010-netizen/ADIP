# Connector Artifact Use Cases

## 1. Architecture summary from SharePoint / Confluence

**Connectors:** `sharepoint`, `confluence`  
**Artifact:** `architecture_summary`  
**Sources:** Target Architecture PDF, Architecture Playbook, design decisions

## 2. Requirements traceability from Jira

**Connectors:** `jira`  
**Artifact:** `traceability_matrix`  
**Sources:** Epics, stories, bugs, release blockers

## 3. Release readiness from Jira + SonarQube + Teams

**Connectors:** `jira`, `sonarqube`, `teams`, `jenkins`  
**Artifact:** `release_readiness_report`  
**Sources:** Blockers, quality gate, CAB decisions, CI builds

## 4. Audit evidence pack from Outlook + SharePoint + Jira

**Connectors:** `outlook`, `sharepoint`, `jira`  
**Artifact:** `audit_evidence_summary`  
**Sources:** Approval emails, governance docs, work item audit trail

## 5. Security risk summary from Prisma + SonarQube

**Connectors:** `prisma_cloud`, `sonarqube`  
**Artifact:** `security_findings_report`  
**Sources:** Policy violations, vulnerabilities, code smells

## 6. Executive SDLC health from all sources

**Connectors:** multiple  
**Artifact:** `executive_sdlc_summary`  
**Sources:** Cross-connector aggregated preview
