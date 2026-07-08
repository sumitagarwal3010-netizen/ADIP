"""Connector-driven artifact generation prompts — extends existing prompt system."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ConnectorArtifactUseCase:
    id: str
    label: str
    description: str
    supported_connectors: tuple[str, ...]
    multi_source: bool = False


ARTIFACT_USE_CASES: list[ConnectorArtifactUseCase] = [
    ConnectorArtifactUseCase("requirements_document", "Requirements document",
        "Synthesize requirements from Jira epics/stories and Confluence pages.",
        ("jira", "confluence", "sharepoint")),
    ConnectorArtifactUseCase("architecture_summary", "Architecture summary",
        "Summarize architecture from SharePoint, Confluence, and design decisions.",
        ("sharepoint", "confluence", "teams")),
    ConnectorArtifactUseCase("risk_assessment", "Risk assessment",
        "Consolidate risks from Jira bugs, Prisma Cloud, Teams incidents, and Outlook escalations.",
        ("jira", "prisma_cloud", "teams", "outlook"), multi_source=True),
    ConnectorArtifactUseCase("traceability_matrix", "Traceability matrix",
        "Map requirement → story → bug → release across Jira and ALM tools.",
        ("jira", "github_enterprise", "gitlab", "azure_devops"), multi_source=True),
    ConnectorArtifactUseCase("test_evidence_pack", "Test evidence pack",
        "Compile test evidence from Jenkins builds, OneDrive, and SonarQube quality data.",
        ("jenkins", "onedrive", "sonarqube"), multi_source=True),
    ConnectorArtifactUseCase("release_readiness_report", "Release readiness report",
        "Assess release readiness from Jira blockers, SonarQube gates, Teams decisions, Jenkins CI.",
        ("jira", "sonarqube", "teams", "jenkins"), multi_source=True),
    ConnectorArtifactUseCase("security_findings_report", "Security findings report",
        "Aggregate SonarQube, Prisma Cloud, and scanner findings with severity normalization.",
        ("sonarqube", "prisma_cloud", "snyk", "checkmarx"), multi_source=True),
    ConnectorArtifactUseCase("audit_evidence_summary", "Audit evidence summary",
        "Package audit evidence from Outlook, SharePoint, Jira, and compliance scanners.",
        ("outlook", "sharepoint", "jira", "prisma_cloud"), multi_source=True),
    ConnectorArtifactUseCase("executive_sdlc_summary", "Executive SDLC summary",
        "Executive health report across all connected enterprise sources.",
        ("jira", "confluence", "sharepoint", "sonarqube", "prisma_cloud", "teams", "jenkins"), multi_source=True),
]


PROMPT_TEMPLATES: dict[str, str] = {
    "requirements_document": """You are an ADIP requirements engineer. Using the following connector-sourced records from {connectors}:
{source_records}

Produce a structured Requirements Document with:
1. Executive summary
2. Functional requirements (numbered)
3. Non-functional requirements
4. Open questions and assumptions
5. Traceability references to source Jira/Confluence IDs

Ground every requirement in the provided source records. Do not invent requirements without evidence.""",

    "architecture_summary": """You are an ADIP enterprise architect. Summarize architecture from {connectors}:
{source_records}

Produce an Architecture Summary covering:
- Current-state components and boundaries
- Key design decisions (with Confluence/SharePoint references)
- Integration points and data flows
- Risks and technical debt
- Recommended next steps""",

    "risk_assessment": """You are an ADIP risk analyst. Consolidate risks from {connectors}:
{source_records}

Produce a Risk Assessment with:
- Risk register (ID, description, severity, likelihood, owner)
- Top 5 risks with mitigation
- Connector evidence links per risk
- Residual risk posture""",

    "traceability_matrix": """You are an ADIP traceability specialist. Build a traceability matrix from {connectors}:
{source_records}

Map: Business requirement → Epic → Story → Test → Release artifact.
Include external IDs from Jira/GitHub/Azure DevOps.
Highlight gaps and orphaned items.""",

    "test_evidence_pack": """You are an ADIP QA lead. Compile test evidence from {connectors}:
{source_records}

Produce a Test Evidence Pack with:
- Test scope and coverage summary
- CI/build status (Jenkins)
- Quality metrics (SonarQube)
- Evidence artifacts (OneDrive references)
- Go/no-go recommendation""",

    "release_readiness_report": """You are an ADIP release manager. Assess release readiness from {connectors}:
{source_records}

Produce a Release Readiness Report with:
- Release scope and version
- Blockers and open defects
- Quality gate status (SonarQube)
- CAB/decision log references (Teams)
- CI pipeline health (Jenkins)
- Recommendation: GO / NO-GO / CONDITIONAL""",

    "security_findings_report": """You are an ADIP security engineer. Aggregate findings from {connectors}:
{source_records}

Produce a Security Findings Report with:
- Executive summary
- Findings by severity (normalized)
- Policy violations (Prisma Cloud)
- Code quality/security issues (SonarQube)
- Remediation priorities and owners""",

    "audit_evidence_summary": """You are an ADIP audit specialist. Package audit evidence from {connectors}:
{source_records}

Produce an Audit Evidence Summary with:
- Control objectives covered
- Evidence items with source references (Outlook, SharePoint, Jira)
- Compliance gaps
- Attestation readiness""",

    "executive_sdlc_summary": """You are an ADIP executive advisor. Synthesize SDLC health from {connectors}:
{source_records}

Produce an Executive SDLC Health Summary with:
- Delivery confidence score rationale
- Requirements/architecture/test/release/security posture
- Top risks and decisions needed
- KPI highlights and trend narrative""",

    # Connector-specific named prompts (referenced by use case extensions)
    "sharepoint_architecture_summarizer": """Summarize SharePoint architecture documents:
{source_records}
Focus on governance sites, architecture libraries, and policy documents.""",

    "confluence_design_decision_extractor": """Extract design decisions from Confluence pages:
{source_records}
List decision, rationale, alternatives considered, and status.""",

    "jira_requirements_traceability": """Generate requirements traceability from Jira:
{source_records}
Map epics, stories, bugs, and release items with status.""",

    "teams_decision_log": """Generate a decision log from Teams conversations:
{source_records}
Capture decisions, approvers, dates, and open actions.""",

    "outlook_approval_evidence": """Summarize approval evidence from Outlook:
{source_records}
List approvals, signoffs, audit threads, and risk escalations.""",

    "sonarqube_quality_report": """Generate SonarQube quality report:
{source_records}
Include quality gate, coverage, vulnerabilities, bugs, code smells.""",

    "prisma_cloud_risk_summary": """Generate Prisma Cloud risk summary:
{source_records}
Include posture findings, policy violations, severity, compliance impact.""",
}


def get_use_case(use_case_id: str) -> ConnectorArtifactUseCase | None:
    for uc in ARTIFACT_USE_CASES:
        if uc.id == use_case_id:
            return uc
    return None


def render_prompt(artifact_type: str, *, connectors: str, source_records: str) -> str:
    template = PROMPT_TEMPLATES.get(artifact_type, PROMPT_TEMPLATES["executive_sdlc_summary"])
    return template.format(connectors=connectors, source_records=source_records)
