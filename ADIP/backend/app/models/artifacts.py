"""Artifacts + traceability models."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import ApprovalStatus, ArtifactType, SdlcPhase


class Artifact(Base, TimestampMixin):
    """A generated SDLC artifact (BRD, FRD, Architecture Document, etc.)."""

    __tablename__ = "artifacts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    artifact_type: Mapped[ArtifactType] = mapped_column(String(40), nullable=False, index=True)
    phase: Mapped[Optional[SdlcPhase]] = mapped_column(String(20), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    generated_by: Mapped[str] = mapped_column(String(120), default="AI SDLC Copilot")
    model_used: Mapped[str] = mapped_column(String(60), default="Gemini")
    version: Mapped[str] = mapped_column(String(20), default="1.0")
    approval_status: Mapped[ApprovalStatus] = mapped_column(
        String(30), default=ApprovalStatus.PENDING_REVIEW
    )
    file_type: Mapped[str] = mapped_column(String(20), default="docx")
    preview_content: Mapped[Optional[str]] = mapped_column(Text)
    executive_summary: Mapped[Optional[str]] = mapped_column(Text)
    risk_rating: Mapped[Optional[str]] = mapped_column(String(20))


class TraceabilityLink(Base, TimestampMixin):
    """A single edge in the traceability chain.

    Models the flow Prompt → Requirement → Architecture → Development →
    Testing → Release → Audit by linking a source entity to a target entity.
    Each side is described generically by ``(entity_type, entity_id, reference)``
    so any SDLC entity can participate without a rigid FK per phase.
    """

    __tablename__ = "traceability_links"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    chain_id: Mapped[Optional[str]] = mapped_column(String(60), index=True)

    source_type: Mapped[str] = mapped_column(String(60), nullable=False)
    source_id: Mapped[Optional[int]] = mapped_column(Integer)
    source_reference: Mapped[Optional[str]] = mapped_column(String(120))

    target_type: Mapped[str] = mapped_column(String(60), nullable=False)
    target_id: Mapped[Optional[int]] = mapped_column(Integer)
    target_reference: Mapped[Optional[str]] = mapped_column(String(120))

    relationship_type: Mapped[str] = mapped_column(String(60), default="derives")
    detail: Mapped[Optional[str]] = mapped_column(Text)
