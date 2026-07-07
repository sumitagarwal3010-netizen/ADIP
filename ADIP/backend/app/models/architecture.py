"""Architecture module: architecture artifacts + architecture review."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import Severity


class Architecture(Base, TimestampMixin):
    """An architecture view/asset for a project.

    ``view_type`` distinguishes Logical, Physical, Integration, Sequence,
    API Inventory and Database Design views.
    """

    __tablename__ = "architecture"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    view_type: Mapped[str] = mapped_column(String(40), nullable=False)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    detail: Mapped[Optional[str]] = mapped_column(Text)
    impacted_systems: Mapped[Optional[str]] = mapped_column(Text)
    readiness_score: Mapped[Optional[int]] = mapped_column(Integer)

    reviews: Mapped[list["ArchitectureReview"]] = relationship(
        back_populates="architecture", cascade="all, delete-orphan"
    )


class ArchitectureReview(Base, TimestampMixin):
    """A review finding raised against an architecture asset."""

    __tablename__ = "architecture_review"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    architecture_id: Mapped[int] = mapped_column(
        ForeignKey("architecture.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    severity: Mapped[Severity] = mapped_column(String(20), default=Severity.MEDIUM)
    finding: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[Optional[str]] = mapped_column(Text)
    verdict: Mapped[Optional[str]] = mapped_column(String(30))

    architecture: Mapped[Architecture] = relationship(back_populates="reviews")
