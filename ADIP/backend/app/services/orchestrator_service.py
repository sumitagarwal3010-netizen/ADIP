"""Prompt Execution Engine (final orchestration layer).

Sits ABOVE all existing services. Given ONE business prompt it:
  1. classifies the prompt (provider-independent reasoner — mock now, LLM later),
  2. resolves the target project,
  3. invokes the EXISTING SdlcService / AnalyticsService / KnowledgeService /
     ArtifactGenerator (reused — no duplication),
  4. generates artifacts via the EXISTING ArtifactGenerator,
  5. updates traceability + records an audit-trail entry,
  6. composes one coherent orchestration response.

No business logic, artifact framework, copilot, repository or service is
duplicated here — this module only *orchestrates* what already exists.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.logging import get_logger
from app.llm.reasoning import Reasoner, default_reasoner
from app.models.enums import CopilotType
from app.models.organization import Project
from app.schemas import orchestrator as odto
from app.schemas.artifact_generation import GeneratedArtifact, MarkdownArtifact
from app.services.analytics_service import AnalyticsService
from app.services.artifact_generator import ArtifactGenerator
from app.services.audit_trail import record_activity
from app.services.knowledge_service import KnowledgeService
from app.services.sdlc_service import SdlcService

logger = get_logger(__name__)

# Copilot slug -> existing CopilotType.
COPILOT_SLUGS: dict[str, CopilotType] = {
    "requirement": CopilotType.REQUIREMENT,
    "architecture": CopilotType.ARCHITECTURE,
    "development": CopilotType.DEVELOPMENT,
    "testing": CopilotType.TESTING,
    "release": CopilotType.RELEASE,
    "go-live": CopilotType.GO_LIVE,
    "audit": CopilotType.AUDIT,
    "executive-advisor": CopilotType.EXECUTIVE_ADVISOR,
}

# Default SDLC artifact set (all produced by the EXISTING ArtifactGenerator).
DEFAULT_ARTIFACTS = [
    "BRD", "FRD", "SRS", "Architecture", "HLD", "LLD", "API Spec", "DB Design",
    "Test Plan", "Deployment Guide", "Rollback Guide", "Audit Checklist", "Executive Summary",
]


class PromptExecutionEngine:
    """Composes existing services into a single prompt-driven AI SDLC run."""

    def __init__(self, db: Session, reasoner: Reasoner | None = None) -> None:
        self.db = db
        self.reasoner = reasoner or default_reasoner
        # Reuse existing services — do not reimplement any of them.
        self.sdlc = SdlcService(db)
        self.analytics = AnalyticsService(db)
        self.knowledge = KnowledgeService(db)
        self.artifacts = ArtifactGenerator(db)

    # --- project resolution ---
    def _resolve_project(self, prompt: str, meta: odto.OrchestrationMetadata | None) -> Project:
        """Pick the target project from metadata, else infer from the prompt.

        Falls back to the first project so orchestration always has data to
        compose (the demo seed has Net Banking / Mobile Banking / Payments).
        """
        projects = list(self.db.scalars(select(Project)).all())
        if not projects:
            raise NotFoundError("No projects exist to orchestrate against; seed the database first.")

        # 1. explicit metadata (name or code, case-insensitive).
        hint = ((meta.project if meta else None) or (meta.application if meta else None) or "").strip().lower()
        text = f"{prompt} {hint}".lower()

        def find(pred) -> Project | None:
            return next((p for p in projects if pred(p)), None)

        if hint:
            match = find(lambda p: p.name.lower() == hint or p.code.lower() == hint)
            if match:
                return match

        # 2. infer from prompt/application text.
        if "mobile" in text or "biometric" in text:
            match = find(lambda p: "mobile" in p.name.lower())
            if match:
                return match
        if any(k in text for k in ("upi", "npci", "payment", "beneficiary", "reversal", "reconcil")):
            match = find(lambda p: "payment" in p.name.lower())
            if match:
                return match
        if "net banking" in text or "internet banking" in text:
            match = find(lambda p: "net banking" in p.name.lower())
            if match:
                return match

        # 3. safe default.
        return projects[0]

    # --- main entry point ---
    def execute(self, request: odto.OrchestrationRequest) -> odto.OrchestrationResponse:
        meta = request.metadata
        project = self._resolve_project(request.prompt, meta)
        pid = project.id

        # Step 2 — classification (provider-independent reasoning).
        meta_dict = meta.model_dump(exclude_none=True) if meta else {}
        classification = self.reasoner.classify(request.prompt, meta_dict)

        logger.info(
            "Orchestrating prompt for project=%s scenario=%s (reasoner=%s)",
            project.name, classification.scenario, self.reasoner.name,
        )

        # Step 3/4 — invoke EXISTING phase services (reused).
        requirements = self.sdlc.requirement_summary(pid)
        architecture = self.sdlc.architecture_summary(pid)
        development = self.sdlc.development_summary(pid)
        testing = self.sdlc.testing_summary(pid)
        release = self.sdlc.release_summary(pid)
        go_live = self.sdlc.go_live_summary(pid)
        audit = self.sdlc.audit_summary(pid)

        # Copilots (reused).
        copilots = {slug: self.sdlc.copilot(pid, ctype) for slug, ctype in COPILOT_SLUGS.items()}

        # Executive (reused) + dashboard (composed from existing analytics).
        executive = self.sdlc.executive_summary(pid)
        kpis = self.analytics.engineering_kpis(pid)
        dashboard = odto.ExecutiveDashboard(
            overall_sdlc_score=executive.overall_score,
            band=executive.band,
            business_value=executive.business_value,
            engineering_productivity=executive.productivity_uplift_pct,
            risk_score=executive.risk_score,
            compliance_score=executive.compliance_score,
            ai_confidence=executive.ai_confidence,
            manual_effort_saved_days=executive.manual_effort_saved_days,
            automation_pct=kpis.automation_pct,
        )

        # Knowledge recommendations (reused).
        knowledge = self.knowledge.recommendations(pid)
        knowledge_recs = [r.model_dump() for r in knowledge.recommendations]

        # Step 5 — artifacts via the EXISTING ArtifactGenerator (no new framework).
        artifact_types = request.artifact_types or DEFAULT_ARTIFACTS
        generated: list[GeneratedArtifact] = []
        markdown: list[MarkdownArtifact] = []
        for atype in artifact_types:
            try:
                generated.append(self.artifacts.generate(pid, atype))
                if request.include_markdown:
                    markdown.append(self.artifacts.generate_markdown(pid, atype))
            except Exception as exc:  # skip unknown types, keep orchestration resilient
                logger.warning("Skipping artifact '%s': %s", atype, exc)

        # Step 6 — traceability (reused engine) + audit trail.
        traceability = self.sdlc.traceability_chain(pid)

        run_id = f"ORCH-{uuid.uuid4().hex[:8].upper()}"
        record_activity(
            self.db,
            action="orchestrate",
            actor="prompt-execution-engine",
            entity_type="OrchestrationRun",
            entity_reference=run_id,
            project_id=pid,
            detail=f"Prompt orchestrated ({classification.scenario}); {len(generated)} artifacts generated.",
        )

        return odto.OrchestrationResponse(
            run_id=run_id,
            prompt=request.prompt,
            generated_at=datetime.now(timezone.utc),
            reasoner=self.reasoner.name,
            project=requirements.project,
            classification=odto.ClassificationDTO(
                business_domain=classification.business_domain,
                application=classification.application,
                capability=classification.capability,
                technology=classification.technology,
                security_impact=classification.security_impact,
                compliance_impact=classification.compliance_impact,
                risk=classification.risk,
                complexity=classification.complexity,
                story_points=classification.story_points,
                sprint_estimate=classification.sprint_estimate,
                confidence=classification.confidence,
                matched_keywords=classification.matched_keywords,
                scenario=classification.scenario,
            ),
            requirements=requirements,
            architecture=architecture,
            development=development,
            testing=testing,
            release=release,
            go_live=go_live,
            audit=audit,
            copilots=copilots,
            executive=executive,
            dashboard=dashboard,
            knowledge_recommendations=knowledge_recs,
            artifacts=generated,
            artifacts_markdown=markdown,
            traceability=traceability,
        )
