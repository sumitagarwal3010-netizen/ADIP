"""Schemas for platform entities: knowledge, transformation, activity, notifications."""
from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import NotificationLevel
from app.schemas.common import TimestampSchema


class KnowledgeArticleBase(BaseModel):
    project_id: Optional[int] = None
    reference: str = Field(max_length=40)
    title: str = Field(max_length=300)
    category: str = "Lesson Learned"
    summary: Optional[str] = None
    body: Optional[str] = None
    tags: Optional[str] = None
    author: Optional[str] = None


class KnowledgeArticleCreate(KnowledgeArticleBase):
    pass


class KnowledgeArticleUpdate(BaseModel):
    project_id: Optional[int] = None
    reference: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None
    body: Optional[str] = None
    tags: Optional[str] = None
    author: Optional[str] = None


class KnowledgeArticleRead(KnowledgeArticleBase, TimestampSchema):
    id: int


class TransformationProgramBase(BaseModel):
    project_id: Optional[int] = None
    reference: str = Field(max_length=40)
    name: str = Field(max_length=200)
    description: Optional[str] = None
    status: str = "On Track"
    health_score: Optional[int] = None
    benefit_value: Optional[int] = None
    owner: Optional[str] = None
    start_date: Optional[date] = None
    target_date: Optional[date] = None


class TransformationProgramCreate(TransformationProgramBase):
    pass


class TransformationProgramUpdate(BaseModel):
    project_id: Optional[int] = None
    reference: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    health_score: Optional[int] = None
    benefit_value: Optional[int] = None
    owner: Optional[str] = None
    start_date: Optional[date] = None
    target_date: Optional[date] = None


class TransformationProgramRead(TransformationProgramBase, TimestampSchema):
    id: int


class ActivityLogBase(BaseModel):
    project_id: Optional[int] = None
    actor: str = "system"
    action: str = Field(max_length=120)
    entity_type: Optional[str] = None
    entity_reference: Optional[str] = None
    detail: Optional[str] = None


class ActivityLogCreate(ActivityLogBase):
    pass


class ActivityLogUpdate(BaseModel):
    project_id: Optional[int] = None
    actor: Optional[str] = None
    action: Optional[str] = None
    entity_type: Optional[str] = None
    entity_reference: Optional[str] = None
    detail: Optional[str] = None


class ActivityLogRead(ActivityLogBase, TimestampSchema):
    id: int


class NotificationBase(BaseModel):
    project_id: Optional[int] = None
    level: NotificationLevel = NotificationLevel.INFO
    title: str = Field(max_length=200)
    message: Optional[str] = None
    is_read: bool = False


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    project_id: Optional[int] = None
    level: Optional[NotificationLevel] = None
    title: Optional[str] = None
    message: Optional[str] = None
    is_read: Optional[bool] = None


class NotificationRead(NotificationBase, TimestampSchema):
    id: int
