"""AI SDLC phase-summary endpoints (Phase 3, business DTOs — not CRUD)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import sdlc as dto
from app.services.sdlc_service import SdlcService

router = APIRouter(prefix="/sdlc", tags=["AI SDLC · Summaries"])


def get_service(db: Session = Depends(get_db)) -> SdlcService:
    return SdlcService(db)


@router.get("/projects/{project_id}/requirements/summary", response_model=dto.RequirementSummary)
def requirement_summary(project_id: int, service: SdlcService = Depends(get_service)):
    """Aggregated requirements view: BR/FR/NFR, assumptions, dependencies, AC, gaps, findings, score."""
    return service.requirement_summary(project_id)


@router.get("/projects/{project_id}/architecture/summary", response_model=dto.ArchitectureSummary)
def architecture_summary(project_id: int, service: SdlcService = Depends(get_service)):
    """Aggregated architecture view: logical/physical/integration/API/DB/sequence, findings, score."""
    return service.architecture_summary(project_id)


@router.get("/projects/{project_id}/development/summary", response_model=dto.DevelopmentSummary)
def development_summary(project_id: int, service: SdlcService = Depends(get_service)):
    """Aggregated development view: stories, tasks, code review, secure coding, source metadata, score."""
    return service.development_summary(project_id)


@router.get("/projects/{project_id}/testing/summary", response_model=dto.TestingSummary)
def testing_summary(project_id: int, service: SdlcService = Depends(get_service)):
    """Aggregated testing view: plan, cases, execution, coverage, regression, automation, defects, score."""
    return service.testing_summary(project_id)


@router.get("/projects/{project_id}/release/summary", response_model=dto.ReleaseSummary)
def release_summary(project_id: int, service: SdlcService = Depends(get_service)):
    """Aggregated release view: plan, deployment, rollback, CAB, monitoring, findings, score."""
    return service.release_summary(project_id)


@router.get("/projects/{project_id}/go-live/summary", response_model=dto.GoLiveSummary)
def go_live_summary(project_id: int, service: SdlcService = Depends(get_service)):
    """Aggregated go-live view: checklist, business sign-off, support transition, hypercare, readiness."""
    return service.go_live_summary(project_id)


@router.get("/projects/{project_id}/audit/summary", response_model=dto.AuditSummary)
def audit_summary(project_id: int, service: SdlcService = Depends(get_service)):
    """Aggregated audit view: evidence, compliance, observations, traceability, findings, score."""
    return service.audit_summary(project_id)
