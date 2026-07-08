"""Prompt regression endpoints (Phase D)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.regression import RegressionReport, RegressionRequest
from app.services.regression_service import RegressionService

router = APIRouter(prefix="/prompt-regression", tags=["Prompt Regression"])


def get_service(db: Session = Depends(get_db)) -> RegressionService:
    return RegressionService(db)


@router.post("/compare", response_model=RegressionReport)
def compare(request: RegressionRequest, service: RegressionService = Depends(get_service)):
    """Compare a candidate prompt against a baseline and flag regressions."""
    return service.compare(request)
