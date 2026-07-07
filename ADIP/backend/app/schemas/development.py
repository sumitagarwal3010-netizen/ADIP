"""Schemas for the development module."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import Severity, StoryStatus
from app.schemas.common import TimestampSchema


class DevelopmentStoryBase(BaseModel):
    project_id: int
    requirement_id: Optional[int] = None
    reference: str = Field(max_length=40)
    title: str = Field(max_length=300)
    description: Optional[str] = None
    status: StoryStatus = StoryStatus.BACKLOG
    story_points: Optional[int] = None
    assignee: Optional[str] = None
    feature_flag: Optional[str] = None
    readiness_score: Optional[int] = None


class DevelopmentStoryCreate(DevelopmentStoryBase):
    pass


class DevelopmentStoryUpdate(BaseModel):
    project_id: Optional[int] = None
    requirement_id: Optional[int] = None
    reference: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[StoryStatus] = None
    story_points: Optional[int] = None
    assignee: Optional[str] = None
    feature_flag: Optional[str] = None
    readiness_score: Optional[int] = None


class DevelopmentStoryRead(DevelopmentStoryBase, TimestampSchema):
    id: int


class DevelopmentTaskBase(BaseModel):
    story_id: int
    title: str = Field(max_length=300)
    status: StoryStatus = StoryStatus.BACKLOG
    estimate_hours: Optional[int] = None


class DevelopmentTaskCreate(DevelopmentTaskBase):
    pass


class DevelopmentTaskUpdate(BaseModel):
    story_id: Optional[int] = None
    title: Optional[str] = None
    status: Optional[StoryStatus] = None
    estimate_hours: Optional[int] = None


class DevelopmentTaskRead(DevelopmentTaskBase, TimestampSchema):
    id: int


class SourceCodeMetadataBase(BaseModel):
    story_id: int
    repository: str = Field(max_length=200)
    module: Optional[str] = None
    language: Optional[str] = None
    lines_of_code: Optional[int] = None
    complexity: Optional[int] = None
    coverage_pct: Optional[int] = None
    code_smells: Optional[int] = None


class SourceCodeMetadataCreate(SourceCodeMetadataBase):
    pass


class SourceCodeMetadataUpdate(BaseModel):
    story_id: Optional[int] = None
    repository: Optional[str] = None
    module: Optional[str] = None
    language: Optional[str] = None
    lines_of_code: Optional[int] = None
    complexity: Optional[int] = None
    coverage_pct: Optional[int] = None
    code_smells: Optional[int] = None


class SourceCodeMetadataRead(SourceCodeMetadataBase, TimestampSchema):
    id: int


class CodeReviewBase(BaseModel):
    story_id: int
    category: str = Field(max_length=80)
    severity: Severity = Severity.MEDIUM
    finding: str
    recommendation: Optional[str] = None
    is_secure_coding: bool = False


class CodeReviewCreate(CodeReviewBase):
    pass


class CodeReviewUpdate(BaseModel):
    story_id: Optional[int] = None
    category: Optional[str] = None
    severity: Optional[Severity] = None
    finding: Optional[str] = None
    recommendation: Optional[str] = None
    is_secure_coding: Optional[bool] = None


class CodeReviewRead(CodeReviewBase, TimestampSchema):
    id: int
