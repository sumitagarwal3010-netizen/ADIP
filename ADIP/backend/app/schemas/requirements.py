"""Schemas for the requirements module."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import RequirementStatus, RequirementType, Severity
from app.schemas.common import TimestampSchema


class RequirementBase(BaseModel):
    project_id: int
    reference: str = Field(max_length=40)
    requirement_type: RequirementType
    title: str = Field(max_length=300)
    detail: Optional[str] = None
    priority: str = "P2"
    status: RequirementStatus = RequirementStatus.DRAFT
    acceptance_criteria: Optional[str] = None
    quality_score: Optional[int] = None


class RequirementCreate(RequirementBase):
    pass


class RequirementUpdate(BaseModel):
    project_id: Optional[int] = None
    reference: Optional[str] = None
    requirement_type: Optional[RequirementType] = None
    title: Optional[str] = None
    detail: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[RequirementStatus] = None
    acceptance_criteria: Optional[str] = None
    quality_score: Optional[int] = None


class RequirementRead(RequirementBase, TimestampSchema):
    id: int


class RequirementAnalysisBase(BaseModel):
    requirement_id: int
    issue_type: str = Field(max_length=60)
    severity: Severity = Severity.MEDIUM
    finding: str
    recommendation: Optional[str] = None
    gap: Optional[str] = None


class RequirementAnalysisCreate(RequirementAnalysisBase):
    pass


class RequirementAnalysisUpdate(BaseModel):
    requirement_id: Optional[int] = None
    issue_type: Optional[str] = None
    severity: Optional[Severity] = None
    finding: Optional[str] = None
    recommendation: Optional[str] = None
    gap: Optional[str] = None


class RequirementAnalysisRead(RequirementAnalysisBase, TimestampSchema):
    id: int
