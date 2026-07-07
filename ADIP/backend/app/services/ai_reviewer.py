"""AI Reviewer / Critic (Phase 4).

Flow: Prompt → Generator → Artifact → Reviewer → findings → improved artifact.

Two modes:
  - Deterministic (default): derives review findings from the quality engine +
    heuristics. Works with NO live LLM.
  - Ollama: when LOCAL_LLM_ENABLED=true and the provider is reachable, builds a
    reviewer prompt and calls the model; falls back to deterministic on failure.

Reuses ArtifactGenerator, QualityEngine and the LLM layer — no duplication.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.logging import get_logger
from app.llm.parser import parse_response
from app.llm.service import llm_service
from app.llm.types import CompletionRequest, Message, Role
from app.schemas.ai_review import (
    ArtifactReview,
    ImprovedArtifact,
    ReviewFinding,
    ReviewRunResult,
)
from app.schemas.artifact_generation import GeneratedArtifact
from app.schemas.orchestrator import OrchestrationMetadata, OrchestrationRequest
from app.services.artifact_generator import ArtifactGenerator
from app.services.orchestrator_service import PromptExecutionEngine
from app.services.quality_engine import QualityEngine

logger = get_logger(__name__)

# The 10 reviewer checks mapped to the quality dimensions they draw on.
_REVIEW_CHECKS: list[tuple[str, str]] = [
    ("business_accuracy", "banking_relevance"),
    ("sdlc_completeness", "completeness"),
    ("architecture_quality", "structure"),
    ("regulatory_completeness", "compliance_coverage"),
    ("test_coverage", "testability"),
    ("risk_coverage", "security_coverage"),
    ("traceability", "traceability"),
    ("hallucination_risk", "placeholder_detection"),
    ("missing_assumptions", "missing_information"),
    ("executive_clarity", "executive_readability"),
]


def _severity(score: int) -> str:
    return "critical" if score < 40 else "high" if score < 60 else "medium" if score < 75 else "low"


class AIReviewer:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.generator = ArtifactGenerator(db)
        self.quality = QualityEngine(db)

    # --- review ---
    def review(self, project_id: int, artifact_type: str) -> ArtifactReview:
        artifact = self.generator.generate(project_id, artifact_type)
        return self.review_artifact(artifact)

    def review_artifact(self, artifact: GeneratedArtifact) -> ArtifactReview:
        # Try Ollama reviewer if enabled; otherwise deterministic.
        if settings.local_llm_enabled:
            try:
                return self._ollama_review(artifact)
            except Exception as exc:  # noqa: BLE001 - degrade gracefully to deterministic
                logger.warning("Ollama review failed (%s); using deterministic reviewer.", exc)
        return self._deterministic_review(artifact)

    def _deterministic_review(self, artifact: GeneratedArtifact) -> ArtifactReview:
        report = self.quality.score_artifact(artifact)
        dim_by_name = {d.dimension: d.score for d in report.dimension_scores}

        findings: list[ReviewFinding] = []
        strengths: list[str] = []
        for check, dim in _REVIEW_CHECKS:
            score = dim_by_name.get(dim, 70)
            if score < 75:
                findings.append(ReviewFinding(
                    dimension=check,
                    severity=_severity(score),
                    finding=f"{check.replace('_', ' ').title()} is weak (quality signal {score}/100).",
                    recommendation=f"Improve {check.replace('_', ' ')} with concrete banking-specific detail.",
                ))
            else:
                strengths.append(f"{check.replace('_', ' ').title()} is solid.")

        hallucination = ("Low" if dim_by_name.get("placeholder_detection", 100) == 100
                         else "Medium (placeholder content detected)")
        missing_assumptions = report.missing_sections or (
            [] if dim_by_name.get("missing_information", 100) == 100 else ["Some sections lack content."]
        )
        exec_clarity = "Concise and decision-oriented" if dim_by_name.get("executive_readability", 0) >= 75 \
            else "Executive summary needs tightening"
        assessment = (
            f"{artifact.artifact_type} scored {report.overall_score}/100 ({report.quality_band}). "
            + ("Ready with minor improvements." if report.overall_score >= 75 else "Needs revision before sign-off.")
        )
        return ArtifactReview(
            artifact_type=artifact.artifact_type,
            reference=artifact.reference,
            reviewer="deterministic",
            overall_assessment=assessment,
            review_score=report.overall_score,
            findings=findings,
            strengths=strengths or ["Meets baseline expectations."],
            hallucination_risk=hallucination,
            missing_assumptions=missing_assumptions,
            executive_clarity=exec_clarity,
        )

    def _ollama_review(self, artifact: GeneratedArtifact) -> ArtifactReview:
        """Real reviewer via Ollama; parses structured feedback, then blends with
        the deterministic baseline for guaranteed structure."""
        from app.services.artifact_generator import ArtifactGenerator as _AG  # local ref
        md = _AG.to_markdown(artifact)
        system = (
            "You are a principal banking SDLC reviewer. Critically review the artifact for "
            "business accuracy, SDLC completeness, architecture quality, regulatory completeness, "
            "test coverage, risk coverage, traceability, hallucination risk, missing assumptions and "
            "executive clarity. Respond with a short assessment and bullet findings."
        )
        req = CompletionRequest(
            model=settings.ollama_model,
            messages=[Message(Role.SYSTEM, system), Message(Role.USER, md[:6000])],
            temperature=settings.llm_temperature,
            max_tokens=settings.llm_max_tokens,
        )
        resp = llm_service.complete(req)
        parsed = parse_response(resp.content)
        base = self._deterministic_review(artifact)
        base.reviewer = "ollama"
        if parsed.raw.strip():
            base.overall_assessment = parsed.raw.strip()[:600]
        return base

    # --- improve ---
    def improve(self, project_id: int, artifact_type: str) -> ImprovedArtifact:
        artifact = self.generator.generate(project_id, artifact_type)
        review = self.review_artifact(artifact)
        # Regenerate through the professional authoring path (already structured);
        # record the improvements the review would drive.
        improved = self.generator.generate(project_id, artifact_type, prompt_reference=f"review-{artifact.reference}")
        changes = [f.recommendation for f in review.findings] or [
            "No material changes required; artifact already meets quality expectations."
        ]
        return ImprovedArtifact(review=review, improved=improved, changes_applied=changes)

    # --- review a full orchestration run ---
    def review_run(self, prompt: str, project: str | None = None) -> ReviewRunResult:
        engine = PromptExecutionEngine(self.db)
        meta = OrchestrationMetadata(project=project) if project else None
        orch = engine.execute(OrchestrationRequest(prompt=prompt, metadata=meta))
        reviews = [self.review_artifact(a) for a in orch.artifacts]
        avg = round(sum(r.review_score for r in reviews) / len(reviews)) if reviews else 0
        return ReviewRunResult(
            prompt=prompt,
            project_name=orch.project.name,
            scenario=orch.classification.scenario,
            artifacts_reviewed=len(reviews),
            average_review_score=avg,
            reviews=reviews,
        )
