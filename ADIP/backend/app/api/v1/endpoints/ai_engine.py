"""AI engineering meta endpoints (Role 6)."""
from __future__ import annotations

from fastapi import APIRouter

from app.ai.artifact_ops import ArtifactComparer, ArtifactImprover, ArtifactReviewer
from app.ai.planning_engine import PlanningEngine
from app.ai.reasoning_engine import ReasoningEngine
from app.ai.reflection_engine import ReflectionEngine
from app.schemas.ai_engine import AnalyzeRequest, CompareArtifactsRequest, ReviewArtifactRequest

router = APIRouter(prefix="/ai-engine", tags=["AI Engineering"])


@router.post("/analyze")
def analyze_prompt(body: AnalyzeRequest) -> dict:
    reasoning = ReasoningEngine(body.strategy).analyze(body.prompt)
    plan = PlanningEngine().plan(reasoning)
    reflection = ReflectionEngine().reflect(reasoning, plan)
    return {
        "classification": reasoning.classification.__dict__,
        "strategy": reasoning.strategy.value,
        "steps": reasoning.steps,
        "confidence": reasoning.confidence,
        "plan": [{"phase": s.phase, "action": s.action, "artifact": s.artifact} for s in plan.steps],
        "reflection": {
            "valid": reflection.valid,
            "issues": reflection.issues,
            "improvements": reflection.improvements,
            "adjusted_confidence": reflection.adjusted_confidence,
        },
    }


@router.post("/review-artifact")
def review_artifact(body: ReviewArtifactRequest) -> dict:
    review = ArtifactReviewer().review(body.content, body.artifact_type)
    improved = ArtifactImprover().improve(body.content, review)
    return {"review": review.__dict__, "improved_preview": improved[:500]}


@router.post("/compare-artifacts")
def compare_artifacts(body: CompareArtifactsRequest) -> dict:
    return ArtifactComparer().compare(body.left, body.right).__dict__
