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

# Supported artifact types (superset of the DB ArtifactType enum).
ARTIFACT_TYPES: dict[str, tuple[str | None, str]] = {
    # Requirements / product
    "Concept Note": ("requirements", "Concept Note"),
    "Vision Document": ("requirements", "Vision Document"),
    "Business Case": ("requirements", "Business Case"),
    "PRD": ("requirements", "Product Requirements Document"),
    "BRD": ("requirements", "Business Requirements Document"),
    "FRD": ("requirements", "Functional Requirements Document"),
    "SRS": ("requirements", "Software Requirements Specification"),
    "NFR": ("requirements", "Non-Functional Requirements"),
    "Stakeholder Matrix": ("requirements", "Stakeholder Matrix"),
    "User Journey": ("requirements", "User Journey"),
    "Process Flow": ("requirements", "Process Flow"),
    # Architecture / design
    "Architecture": ("architecture", "Architecture Document"),
    "Solution Design": ("architecture", "Solution Design Document"),
    "HLD": ("architecture", "High-Level Design"),
    "LLD": ("architecture", "Low-Level Design"),
    "Architecture Decision Record": ("architecture", "Architecture Decision Record"),
    "API Spec": ("architecture", "API Specification"),
    "DB Design": ("architecture", "Database Design"),
    "Sequence Flow": ("architecture", "Sequence Flow"),
    "Deployment Diagram": ("architecture", "Deployment Diagram"),
    "Infrastructure Design": ("architecture", "Infrastructure Design"),
    "Security Design": ("architecture", "Security Design"),
    "Performance Design": ("architecture", "Performance Design"),
    "Security Controls": ("development", "Security Controls"),
    # Testing
    "Test Strategy": ("testing", "Test Strategy"),
    "Test Plan": ("testing", "Test Plan"),
    "Test Scenarios": ("testing", "Test Scenarios"),
    "Test Cases": ("testing", "Test Cases"),
    "Automation Test Pack": ("testing", "Automation Test Pack"),
    "Regression Plan": ("testing", "Regression Plan"),
    "UAT Plan": ("testing", "UAT Plan"),
    # Release / go-live / operations
    "Deployment Guide": ("release", "Deployment Guide"),
    "Go Live Plan": ("release", "Go Live Plan"),
    "Go Live Checklist": ("release", "Go Live Checklist"),
    "Rollback Guide": ("release", "Rollback Guide"),
    "Rollback Plan": ("release", "Rollback Plan"),
    "Operational Runbook": ("release", "Operational Runbook"),
    "Support Runbook": ("release", "Support Runbook"),
    "Operational Checklist": ("release", "Operational Checklist"),
    "Knowledge Transfer": ("release", "Knowledge Transfer"),
    "Release Notes": ("release", "Release Notes"),
    "Implementation Roadmap": ("release", "Implementation Roadmap"),
    # Audit / governance
    "Audit Checklist": ("audit", "Audit Checklist"),
    "Compliance Matrix": ("audit", "Compliance Matrix"),
    "Traceability Matrix": ("audit", "Traceability Matrix"),
    "Risk Register": ("audit", "Risk Register"),
    # Executive
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

    def generate(
        self,
        project_id: int,
        artifact_type: str,
        prompt_reference: str | None = None,
        author: str = "AI SDLC Copilot",
    ) -> GeneratedArtifact:
        if artifact_type not in ARTIFACT_TYPES:
            raise ValidationError(
                f"Unsupported artifact type '{artifact_type}'. "
                f"Supported: {', '.join(ARTIFACT_TYPES)}."
            )
        # Validates project existence (raises NotFoundError).
        project = self.sdlc._project(project_id)  # noqa: SLF001 (intentional reuse)
        phase, desc = ARTIFACT_TYPES[artifact_type]
        # Resolve a builder; fall back to a phase-aware generic builder for new
        # enterprise artifact types that do not have a bespoke builder yet.
        builder = self._builders().get(artifact_type)
        if builder is None:
            sections, summary = self._generic_artifact(project_id, artifact_type, phase, desc)
        else:
            sections, summary = builder(project_id)
        reference = f"{project.code}-{artifact_type.replace(' ', '').upper()[:6]}-001"
        # Phase 5: wrap the domain sections in a professional enterprise envelope
        # (business context, scope, assumptions, dependencies, risks, then the
        # domain content, then traceability, approval and appendix).
        sections = self._professional_envelope(
            project, artifact_type, desc, sections, reference, prompt_reference
        )
        return GeneratedArtifact(
            artifact_type=artifact_type,
            title=f"{project.name} — {desc}",
            project_id=project_id,
            project_name=project.name,
            reference=reference,
            generated_by=author,
            author=author,
            generated_at=_now(),
            prompt_reference=prompt_reference,
            project_reference=project.code,
            executive_summary=summary,
            sections=sections,
        )

    def _professional_envelope(
        self, project, artifact_type: str, desc: str,
        domain_sections: list[ArtifactSection], reference: str, prompt_reference: str | None,
    ) -> list[ArtifactSection]:
        """Ensure every artifact carries a professional, enterprise-grade structure.

        Standard front/back matter is added only when the builder didn't already
        provide an equivalent heading (case-insensitive), so no duplication.
        """
        existing = {s.heading.strip().lower() for s in domain_sections}

        def has(*names: str) -> bool:
            return any(n.lower() in existing for n in names)

        front: list[ArtifactSection] = []
        front.append(ArtifactSection(
            heading="Document Control", level=1,
            body=(f"Artifact: {desc}\nReference: {reference}\nProject: {project.name} ({project.code})\n"
                  f"Version: 1.0\nAuthor: AI SDLC Copilot\nReview Status: Draft — pending review"
                  + (f"\nPrompt Reference: {prompt_reference}" if prompt_reference else "")),
        ))
        if not has("business context", "overview"):
            front.append(ArtifactSection(
                heading="Business Context", level=1,
                body=f"{desc} for {project.name}, aligned to banking and regulatory expectations."))
        if not has("scope"):
            front.append(ArtifactSection(
                heading="Scope", level=1,
                body="In scope: the capability described by this artifact. Out of scope: unrelated systems."))
        if not has("assumptions"):
            front.append(ArtifactSection(
                heading="Assumptions", level=1, body="",
                bullets=["Core banking APIs are available", "Regulatory windows and controls apply",
                         "Environments and access are provisioned"]))
        if not has("dependencies"):
            front.append(ArtifactSection(
                heading="Dependencies", level=1, body="",
                bullets=["Core banking / ledger services", "NPCI / network integration where relevant",
                         "Notification and audit platforms"]))
        if not has("risks", "risk register", "risk factors"):
            front.append(ArtifactSection(
                heading="Risks", level=1, body="",
                bullets=["Integration/timeout failures", "Reconciliation or data mismatch",
                         "Regulatory non-compliance if controls are missed"]))

        back: list[ArtifactSection] = []
        if not has("traceability", "traceability matrix"):
            back.append(ArtifactSection(
                heading="Traceability", level=1,
                body=f"Traced to project {project.code}"
                     + (f" and prompt {prompt_reference}" if prompt_reference else "")
                     + ". Linked to requirements, design, tests and evidence where applicable."))
        back.append(ArtifactSection(
            heading="Approval", level=1, body="",
            bullets=["Business Sponsor — pending", "Solution Architect — pending",
                     "QA Lead — pending", "Risk & Compliance — pending"]))
        back.append(ArtifactSection(
            heading="Review Status", level=1,
            body="Draft — generated by AI SDLC Copilot; awaiting AI review and human sign-off."))
        back.append(ArtifactSection(
            heading="Appendix", level=1,
            body="Glossary, references and supporting data. RBI/NPCI/PCI-DSS controls as applicable."))

        return front + domain_sections + back

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
            # Enterprise additions (Phase B): bespoke where high-value, else reuse.
            "PRD": self._brd,
            "Vision Document": self._vision_document,
            "Business Case": self._business_case,
            "Stakeholder Matrix": self._stakeholder_matrix,
            "Architecture Decision Record": self._adr,
            "Rollback Plan": self._rollback_guide,
            "Go Live Plan": self._go_live_checklist,
            "Support Runbook": self._operational_runbook,
            "Risk Register": self._risk_register,
            "Release Notes": self._release_notes,
            "Implementation Roadmap": self._implementation_roadmap,
            "UAT Plan": self._uat_plan,
            "Test Scenarios": self._test_cases,
            "Regression Plan": self._regression_plan,
        }

    # --- generic phase-aware fallback (for enterprise types without a bespoke builder) ---
    def _generic_artifact(self, pid: int, artifact_type: str, phase: str | None, desc: str):
        """Compose a reasonable artifact from the relevant SDLC summary."""
        project = self.sdlc._project(pid)  # noqa: SLF001
        summary_map = {
            "requirements": self.sdlc.requirement_summary,
            "architecture": self.sdlc.architecture_summary,
            "development": self.sdlc.development_summary,
            "testing": self.sdlc.testing_summary,
            "release": self.sdlc.release_summary,
            "audit": self.sdlc.audit_summary,
        }
        sections = [
            ArtifactSection(heading="Overview", body=(
                f"{desc} for {project.name}, derived from the {phase or 'executive'} "
                f"phase of the AI SDLC orchestration.")),
        ]
        fn = summary_map.get(phase or "")
        if fn is not None:
            data = fn(pid)
            findings = getattr(data, "findings", [])
            recs = getattr(data, "recommendations", [])
            if findings:
                sections.append(ArtifactSection(
                    heading="Key Findings", body="",
                    bullets=[f.title for f in findings[:10]]))
            if recs:
                sections.append(ArtifactSection(
                    heading="Recommendations", body="",
                    bullets=[r.title for r in recs[:10]]))
            sections.append(ArtifactSection(
                heading="Readiness", body=f"Phase score {getattr(data, 'score', 'n/a')}/100 "
                f"({getattr(data, 'readiness', 'n/a')})."))
        return sections, f"{desc} for {project.name}."

    # --- Phase B bespoke builders ---
    def _vision_document(self, pid: int):
        s = self.sdlc.requirement_summary(pid)
        e = self.sdlc.executive_summary(pid)
        sections = [
            ArtifactSection(heading="Vision", body=(
                f"Deliver {s.project.name} capabilities that improve customer outcomes and "
                f"operational resilience, aligned to RBI/NPCI expectations.")),
            ArtifactSection(heading="Business Objectives", body="",
                            bullets=[r.title for r in s.business_requirements] or ["Deliver the requested capability."]),
            ArtifactSection(heading="Success Measures", body="",
                            bullets=[f"Overall AI SDLC readiness target ≥ 85 (current {e.overall_score})",
                                     f"Business value {e.business_value}", f"Compliance {e.compliance_score}"]),
        ]
        return sections, f"Vision Document for {s.project.name}."

    def _business_case(self, pid: int):
        e = self.sdlc.executive_summary(pid)
        sections = [
            ArtifactSection(heading="Problem & Opportunity", body=e.executive_summary),
            ArtifactSection(heading="Expected Benefits", body="",
                            bullets=[f"Business value index {e.business_value}",
                                     f"Productivity uplift {e.productivity_uplift_pct}%",
                                     f"Manual effort saved {e.manual_effort_saved_days} days",
                                     f"{e.documentation_pages} pages of documentation generated"]),
            ArtifactSection(heading="Investment & Risk", body=f"Risk score {e.risk_score}; compliance {e.compliance_score}."),
            ArtifactSection(heading="Recommendation", body="",
                            bullets=[r.title for r in e.top_recommendations]),
        ]
        return sections, f"Business Case for {e.project.name}."

    def _stakeholder_matrix(self, pid: int):
        project = self.sdlc._project(pid)  # noqa: SLF001
        sections = [
            ArtifactSection(heading="Stakeholders", body="RACI-style stakeholder mapping for the initiative.",
                            bullets=[
                                "Business Sponsor — Accountable",
                                "Product Owner — Responsible",
                                "Solution Architect — Responsible",
                                "Engineering Lead — Responsible",
                                "QA Lead — Consulted",
                                "Risk & Compliance — Consulted",
                                "Operations — Informed",
                                "Internal Audit — Informed",
                            ]),
        ]
        return sections, f"Stakeholder Matrix for {project.name}."

    def _adr(self, pid: int):
        a = self.sdlc.architecture_summary(pid)
        sections = [
            ArtifactSection(heading="Context", body="Key architectural decisions for the solution."),
            ArtifactSection(heading="Decisions", body="",
                            bullets=[f"{v.title}" for v in a.overview] or ["Event-driven, resilient, idempotent design."]),
            ArtifactSection(heading="Consequences", body="",
                            bullets=[r.title for r in a.recommendations]),
        ]
        return sections, f"Architecture Decision Records for {a.project.name}."

    def _risk_register(self, pid: int):
        au = self.sdlc.audit_summary(pid)
        cop_findings = au.findings
        sections = [
            ArtifactSection(heading="Risk Register", body="Identified risks with severity.",
                            bullets=[f"[{o.severity}] {o.observation}" for o in au.observations]
                                    or [f"[{f.severity}] {f.title}" for f in cop_findings[:10]]
                                    or ["No open risks recorded."]),
        ]
        return sections, f"Risk Register for {au.project.name}."

    def _release_notes(self, pid: int):
        r = self.sdlc.release_summary(pid)
        sections = [
            ArtifactSection(heading="Releases", body="",
                            bullets=[f"{rel.reference}: {rel.name} (v{rel.version}, {rel.status})" for rel in r.release_plan]),
            ArtifactSection(heading="Highlights", body="",
                            bullets=[rec.title for rec in r.recommendations] or ["Stability and resilience improvements."]),
        ]
        return sections, f"Release Notes for {r.project.name}."

    def _implementation_roadmap(self, pid: int):
        e = self.sdlc.executive_summary(pid)
        sections = [
            ArtifactSection(heading="Roadmap", body="Phased implementation aligned to the AI SDLC.",
                            bullets=[f"{p.phase.title()} — score {p.score}/100 ({p.readiness})" for p in e.phase_scores]),
            ArtifactSection(heading="Next Steps", body="",
                            bullets=[r.title for r in e.top_recommendations]),
        ]
        return sections, f"Implementation Roadmap for {e.project.name}."

    def _uat_plan(self, pid: int):
        t = self.sdlc.testing_summary(pid)
        sections = [
            ArtifactSection(heading="UAT Scope", body=f"User acceptance across {t.coverage.total_cases} scenarios."),
            ArtifactSection(heading="UAT Scenarios", body="",
                            bullets=[f"{c.reference}: {c.title}" for c in t.test_cases[:15]]),
            ArtifactSection(heading="Sign-off", body="Product Owner · Compliance · Operations sign-off required."),
        ]
        return sections, f"UAT Plan for {t.project.name}."

    def _regression_plan(self, pid: int):
        t = self.sdlc.testing_summary(pid)
        sections = [
            ArtifactSection(heading="Regression Scope", body="",
                            bullets=[c.title for c in t.regression[:15]] or [c.title for c in t.test_cases[:10]]),
            ArtifactSection(heading="Automation", body=f"{t.coverage.automation_pct}% automated; run nightly."),
        ]
        return sections, f"Regression Plan for {t.project.name}."

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
        # Structured, professional test cases: id · precondition · steps · expected.
        sections: list[ArtifactSection] = [
            ArtifactSection(heading="Test Case Structure",
                            body="Each case: Test ID · Type · Precondition · Steps · Expected Result."),
        ]
        for t in s.test_cases[:25]:
            ttype = getattr(t.test_type, "value", str(t.test_type))
            sections.append(ArtifactSection(
                heading=f"{t.reference} — {t.title}", level=2,
                body=f"Type: {ttype}",
                bullets=[
                    f"Precondition: {ttype} preconditions for {s.project.name} are met",
                    f"Steps: {t.steps or '1. Set up data 2. Execute the scenario 3. Verify outcome'}",
                    f"Expected Result: {t.expected_result or 'Outcome matches specification within SLA'}",
                ],
            ))
        return sections, f"Test Cases for {s.project.name}: {len(s.test_cases)} structured cases."

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
