"""Artifact review / improve / compare / merge (Role 6).

Reuses QualityEngine and AIReviewer semantics without duplicating services.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ArtifactReview:
    score: float
    findings: list[str]
    recommendations: list[str]


@dataclass
class ArtifactComparison:
    left_id: str
    right_id: str
    similarity: float
    diffs: list[str]


class ArtifactReviewer:
    def review(self, content: str, artifact_type: str = "BRD") -> ArtifactReview:
        score = 72.0 + min(20, len(content) / 500)
        findings = []
        if "acceptance criteria" not in content.lower():
            findings.append("Missing explicit acceptance criteria")
        if artifact_type in ("HLD", "LLD") and "integration" not in content.lower():
            findings.append("Integration points not documented")
        return ArtifactReview(
            score=round(score, 1),
            findings=findings,
            recommendations=[f"Expand {artifact_type} section coverage"] if findings else ["Ready for governance"],
        )


class ArtifactImprover:
    def improve(self, content: str, review: ArtifactReview) -> str:
        footer = "\n\n## AI Improvement Notes\n"
        for rec in review.recommendations:
            footer += f"- {rec}\n"
        return content.rstrip() + footer


class ArtifactComparer:
    def compare(self, left: str, right: str, left_id: str = "A", right_id: str = "B") -> ArtifactComparison:
        left_set = set(left.lower().split())
        right_set = set(right.lower().split())
        union = left_set | right_set
        similarity = round(len(left_set & right_set) / len(union) * 100, 1) if union else 100.0
        diffs = [w for w in sorted(union) if (w in left_set) ^ (w in right_set)][:12]
        return ArtifactComparison(left_id=left_id, right_id=right_id, similarity=similarity, diffs=diffs)


class ArtifactMerger:
    def merge(self, primary: str, secondary: str) -> str:
        return primary.rstrip() + "\n\n---\n\n## Merged Supplement\n\n" + secondary.strip()
