"""Planning engine — SDLC phase plan from classification (Role 6)."""
from __future__ import annotations

from dataclasses import dataclass, field

from app.ai.reasoning_engine import ReasoningResult


@dataclass
class PlanStep:
    phase: str
    action: str
    owner: str
    artifact: str


@dataclass
class PlanningResult:
    steps: list[PlanStep] = field(default_factory=list)
    estimated_sprints: int = 0


class PlanningEngine:
    SDLC_TEMPLATE: list[tuple[str, str, str]] = [
        ("requirements", "Author BRD/FRD", "Business Analyst"),
        ("architecture", "Produce HLD/API spec", "Solution Architect"),
        ("development", "Implement services", "Engineering Lead"),
        ("testing", "SIT/UAT + regression", "QA Lead"),
        ("release", "CAB + deployment", "Release Manager"),
        ("audit", "Post-release audit", "Internal Audit"),
    ]

    def plan(self, reasoning: ReasoningResult) -> PlanningResult:
        cls = reasoning.classification
        steps = [
            PlanStep(phase=p, action=a, owner=o, artifact=self._artifact_for(p))
            for p, a, o in self.SDLC_TEMPLATE
        ]
        return PlanningResult(steps=steps, estimated_sprints=cls.sprint_estimate)

    @staticmethod
    def _artifact_for(phase: str) -> str:
        return {
            "requirements": "BRD.docx",
            "architecture": "HLD.docx",
            "development": "API_Spec.yaml",
            "testing": "Test_Strategy.docx",
            "release": "Release_Readiness.docx",
            "audit": "Audit_Checklist.docx",
        }.get(phase, "Artifact.docx")
