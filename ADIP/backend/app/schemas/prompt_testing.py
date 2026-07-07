"""DTOs for the Prompt Testing Framework (Phase E)."""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class PromptRunRequest(BaseModel):
    prompt: str = Field(min_length=3)
    label: Optional[str] = None
    project: Optional[str] = None


class PromptRunResult(BaseModel):
    run_id: str
    prompt: str
    label: Optional[str]
    scenario: str
    project_name: str
    classification_confidence: int
    prompt_tokens: int
    completion_tokens: int
    artifacts_generated: int
    latency_ms: float
    execution_time: datetime
    error: Optional[str] = None
    reasoning: list[str] = []


class PromptHistory(BaseModel):
    total: int
    results: list[PromptRunResult]


class PromptComparison(BaseModel):
    run_a: PromptRunResult
    run_b: PromptRunResult
    latency_delta_ms: float
    confidence_delta: int
    artifacts_delta: int


class BenchmarkRequest(BaseModel):
    prompts: list[str] = Field(min_length=1)
    iterations: int = Field(default=1, ge=1, le=10)


class BenchmarkReport(BaseModel):
    total_runs: int
    prompts_tested: int
    iterations: int
    avg_latency_ms: float
    p95_latency_ms: float
    avg_confidence: float
    total_artifacts: int
    errors: int
    results: list[PromptRunResult]


class PromptStatistics(BaseModel):
    total_runs: int
    unique_prompts: int
    avg_latency_ms: float
    avg_confidence: float
    total_artifacts: int
    errors: int
    scenarios: dict[str, int]
