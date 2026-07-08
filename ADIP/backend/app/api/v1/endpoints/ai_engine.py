"""AI engineering meta endpoints (Role 6)."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.ai.artifact_ops import ArtifactComparer, ArtifactImprover, ArtifactReviewer
from app.ai.planning_engine import PlanningEngine
from app.ai.reasoning_engine import ReasoningEngine
from app.ai.reflection_engine import ReflectionEngine
from app.core.prompt_security import assess_prompt
from app.ml.hallucination import detect_hallucinations
from app.ml.semantic_similarity import similarity_score
from app.schemas.ai_engine import AnalyzeRequest, CompareArtifactsRequest, ReviewArtifactRequest

router = APIRouter(prefix="/ai-engine", tags=["AI Engineering"])


@router.post("/analyze")
def analyze_prompt(body: AnalyzeRequest) -> dict:
    security = assess_prompt(body.prompt)
    if not security.safe:
        raise HTTPException(
            status_code=400,
            detail={"message": "Prompt rejected by security policy", "flags": security.flags},
        )
    reasoning = ReasoningEngine(body.strategy).analyze(security.sanitized)
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
        "security": {"risk_score": security.risk_score, "flags": security.flags},
    }


@router.post("/review-artifact")
def review_artifact(body: ReviewArtifactRequest) -> dict:
    review = ArtifactReviewer().review(body.content, body.artifact_type)
    improved = ArtifactImprover().improve(body.content, review)
    hallucination = detect_hallucinations(body.content)
    return {
        "review": review.__dict__,
        "improved_preview": improved[:500],
        "hallucination": hallucination.__dict__,
    }


@router.post("/compare-artifacts")
def compare_artifacts(body: CompareArtifactsRequest) -> dict:
    comparison = ArtifactComparer().compare(body.left, body.right)
    semantic = similarity_score(body.left, body.right)
    return {
        **comparison.__dict__,
        "semantic_similarity": semantic.score,
        "grounded": semantic.grounded,
    }
