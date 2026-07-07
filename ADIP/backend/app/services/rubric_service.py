"""Artifact quality rubrics (Phase 6).

Generates a detailed evaluation rubric for every artifact type across the 10
required criteria (completeness, business correctness, architecture correctness,
compliance, security, testing, traceability, maintainability, executive
readability, overall quality) with band descriptors. Reuses the canonical
artifact type/spec catalog — no duplication.
"""
from __future__ import annotations

from app.schemas.rubric import ArtifactRubric, RubricCriterion, RubricList
from app.services.artifact_generator import ARTIFACT_TYPES
from app.services.artifact_spec import get_spec

# 10 criteria with weights (sum = 100) and band descriptors.
_CRITERIA: list[tuple[str, int, str, str, str, str]] = [
    ("Completeness", 14,
     "All required sections present with depth", "Most sections present",
     "Some sections thin/missing", "Major gaps / mostly empty"),
    ("Business Correctness", 12,
     "Business intent & rules fully correct", "Mostly correct",
     "Partially correct", "Incorrect or generic"),
    ("Architecture Correctness", 12,
     "Sound, resilient, integration-aware design", "Reasonable design",
     "Weak/incomplete design", "Flawed or absent design"),
    ("Compliance", 12,
     "All relevant controls mapped (RBI/NPCI/PCI)", "Key controls referenced",
     "Few controls referenced", "No compliance coverage"),
    ("Security", 10,
     "Threats, auth, PII masking addressed", "Some security addressed",
     "Minimal security", "No security considerations"),
    ("Testing", 10,
     "Testable, with functional/negative coverage", "Some testability",
     "Vague/untestable", "No test consideration"),
    ("Traceability", 10,
     "Traced to prompt/requirements/tests", "Partial traceability",
     "Weak references", "No traceability"),
    ("Maintainability", 6,
     "Versioned, structured, clear metadata", "Adequate structure",
     "Poor structure", "Unmaintainable"),
    ("Executive Readability", 6,
     "Concise, decision-oriented summary", "Readable summary",
     "Verbose/unclear", "No usable summary"),
    ("Overall Quality", 8,
     "Enterprise-ready, sign-off worthy", "Good with minor fixes",
     "Needs revision", "Not usable"),
]


def _rubric_for(artifact_type: str) -> ArtifactRubric | None:
    if artifact_type not in ARTIFACT_TYPES:
        return None
    phase, _ = ARTIFACT_TYPES[artifact_type]
    spec = get_spec(artifact_type)
    criteria = [
        RubricCriterion(
            criterion=name, weight=w, excellent=ex, good=gd, average=av, poor=pr,
        )
        for name, w, ex, gd, av, pr in _CRITERIA
    ]
    return ArtifactRubric(
        artifact_type=artifact_type,
        phase=phase or (spec.phase if spec else "requirements"),
        criteria=criteria,
        total_weight=sum(c.weight for c in criteria),
    )


class RubricService:
    def list(self) -> RubricList:
        return RubricList(total=len(ARTIFACT_TYPES), artifact_types=sorted(ARTIFACT_TYPES.keys()))

    def get(self, artifact_type: str) -> ArtifactRubric | None:
        return _rubric_for(artifact_type)


rubric_service = RubricService()
