"""Requirements module: requirements (all types) + requirement analysis."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import RequirementStatus, RequirementType, Severity


class Requirement(Base, TimestampMixin):
    """A single requirement of any type.

    Covers Business, Functional, Non-Functional requirements, Assumptions,
    Dependencies and Acceptance Criteria via ``requirement_type``.
    """

    __tablename__ = "requirements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    requirement_type: Mapped[RequirementType] = mapped_column(String(30), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    detail: Mapped[Optional[str]] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(String(10), default="P2")
    status: Mapped[RequirementStatus] = mapped_column(
        String(20), default=RequirementStatus.DRAFT, nullable=False
    )
    acceptance_criteria: Mapped[Optional[str]] = mapped_column(Text)
    quality_score: Mapped[Optional[int]] = mapped_column(Integer)

    analysis: Mapped[list["RequirementAnalysis"]] = relationship(
        back_populates="requirement", cascade="all, delete-orphan"
    )


class RequirementAnalysis(Base, TimestampMixin):
    """AI analysis / gap analysis for a requirement."""

    __tablename__ = "requirement_analysis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    requirement_id: Mapped[int] = mapped_column(
        ForeignKey("requirements.id", ondelete="CASCADE"), nullable=False, index=True
    )
    issue_type: Mapped[str] = mapped_column(String(60), nullable=False)
    severity: Mapped[Severity] = mapped_column(String(20), default=Severity.MEDIUM)
    finding: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[Optional[str]] = mapped_column(Text)
    gap: Mapped[Optional[str]] = mapped_column(Text)

    requirement: Mapped[Requirement] = relationship(back_populates="analysis")
