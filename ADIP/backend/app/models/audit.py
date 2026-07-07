"""Audit module: audit evidence, compliance mappings, observations."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import ComplianceStatus, Severity


class AuditEvidence(Base, TimestampMixin):
    """A piece of audit evidence for a project."""

    __tablename__ = "audit_evidence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    evidence_type: Mapped[str] = mapped_column(String(80), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    detail: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="Pending")
    retention_years: Mapped[Optional[int]] = mapped_column(Integer)

    compliance_records: Mapped[list["ComplianceRecord"]] = relationship(
        back_populates="evidence", cascade="all, delete-orphan"
    )
    observations: Mapped[list["AuditObservation"]] = relationship(
        back_populates="evidence", cascade="all, delete-orphan"
    )


class ComplianceRecord(Base, TimestampMixin):
    """A regulatory-control compliance mapping for a piece of evidence."""

    __tablename__ = "compliance_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    evidence_id: Mapped[int] = mapped_column(
        ForeignKey("audit_evidence.id", ondelete="CASCADE"), nullable=False, index=True
    )
    framework: Mapped[str] = mapped_column(String(80), nullable=False)
    control_reference: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[ComplianceStatus] = mapped_column(
        String(30), default=ComplianceStatus.NOT_ASSESSED
    )
    notes: Mapped[Optional[str]] = mapped_column(Text)

    evidence: Mapped[AuditEvidence] = relationship(back_populates="compliance_records")


class AuditObservation(Base, TimestampMixin):
    """An audit observation/finding tied to evidence."""

    __tablename__ = "audit_observations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    evidence_id: Mapped[int] = mapped_column(
        ForeignKey("audit_evidence.id", ondelete="CASCADE"), nullable=False, index=True
    )
    severity: Mapped[Severity] = mapped_column(String(20), default=Severity.MEDIUM)
    observation: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[Optional[str]] = mapped_column(Text)

    evidence: Mapped[AuditEvidence] = relationship(back_populates="observations")
