"""Prompt quality benchmark + optimization endpoints (Phases 3 & 4)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import benchmark as dto
from app.services.benchmark_service import BenchmarkService

router = APIRouter(prefix="/prompt-benchmark", tags=["Prompt Benchmark"])


def get_service(db: Session = Depends(get_db)) -> BenchmarkService:
    return BenchmarkService(db)


@router.post("/run", response_model=dto.PromptBenchmarkReport)
def benchmark(request: dto.PromptBenchmarkRequest, service: BenchmarkService = Depends(get_service)):
    """Benchmark prompt versions across prompt/artifact/reviewer/overall scores."""
    return service.benchmark(request)


@router.post("/optimize", response_model=dto.OptimizationResult)
def optimize(request: dto.OptimizationRequest, service: BenchmarkService = Depends(get_service)):
    """Auto-generate V1/V2/V3 prompt variants, compare, diff and recommend."""
    return service.optimize(request)
