"""Schemas for the architecture module."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import Severity
from app.schemas.common import TimestampSchema


class ArchitectureBase(BaseModel):
    project_id: int
    reference: str = Field(max_length=40)
    view_type: str = Field(max_length=40)
    title: str = Field(max_length=300)
    detail: Optional[str] = None
    impacted_systems: Optional[str] = None
    readiness_score: Optional[int] = None


class ArchitectureCreate(ArchitectureBase):
    pass


class ArchitectureUpdate(BaseModel):
    project_id: Optional[int] = None
    reference: Optional[str] = None
    view_type: Optional[str] = None
    title: Optional[str] = None
    detail: Optional[str] = None
    impacted_systems: Optional[str] = None
    readiness_score: Optional[int] = None


class ArchitectureRead(ArchitectureBase, TimestampSchema):
    id: int


class ArchitectureReviewBase(BaseModel):
    architecture_id: int
    category: str = Field(max_length=80)
    severity: Severity = Severity.MEDIUM
    finding: str
    recommendation: Optional[str] = None
    verdict: Optional[str] = None


class ArchitectureReviewCreate(ArchitectureReviewBase):
    pass


class ArchitectureReviewUpdate(BaseModel):
    architecture_id: Optional[int] = None
    category: Optional[str] = None
    severity: Optional[Severity] = None
    finding: Optional[str] = None
    recommendation: Optional[str] = None
    verdict: Optional[str] = None


class ArchitectureReviewRead(ArchitectureReviewBase, TimestampSchema):
    id: int
