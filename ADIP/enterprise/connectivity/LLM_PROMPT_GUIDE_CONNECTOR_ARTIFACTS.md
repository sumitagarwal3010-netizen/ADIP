# LLM Prompt Guide — Connector Artifacts

Prompts live in `backend/app/connectors/connector_artifact_prompts.py` and integrate with the existing ADIP prompt system (no duplicate engine).

## Artifact prompts

| ID | Purpose |
|----|---------|
| `requirements_document` | Jira + Confluence requirements synthesis |
| `architecture_summary` | SharePoint + Confluence architecture |
| `risk_assessment` | Multi-source risk consolidation |
| `traceability_matrix` | Jira/ALM traceability |
| `test_evidence_pack` | Jenkins + SonarQube + OneDrive |
| `release_readiness_report` | Jira + SonarQube + Teams + Jenkins |
| `security_findings_report` | SonarQube + Prisma Cloud |
| `audit_evidence_summary` | Outlook + SharePoint + Jira |
| `executive_sdlc_summary` | Cross-connector executive view |

## Connector-specific prompts

- `sharepoint_architecture_summarizer`
- `confluence_design_decision_extractor`
- `jira_requirements_traceability`
- `teams_decision_log`
- `outlook_approval_evidence`
- `sonarqube_quality_report`
- `prisma_cloud_risk_summary`

## Provider abstraction

Generation uses `mock_llm` mode in prototype. Wire to `PromptExecutionEngine` or LLM provider by passing connector context from `build_connector_prompt_context()`.

## Grounding rules

Prompts require `{source_records}` substitution. Do not generate without source grounding in production.
