"""Artifact business-view endpoints (Phase 3).

Returns the artifact *catalog* grouped by type (BRD, FRD, Architecture
Documents, API Specification, Test Plan, Deployment Guide, Audit Checklist,
Executive Summary, ...) — a business DTO, not raw CRUD rows.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import sdlc as dto
from app.services.sdlc_service import SdlcService

router = APIRouter(prefix="/artifact-catalog", tags=["AI SDLC · Artifacts"])


def get_service(db: Session = Depends(get_db)) -> SdlcService:
    return SdlcService(db)


@router.get("/projects/{project_id}", response_model=dto.ArtifactCatalog)
def artifact_catalog(project_id: int, service: SdlcService = Depends(get_service)):
    """Project artifact catalog grouped by artifact type with counts."""
    return service.artifact_catalog(project_id)
