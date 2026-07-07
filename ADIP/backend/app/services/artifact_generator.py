"""Artifact generation framework (Phase 5).

Generates structured SDLC documents from the aggregated project data produced by
``SdlcService`` (reused — no duplicate queries). Each artifact type maps to a
builder that assembles ``ArtifactSection`` blocks; render helpers convert the
same structure to Markdown or a DOCX-ready paragraph model.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Callable

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.models.enums import SdlcPhase
from app.schemas.artifact_generation import (
    ArtifactSection,
    ArtifactTypeInfo,
    DocxArtifact,
    DocxParagraph,
    GeneratedArtifact,
    MarkdownArtifact,
    PdfArtifact,
    PdfBlock,
)
from app.services.sdlc_service import SdlcService

# Supported artifact types (superset of the DB ArtifactType enum: adds SRS/HLD/LLD).
ARTIFACT_TYPES: dict[str, tuple[str | None, str]] = {
    "Concept Note": ("requirements", "Concept Note"),
    "BRD": ("requirements", "Business Requirements Document"),
    "FRD": ("requirements", "Functional Requirements Document"),
    "SRS": ("requirements", "Software Requirements Specification"),
    "NFR": ("requirements", "Non-Functional Requirements"),
    "Architecture": ("architecture", "Architecture Document"),
    "Solution Design": ("architecture", "Solution Design Document"),
    "HLD": ("architecture", "High-Level Design"),
    "LLD": ("architecture", "Low-Level Design"),
    "API Spec": ("architecture", "API Specification"),
    "DB Design": ("architecture", "Database Design"),
    "Sequence Flow": ("architecture", "Sequence Flow"),
    "Security Controls": ("development", "Security Controls"),
    "Test Strategy": ("testing", "Test Strategy"),
    "Test Plan": ("testing", "Test Plan"),
    "Test Cases": ("testing", "Test Cases"),
    "Automation Test Pack": ("testing", "Automation Test Pack"),
    "Deployment Guide": ("release", "Deployment Guide"),
    "Rollback Guide": ("release", "Rollback Guide"),
    "Go Live Checklist": ("release", "Go Live Checklist"),
    "Operational Runbook": ("release", "Operational Runbook"),
    "Audit Checklist": ("audit", "Audit Checklist"),
    "Compliance Matrix": ("audit", "Compliance Matrix"),
    "Traceability Matrix": ("audit", "Traceability Matrix"),
    "Executive Summary": (None, "Executive Summary"),
}


def _now() -> datetime:
    return datetime.now(timezone.utc)


class ArtifactGenerator:
    """Builds structured artifacts from aggregated project data."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.sdlc = SdlcService(db)

    # --- public API ---
    def supported_types(self) -> list[ArtifactTypeInfo]:
        return [
            ArtifactTypeInfo(artifact_type=k, phase=v[0], description=v[1])
            for k, v in ARTIFACT_TYPES.items()
        ]

    def generate(self, project_id: int, artifact_type: str) -> GeneratedArtifact:
        if artifact_type not in ARTIFACT_TYPES:
            raise ValidationError(
                f"Unsupported artifact type '{artifact_type}'. "
                f"Supported: {', '.join(ARTIFACT_TYPES)}."
            )
        # Validates project existence (raises NotFoundError).
        project = self.sdlc._project(project_id)  # noqa: SLF001 (intentional reuse)
        builder = self._builders()[artifact_type]
        sections, summary = builder(project_id)
        _, desc = ARTIFACT_TYPES[artifact_type]
        return GeneratedArtifact(
            artifact_type=artifact_type,
            title=f"{project.name} — {desc}",
            project_id=project_id,
            project_name=project.name,
            reference=f"{project.code}-{artifact_type.replace(' ', '').upper()[:6]}-001",
            generated_at=_now(),
            executive_summary=summary,
            sections=sections,
        )

    def generate_markdown(self, project_id: int, artifact_type: str) -> MarkdownArtifact:
        art = self.generate(project_id, artifact_type)
        md = self.to_markdown(art)
        return MarkdownArtifact(
            artifact_type=art.artifact_type,
            title=art.title,
            project_id=art.project_id,
            reference=art.reference,
            markdown=md,
        )

    def generate_docx_model(self, project_id: int, artifact_type: str) -> DocxArtifact:
        art = self.generate(project_id, artifact_type)
        paras: list[DocxParagraph] = [DocxParagraph(style="Title", text=art.title)]
        paras.append(DocxParagraph(style="Heading 1", text="Executive Summary"))
        paras.append(DocxParagraph(style="Normal", text=art.executive_summary))
        for s in art.sections:
            paras.append(DocxParagraph(style=f"Heading {min(max(s.level, 1), 3)}", text=s.heading))
            if s.body:
                paras.append(DocxParagraph(style="Normal", text=s.body))
            for b in s.bullets:
                paras.append(DocxParagraph(style="List Bullet", text=b))
        return DocxArtifact(
            artifact_type=art.artifact_type,
            title=art.title,
            project_id=art.project_id,
            reference=art.reference,
            paragraphs=paras,
        )

    def generate_pdf_model(self, project_id: int, artifact_type: str) -> PdfArtifact:
        """Generate a PDF-ready block model (placeholder for a future PDF renderer)."""
        art = self.generate(project_id, artifact_type)
        blocks: list[PdfBlock] = [PdfBlock(kind="title", text=art.title)]
        blocks.append(PdfBlock(kind="heading", text="Executive Summary"))
        blocks.append(PdfBlock(kind="paragraph", text=art.executive_summary))
        for s in art.sections:
            blocks.append(PdfBlock(kind="heading", text=s.heading))
            if s.body:
                blocks.append(PdfBlock(kind="paragraph", text=s.body))
            for b in s.bullets:
                blocks.append(PdfBlock(kind="bullet", text=b))
        return PdfArtifact(
            artifact_type=art.artifact_type,
            title=art.title,
            project_id=art.project_id,
            reference=art.reference,
            blocks=blocks,
        )

    @staticmethod
    def to_markdown(art: GeneratedArtifact) -> str:
        lines = [f"# {art.title}", ""]
        lines.append(f"> **Reference:** {art.reference}  ")
        lines.append(f"> **Generated by:** {art.generated_by} ({art.model_used}) · "
                     f"**Version:** {art.version} · **Date:** {art.generated_at:%Y-%m-%d}")
        lines += ["", "## Executive Summary", "", art.executive_summary, ""]
        for s in art.sections:
            lines.append(f"{'#' * (s.level + 1)} {s.heading}")
            lines.append("")
            if s.body:
                lines += [s.body, ""]
            for b in s.bullets:
                lines.append(f"- {b}")
            if s.bullets:
                lines.append("")
        return "\n".join(lines).rstrip() + "\n"

    # --- builders (one per artifact type) ---
    def _builders(self) -> dict[str, Callable[[int], tuple[list[ArtifactSection], str]]]:
        return {
            "Concept Note": self._concept_note,
            "BRD": self._brd,
            "FRD": self._frd,
            "SRS": self._srs,
            "NFR": self._nfr,
            "Architecture": self._architecture_doc,
            "Solution Design": self._architecture_doc,
            "HLD": self._hld,
            "LLD": self._lld,
            "API Spec": self._api_spec,
            "DB Design": self._db_design,
            "Sequence Flow": self._sequence_flow,
            "Security Controls": self._security_controls,
            "Test Strategy": self._test_strategy,
            "Test Plan": self._test_plan,
            "Test Cases": self._test_cases,
            "Automation Test Pack": self._automation_pack,
            "Deployment Guide": self._deployment_guide,
            "Rollback Guide": self._rollback_guide,
            "Go Live Checklist": self._go_live_checklist,
            "Operational Runbook": self._operational_runbook,
            "Audit Checklist": self._audit_checklist,
            "Compliance Matrix": self._compliance_matrix,
            "Traceability Matrix": self._traceability_matrix,
            "Executive Summary": self._executive_summary,
        }

    # Requirements-based
    def _concept_note(self, pid: int):
        s = self.sdlc.requirement_summary(pid)
        sections = [
            ArtifactSection(heading="Problem Statement", body=(
                f"{s.project.name} initiative to deliver the capabilities identified from the "
                f"business scenario, aligned to banking/regulatory expectations.")),
            ArtifactSection(heading="Objective", body="", bullets=[r.title for r in s.business_requirements] or ["Deliver the requested capability."]),
            ArtifactSection(heading="High-Level Approach", body="AI-orchestrated SDLC across requirements → architecture → development → testing → release → audit."),
            ArtifactSection(heading="Key Dependencies", body="", bullets=[r.title for r in s.dependencies]),
        ]
        return sections, f"Concept Note for {s.project.name}."

    def _nfr(self, pid: int):
        s = self.sdlc.requirement_summary(pid)
        sections = [
            ArtifactSection(heading="Non-Functional Requirements", body="Performance, availability, security and scalability requirements.",
                            bullets=[f"{r.reference}: {r.title}" for r in s.non_functional_requirements] or ["99.95% availability; p95 < 800ms; idempotent processing."]),
        ]
        return sections, f"Non-Functional Requirements for {s.project.name}."

    def _brd(self, pid: int):
        s = self.sdlc.requirement_summary(pid)
        sections = [
            ArtifactSection(heading="Business Objectives", body="Business requirements driving this initiative.",
                            bullets=[r.title for r in s.business_requirements] or ["Derived from project scope."]),
            ArtifactSection(heading="Scope", body="In-scope functional capabilities.",
                            bullets=[r.title for r in s.functional_requirements[:12]]),
            ArtifactSection(heading="Assumptions", body="", bullets=[r.title for r in s.assumptions]),
            ArtifactSection(heading="Dependencies", body="", bullets=[r.title for r in s.dependencies]),
            ArtifactSection(heading="Acceptance Criteria", body="", bullets=[r.title for r in s.acceptance_criteria]),
        ]
        summary = (f"Business Requirements Document for {s.project.name}: "
                   f"{len(s.business_requirements)} business and {len(s.functional_requirements)} functional "
                   f"requirements, readiness {s.readiness} ({s.score}/100).")
        return sections, summary

    def _frd(self, pid: int):
        s = self.sdlc.requirement_summary(pid)
        sections = [
            ArtifactSection(heading="Functional Requirements", body="Detailed functional requirements.",
                            bullets=[f"{r.reference}: {r.title}" for r in s.functional_requirements]),
            ArtifactSection(heading="Non-Functional Requirements", body="",
                            bullets=[f"{r.reference}: {r.title}" for r in s.non_functional_requirements]),
            ArtifactSection(heading="Acceptance Criteria", body="",
                            bullets=[r.title for r in s.acceptance_criteria]),
            ArtifactSection(heading="Gap Analysis", body="AI-detected requirement gaps.",
                            bullets=[f"[{g.severity}] {g.finding}" for g in s.gap_analysis[:15]]),
        ]
        return sections, (f"Functional Requirements Document for {s.project.name} covering "
                          f"{len(s.functional_requirements)} FRs and {len(s.non_functional_requirements)} NFRs.")

    def _srs(self, pid: int):
        s = self.sdlc.requirement_summary(pid)
        sections = [
            ArtifactSection(heading="Introduction", body=f"Software Requirements Specification for {s.project.name}."),
            ArtifactSection(heading="Overall Description", body="System context and constraints derived from requirements."),
            ArtifactSection(heading="Functional Requirements", body="",
                            bullets=[f"{r.reference}: {r.title}" for r in s.functional_requirements]),
            ArtifactSection(heading="Non-Functional Requirements", body="",
                            bullets=[f"{r.reference}: {r.title}" for r in s.non_functional_requirements]),
            ArtifactSection(heading="Constraints & Assumptions", body="",
                            bullets=[r.title for r in s.assumptions] + [r.title for r in s.dependencies]),
        ]
        return sections, f"SRS for {s.project.name}: {s.total_requirements} requirements analyzed."

    # Architecture-based
    def _architecture_doc(self, pid: int):
        s = self.sdlc.architecture_summary(pid)
        sections = [
            ArtifactSection(heading="Architecture Overview", body="Solution and platform architecture overview.",
                            bullets=[f"{a.reference}: {a.title}" for a in s.overview]),
            ArtifactSection(heading="Impacted Applications", body="",
                            bullets=[f"{a.name} ({a.technology})" for a in s.applications]),
            ArtifactSection(heading="Architecture Findings", body="",
                            bullets=[f"[{f.severity}] {f.finding}" for f in s.review_findings[:12]]),
            ArtifactSection(heading="Recommendations", body="",
                            bullets=[r.title for r in s.recommendations]),
        ]
        return sections, (f"Architecture document for {s.project.name}: readiness {s.readiness} ({s.score}/100), "
                          f"{len(s.applications)} impacted applications.")

    def _hld(self, pid: int):
        s = self.sdlc.architecture_summary(pid)
        sections = [
            ArtifactSection(heading="Logical Design", body="", bullets=[a.title for a in s.logical_design] or ["See architecture overview."]),
            ArtifactSection(heading="Integration Architecture", body="", bullets=[a.title for a in s.integrations]),
            ArtifactSection(heading="API Surface", body="", bullets=[a.title for a in s.apis]),
            ArtifactSection(heading="Data Design", body="", bullets=[a.title for a in s.database_design]),
        ]
        return sections, f"High-Level Design for {s.project.name}."

    def _lld(self, pid: int):
        s = self.sdlc.architecture_summary(pid)
        sections = [
            ArtifactSection(heading="Physical Design", body="", bullets=[a.title for a in s.physical_design] or ["Deployment topology."]),
            ArtifactSection(heading="Sequence Flows", body="", bullets=[a.title for a in s.sequence_metadata]),
            ArtifactSection(heading="Component Detail", body="",
                            bullets=[f"{a.name}: {a.technology}" for a in s.applications]),
        ]
        return sections, f"Low-Level Design for {s.project.name}."

    def _api_spec(self, pid: int):
        s = self.sdlc.architecture_summary(pid)
        sections = [
            ArtifactSection(heading="API Inventory", body="APIs exposed and consumed by the solution.",
                            bullets=[a.title for a in s.apis] or ["REST APIs per integration view."]),
            ArtifactSection(heading="Integration Endpoints", body="", bullets=[a.title for a in s.integrations]),
        ]
        return sections, f"API Specification for {s.project.name}."

    def _db_design(self, pid: int):
        s = self.sdlc.architecture_summary(pid)
        sections = [
            ArtifactSection(heading="Database Design", body="Logical and physical data model.",
                            bullets=[a.title for a in s.database_design] or ["Domain data model."]),
        ]
        return sections, f"Database Design for {s.project.name}."

    def _sequence_flow(self, pid: int):
        s = self.sdlc.architecture_summary(pid)
        sections = [
            ArtifactSection(heading="Sequence Flows", body="End-to-end sequence for the primary journeys.",
                            bullets=[a.title for a in s.sequence_metadata] or ["Debit → detection → reconcile → reverse → notify."]),
            ArtifactSection(heading="Integration Points", body="", bullets=[a.title for a in s.integrations]),
        ]
        return sections, f"Sequence Flow for {s.project.name}."

    # Development-based
    def _security_controls(self, pid: int):
        s = self.sdlc.development_summary(pid)
        secure = [f"[{r.severity}] {r.finding}" for r in s.code_reviews if getattr(r, "is_secure_coding", False)]
        sections = [
            ArtifactSection(heading="Secure Coding Controls", body="Security controls and secure-coding checklist.",
                            bullets=secure or ["PII masking", "Idempotency keys", "Signed audit events", "AuthN/AuthZ enforcement"]),
            ArtifactSection(heading="Recommendations", body="", bullets=[r.title for r in s.recommendations]),
        ]
        return sections, f"Security Controls for {s.project.name}."

    # Testing-based
    def _test_strategy(self, pid: int):
        s = self.sdlc.testing_summary(pid)
        c = s.coverage
        sections = [
            ArtifactSection(heading="Test Strategy", body=(
                f"Risk-based strategy across functional, negative, reconciliation and performance testing. "
                f"{c.total_cases} cases, {c.automation_pct}% automated.")),
            ArtifactSection(heading="Scope", body="", bullets=[t.title for t in s.test_cases[:12]]),
            ArtifactSection(heading="Automation Approach", body=f"{c.automated} automated of {c.total_cases}; nightly regression."),
        ]
        return sections, f"Test Strategy for {s.project.name}."

    def _test_cases(self, pid: int):
        s = self.sdlc.testing_summary(pid)
        sections = [
            ArtifactSection(heading="Test Cases", body="Executable test cases.",
                            bullets=[f"{t.reference} [{t.test_type}]: {t.title}" for t in s.test_cases]),
        ]
        return sections, f"Test Cases for {s.project.name}: {len(s.test_cases)} cases."

    def _automation_pack(self, pid: int):
        s = self.sdlc.testing_summary(pid)
        sections = [
            ArtifactSection(heading="Automation Test Pack", body="Automation-candidate cases for CI.",
                            bullets=[f"{t.reference}: {t.title}" for t in s.automation]),
        ]
        return sections, f"Automation Test Pack for {s.project.name}: {len(s.automation)} automated cases."

    # Testing-based
    def _test_plan(self, pid: int):
        s = self.sdlc.testing_summary(pid)
        c = s.coverage
        sections = [
            ArtifactSection(heading="Test Strategy", body=(
                f"Coverage across {c.total_cases} cases ({c.automation_pct}% automated), "
                f"pass rate {c.pass_rate_pct}%.")),
            ArtifactSection(heading="Test Cases", body="", bullets=[f"{t.reference}: {t.title}" for t in s.test_cases[:20]]),
            ArtifactSection(heading="Regression Scope", body="", bullets=[t.title for t in s.regression[:12]]),
            ArtifactSection(heading="Defects", body="", bullets=[f"[{d.severity}] {d.title}" for d in s.defects[:12]]),
        ]
        return sections, f"Test Plan for {s.project.name}: readiness {s.readiness} ({s.score}/100)."

    # Release-based
    def _deployment_guide(self, pid: int):
        s = self.sdlc.release_summary(pid)
        sections = [
            ArtifactSection(heading="Deployment Plan", body="",
                            bullets=[f"{r.reference}: {r.name} ({r.status})" for r in s.release_plan]),
            ArtifactSection(heading="Deployment Steps", body="",
                            bullets=[f"{d.environment} · {d.strategy} · {d.status}" for d in s.deployment]),
            ArtifactSection(heading="Monitoring", body="", bullets=[m.get("monitoring_plan", "") for m in s.monitoring]),
        ]
        return sections, f"Deployment Guide for {s.project.name}: readiness {s.readiness} ({s.score}/100)."

    def _rollback_guide(self, pid: int):
        s = self.sdlc.release_summary(pid)
        sections = [
            ArtifactSection(heading="Rollback Plan", body="", bullets=[m.get("rollback_plan", "") for m in s.rollback] or ["Kill-switch + revert to N-1."]),
            ArtifactSection(heading="CAB Approval", body="", bullets=[m.get("cab_summary", "") for m in s.cab]),
        ]
        return sections, f"Rollback Guide for {s.project.name}."

    def _go_live_checklist(self, pid: int):
        s = self.sdlc.go_live_summary(pid)
        sections = [
            ArtifactSection(heading="Go-Live Checklist", body="",
                            bullets=[g.checklist or f"Go-live record {g.id}" for g in s.go_live_checklist] or ["Regression green · rollback rehearsed · monitoring live."]),
            ArtifactSection(heading="Business Sign-off", body="",
                            bullets=[f"{b.get('approved_by', 'TBD')} — {b.get('verdict', '')}" for b in s.business_signoff]),
            ArtifactSection(heading="Hypercare", body="", bullets=[h.get("hypercare", "") for h in s.hypercare]),
        ]
        return sections, f"Go Live Checklist for {s.project.name}: readiness {s.readiness} ({s.score}/100)."

    def _operational_runbook(self, pid: int):
        s = self.sdlc.release_summary(pid)
        gl = self.sdlc.go_live_summary(pid)
        sections = [
            ArtifactSection(heading="Monitoring", body="", bullets=[m.get("monitoring_plan", "") for m in s.monitoring] or ["SLA, error-rate and latency dashboards."]),
            ArtifactSection(heading="Hypercare", body="", bullets=[h.get("hypercare", "") for h in gl.hypercare] or ["48h enhanced monitoring and on-call."]),
            ArtifactSection(heading="Incident Response", body="Escalation matrix, rollback trigger and kill-switch procedure."),
        ]
        return sections, f"Operational Runbook for {s.project.name}."

    # Audit-based
    def _audit_checklist(self, pid: int):
        s = self.sdlc.audit_summary(pid)
        sections = [
            ArtifactSection(heading="Audit Evidence", body="",
                            bullets=[f"{e.reference}: {e.title} ({e.status})" for e in s.evidence]),
            ArtifactSection(heading="Compliance Mapping", body="",
                            bullets=[f"{c.framework} · {c.control_reference} · {c.status}" for c in s.compliance]),
            ArtifactSection(heading="Observations", body="",
                            bullets=[f"[{o.severity}] {o.observation}" for o in s.observations]),
        ]
        return sections, f"Audit Checklist for {s.project.name}: readiness {s.readiness} ({s.score}/100)."

    def _compliance_matrix(self, pid: int):
        s = self.sdlc.audit_summary(pid)
        sections = [
            ArtifactSection(heading="Compliance Matrix", body="Framework → control → status mapping.",
                            bullets=[f"{c.framework} · {c.control_reference} · {c.status}" for c in s.compliance] or ["RBI / PCI-DSS / SOX / AML controls."]),
        ]
        return sections, f"Compliance Matrix for {s.project.name}."

    def _traceability_matrix(self, pid: int):
        # Reuse the existing AnalyticsService traceability matrix (no duplicate logic).
        from app.services.analytics_service import AnalyticsService

        m = AnalyticsService(self.db).traceability_matrix(pid)
        sections = [
            ArtifactSection(heading="Traceability Matrix", body=(
                f"Requirement → development → test coverage. "
                f"{m.covered_requirements}/{m.total_requirements} requirements covered "
                f"({m.coverage_pct}%).")),
            ArtifactSection(heading="Coverage Detail", body="",
                            bullets=[
                                f"{r.requirement_reference}: dev={len(r.development_refs)} test={len(r.test_refs)} "
                                f"{'✓' if r.covered else '✗'}"
                                for r in m.rows[:25]
                            ]),
        ]
        return sections, f"Traceability Matrix for {m.project.name}: {m.coverage_pct}% coverage."

    # Executive
    def _executive_summary(self, pid: int):
        e = self.sdlc.executive_summary(pid)
        sections = [
            ArtifactSection(heading="Overall Posture", body=(
                f"Overall AI SDLC score {e.overall_score}/100 ({e.band}). "
                f"Business value {e.business_value}, compliance {e.compliance_score}, risk {e.risk_score}, "
                f"AI confidence {e.ai_confidence}%.")),
            ArtifactSection(heading="Phase Scores", body="",
                            bullets=[f"{p.phase.title()}: {p.score}/100 ({p.readiness})" for p in e.phase_scores]),
            ArtifactSection(heading="Value Delivered", body=(
                f"Manual effort saved {e.manual_effort_saved_days} days · "
                f"{e.documentation_pages} pages of documentation · "
                f"productivity uplift {e.productivity_uplift_pct}%.")),
            ArtifactSection(heading="Key Recommendations", body="",
                            bullets=[r.title for r in e.top_recommendations]),
        ]
        return sections, e.executive_summary
