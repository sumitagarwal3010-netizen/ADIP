"""Deterministic rule engine DTOs."""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

RuleStatus = Literal["pass", "fail", "warning"]


class RuleDefinition(BaseModel):
    id: str
    name: str
    category: str
    description: str
    requires_llm: bool = False


class RuleResult(BaseModel):
    rule_id: str
    name: str
    category: str
    status: RuleStatus
    message: str
    remediation: str = ""
    explainability: dict[str, Any] = Field(default_factory=dict)


class RuleRunRequest(BaseModel):
    artifact_type: str | None = None
    artifact_content: str | None = None
    connector_records: list[dict[str, Any]] = Field(default_factory=list)
    project_id: int = 1
    categories: list[str] = Field(default_factory=list)


class RuleRunReport(BaseModel):
    total: int
    passed: int
    failed: int
    warnings: int
    results: list[RuleResult]
    overall_status: RuleStatus
