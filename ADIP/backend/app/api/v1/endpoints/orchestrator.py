"""Prompt Execution Engine endpoint — the single orchestration entry point.

`POST /api/v1/orchestrator/execute` accepts one business prompt and returns the
entire AI SDLC orchestration (classification → all phases → copilots →
executive → artifacts → traceability), composed from existing services.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.orchestrator import OrchestrationRequest, OrchestrationResponse
from app.services.orchestrator_service import (
    COPILOT_SLUGS,
    DEFAULT_ARTIFACTS,
    PromptExecutionEngine,
)

router = APIRouter(prefix="/orchestrator", tags=["Prompt Orchestration"])


def get_engine(db: Session = Depends(get_db)) -> PromptExecutionEngine:
    return PromptExecutionEngine(db)


@router.post("/execute", response_model=OrchestrationResponse)
def execute(
    request: OrchestrationRequest,
    engine: PromptExecutionEngine = Depends(get_engine),
) -> OrchestrationResponse:
    """Run the full AI SDLC orchestration for a single business prompt."""
    return engine.execute(request)


@router.get("/capabilities")
def capabilities() -> dict:
    """Describe what the orchestrator produces (copilots + default artifacts)."""
    return {
        "copilots": list(COPILOT_SLUGS.keys()),
        "default_artifacts": DEFAULT_ARTIFACTS,
        "reasoner": "mock (provider-independent; LLM-ready)",
        "flow": [
            "classification", "requirements", "architecture", "development",
            "testing", "release", "go_live", "audit", "executive",
            "artifacts", "traceability",
        ],
    }
