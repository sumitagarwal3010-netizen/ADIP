"""DTOs for the AI Reviewer / Critic (Phase 4)."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel

from app.schemas.artifact_generation import GeneratedArtifact


class ReviewFinding(BaseModel):
    dimension: str
    severity: str  # "critical" | "high" | "medium" | "low" | "info"
    finding: str
    recommendation: str


class ReviewRequest(BaseModel):
    project_id: int
    artifact_type: str


class ArtifactReview(BaseModel):
    artifact_type: str
    reference: str
    reviewer: str            # "deterministic" or "ollama"
    overall_assessment: str
    review_score: int
    findings: list[ReviewFinding]
    strengths: list[str]
    hallucination_risk: str
    missing_assumptions: list[str]
    executive_clarity: str


class ImproveRequest(BaseModel):
    project_id: int
    artifact_type: str


class ImprovedArtifact(BaseModel):
    review: ArtifactReview
    improved: GeneratedArtifact
    changes_applied: list[str]


class ReviewRunRequest(BaseModel):
    prompt: str
    project: Optional[str] = None


class ReviewRunResult(BaseModel):
    prompt: str
    project_name: str
    scenario: str
    artifacts_reviewed: int
    average_review_score: int
    reviews: list[ArtifactReview]
