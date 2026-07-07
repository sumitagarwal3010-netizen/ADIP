"""Schemas for the release module."""
from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import GoLiveVerdict, ReleaseStatus
from app.schemas.common import TimestampSchema


class ReleaseBase(BaseModel):
    project_id: int
    reference: str = Field(max_length=40)
    name: str = Field(max_length=200)
    version: str = "1.0.0"
    status: ReleaseStatus = ReleaseStatus.PLANNED
    deployment_plan: Optional[str] = None
    rollback_plan: Optional[str] = None
    cab_summary: Optional[str] = None
    monitoring_plan: Optional[str] = None
    readiness_score: Optional[int] = None
    planned_date: Optional[date] = None


class ReleaseCreate(ReleaseBase):
    pass


class ReleaseUpdate(BaseModel):
    project_id: Optional[int] = None
    reference: Optional[str] = None
    name: Optional[str] = None
    version: Optional[str] = None
    status: Optional[ReleaseStatus] = None
    deployment_plan: Optional[str] = None
    rollback_plan: Optional[str] = None
    cab_summary: Optional[str] = None
    monitoring_plan: Optional[str] = None
    readiness_score: Optional[int] = None
    planned_date: Optional[date] = None


class ReleaseRead(ReleaseBase, TimestampSchema):
    id: int


class DeploymentBase(BaseModel):
    release_id: int
    environment: str = Field(max_length=60)
    strategy: str = "Blue-Green"
    status: str = "Pending"
    deployed_by: Optional[str] = None
    notes: Optional[str] = None


class DeploymentCreate(DeploymentBase):
    pass


class DeploymentUpdate(BaseModel):
    release_id: Optional[int] = None
    environment: Optional[str] = None
    strategy: Optional[str] = None
    status: Optional[str] = None
    deployed_by: Optional[str] = None
    notes: Optional[str] = None


class DeploymentRead(DeploymentBase, TimestampSchema):
    id: int


class GoLiveBase(BaseModel):
    release_id: int
    verdict: GoLiveVerdict = GoLiveVerdict.CONDITIONAL_GO
    checklist: Optional[str] = None
    rationale: Optional[str] = None
    approved_by: Optional[str] = None
    go_live_date: Optional[date] = None


class GoLiveCreate(GoLiveBase):
    pass


class GoLiveUpdate(BaseModel):
    release_id: Optional[int] = None
    verdict: Optional[GoLiveVerdict] = None
    checklist: Optional[str] = None
    rationale: Optional[str] = None
    approved_by: Optional[str] = None
    go_live_date: Optional[date] = None


class GoLiveRead(GoLiveBase, TimestampSchema):
    id: int
