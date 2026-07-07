"""Schemas for artifacts and traceability."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import ApprovalStatus, ArtifactType, SdlcPhase
from app.schemas.common import TimestampSchema


class ArtifactBase(BaseModel):
    project_id: int
    reference: str = Field(max_length=40)
    name: str = Field(max_length=300)
    artifact_type: ArtifactType
    phase: Optional[SdlcPhase] = None
    description: Optional[str] = None
    generated_by: str = "AI SDLC Copilot"
    model_used: str = "Gemini"
    version: str = "1.0"
    approval_status: ApprovalStatus = ApprovalStatus.PENDING_REVIEW
    file_type: str = "docx"
    preview_content: Optional[str] = None
    executive_summary: Optional[str] = None
    risk_rating: Optional[str] = None


class ArtifactCreate(ArtifactBase):
    pass


class ArtifactUpdate(BaseModel):
    project_id: Optional[int] = None
    reference: Optional[str] = None
    name: Optional[str] = None
    artifact_type: Optional[ArtifactType] = None
    phase: Optional[SdlcPhase] = None
    description: Optional[str] = None
    generated_by: Optional[str] = None
    model_used: Optional[str] = None
    version: Optional[str] = None
    approval_status: Optional[ApprovalStatus] = None
    file_type: Optional[str] = None
    preview_content: Optional[str] = None
    executive_summary: Optional[str] = None
    risk_rating: Optional[str] = None


class ArtifactRead(ArtifactBase, TimestampSchema):
    id: int


class TraceabilityLinkBase(BaseModel):
    project_id: int
    chain_id: Optional[str] = None
    source_type: str = Field(max_length=60)
    source_id: Optional[int] = None
    source_reference: Optional[str] = None
    target_type: str = Field(max_length=60)
    target_id: Optional[int] = None
    target_reference: Optional[str] = None
    relationship_type: str = "derives"
    detail: Optional[str] = None


class TraceabilityLinkCreate(TraceabilityLinkBase):
    pass


class TraceabilityLinkUpdate(BaseModel):
    project_id: Optional[int] = None
    chain_id: Optional[str] = None
    source_type: Optional[str] = None
    source_id: Optional[int] = None
    source_reference: Optional[str] = None
    target_type: Optional[str] = None
    target_id: Optional[int] = None
    target_reference: Optional[str] = None
    relationship_type: Optional[str] = None
    detail: Optional[str] = None


class TraceabilityLinkRead(TraceabilityLinkBase, TimestampSchema):
    id: int
