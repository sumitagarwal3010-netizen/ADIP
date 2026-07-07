"""AI intelligence models: copilot findings, recommendations, executive scores, AI risk."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import (
    CopilotType,
    Readiness,
    RiskStatus,
    SdlcPhase,
    Severity,
)


class CopilotFinding(Base, TimestampMixin):
    """A finding produced by one of the SDLC copilots for a project.

    Carries the copilot's confidence, reasoning, risk and readiness so the
    frontend copilot panels can render the full AI narrative.
    """

    __tablename__ = "copilot_findings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    copilot_type: Mapped[CopilotType] = mapped_column(String(40), nullable=False, index=True)
    phase: Mapped[SdlcPhase] = mapped_column(String(20), nullable=False, index=True)
    badge: Mapped[Optional[str]] = mapped_column(String(120))
    severity: Mapped[Severity] = mapped_column(String(20), default=Severity.MEDIUM)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    detail: Mapped[Optional[str]] = mapped_column(Text)
    reasoning: Mapped[Optional[str]] = mapped_column(Text)
    confidence: Mapped[Optional[int]] = mapped_column(Integer)
    risk: Mapped[Optional[str]] = mapped_column(String(40))
    readiness: Mapped[Optional[Readiness]] = mapped_column(String(30))

    recommendations: Mapped[list["AIRecommendation"]] = relationship(
        back_populates="finding", cascade="all, delete-orphan"
    )


class AIRecommendation(Base, TimestampMixin):
    """An AI recommendation, optionally tied to a specific copilot finding."""

    __tablename__ = "ai_recommendations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    finding_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("copilot_findings.id", ondelete="CASCADE"), index=True
    )
    copilot_type: Mapped[Optional[CopilotType]] = mapped_column(String(40), index=True)
    badge: Mapped[Optional[str]] = mapped_column(String(120))
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    rationale: Mapped[Optional[str]] = mapped_column(Text)
    impact: Mapped[Optional[str]] = mapped_column(String(300))
    priority: Mapped[str] = mapped_column(String(10), default="P2")

    finding: Mapped[Optional[CopilotFinding]] = relationship(back_populates="recommendations")


class ExecutiveScore(Base, TimestampMixin):
    """Aggregated executive intelligence metrics for a project.

    One row per scoring snapshot; the latest row is the current posture.
    """

    __tablename__ = "executive_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    overall_score: Mapped[int] = mapped_column(Integer, nullable=False)
    band: Mapped[str] = mapped_column(String(30), default="Conditional")
    business_value: Mapped[Optional[int]] = mapped_column(Integer)
    productivity_uplift_pct: Mapped[Optional[int]] = mapped_column(Integer)
    risk_score: Mapped[Optional[int]] = mapped_column(Integer)
    compliance_score: Mapped[Optional[int]] = mapped_column(Integer)
    ai_confidence: Mapped[Optional[int]] = mapped_column(Integer)
    manual_effort_saved_days: Mapped[Optional[int]] = mapped_column(Integer)
    documentation_pages: Mapped[Optional[int]] = mapped_column(Integer)
    executive_summary: Mapped[Optional[str]] = mapped_column(Text)

    # Per-phase scores for the executive dashboard.
    requirements_score: Mapped[Optional[int]] = mapped_column(Integer)
    architecture_score: Mapped[Optional[int]] = mapped_column(Integer)
    development_score: Mapped[Optional[int]] = mapped_column(Integer)
    testing_score: Mapped[Optional[int]] = mapped_column(Integer)
    release_score: Mapped[Optional[int]] = mapped_column(Integer)
    audit_score: Mapped[Optional[int]] = mapped_column(Integer)


class AIRisk(Base, TimestampMixin):
    """An AI-identified risk for a project."""

    __tablename__ = "ai_risk"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    category: Mapped[str] = mapped_column(String(80), default="Delivery")
    severity: Mapped[Severity] = mapped_column(String(20), default=Severity.MEDIUM)
    likelihood: Mapped[Optional[str]] = mapped_column(String(20))
    impact: Mapped[Optional[str]] = mapped_column(String(20))
    status: Mapped[RiskStatus] = mapped_column(String(20), default=RiskStatus.OPEN)
    mitigation: Mapped[Optional[str]] = mapped_column(Text)
    exposure_value: Mapped[Optional[float]] = mapped_column(Float)
