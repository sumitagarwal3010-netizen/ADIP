"""AI Reviewer / Critic endpoints (Phase 4)."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.ai_review import (
    ArtifactReview,
    ImprovedArtifact,
    ImproveRequest,
    ReviewRequest,
    ReviewRunRequest,
    ReviewRunResult,
)
from app.services.ai_reviewer import AIReviewer

router = APIRouter(prefix="/ai-review", tags=["AI Reviewer"])


def get_reviewer(db: Session = Depends(get_db)) -> AIReviewer:
    return AIReviewer(db)


@router.post("/review-artifact", response_model=ArtifactReview)
def review_artifact(request: ReviewRequest, reviewer: AIReviewer = Depends(get_reviewer)):
    """Generate and critically review an artifact (deterministic or Ollama)."""
    return reviewer.review(request.project_id, request.artifact_type)


@router.post("/improve-artifact", response_model=ImprovedArtifact)
def improve_artifact(request: ImproveRequest, reviewer: AIReviewer = Depends(get_reviewer)):
    """Review an artifact and return an improved version + applied changes."""
    return reviewer.improve(request.project_id, request.artifact_type)


@router.post("/review-run", response_model=ReviewRunResult)
def review_run(request: ReviewRunRequest, reviewer: AIReviewer = Depends(get_reviewer)):
    """Run a prompt through the orchestrator and review all generated artifacts."""
    return reviewer.review_run(request.prompt, request.project)
