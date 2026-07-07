"""DTOs for the prompt quality benchmark + optimization (Phases 3 & 4)."""
from __future__ import annotations

from pydantic import BaseModel, Field


class BenchmarkEntry(BaseModel):
    prompt_version: str
    prompt: str
    prompt_score: int
    artifact_score: int
    reviewer_score: int
    latency_ms: float
    input_tokens: int
    output_tokens: int
    overall_score: int


class PromptBenchmarkRequest(BaseModel):
    """Benchmark labelled prompt versions (V1/V2/...) for a scenario."""

    versions: list[str] = Field(min_length=1, description="Prompt version texts, in order.")
    project: str | None = None


class PromptBenchmarkReport(BaseModel):
    entries: list[BenchmarkEntry]
    best_version: str
    best_overall_score: int
    average_overall_score: int


class OptimizationRequest(BaseModel):
    base_prompt: str = Field(min_length=3)
    project: str | None = None


class VersionDiff(BaseModel):
    version: str
    prompt: str
    added: list[str]
    overall_score: int


class OptimizationResult(BaseModel):
    entries: list[BenchmarkEntry]
    diffs: list[VersionDiff]
    best_version: str
    recommendations: list[str]
