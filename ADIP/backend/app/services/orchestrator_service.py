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

import hashlib
import json
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.config import settings
from app.core.logging import get_logger
from app.llm.reasoning import Reasoner, default_reasoner
from app.llm.service import llm_service
from app.llm.types import CompletionRequest, Message, Role
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

    # --- requirement artifact package generation ---
    @staticmethod
    def _normalize_requirement(text: str) -> str:
        return " ".join((text or "").strip().lower().split())

    @staticmethod
    def _session_key_for(normalized_requirement: str) -> str:
        return hashlib.sha256(normalized_requirement.encode("utf-8")).hexdigest()[:24]

    @staticmethod
    def _parse_json_payload(text: str) -> dict:
        payload = (text or "").strip()
        if payload.startswith("```"):
            payload = payload.strip("`")
            if payload.startswith("json"):
                payload = payload[4:].strip()
        return json.loads(payload)

    @staticmethod
    def _validate_requirement_package(data: dict) -> tuple[bool, str]:
        try:
            profile = data["requirement_profile"]
            artifacts = data["artifacts"]
            required_profile = ("feature", "business_context", "constraints", "technology_stack", "acceptance_criteria")
            for key in required_profile:
                if not str(profile.get(key, "")).strip():
                    return False, f"missing requirement_profile.{key}"
            required_artifacts = (
                "brd",
                "frd",
                "user_stories",
                "acceptance_criteria",
                "test_scenarios",
                "traceability_matrix",
            )
            for key in required_artifacts:
                entry = artifacts.get(key)
                if not isinstance(entry, dict):
                    return False, f"missing artifacts.{key}"
                if not str(entry.get("content", "")).strip():
                    return False, f"empty artifacts.{key}.content"
            return True, ""
        except Exception as exc:  # noqa: BLE001
            return False, str(exc)

    @staticmethod
    def _fallback_requirement_package(normalized_requirement: str, session_key: str) -> odto.RequirementArtifactPackage:
        feature = normalized_requirement
        if "biometric" in normalized_requirement and "mobile banking" in normalized_requirement:
            project_title = "Biometric Login for Mobile Banking"
            brd_body = (
                "FALLBACK-GENERATED\nBRD\n"
                f"Project: {project_title}\n"
                "Feature focus: biometric authentication\n"
                "Scope includes device enrollment, fallback login, and security/audit logging."
            )
            frd_body = (
                "FALLBACK-GENERATED\nFRD\n"
                "Functional design for biometric authentication, device enrollment lifecycle, "
                "fallback login journey, and security/audit logging controls."
            )
            stories_body = (
                "FALLBACK-GENERATED\nUSER STORIES\n"
                "As a customer, I use biometric authentication.\n"
                "As a customer, I enroll and manage devices.\n"
                "As operations, I monitor fallback login and audit logs."
            )
            ac_body = (
                "FALLBACK-GENERATED\nACCEPTANCE CRITERIA\n"
                "Biometric authentication works for enrolled devices.\n"
                "Device enrollment requires step-up validation.\n"
                "Fallback login is available on biometric failure.\n"
                "Security/audit logging records all authentication events."
            )
            tests_body = (
                "FALLBACK-GENERATED\nTEST SCENARIOS\n"
                "Validate biometric authentication success/failure flows.\n"
                "Validate device enrollment and revocation.\n"
                "Validate fallback login reliability.\n"
                "Validate security/audit logging completeness."
            )
            trace_body = (
                "FALLBACK-GENERATED\nTRACEABILITY MATRIX\n"
                "Requirement -> biometric authentication -> tests\n"
                "Requirement -> device enrollment -> tests\n"
                "Requirement -> fallback login -> tests\n"
                "Requirement -> security/audit logging -> tests"
            )
        else:
            project_title = "Requirement Delivery Package"
            brd_body = (
                "FALLBACK-GENERATED\nBRD\n"
                f"Project: {project_title}\n"
                f"Feature: {feature}\n"
                "Business context: requirement-aware fallback package."
            )
            frd_body = f"FALLBACK-GENERATED\nFRD\nFunctional scope aligned to requirement: {feature}"
            stories_body = f"FALLBACK-GENERATED\nUser stories for feature: {feature}"
            ac_body = f"FALLBACK-GENERATED\nAcceptance criteria specific to: {feature}"
            tests_body = f"FALLBACK-GENERATED\nTest scenarios derived from: {feature}"
            trace_body = f"FALLBACK-GENERATED\nTraceability matrix for requirement: {feature}"
        profile = {
            "feature": feature,
            "business_context": f"Requirement-focused fallback package for: {feature}",
            "constraints": "Generated in fallback mode because Ollama was unavailable.",
            "technology_stack": "Backend configured stack",
            "acceptance_criteria": f"Artifacts must remain specific to: {feature}",
        }
        artifacts = {
            "brd": odto.RequirementArtifactItem(
                name="BRD.docx",
                file_type="docx",
                content=brd_body,
                metadata={"fallback_generated": "true"},
            ),
            "frd": odto.RequirementArtifactItem(
                name="FRD.docx",
                file_type="docx",
                content=frd_body,
                metadata={"fallback_generated": "true"},
            ),
            "user_stories": odto.RequirementArtifactItem(
                name="User_Stories.xlsx",
                file_type="xlsx",
                content=stories_body,
                metadata={"fallback_generated": "true"},
            ),
            "acceptance_criteria": odto.RequirementArtifactItem(
                name="Acceptance_Criteria.docx",
                file_type="docx",
                content=ac_body,
                metadata={"fallback_generated": "true"},
            ),
            "test_scenarios": odto.RequirementArtifactItem(
                name="Test_Scenarios.docx",
                file_type="docx",
                content=tests_body,
                metadata={"fallback_generated": "true"},
            ),
            "traceability_matrix": odto.RequirementArtifactItem(
                name="Requirement_Traceability_Matrix.xlsx",
                file_type="xlsx",
                content=trace_body,
                metadata={"fallback_generated": "true"},
            ),
        }
        return odto.RequirementArtifactPackage(
            session_key=session_key,
            normalized_requirement=normalized_requirement,
            source="fallback",
            requirement_profile=profile,
            artifacts=artifacts,
        )

    def generate_requirement_artifact_package(self, requirement: str) -> odto.RequirementArtifactPackage:
        normalized = self._normalize_requirement(requirement)
        if not normalized:
            return odto.RequirementArtifactPackage(
                session_key=self._session_key_for(""),
                normalized_requirement="",
                source="failed",
                failure_reason="Requirement is empty.",
                requirement_profile={},
                artifacts={},
            )
        session_key = self._session_key_for(normalized)

        # Preserve demo capability: when local LLM is not available, return deterministic fallback.
        if not llm_service.enabled or not llm_service.adapter_for("qwen3:8b").is_available():
            return self._fallback_requirement_package(normalized, session_key)

        system_prompt = (
            "You are ADIP Requirement Copilot. Return ONLY valid JSON. "
            "No markdown fences. Keep output requirement-specific."
        )
        user_prompt = (
            "Generate a structured requirement package for the user requirement.\n"
            f"Requirement: {requirement.strip()}\n"
            "JSON schema:\n"
            "{"
            "\"requirement_profile\":{"
            "\"feature\":\"string\",\"business_context\":\"string\",\"constraints\":\"string\","
            "\"technology_stack\":\"string\",\"acceptance_criteria\":\"string\"},"
            "\"artifacts\":{"
            "\"brd\":{\"name\":\"BRD.docx\",\"file_type\":\"docx\",\"content\":\"string\"},"
            "\"frd\":{\"name\":\"FRD.docx\",\"file_type\":\"docx\",\"content\":\"string\"},"
            "\"user_stories\":{\"name\":\"User_Stories.xlsx\",\"file_type\":\"xlsx\",\"content\":\"string\"},"
            "\"acceptance_criteria\":{\"name\":\"Acceptance_Criteria.docx\",\"file_type\":\"docx\",\"content\":\"string\"},"
            "\"test_scenarios\":{\"name\":\"Test_Scenarios.docx\",\"file_type\":\"docx\",\"content\":\"string\"},"
            "\"traceability_matrix\":{\"name\":\"Requirement_Traceability_Matrix.xlsx\",\"file_type\":\"xlsx\",\"content\":\"string\"}"
            "}"
            "}"
        )

        last_error = "unknown generation error"
        for attempt in range(2):
            try:
                response = llm_service.complete(
                    CompletionRequest(
                        model="qwen3:8b",
                        messages=[Message(Role.SYSTEM, system_prompt), Message(Role.USER, user_prompt)],
                        temperature=0.1 if attempt == 0 else 0.0,
                        max_tokens=settings.llm_max_tokens,
                    )
                )
                data = self._parse_json_payload(response.content)
                ok, reason = self._validate_requirement_package(data)
                if ok:
                    artifacts = {
                        key: odto.RequirementArtifactItem(
                            name=value.get("name", ""),
                            file_type=value.get("file_type", "docx"),
                            content=value.get("content", ""),
                            metadata={"source_model": "qwen3:8b"},
                        )
                        for key, value in data["artifacts"].items()
                    }
                    return odto.RequirementArtifactPackage(
                        session_key=session_key,
                        normalized_requirement=normalized,
                        source="llm",
                        requirement_profile={k: str(v) for k, v in data["requirement_profile"].items()},
                        artifacts=artifacts,
                    )
                last_error = reason
            except Exception as exc:  # noqa: BLE001
                last_error = str(exc)

        return odto.RequirementArtifactPackage(
            session_key=session_key,
            normalized_requirement=normalized,
            source="failed",
            failure_reason=f"Generation Failed: {last_error}",
            requirement_profile={},
            artifacts={},
        )
