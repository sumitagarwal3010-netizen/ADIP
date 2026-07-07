"""Traceability-enhancement (Phase 6) and executive-analytics (Phase 7) endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import analytics as dto
from app.services.analytics_service import AnalyticsService

router = APIRouter(tags=["AI SDLC · Analytics"])


def get_service(db: Session = Depends(get_db)) -> AnalyticsService:
    return AnalyticsService(db)


# --- Phase 6: traceability matrix + impact ---
@router.get("/traceability/projects/{project_id}/matrix", response_model=dto.TraceabilityMatrix)
def traceability_matrix(project_id: int, service: AnalyticsService = Depends(get_service)):
    """Requirement → development → test coverage matrix for a project."""
    return service.traceability_matrix(project_id)


@router.get("/traceability/projects/{project_id}/impact", response_model=dto.ImpactAnalysis)
def impact_analysis(
    project_id: int,
    requirement_id: int = Query(..., description="Requirement to analyze impact for."),
    service: AnalyticsService = Depends(get_service),
):
    """Upstream/downstream impact analysis for a requirement."""
    return service.impact_analysis(project_id, requirement_id)


# --- Phase 7: executive analytics ---
@router.get("/analytics/portfolio-health", response_model=dto.PortfolioHealth)
def portfolio_health(service: AnalyticsService = Depends(get_service)):
    """Portfolio health across all projects (scores, bands, healthy vs at-risk)."""
    return service.portfolio_health()


@router.get("/analytics/risk-rollup", response_model=dto.RiskRollup)
def risk_rollup(service: AnalyticsService = Depends(get_service)):
    """Portfolio risk rollup: open/critical counts and total exposure."""
    return service.risk_rollup()


@router.get("/analytics/projects/{project_id}/engineering-kpis", response_model=dto.EngineeringKpis)
def engineering_kpis(project_id: int, service: AnalyticsService = Depends(get_service)):
    """Engineering KPIs: velocity, coverage, defects, automation."""
    return service.engineering_kpis(project_id)


@router.get("/analytics/projects/{project_id}/value", response_model=dto.ValueMetrics)
def value_metrics(project_id: int, service: AnalyticsService = Depends(get_service)):
    """Business value metrics for a project."""
    return service.value_metrics(project_id)


@router.get("/analytics/projects/{project_id}/trend", response_model=dto.ExecutiveTrend)
def executive_trend(
    project_id: int,
    metric: str = Query("overall_score", description="overall_score|business_value|risk_score|compliance_score|ai_confidence"),
    service: AnalyticsService = Depends(get_service),
):
    """Executive metric trend across scoring snapshots."""
    return service.executive_trend(project_id, metric)
