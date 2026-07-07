"""Schemas for the audit module."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import ComplianceStatus, Severity
from app.schemas.common import TimestampSchema


class AuditEvidenceBase(BaseModel):
    project_id: int
    reference: str = Field(max_length=40)
    evidence_type: str = Field(max_length=80)
    title: str = Field(max_length=300)
    detail: Optional[str] = None
    status: str = "Pending"
    retention_years: Optional[int] = None


class AuditEvidenceCreate(AuditEvidenceBase):
    pass


class AuditEvidenceUpdate(BaseModel):
    project_id: Optional[int] = None
    reference: Optional[str] = None
    evidence_type: Optional[str] = None
    title: Optional[str] = None
    detail: Optional[str] = None
    status: Optional[str] = None
    retention_years: Optional[int] = None


class AuditEvidenceRead(AuditEvidenceBase, TimestampSchema):
    id: int


class ComplianceRecordBase(BaseModel):
    evidence_id: int
    framework: str = Field(max_length=80)
    control_reference: str = Field(max_length=120)
    status: ComplianceStatus = ComplianceStatus.NOT_ASSESSED
    notes: Optional[str] = None


class ComplianceRecordCreate(ComplianceRecordBase):
    pass


class ComplianceRecordUpdate(BaseModel):
    evidence_id: Optional[int] = None
    framework: Optional[str] = None
    control_reference: Optional[str] = None
    status: Optional[ComplianceStatus] = None
    notes: Optional[str] = None


class ComplianceRecordRead(ComplianceRecordBase, TimestampSchema):
    id: int


class AuditObservationBase(BaseModel):
    evidence_id: int
    severity: Severity = Severity.MEDIUM
    observation: str
    recommendation: Optional[str] = None


class AuditObservationCreate(AuditObservationBase):
    pass


class AuditObservationUpdate(BaseModel):
    evidence_id: Optional[int] = None
    severity: Optional[Severity] = None
    observation: Optional[str] = None
    recommendation: Optional[str] = None


class AuditObservationRead(AuditObservationBase, TimestampSchema):
    id: int
