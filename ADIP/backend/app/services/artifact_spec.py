"""Canonical artifact specifications (single source of truth).

Defines, per artifact type: phase, objective, and the professional required
sections. This spec is REUSED by:
  - the artifact-authoring prompt templates (Phase 1),
  - the professional authoring upgrade (Phase 5),
  - the quality-scoring engine's required-section check (Phase 3).

Keeping it in one place avoids drift and duplication across those features.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ArtifactSpec:
    artifact_type: str
    phase: str
    objective: str
    required_sections: tuple[str, ...]
    compliance: tuple[str, ...] = ()


# Standard enterprise section set most SDLC documents share.
_STD_META = ("Business Context", "Scope", "Assumptions", "Dependencies", "Risks")
_STD_TAIL = ("Traceability", "Approval", "Appendix")


def _spec(atype: str, phase: str, objective: str, core: tuple[str, ...], compliance: tuple[str, ...] = ()) -> ArtifactSpec:
    return ArtifactSpec(atype, phase, objective, _STD_META + core + _STD_TAIL, compliance)


ARTIFACT_SPECS: dict[str, ArtifactSpec] = {
    "PRD": _spec("PRD", "requirements", "Define the product requirements and outcomes.",
                 ("Product Vision", "Personas", "Functional Requirements", "Non-Functional Requirements", "Success Metrics"),
                 ("RBI",)),
    "BRD": _spec("BRD", "requirements", "Capture the business requirements and objectives.",
                 ("Business Objectives", "Business Requirements", "Process Flow", "Acceptance Criteria"),
                 ("RBI",)),
    "FRD": _spec("FRD", "requirements", "Specify the detailed functional requirements.",
                 ("Functional Requirements", "Business Rules", "Data Requirements", "Acceptance Criteria")),
    "SRS": _spec("SRS", "requirements", "Specify software requirements (IEEE-style).",
                 ("Overall Description", "Functional Requirements", "Non-Functional Requirements", "External Interfaces")),
    "NFR": _spec("NFR", "requirements", "Define non-functional requirements and thresholds.",
                 ("Performance", "Availability", "Security", "Scalability", "Observability")),
    "HLD": _spec("HLD", "architecture", "Describe the high-level solution design.",
                 ("Architecture Overview", "Logical Design", "Integration Architecture", "Data Design", "Non-Functional Design")),
    "LLD": _spec("LLD", "architecture", "Describe the low-level/component design.",
                 ("Component Design", "Class/Module Design", "Sequence Flows", "Data Model", "Error Handling")),
    "API Spec": _spec("API Spec", "architecture", "Specify the API contract.",
                      ("API Inventory", "Endpoints", "Request/Response Schemas", "Error Codes", "Security")),
    "DB Design": _spec("DB Design", "architecture", "Define the database design.",
                       ("Logical Data Model", "Physical Data Model", "Entities & Relationships", "Indexing & Partitioning")),
    "Security Design": _spec("Security Design", "architecture", "Define the security architecture.",
                             ("Threat Model", "Authentication & Authorization", "Data Protection", "Secure Coding Controls"),
                             ("PCI-DSS", "RBI")),
    "Test Strategy": _spec("Test Strategy", "testing", "Define the overall test strategy.",
                           ("Test Approach", "Test Levels", "Test Types", "Automation Strategy", "Entry/Exit Criteria")),
    "Test Plan": _spec("Test Plan", "testing", "Plan the test execution.",
                       ("Test Scope", "Test Environment", "Test Schedule", "Test Cases Summary", "Defect Management")),
    "Test Cases": _spec("Test Cases", "testing", "Author structured, executable test cases.",
                        ("Functional Test Cases", "Negative Test Cases", "Reconciliation Test Cases", "Coverage Summary")),
    "Regression Plan": _spec("Regression Plan", "testing", "Define the regression scope.",
                             ("Regression Scope", "Automation Coverage", "Selection Criteria", "Schedule")),
    "UAT Plan": _spec("UAT Plan", "testing", "Plan user acceptance testing.",
                      ("UAT Scope", "UAT Scenarios", "Entry/Exit Criteria", "Sign-off")),
    "Deployment Plan": _spec("Deployment Plan", "release", "Plan the deployment.",
                             ("Deployment Strategy", "Deployment Steps", "Pre/Post Checks", "Monitoring")),
    "Deployment Guide": _spec("Deployment Guide", "release", "Guide the deployment.",
                              ("Deployment Strategy", "Deployment Steps", "Pre/Post Checks", "Monitoring")),
    "Rollback Plan": _spec("Rollback Plan", "release", "Define the rollback procedure.",
                           ("Rollback Triggers", "Rollback Steps", "Data Recovery", "Verification")),
    "Go-Live Checklist": _spec("Go-Live Checklist", "release", "Provide an actionable go-live checklist.",
                               ("Pre-Go-Live", "Go-Live", "Post-Go-Live", "Hypercare"),
                               ("RBI",)),
    "Go Live Checklist": _spec("Go Live Checklist", "release", "Provide an actionable go-live checklist.",
                               ("Pre-Go-Live", "Go-Live", "Post-Go-Live", "Hypercare"),
                               ("RBI",)),
    "Operational Runbook": _spec("Operational Runbook", "release", "Provide the operational runbook.",
                                 ("Monitoring", "Alerting", "Incident Response", "Escalation Matrix", "Hypercare")),
    "Audit Checklist": _spec("Audit Checklist", "audit", "Provide an evidence-focused audit checklist.",
                             ("Evidence Checklist", "Change Evidence", "Approval Evidence", "Test Evidence", "Regulatory Mapping"),
                             ("RBI", "PCI-DSS", "SOX", "AML")),
    "Compliance Matrix": _spec("Compliance Matrix", "audit", "Map controls to regulations.",
                               ("Framework Mapping", "Control References", "Compliance Status", "Gaps"),
                               ("RBI", "PCI-DSS", "SOX", "AML")),
    "Executive Summary": _spec("Executive Summary", "audit", "Provide a concise, decision-oriented summary.",
                               ("Overall Posture", "Business Value", "Key Risks", "Recommendations", "Decision")),
    "Risk Register": _spec("Risk Register", "audit", "Maintain the risk register.",
                           ("Risk Inventory", "Likelihood & Impact", "Mitigations", "Residual Risk")),
    "Release Notes": _spec("Release Notes", "release", "Communicate what changed.",
                           ("What's New", "Fixes", "Known Issues", "Upgrade Notes")),
    "Implementation Roadmap": _spec("Implementation Roadmap", "release", "Lay out the phased roadmap.",
                                    ("Phases", "Milestones", "Deliverables", "Timeline")),
}


def get_spec(artifact_type: str) -> ArtifactSpec | None:
    return ARTIFACT_SPECS.get(artifact_type)
