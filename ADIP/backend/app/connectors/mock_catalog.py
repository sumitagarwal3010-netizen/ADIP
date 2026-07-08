"""Rich mock catalog data for demo-ready connector artifact workbench."""
from __future__ import annotations

from typing import Any


def _record(
    *,
    kind: str,
    connector: str,
    external_id: str,
    title: str,
    classification: str,
    artifact_role: str,
    severity: str | None = None,
    **extra: Any,
) -> dict[str, Any]:
    row: dict[str, Any] = {
        "kind": kind,
        "connector_type": connector,
        "external_id": external_id,
        "title": title,
        "classification": classification,
        "artifact_role": artifact_role,
        "project_id": 1,
    }
    if severity:
        row["severity"] = severity
    row.update(extra)
    return row


MOCK_CATALOG: dict[str, list[dict[str, Any]]] = {
    "sharepoint": [
        _record(kind="asset", connector="sharepoint", external_id="sp-site-1", title="ADIP Governance Site",
                classification="governance_evidence", artifact_role="policy", site="https://contoso.sharepoint.com/sites/adip-gov"),
        _record(kind="asset", connector="sharepoint", external_id="sp-doc-1", title="Target Architecture v2.1.pdf",
                classification="architecture", artifact_role="architecture_summary", library="Architecture Library", modified="2026-06-01"),
        _record(kind="asset", connector="sharepoint", external_id="sp-doc-2", title="UPI Requirements Baseline.docx",
                classification="requirement", artifact_role="requirements_document", library="Requirements", modified="2026-05-28"),
        _record(kind="asset", connector="sharepoint", external_id="sp-doc-3", title="Release Readiness Checklist.xlsx",
                classification="release_evidence", artifact_role="release_readiness", library="Release", modified="2026-06-04"),
    ],
    "onedrive": [
        _record(kind="asset", connector="onedrive", external_id="od-1", title="/ADIP/Evidence/Test-Run-2026-06.pdf",
                classification="test_evidence", artifact_role="test_evidence_pack", drive="ADIP Evidence"),
        _record(kind="asset", connector="onedrive", external_id="od-2", title="/ADIP/Artifacts/Security-Review.docx",
                classification="governance_evidence", artifact_role="audit_evidence", drive="ADIP Artifacts"),
    ],
    "teams": [
        _record(kind="asset", connector="teams", external_id="teams-1", title="#adip-delivery — Release go/no-go decision",
                classification="decision_log", artifact_role="release_discussion", channel="adip-delivery", messages=12),
        _record(kind="asset", connector="teams", external_id="teams-2", title="#architecture-review — API gateway approval",
                classification="approval", artifact_role="design_decision", channel="architecture-review", messages=8),
        _record(kind="asset", connector="teams", external_id="teams-3", title="#incidents — P1 latency spike",
                classification="incident", artifact_role="risk_escalation", channel="incidents", messages=24),
    ],
    "outlook": [
        _record(kind="asset", connector="outlook", external_id="mail-1", title="RE: Release 2.4 CAB Approval",
                classification="approval", artifact_role="signoff", folder="Release Approvals", sender="cab@contoso.com"),
        _record(kind="asset", connector="outlook", external_id="mail-2", title="Audit evidence — SOX control attestation",
                classification="audit_evidence", artifact_role="audit_evidence", folder="Audit Evidence", sender="audit@contoso.com"),
        _record(kind="asset", connector="outlook", external_id="mail-3", title="Risk escalation: Prisma critical findings",
                classification="risk_escalation", artifact_role="risk_assessment", folder="Risk", sender="ciso@contoso.com"),
    ],
    "jira": [
        _record(kind="asset", connector="jira", external_id="jira-proj-1", title="ADIP Platform", classification="project",
                artifact_role="requirements_traceability", project_key="ADIP"),
        _record(kind="asset", connector="jira", external_id="jira-epic-1", title="EPIC-101 UPI Settlement Modernization",
                classification="epic", artifact_role="requirements_document", issue_type="Epic", status="In Progress"),
        _record(kind="finding", connector="jira", external_id="jira-101", title="UPI-101: Settlement gap in reversal flow",
                classification="story", artifact_role="requirements_traceability", issue_type="Story", severity="high", status="Open"),
        _record(kind="finding", connector="jira", external_id="jira-204", title="UPI-204: NPCI timeout handling defect",
                classification="bug", artifact_role="traceability_matrix", issue_type="Bug", severity="critical", status="Open"),
        _record(kind="finding", connector="jira", external_id="jira-310", title="REL-12: Release blocker — missing regression",
                classification="release", artifact_role="release_readiness", issue_type="Task", severity="high", status="Blocked"),
    ],
    "confluence": [
        _record(kind="asset", connector="confluence", external_id="conf-1", title="Architecture Playbook",
                classification="architecture", artifact_role="architecture_summary", space="ARCH", version=14),
        _record(kind="asset", connector="confluence", external_id="conf-2", title="Design Decision: Event-driven settlement",
                classification="design_decision", artifact_role="design_decision", space="ARCH", version=3),
        _record(kind="asset", connector="confluence", external_id="conf-3", title="Release Runbook — UPI v2.4",
                classification="runbook", artifact_role="release_readiness", space="OPS", version=7),
        _record(kind="asset", connector="confluence", external_id="conf-4", title="Functional Requirements — Beneficiary Management",
                classification="requirement", artifact_role="requirements_document", space="REQ", version=5),
    ],
    "sonarqube": [
        _record(kind="finding", connector="sonarqube", external_id="sq-proj-1", title="payments-service",
                classification="project", artifact_role="security_findings_report", quality_gate="FAILED", coverage=72.4),
        _record(kind="finding", connector="sonarqube", external_id="sq-vuln-1", title="SQL injection risk in PaymentService",
                classification="vulnerability", artifact_role="security_findings_report", severity="critical", rule="java:S3649"),
        _record(kind="finding", connector="sonarqube", external_id="sq-smell-1", title="Cognitive complexity breach in SettlementEngine",
                classification="code_smell", artifact_role="quality_report", severity="high", rule="java:S3776"),
        _record(kind="finding", connector="sonarqube", external_id="sq-bug-1", title="Null pointer in reversal handler",
                classification="bug", artifact_role="quality_report", severity="medium", rule="java:S2259"),
    ],
    "prisma_cloud": [
        _record(kind="finding", connector="prisma_cloud", external_id="pc-1", title="S3 bucket public ACL — adip-evidence-prod",
                classification="policy_violation", artifact_role="risk_assessment", severity="critical", policy="AWS S3 public access"),
        _record(kind="finding", connector="prisma_cloud", external_id="pc-2", title="K8s privileged pod in adip namespace",
                classification="posture_finding", artifact_role="security_findings_report", severity="high", policy="CIS Kubernetes"),
        _record(kind="finding", connector="prisma_cloud", external_id="pc-3", title="Unencrypted RDS snapshot",
                classification="compliance", artifact_role="audit_evidence", severity="medium", policy="PCI-DSS 3.4"),
    ],
    "github_enterprise": [
        _record(kind="asset", connector="github_enterprise", external_id="gh-1", title="adip-platform",
                classification="repository", artifact_role="traceability_matrix"),
        _record(kind="finding", connector="github_enterprise", external_id="gh-pr-42", title="PR #42: missing integration tests",
                classification="pull_request", artifact_role="release_readiness", severity="medium"),
    ],
    "gitlab": [
        _record(kind="asset", connector="gitlab", external_id="gl-1", title="adip/backend",
                classification="repository", artifact_role="traceability_matrix"),
        _record(kind="finding", connector="gitlab", external_id="gl-mr-18", title="MR !18: security scan gate failed",
                classification="merge_request", artifact_role="security_findings_report", severity="high"),
    ],
    "azure_devops": [
        _record(kind="asset", connector="azure_devops", external_id="ado-1", title="ADIP Program",
                classification="project", artifact_role="requirements_traceability"),
        _record(kind="finding", connector="azure_devops", external_id="ado-wi-99", title="WI-99: pipeline gate failure",
                classification="work_item", artifact_role="release_readiness", severity="high"),
    ],
    "jenkins": [
        _record(kind="asset", connector="jenkins", external_id="jk-1", title="adip-ci",
                classification="pipeline", artifact_role="release_readiness"),
        _record(kind="finding", connector="jenkins", external_id="jk-build-892", title="Build #892 failed: integration tests",
                classification="build_failure", artifact_role="test_evidence_pack", severity="high"),
    ],
}


def samples_for(connector_type: str) -> list[dict[str, Any]]:
    """Return rich mock samples; fall back to generic item if type not in catalog."""
    if connector_type in MOCK_CATALOG:
        return list(MOCK_CATALOG[connector_type])
    return [
        _record(kind="asset", connector=connector_type, external_id=f"{connector_type}-1",
                title=f"Demo {connector_type} resource", classification="generic", artifact_role="evidence"),
    ]


def preview_for_connectors(connector_types: list[str], *, artifact_type: str | None = None, limit: int = 20) -> list[dict[str, Any]]:
    """Aggregate preview records across connector types, optionally filtered by artifact relevance."""
    rows: list[dict[str, Any]] = []
    for ctype in connector_types:
        rows.extend(samples_for(ctype))
    if artifact_type:
        filtered = [
            r for r in rows
            if artifact_type in (r.get("artifact_role") or "")
            or artifact_type.replace("_", " ") in (r.get("classification") or "").replace("_", " ")
            or (artifact_type == "executive_sdlc_summary")
        ]
        if filtered:
            rows = filtered
    return rows[:limit]
