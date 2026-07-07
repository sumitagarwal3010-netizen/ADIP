"""Release module: releases, deployments, go-live records."""
from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import GoLiveVerdict, ReleaseStatus


class Release(Base, TimestampMixin):
    """A release train for a project."""

    __tablename__ = "releases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    version: Mapped[str] = mapped_column(String(40), default="1.0.0")
    status: Mapped[ReleaseStatus] = mapped_column(
        String(30), default=ReleaseStatus.PLANNED, nullable=False
    )
    deployment_plan: Mapped[Optional[str]] = mapped_column(Text)
    rollback_plan: Mapped[Optional[str]] = mapped_column(Text)
    cab_summary: Mapped[Optional[str]] = mapped_column(Text)
    monitoring_plan: Mapped[Optional[str]] = mapped_column(Text)
    readiness_score: Mapped[Optional[int]] = mapped_column(Integer)
    planned_date: Mapped[Optional[date]] = mapped_column(Date)

    deployments: Mapped[list["Deployment"]] = relationship(
        back_populates="release", cascade="all, delete-orphan"
    )
    go_live: Mapped[list["GoLive"]] = relationship(
        back_populates="release", cascade="all, delete-orphan"
    )


class Deployment(Base, TimestampMixin):
    """A deployment of a release to an environment."""

    __tablename__ = "deployments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    release_id: Mapped[int] = mapped_column(
        ForeignKey("releases.id", ondelete="CASCADE"), nullable=False, index=True
    )
    environment: Mapped[str] = mapped_column(String(60), nullable=False)
    strategy: Mapped[str] = mapped_column(String(60), default="Blue-Green")
    status: Mapped[str] = mapped_column(String(30), default="Pending")
    deployed_by: Mapped[Optional[str]] = mapped_column(String(160))
    notes: Mapped[Optional[str]] = mapped_column(Text)

    release: Mapped[Release] = relationship(back_populates="deployments")


class GoLive(Base, TimestampMixin):
    """A go-live decision record with checklist and verdict."""

    __tablename__ = "go_live"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    release_id: Mapped[int] = mapped_column(
        ForeignKey("releases.id", ondelete="CASCADE"), nullable=False, index=True
    )
    verdict: Mapped[GoLiveVerdict] = mapped_column(
        String(30), default=GoLiveVerdict.CONDITIONAL_GO, nullable=False
    )
    checklist: Mapped[Optional[str]] = mapped_column(Text)
    rationale: Mapped[Optional[str]] = mapped_column(Text)
    approved_by: Mapped[Optional[str]] = mapped_column(String(160))
    go_live_date: Mapped[Optional[date]] = mapped_column(Date)

    release: Mapped[Release] = relationship(back_populates="go_live")
