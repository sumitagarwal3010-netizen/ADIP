"""Artifact quality scoring engine (Phase 3).

A professional, multi-dimensional scoring engine that extends the lightweight
artifact validator. Scores a generated artifact across 14 dimensions, produces
section-level scores, an overall score + quality band, improvement suggestions,
missing sections and risk notes. Reuses ArtifactGenerator output and the
canonical artifact spec (required sections) — no duplication.
"""
from __future__ import annotations

import re

from sqlalchemy.orm import Session

from app.schemas.artifact_generation import GeneratedArtifact
from app.schemas.quality import (
    DimensionScore,
    QualityRule,
    QualityRuleList,
    QualityScoreReport,
    SectionScore,
)
from app.services.artifact_generator import ArtifactGenerator
from app.services.artifact_spec import get_spec

_PLACEHOLDER_RE = re.compile(r"\b(tbd|todo|lorem ipsum|placeholder|fixme|xxx)\b", re.IGNORECASE)

_BANKING_TERMS = ("bank", "upi", "npci", "rbi", "payment", "card", "account", "ledger",
                  "reconcil", "settlement", "customer", "transaction", "kyc", "aml")
_COMPLIANCE_TERMS = ("rbi", "pci", "sox", "aml", "kyc", "npci", "compliance", "regulat", "audit")
_SECURITY_TERMS = ("security", "auth", "encrypt", "mask", "pii", "token", "secure", "fraud", "access")
_PERFORMANCE_TERMS = ("performance", "latency", "throughput", "sla", "scalab", "availability", "tps")
_TEST_TERMS = ("test", "coverage", "regression", "uat", "scenario", "validation", "assert")
_TRACE_TERMS = ("requirement", "trace", "reference", "mapping", "linked")

# 14 scoring dimensions with weights (sum = 100).
_DIMENSION_WEIGHTS: dict[str, int] = {
    "completeness": 12,
    "clarity": 8,
    "structure": 8,
    "required_sections": 12,
    "banking_relevance": 8,
    "compliance_coverage": 8,
    "security_coverage": 6,
    "performance_coverage": 6,
    "testability": 6,
    "traceability": 8,
    "maintainability": 4,
    "executive_readability": 4,
    "missing_information": 6,
    "placeholder_detection": 4,
}

_DIMENSION_DESCRIPTIONS: dict[str, str] = {
    "completeness": "Sufficient sections and content depth.",
    "clarity": "Readable, well-phrased content.",
    "structure": "Sections have headings and bodies/bullets.",
    "required_sections": "Presence of the artifact's required sections.",
    "banking_relevance": "Banking-domain-specific content.",
    "compliance_coverage": "References to regulatory controls.",
    "security_coverage": "Security considerations present.",
    "performance_coverage": "Performance/NFR considerations present.",
    "testability": "Testable statements / test content.",
    "traceability": "Prompt/project references and requirement links.",
    "maintainability": "Metadata (version/author) for maintenance.",
    "executive_readability": "Concise executive summary.",
    "missing_information": "No empty sections.",
    "placeholder_detection": "No placeholder text (TBD/TODO).",
}

_BAND = lambda s: "Excellent" if s >= 90 else "Good" if s >= 75 else "Fair" if s >= 60 else "Poor"  # noqa: E731


def _term_score(text: str, terms: tuple[str, ...], floor: int = 40) -> int:
    """Score 0-100 by how many domain terms appear (with a floor)."""
    hits = sum(1 for t in terms if t in text)
    if hits == 0:
        return floor
    return min(100, floor + hits * 15)


class QualityEngine:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.generator = ArtifactGenerator(db)

    def rules(self) -> QualityRuleList:
        return QualityRuleList(
            total_weight=sum(_DIMENSION_WEIGHTS.values()),
            rules=[
                QualityRule(dimension=d, weight=w, description=_DIMENSION_DESCRIPTIONS[d])
                for d, w in _DIMENSION_WEIGHTS.items()
            ],
        )

    def score_generated(self, project_id: int, artifact_type: str) -> QualityScoreReport:
        artifact = self.generator.generate(project_id, artifact_type)
        return self.score_artifact(artifact)

    def score_artifact(self, artifact: GeneratedArtifact) -> QualityScoreReport:
        headings = [s.heading for s in artifact.sections]
        body_text = " ".join(
            [artifact.executive_summary] + [s.body for s in artifact.sections]
            + [b for s in artifact.sections for b in s.bullets]
        )
        lc = body_text.lower()
        total_len = len(body_text)

        # --- dimension scores ---
        dims: dict[str, int] = {}
        dims["completeness"] = min(100, 40 + len(artifact.sections) * 8 + min(30, total_len // 40))
        dims["clarity"] = 85 if total_len > 200 else 65
        structured = sum(1 for s in artifact.sections if s.heading.strip() and (s.body.strip() or s.bullets))
        dims["structure"] = round(100 * structured / max(1, len(artifact.sections)))

        spec = get_spec(artifact.artifact_type)
        missing_sections: list[str] = []
        if spec:
            present = {h.lower() for h in headings}
            required = spec.required_sections
            hit = sum(1 for r in required if any(r.lower() in p or p in r.lower() for p in present))
            dims["required_sections"] = round(100 * hit / max(1, len(required)))
            missing_sections = [
                r for r in required
                if not any(r.lower() in p or p in r.lower() for p in present)
            ]
        else:
            dims["required_sections"] = 70

        dims["banking_relevance"] = _term_score(lc, _BANKING_TERMS)
        dims["compliance_coverage"] = _term_score(lc, _COMPLIANCE_TERMS)
        dims["security_coverage"] = _term_score(lc, _SECURITY_TERMS)
        dims["performance_coverage"] = _term_score(lc, _PERFORMANCE_TERMS)
        dims["testability"] = _term_score(lc, _TEST_TERMS)
        dims["traceability"] = 90 if (artifact.project_reference and artifact.prompt_reference) else (
            70 if artifact.project_reference else 40)
        dims["maintainability"] = 100 if (artifact.version and artifact.author) else 60
        dims["executive_readability"] = 90 if 20 <= len(artifact.executive_summary) <= 800 else 60
        empty = sum(1 for s in artifact.sections if not s.body.strip() and not s.bullets)
        dims["missing_information"] = 100 if empty == 0 else max(20, 100 - empty * 25)
        dims["placeholder_detection"] = 40 if _PLACEHOLDER_RE.search(lc) else 100

        # --- weighted overall ---
        overall = round(
            sum(dims[d] * w for d, w in _DIMENSION_WEIGHTS.items()) / sum(_DIMENSION_WEIGHTS.values())
        )

        dimension_scores = [
            DimensionScore(
                dimension=d, score=dims[d], weight=w,
                note=None if dims[d] >= 75 else f"Improve {d.replace('_', ' ')}.",
            )
            for d, w in _DIMENSION_WEIGHTS.items()
        ]

        # --- section-level scores ---
        section_scores: list[SectionScore] = []
        for s in artifact.sections:
            issues: list[str] = []
            slen = len(s.body) + sum(len(b) for b in s.bullets)
            sc = 100
            if not s.body.strip() and not s.bullets:
                issues.append("Empty section")
                sc -= 60
            elif slen < 40:
                issues.append("Thin content")
                sc -= 20
            if _PLACEHOLDER_RE.search((s.body or "").lower()):
                issues.append("Placeholder text")
                sc -= 40
            section_scores.append(SectionScore(heading=s.heading, score=max(0, sc), issues=issues))

        # --- suggestions + risk notes ---
        suggestions: list[str] = []
        for d, sc in dims.items():
            if sc < 70:
                suggestions.append(f"Strengthen {d.replace('_', ' ')} (score {sc}).")
        if missing_sections:
            suggestions.append(f"Add missing sections: {', '.join(missing_sections)}.")
        if not suggestions:
            suggestions.append("Artifact meets quality expectations across all dimensions.")

        risk_notes: list[str] = []
        if dims["placeholder_detection"] < 100:
            risk_notes.append("Placeholder content present — artifact is not final.")
        if dims["compliance_coverage"] < 55:
            risk_notes.append("Weak compliance coverage — regulatory review recommended.")
        if dims["required_sections"] < 60:
            risk_notes.append("Several required sections are missing.")

        return QualityScoreReport(
            artifact_type=artifact.artifact_type,
            reference=artifact.reference,
            overall_score=overall,
            quality_band=_BAND(overall),
            dimension_scores=dimension_scores,
            section_scores=section_scores,
            missing_sections=missing_sections,
            improvement_suggestions=suggestions,
            risk_notes=risk_notes,
        )


def quality_engine(db: Session) -> QualityEngine:
    return QualityEngine(db)
