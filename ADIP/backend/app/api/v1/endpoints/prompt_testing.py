"""Prompt testing / history / benchmark / analytics endpoints (Phase G)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import prompt_testing as dto
from app.services.prompt_testing import PromptTestingService

router = APIRouter(prefix="/prompt-testing", tags=["Prompt Testing"])


def get_service(db: Session = Depends(get_db)) -> PromptTestingService:
    return PromptTestingService(db)


@router.post("/run", response_model=dto.PromptRunResult)
def run_prompt(request: dto.PromptRunRequest, service: PromptTestingService = Depends(get_service)):
    """Execute a prompt through the Prompt Execution Engine and capture metrics."""
    return service.run(request)


@router.get("/history", response_model=dto.PromptHistory)
def history(limit: int = Query(50, ge=1, le=500), service: PromptTestingService = Depends(get_service)):
    """Recent prompt run history."""
    return service.history(limit)


@router.get("/statistics", response_model=dto.PromptStatistics)
def statistics(service: PromptTestingService = Depends(get_service)):
    """Aggregate prompt execution analytics."""
    return service.statistics()


@router.get("/compare", response_model=dto.PromptComparison)
def compare(
    run_a: str = Query(..., description="First run id."),
    run_b: str = Query(..., description="Second run id."),
    service: PromptTestingService = Depends(get_service),
):
    """Compare two prompt runs (versions)."""
    return service.compare(run_a, run_b)


@router.post("/benchmark", response_model=dto.BenchmarkReport)
def benchmark(request: dto.BenchmarkRequest, service: PromptTestingService = Depends(get_service)):
    """Run a benchmark across prompts/iterations and produce a report."""
    return service.benchmark(request)


@router.get("/{run_id}", response_model=dto.PromptRunResult)
def get_run(run_id: str, service: PromptTestingService = Depends(get_service)):
    """Fetch a single prompt run result."""
    return service.get_run(run_id)
