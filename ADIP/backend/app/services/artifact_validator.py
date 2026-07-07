"""Artifact quality validation (Phase F).

Validates a generated artifact against enterprise quality rules — completeness,
formatting, required sections, missing information, placeholder detection,
traceability and consistency — and produces a quality score plus improvement
suggestions. Reuses the existing ArtifactGenerator output (no new generator).
"""
from __future__ import annotations

import re

from app.schemas.artifact_generation import GeneratedArtifact
from app.schemas.validation import ArtifactQualityReport, ValidationIssue

# Phrases that indicate unfinished/placeholder content.
_PLACEHOLDER_RE = re.compile(
    r"\b(tbd|todo|lorem ipsum|placeholder|fixme|xxx|<[^>]+>|n/a n/a)\b", re.IGNORECASE
)

# Minimum expected sections per artifact category (light-touch required sections).
_MIN_SECTIONS = 2
_MIN_SUMMARY_LEN = 20
_MIN_TOTAL_CONTENT = 120


class ArtifactValidator:
    """Applies quality rules to a generated artifact."""

    def validate(self, artifact: GeneratedArtifact) -> ArtifactQualityReport:
        issues: list[ValidationIssue] = []
        suggestions: list[str] = []
        checks: dict[str, bool] = {}

        text_blocks = [s.body for s in artifact.sections] + [
            b for s in artifact.sections for b in s.bullets
        ]
        full_text = " ".join([artifact.executive_summary, *text_blocks])

        # 1. Completeness — has sections and content.
        completeness = len(artifact.sections) >= _MIN_SECTIONS and len(full_text) >= _MIN_TOTAL_CONTENT
        checks["completeness"] = completeness
        if not completeness:
            issues.append(ValidationIssue(rule="completeness", severity="error",
                                          message="Artifact has too few sections or insufficient content."))
            suggestions.append("Add more detailed sections and body content.")

        # 2. Formatting — every section has a heading and some content.
        formatting = all(s.heading.strip() and (s.body.strip() or s.bullets) for s in artifact.sections)
        checks["formatting"] = formatting
        if not formatting:
            issues.append(ValidationIssue(rule="formatting", severity="warning",
                                          message="One or more sections are missing a heading or content."))
            suggestions.append("Ensure each section has a heading and body or bullets.")

        # 3. Required sections — executive summary present and substantial.
        required = len(artifact.executive_summary.strip()) >= _MIN_SUMMARY_LEN
        checks["required_sections"] = required
        if not required:
            issues.append(ValidationIssue(rule="required_sections", severity="error",
                                          message="Executive summary is missing or too short."))
            suggestions.append("Provide a meaningful executive summary.")

        # 4. Missing information — empty bullets / very short bodies.
        empty_bodies = sum(1 for s in artifact.sections if not s.body.strip() and not s.bullets)
        missing_info = empty_bodies == 0
        checks["missing_information"] = missing_info
        if not missing_info:
            issues.append(ValidationIssue(rule="missing_information", severity="warning",
                                          message=f"{empty_bodies} section(s) have no content."))
            suggestions.append("Fill in content for empty sections.")

        # 5. Placeholder detection.
        placeholder_hit = _PLACEHOLDER_RE.search(full_text)
        no_placeholders = placeholder_hit is None
        checks["placeholder_free"] = no_placeholders
        if not no_placeholders:
            issues.append(ValidationIssue(rule="placeholder_free", severity="error",
                                          message=f"Placeholder content detected: '{placeholder_hit.group(0)}'."))
            suggestions.append("Replace placeholder text (TBD/TODO/etc.) with real content.")

        # 6. Traceability — carries project + (ideally) prompt reference.
        traceable = bool(artifact.project_reference)
        checks["traceability"] = traceable
        if not traceable:
            issues.append(ValidationIssue(rule="traceability", severity="warning",
                                          message="Artifact lacks a project reference for traceability."))
            suggestions.append("Attach project (and prompt) references for full traceability.")
        if not artifact.prompt_reference:
            suggestions.append("Generate via the orchestrator to attach a prompt reference.")

        # 7. Consistency — title mentions the project, metadata is populated.
        consistency = (
            artifact.project_name.split()[0].lower() in artifact.title.lower()
            and bool(artifact.version)
            and bool(artifact.author)
        )
        checks["consistency"] = consistency
        if not consistency:
            issues.append(ValidationIssue(rule="consistency", severity="info",
                                          message="Title/metadata consistency could be improved."))

        # Quality score: weighted pass rate (errors weigh more).
        weights = {
            "completeness": 20, "formatting": 15, "required_sections": 20,
            "missing_information": 10, "placeholder_free": 20, "traceability": 10,
            "consistency": 5,
        }
        score = sum(w for k, w in weights.items() if checks.get(k))
        passed = not any(i.severity == "error" for i in issues)

        if not suggestions:
            suggestions.append("Artifact meets all quality rules.")

        return ArtifactQualityReport(
            artifact_type=artifact.artifact_type,
            reference=artifact.reference,
            passed=passed,
            quality_score=score,
            checks=checks,
            issues=issues,
            suggestions=suggestions,
        )


artifact_validator = ArtifactValidator()
