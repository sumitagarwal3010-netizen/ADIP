"""DTOs for the artifact quality scoring engine (Phase 3)."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel


class DimensionScore(BaseModel):
    dimension: str
    score: int
    weight: int
    note: Optional[str] = None


class SectionScore(BaseModel):
    heading: str
    score: int
    issues: list[str] = []


class QualityScoreRequest(BaseModel):
    """Score an artifact by generating it, or score a provided artifact body."""

    project_id: Optional[int] = None
    artifact_type: str


class BatchQualityRequest(BaseModel):
    project_id: int
    artifact_types: list[str]


class QualityScoreReport(BaseModel):
    artifact_type: str
    reference: str
    overall_score: int
    quality_band: str
    dimension_scores: list[DimensionScore]
    section_scores: list[SectionScore]
    missing_sections: list[str]
    improvement_suggestions: list[str]
    risk_notes: list[str]


class BatchQualityReport(BaseModel):
    project_id: int
    average_score: int
    reports: list[QualityScoreReport]


class QualityRule(BaseModel):
    dimension: str
    weight: int
    description: str


class QualityRuleList(BaseModel):
    total_weight: int
    rules: list[QualityRule]
