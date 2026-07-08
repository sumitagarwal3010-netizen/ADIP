"""Artifact quality scoring endpoints (Phase 3)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.quality import (
    BatchQualityReport,
    BatchQualityRequest,
    QualityRuleList,
    QualityScoreReport,
    QualityScoreRequest,
)
from app.services.quality_engine import QualityEngine

router = APIRouter(prefix="/artifact-quality", tags=["Artifact Quality"])


def get_engine(db: Session = Depends(get_db)) -> QualityEngine:
    return QualityEngine(db)


@router.get("/rules", response_model=QualityRuleList)
def rules(engine: QualityEngine = Depends(get_engine)):
    """List the quality scoring dimensions and weights."""
    return engine.rules()


@router.post("/score", response_model=QualityScoreReport)
def score(request: QualityScoreRequest, engine: QualityEngine = Depends(get_engine)):
    """Generate and score a single artifact across 14 quality dimensions."""
    return engine.score_generated(request.project_id or 1, request.artifact_type)


@router.post("/batch-score", response_model=BatchQualityReport)
def batch_score(request: BatchQualityRequest, engine: QualityEngine = Depends(get_engine)):
    """Score multiple artifact types for a project."""
    reports = [engine.score_generated(request.project_id, t) for t in request.artifact_types]
    avg = round(sum(r.overall_score for r in reports) / len(reports)) if reports else 0
    return BatchQualityReport(project_id=request.project_id, average_score=avg, reports=reports)


@router.get("/scorecard")
def artifact_scorecard(
    project_id: int = 1,
    artifact_type: str = "BRD",
    db: Session = Depends(get_db),
):
    """Composed quality scorecard: dimensions + rules + rubric."""
    from app.services.quality_scorecard_service import QualityScorecardService
    return QualityScorecardService(db).scorecard(project_id=project_id, artifact_type=artifact_type)
