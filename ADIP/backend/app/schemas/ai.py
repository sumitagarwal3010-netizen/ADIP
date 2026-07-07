"""Schemas for AI intelligence entities."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import CopilotType, Readiness, RiskStatus, SdlcPhase, Severity
from app.schemas.common import TimestampSchema


class CopilotFindingBase(BaseModel):
    project_id: int
    copilot_type: CopilotType
    phase: SdlcPhase
    badge: Optional[str] = None
    severity: Severity = Severity.MEDIUM
    title: str = Field(max_length=300)
    detail: Optional[str] = None
    reasoning: Optional[str] = None
    confidence: Optional[int] = None
    risk: Optional[str] = None
    readiness: Optional[Readiness] = None


class CopilotFindingCreate(CopilotFindingBase):
    pass


class CopilotFindingUpdate(BaseModel):
    project_id: Optional[int] = None
    copilot_type: Optional[CopilotType] = None
    phase: Optional[SdlcPhase] = None
    badge: Optional[str] = None
    severity: Optional[Severity] = None
    title: Optional[str] = None
    detail: Optional[str] = None
    reasoning: Optional[str] = None
    confidence: Optional[int] = None
    risk: Optional[str] = None
    readiness: Optional[Readiness] = None


class CopilotFindingRead(CopilotFindingBase, TimestampSchema):
    id: int


class AIRecommendationBase(BaseModel):
    project_id: int
    finding_id: Optional[int] = None
    copilot_type: Optional[CopilotType] = None
    badge: Optional[str] = None
    title: str = Field(max_length=300)
    rationale: Optional[str] = None
    impact: Optional[str] = None
    priority: str = "P2"


class AIRecommendationCreate(AIRecommendationBase):
    pass


class AIRecommendationUpdate(BaseModel):
    project_id: Optional[int] = None
    finding_id: Optional[int] = None
    copilot_type: Optional[CopilotType] = None
    badge: Optional[str] = None
    title: Optional[str] = None
    rationale: Optional[str] = None
    impact: Optional[str] = None
    priority: Optional[str] = None


class AIRecommendationRead(AIRecommendationBase, TimestampSchema):
    id: int


class ExecutiveScoreBase(BaseModel):
    project_id: int
    overall_score: int
    band: str = "Conditional"
    business_value: Optional[int] = None
    productivity_uplift_pct: Optional[int] = None
    risk_score: Optional[int] = None
    compliance_score: Optional[int] = None
    ai_confidence: Optional[int] = None
    manual_effort_saved_days: Optional[int] = None
    documentation_pages: Optional[int] = None
    executive_summary: Optional[str] = None
    requirements_score: Optional[int] = None
    architecture_score: Optional[int] = None
    development_score: Optional[int] = None
    testing_score: Optional[int] = None
    release_score: Optional[int] = None
    audit_score: Optional[int] = None


class ExecutiveScoreCreate(ExecutiveScoreBase):
    pass


class ExecutiveScoreUpdate(BaseModel):
    project_id: Optional[int] = None
    overall_score: Optional[int] = None
    band: Optional[str] = None
    business_value: Optional[int] = None
    productivity_uplift_pct: Optional[int] = None
    risk_score: Optional[int] = None
    compliance_score: Optional[int] = None
    ai_confidence: Optional[int] = None
    manual_effort_saved_days: Optional[int] = None
    documentation_pages: Optional[int] = None
    executive_summary: Optional[str] = None
    requirements_score: Optional[int] = None
    architecture_score: Optional[int] = None
    development_score: Optional[int] = None
    testing_score: Optional[int] = None
    release_score: Optional[int] = None
    audit_score: Optional[int] = None


class ExecutiveScoreRead(ExecutiveScoreBase, TimestampSchema):
    id: int


class AIRiskBase(BaseModel):
    project_id: int
    reference: str = Field(max_length=40)
    title: str = Field(max_length=300)
    category: str = "Delivery"
    severity: Severity = Severity.MEDIUM
    likelihood: Optional[str] = None
    impact: Optional[str] = None
    status: RiskStatus = RiskStatus.OPEN
    mitigation: Optional[str] = None
    exposure_value: Optional[float] = None


class AIRiskCreate(AIRiskBase):
    pass


class AIRiskUpdate(BaseModel):
    project_id: Optional[int] = None
    reference: Optional[str] = None
    title: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[Severity] = None
    likelihood: Optional[str] = None
    impact: Optional[str] = None
    status: Optional[RiskStatus] = None
    mitigation: Optional[str] = None
    exposure_value: Optional[float] = None


class AIRiskRead(AIRiskBase, TimestampSchema):
    id: int
