"""Artifact quality rubric endpoints (Phase 6)."""
from __future__ import annotations

from fastapi import APIRouter

from app.core.exceptions import NotFoundError
from app.schemas.rubric import ArtifactRubric, RubricList
from app.services.rubric_service import rubric_service

router = APIRouter(prefix="/artifact-rubrics", tags=["Artifact Rubrics"])


@router.get("", response_model=RubricList)
def list_rubrics():
    """List artifact types that have an evaluation rubric."""
    return rubric_service.list()


@router.get("/{artifact_type}", response_model=ArtifactRubric)
def get_rubric(artifact_type: str):
    """Get the detailed evaluation rubric for an artifact type."""
    r = rubric_service.get(artifact_type)
    if r is None:
        raise NotFoundError(f"No rubric for artifact type '{artifact_type}'.")
    return r
