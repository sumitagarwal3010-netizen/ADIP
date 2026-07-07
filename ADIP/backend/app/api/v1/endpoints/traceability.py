"""Traceability endpoint (Phase 3): the end-to-end SDLC chain for a project.

Prompt → Requirement → Architecture → Development → Testing → Release →
Go Live → Audit → Evidence, assembled from the traceability_links table.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import sdlc as dto
from app.services.sdlc_service import SdlcService

router = APIRouter(prefix="/traceability", tags=["AI SDLC · Traceability"])


def get_service(db: Session = Depends(get_db)) -> SdlcService:
    return SdlcService(db)


@router.get("/projects/{project_id}/chain", response_model=dto.TraceabilityChain)
def traceability_chain(project_id: int, service: SdlcService = Depends(get_service)):
    """Ordered traceability chain (Prompt → ... → Evidence) plus the raw links."""
    return service.traceability_chain(project_id)
