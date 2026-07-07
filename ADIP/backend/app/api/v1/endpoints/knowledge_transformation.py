"""Knowledge (Phase 8) and Transformation (Phase 9) business endpoints."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import knowledge_transformation as dto
from app.services.knowledge_service import KnowledgeService, TransformationService

router = APIRouter(tags=["Knowledge & Transformation"])


def get_knowledge(db: Session = Depends(get_db)) -> KnowledgeService:
    return KnowledgeService(db)


def get_transformation(db: Session = Depends(get_db)) -> TransformationService:
    return TransformationService(db)


# --- Phase 8: Knowledge ---
@router.get("/knowledge/overview", response_model=dto.KnowledgeOverview)
def knowledge_overview(service: KnowledgeService = Depends(get_knowledge)):
    """Knowledge base grouped by category (lessons, best practices, playbooks, patterns)."""
    return service.overview()


@router.get("/knowledge/search", response_model=dto.KnowledgeSearchResult)
def knowledge_search(
    q: str = Query(..., min_length=1, description="Search term."),
    service: KnowledgeService = Depends(get_knowledge),
):
    """Full-text search across knowledge articles."""
    return service.search(q)


@router.get("/knowledge/recommendations", response_model=dto.KnowledgeRecommendations)
def knowledge_recommendations(
    project_id: int | None = Query(None, description="Optional project scope."),
    service: KnowledgeService = Depends(get_knowledge),
):
    """Recommended knowledge articles for a project/context."""
    return service.recommendations(project_id)


# --- Phase 9: Transformation ---
@router.get("/transformation/portfolio", response_model=dto.TransformationPortfolio)
def transformation_portfolio(service: TransformationService = Depends(get_transformation)):
    """Transformation program portfolio with health and benefit rollups."""
    return service.portfolio()


@router.get("/transformation/roi", response_model=dto.TransformationRoi)
def transformation_roi(service: TransformationService = Depends(get_transformation)):
    """ROI view across transformation programs."""
    return service.roi()
