"""Context builder (Phase 11 — infrastructure only).

Assembles grounding context for a prompt from ADIP's own aggregated data
(via SdlcService) so a future LLM integration can be retrieval-grounded WITHOUT
a vector database. Produces plain text context blocks; no LLM calls.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.services.sdlc_service import SdlcService


class ContextBuilder:
    """Builds text context windows from project SDLC data."""

    def __init__(self, db: Session) -> None:
        self.sdlc = SdlcService(db)

    def requirement_context(self, project_id: int, max_items: int = 15) -> str:
        s = self.sdlc.requirement_summary(project_id)
        lines = [f"Project: {s.project.name} ({s.project.code})", "Requirements:"]
        for r in (s.business_requirements + s.functional_requirements)[:max_items]:
            lines.append(f"- {r.reference}: {r.title}")
        return "\n".join(lines)

    def architecture_context(self, project_id: int, max_items: int = 15) -> str:
        s = self.sdlc.architecture_summary(project_id)
        lines = [f"Project: {s.project.name}", "Architecture views:"]
        for a in s.overview[:max_items]:
            lines.append(f"- {a.reference}: {a.title} ({a.view_type})")
        return "\n".join(lines)

    def executive_context(self, project_id: int) -> str:
        e = self.sdlc.executive_summary(project_id)
        return (
            f"Project: {e.project.name}\n"
            f"Overall score: {e.overall_score}/100 ({e.band})\n"
            f"Business value: {e.business_value}, Risk: {e.risk_score}, Compliance: {e.compliance_score}\n"
            f"Summary: {e.executive_summary}"
        )
