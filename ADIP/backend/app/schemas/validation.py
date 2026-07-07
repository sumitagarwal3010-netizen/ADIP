"""DTOs for artifact quality validation (Phase F)."""
from __future__ import annotations

from pydantic import BaseModel


class ValidationIssue(BaseModel):
    rule: str
    severity: str  # "error" | "warning" | "info"
    message: str


class ArtifactQualityReport(BaseModel):
    artifact_type: str
    reference: str
    passed: bool
    quality_score: int
    checks: dict[str, bool]
    issues: list[ValidationIssue]
    suggestions: list[str]
