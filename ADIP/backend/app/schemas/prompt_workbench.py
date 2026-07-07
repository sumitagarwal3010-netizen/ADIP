"""DTOs for the Prompt Workbench (Phase 2)."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.common import TimestampSchema


# --- Prompt ---
class WorkbenchPromptCreate(BaseModel):
    name: str = Field(max_length=200)
    description: Optional[str] = None
    category: str = "General"
    owner: Optional[str] = None
    content: Optional[str] = Field(default=None, description="Optional initial version content.")


class WorkbenchPromptRead(TimestampSchema):
    id: int
    name: str
    description: Optional[str]
    category: str
    owner: Optional[str]
    version_count: int = 0


# --- Version ---
class WorkbenchVersionCreate(BaseModel):
    content: str
    notes: Optional[str] = None
    experiment: Optional[str] = None


class WorkbenchVersionRead(TimestampSchema):
    id: int
    prompt_id: int
    version: int
    content: str
    notes: Optional[str]
    experiment: Optional[str]


# --- Run ---
class WorkbenchRunCreate(BaseModel):
    prompt_text: Optional[str] = Field(default=None, description="Prompt text (or resolve from version_id).")
    version_id: Optional[int] = None
    project: Optional[str] = None
    reviewer_comments: Optional[str] = None


class WorkbenchRunRead(TimestampSchema):
    id: int
    version_id: Optional[int]
    prompt_text: str
    scenario: Optional[str]
    project_name: Optional[str]
    model_used: str
    quality_score: Optional[int]
    output_quality: Optional[str]
    latency_ms: Optional[float]
    prompt_tokens: Optional[int]
    completion_tokens: Optional[int]
    artifact_coverage: Optional[int]
    confidence: Optional[int]
    reviewer_comments: Optional[str]
    error: Optional[str]


class WorkbenchCompareRequest(BaseModel):
    run_id_a: int
    run_id_b: int


class WorkbenchCompareResult(BaseModel):
    run_a: WorkbenchRunRead
    run_b: WorkbenchRunRead
    quality_delta: int
    latency_delta_ms: float
    coverage_delta: int
    confidence_delta: int
    verdict: str
