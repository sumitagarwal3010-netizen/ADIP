"""Platform models: knowledge articles, transformation programs, activity log, notifications."""
from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base_class import Base, TimestampMixin
from app.models.enums import NotificationLevel


class KnowledgeArticle(Base, TimestampMixin):
    """A knowledge-center article (lessons learned, best practice, playbook...)."""

    __tablename__ = "knowledge_articles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    category: Mapped[str] = mapped_column(String(80), default="Lesson Learned")
    summary: Mapped[Optional[str]] = mapped_column(Text)
    body: Mapped[Optional[str]] = mapped_column(Text)
    tags: Mapped[Optional[str]] = mapped_column(String(300))
    author: Mapped[Optional[str]] = mapped_column(String(160))


class TransformationProgram(Base, TimestampMixin):
    """A transformation program tracked in the Transformation Center."""

    __tablename__ = "transformation_programs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(30), default="On Track")
    health_score: Mapped[Optional[int]] = mapped_column(Integer)
    benefit_value: Mapped[Optional[int]] = mapped_column(Integer)
    owner: Mapped[Optional[str]] = mapped_column(String(160))
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    target_date: Mapped[Optional[date]] = mapped_column(Date)


class ActivityLog(Base, TimestampMixin):
    """An audit/activity log entry describing a system or user action."""

    __tablename__ = "activity_log"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), index=True
    )
    actor: Mapped[str] = mapped_column(String(160), default="system")
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    entity_type: Mapped[Optional[str]] = mapped_column(String(60))
    entity_reference: Mapped[Optional[str]] = mapped_column(String(120))
    detail: Mapped[Optional[str]] = mapped_column(Text)


class Notification(Base, TimestampMixin):
    """A user-facing notification."""

    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("projects.id", ondelete="SET NULL"), index=True
    )
    level: Mapped[NotificationLevel] = mapped_column(
        String(20), default=NotificationLevel.INFO
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    message: Mapped[Optional[str]] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(default=False)
