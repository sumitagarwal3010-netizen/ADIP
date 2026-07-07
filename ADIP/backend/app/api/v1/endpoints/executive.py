"""Executive endpoints (Phase 3): per-project and portfolio-wide rollups."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import sdlc as dto
from app.services.sdlc_service import SdlcService

router = APIRouter(prefix="/executive", tags=["AI SDLC · Executive"])


def get_service(db: Session = Depends(get_db)) -> SdlcService:
    return SdlcService(db)


@router.get("/projects/{project_id}/summary", response_model=dto.ExecutiveSummaryDTO)
def executive_summary(project_id: int, service: SdlcService = Depends(get_service)):
    """Executive rollup for one project: business value, productivity, compliance,
    risk, AI confidence, engineering health, effort saved, per-phase scores, overall score."""
    return service.executive_summary(project_id)


@router.get("/portfolio", response_model=dto.PortfolioExecutiveDTO)
def portfolio_executive(service: SdlcService = Depends(get_service)):
    """Portfolio-wide executive rollup across all projects."""
    return service.portfolio_executive()
