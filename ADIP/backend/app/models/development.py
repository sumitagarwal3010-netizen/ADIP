"""Development module: user stories, tasks, source code metadata, code review."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import Severity, StoryStatus


class DevelopmentStory(Base, TimestampMixin):
    """A development user story / feature."""

    __tablename__ = "development_stories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requirement_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("requirements.id", ondelete="SET NULL"), index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[StoryStatus] = mapped_column(
        String(20), default=StoryStatus.BACKLOG, nullable=False
    )
    story_points: Mapped[Optional[int]] = mapped_column(Integer)
    assignee: Mapped[Optional[str]] = mapped_column(String(160))
    feature_flag: Mapped[Optional[str]] = mapped_column(String(120))
    readiness_score: Mapped[Optional[int]] = mapped_column(Integer)

    tasks: Mapped[list["DevelopmentTask"]] = relationship(
        back_populates="story", cascade="all, delete-orphan"
    )
    source_code: Mapped[list["SourceCodeMetadata"]] = relationship(
        back_populates="story", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["CodeReview"]] = relationship(
        back_populates="story", cascade="all, delete-orphan"
    )


class DevelopmentTask(Base, TimestampMixin):
    """A task under a development story."""

    __tablename__ = "development_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    story_id: Mapped[int] = mapped_column(
        ForeignKey("development_stories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    status: Mapped[StoryStatus] = mapped_column(
        String(20), default=StoryStatus.BACKLOG, nullable=False
    )
    estimate_hours: Mapped[Optional[int]] = mapped_column(Integer)

    story: Mapped[DevelopmentStory] = relationship(back_populates="tasks")


class SourceCodeMetadata(Base, TimestampMixin):
    """Static-analysis / repo metadata for a story's code changes."""

    __tablename__ = "source_code_metadata"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    story_id: Mapped[int] = mapped_column(
        ForeignKey("development_stories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    repository: Mapped[str] = mapped_column(String(200), nullable=False)
    module: Mapped[Optional[str]] = mapped_column(String(200))
    language: Mapped[Optional[str]] = mapped_column(String(60))
    lines_of_code: Mapped[Optional[int]] = mapped_column(Integer)
    complexity: Mapped[Optional[int]] = mapped_column(Integer)
    coverage_pct: Mapped[Optional[int]] = mapped_column(Integer)
    code_smells: Mapped[Optional[int]] = mapped_column(Integer)

    story: Mapped[DevelopmentStory] = relationship(back_populates="source_code")


class CodeReview(Base, TimestampMixin):
    """A code-review / secure-coding finding on a story."""

    __tablename__ = "code_review"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    story_id: Mapped[int] = mapped_column(
        ForeignKey("development_stories.id", ondelete="CASCADE"), nullable=False, index=True
    )
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    severity: Mapped[Severity] = mapped_column(String(20), default=Severity.MEDIUM)
    finding: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[Optional[str]] = mapped_column(Text)
    is_secure_coding: Mapped[bool] = mapped_column(default=False)

    story: Mapped[DevelopmentStory] = relationship(back_populates="reviews")
