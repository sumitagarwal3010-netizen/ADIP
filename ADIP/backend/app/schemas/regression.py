"""DTOs for the prompt regression framework (Phase D)."""
from __future__ import annotations

from pydantic import BaseModel, Field


class RegressionRequest(BaseModel):
    baseline_prompt: str = Field(min_length=3)
    candidate_prompt: str = Field(min_length=3)
    project: str | None = None
    baseline_label: str = "baseline"
    candidate_label: str = "candidate"


class RegressionMetric(BaseModel):
    metric: str
    baseline: float
    candidate: float
    delta: float
    regressed: bool


class RegressionReport(BaseModel):
    baseline_label: str
    candidate_label: str
    metrics: list[RegressionMetric]
    overall_verdict: str
    regressions: list[str]
    improvements: list[str]
