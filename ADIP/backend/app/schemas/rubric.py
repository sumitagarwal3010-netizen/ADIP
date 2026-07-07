"""DTOs for artifact quality rubrics (Phase 6)."""
from __future__ import annotations

from pydantic import BaseModel


class RubricCriterion(BaseModel):
    criterion: str
    weight: int
    excellent: str
    good: str
    average: str
    poor: str


class ArtifactRubric(BaseModel):
    artifact_type: str
    phase: str
    criteria: list[RubricCriterion]
    total_weight: int


class RubricList(BaseModel):
    total: int
    artifact_types: list[str]
