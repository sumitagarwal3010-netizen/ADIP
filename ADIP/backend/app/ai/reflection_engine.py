"""Reflection and self-validation engine (Role 6)."""
from __future__ import annotations

from dataclasses import dataclass, field

from app.ai.planning_engine import PlanningResult
from app.ai.reasoning_engine import ReasoningResult


@dataclass
class ReflectionResult:
    valid: bool
    issues: list[str] = field(default_factory=list)
    improvements: list[str] = field(default_factory=list)
    adjusted_confidence: int = 0


class ReflectionEngine:
    """Lightweight self-check over reasoning + plan outputs."""

    def reflect(self, reasoning: ReasoningResult, plan: PlanningResult) -> ReflectionResult:
        issues: list[str] = []
        improvements: list[str] = []
        cls = reasoning.classification

        if cls.risk in ("High", "Critical") and cls.complexity == "Low":
            issues.append("Risk/complexity mismatch — escalate review")
        if plan.estimated_sprints < 1:
            issues.append("Sprint estimate missing")
        if "upi" in cls.matched_keywords and "compliance" not in cls.compliance_impact.lower():
            improvements.append("Add NPCI/RBI compliance mapping for UPI scope")

        if cls.confidence < 70:
            improvements.append("Gather missing NFR and rollback requirements")

        adjusted = max(0, min(100, reasoning.confidence - 5 * len(issues) + 2 * len(improvements)))
        return ReflectionResult(
            valid=len(issues) == 0,
            issues=issues,
            improvements=improvements,
            adjusted_confidence=adjusted,
        )
