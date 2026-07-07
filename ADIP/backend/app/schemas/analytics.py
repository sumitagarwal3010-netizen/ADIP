"""DTOs for Phase 6 traceability enhancements and Phase 7 executive analytics."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel

from app.schemas.sdlc import ProjectRef


# --- Traceability matrix / impact / coverage ---
class TraceabilityMatrixRow(BaseModel):
    requirement_id: int
    requirement_reference: str
    requirement_title: str
    architecture_refs: list[str]
    development_refs: list[str]
    test_refs: list[str]
    covered: bool


class TraceabilityMatrix(BaseModel):
    project: ProjectRef
    rows: list[TraceabilityMatrixRow]
    total_requirements: int
    covered_requirements: int
    coverage_pct: int


class ImpactAnalysis(BaseModel):
    project: ProjectRef
    entity_type: str
    entity_id: int
    entity_reference: Optional[str]
    upstream: list[dict]
    downstream: list[dict]


# --- Executive analytics ---
class PortfolioHealthItem(BaseModel):
    project: ProjectRef
    overall_score: int
    band: str
    risk_score: int
    compliance_score: int


class PortfolioHealth(BaseModel):
    items: list[PortfolioHealthItem]
    portfolio_score: int
    portfolio_band: str
    healthy: int
    at_risk: int


class RiskRollupItem(BaseModel):
    project_id: int
    project_name: str
    open_risks: int
    critical_risks: int
    total_exposure: float


class RiskRollup(BaseModel):
    items: list[RiskRollupItem]
    total_open: int
    total_critical: int
    total_exposure: float


class EngineeringKpis(BaseModel):
    project: ProjectRef
    total_stories: int
    done_stories: int
    velocity_points: int
    average_coverage: int
    total_defects: int
    open_defects: int
    critical_defects: int
    automation_pct: int


class TrendPoint(BaseModel):
    sequence: int
    label: str
    overall_score: int
    business_value: Optional[int]
    risk_score: Optional[int]
    compliance_score: Optional[int]
    ai_confidence: Optional[int]


class ExecutiveTrend(BaseModel):
    project: ProjectRef
    metric: str
    points: list[TrendPoint]


class ValueMetrics(BaseModel):
    project: ProjectRef
    business_value: int
    productivity_uplift_pct: int
    manual_effort_saved_days: int
    documentation_pages: int
    ai_confidence: int
