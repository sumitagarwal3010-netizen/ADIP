"""Prompt regression endpoints (Phase D)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.regression import GoldenRegressionReport, RegressionReport, RegressionRequest
from app.services.regression_service import RegressionService

router = APIRouter(prefix="/prompt-regression", tags=["Prompt Regression"])


def get_service(db: Session = Depends(get_db)) -> RegressionService:
    return RegressionService(db)


@router.post("/compare", response_model=RegressionReport)
def compare(request: RegressionRequest, service: RegressionService = Depends(get_service)):
    """Compare a candidate prompt against a baseline and flag regressions."""
    return service.compare(request)


@router.post("/run-golden", response_model=GoldenRegressionReport)
def run_golden_regression(limit: int = 5, service: RegressionService = Depends(get_service)):
    """Run mock golden-dataset regression (no live LLM)."""
    return service.run_golden_mock(limit=limit)
