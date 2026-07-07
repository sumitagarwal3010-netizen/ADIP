"""Prompt Workbench models (Phase 2): prompts, versions and runs.

Persistent prompt engineering: a Prompt has many Versions (experiments); a Run
records the execution of a specific version with quality/latency/token metrics
and reviewer comments. SQLite (dev) and PostgreSQL (prod) compatible.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin


class WorkbenchPrompt(Base, TimestampMixin):
    """A named prompt under active engineering."""

    __tablename__ = "workbench_prompts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(80), default="General")
    owner: Mapped[Optional[str]] = mapped_column(String(160))

    versions: Mapped[list["WorkbenchPromptVersion"]] = relationship(
        back_populates="prompt", cascade="all, delete-orphan"
    )


class WorkbenchPromptVersion(Base, TimestampMixin):
    """A specific version/experiment of a prompt's text."""

    __tablename__ = "workbench_prompt_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    prompt_id: Mapped[int] = mapped_column(
        ForeignKey("workbench_prompts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    experiment: Mapped[Optional[str]] = mapped_column(String(120))

    prompt: Mapped[WorkbenchPrompt] = relationship(back_populates="versions")
    runs: Mapped[list["WorkbenchRun"]] = relationship(
        back_populates="version", cascade="all, delete-orphan"
    )


class WorkbenchRun(Base, TimestampMixin):
    """A recorded execution of a prompt version with quality metrics."""

    __tablename__ = "workbench_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    version_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("workbench_prompt_versions.id", ondelete="SET NULL"), index=True
    )
    prompt_text: Mapped[str] = mapped_column(Text, nullable=False)
    scenario: Mapped[Optional[str]] = mapped_column(String(80))
    project_name: Mapped[Optional[str]] = mapped_column(String(160))
    model_used: Mapped[str] = mapped_column(String(80), default="mock")
    quality_score: Mapped[Optional[int]] = mapped_column(Integer)
    output_quality: Mapped[Optional[str]] = mapped_column(String(40))
    latency_ms: Mapped[Optional[float]] = mapped_column(Float)
    prompt_tokens: Mapped[Optional[int]] = mapped_column(Integer)
    completion_tokens: Mapped[Optional[int]] = mapped_column(Integer)
    artifact_coverage: Mapped[Optional[int]] = mapped_column(Integer)
    confidence: Mapped[Optional[int]] = mapped_column(Integer)
    reviewer_comments: Mapped[Optional[str]] = mapped_column(Text)
    error: Mapped[Optional[str]] = mapped_column(Text)

    version: Mapped[Optional[WorkbenchPromptVersion]] = relationship(back_populates="runs")
