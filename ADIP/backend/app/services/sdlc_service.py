"""AI SDLC aggregation service (Phase 3).

Composes business DTOs from many tables by reusing the generic repository
(`fetch_all`) — no new SQL, no CRUD responses, no duplicated services. Each
method returns a read-only, frontend-oriented summary for a project.
"""
from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.ai import AIRecommendation, AIRisk, CopilotFinding, ExecutiveScore
from app.models.architecture import Architecture, ArchitectureReview
from app.models.artifacts import Artifact, TraceabilityLink
from app.models.audit import AuditEvidence, AuditObservation, ComplianceRecord
from app.models.development import (
    CodeReview,
    DevelopmentStory,
    DevelopmentTask,
    SourceCodeMetadata,
)
from app.models.enums import CopilotType, RequirementType, SdlcPhase, TestResult
from app.models.organization import Application, Project
from app.models.release import Deployment, GoLive, Release
from app.models.requirements import Requirement, RequirementAnalysis
from app.models.testing import Defect, TestCase, TestExecution
from app.repositories.aggregation import fetch_all
from app.schemas import sdlc as dto

# Copilot -> phase mapping (executive advisor spans all phases).
COPILOT_PHASE = {
    CopilotType.REQUIREMENT: SdlcPhase.REQUIREMENTS,
    CopilotType.ARCHITECTURE: SdlcPhase.ARCHITECTURE,
    CopilotType.DEVELOPMENT: SdlcPhase.DEVELOPMENT,
    CopilotType.TESTING: SdlcPhase.TESTING,
    CopilotType.RELEASE: SdlcPhase.RELEASE,
    CopilotType.GO_LIVE: SdlcPhase.RELEASE,
    CopilotType.AUDIT: SdlcPhase.AUDIT,
}


def _readiness_for(score: int) -> str:
    if score >= 82:
        return "Ready"
    if score >= 72:
        return "On Track"
    return "Needs Attention"


def _band_for(score: int) -> str:
    return "Ready" if score >= 82 else "Conditional" if score >= 72 else "At Risk"


class SdlcService:
    """Aggregation/business-logic layer for the AI SDLC APIs."""

    def __init__(self, db: Session) -> None:
        self.db = db

    # --- shared helpers ---
    def _project(self, project_id: int) -> Project:
        project = self.db.get(Project, project_id)
        if project is None:
            raise NotFoundError(f"Project {project_id} not found.")
        return project

    def _project_ref(self, project: Project) -> dto.ProjectRef:
        return dto.ProjectRef(
            id=project.id,
            name=project.name,
            code=project.code,
            status=project.status.value if hasattr(project.status, "value") else str(project.status),
            health_score=project.health_score,
        )

    def _latest_score(self, project_id: int) -> Optional[ExecutiveScore]:
        scores = fetch_all(
            self.db, ExecutiveScore, {"project_id": project_id}, sort_by="id", sort_dir="desc"
        )
        return scores[0] if scores else None

    def _phase_score(self, project_id: int, attr: str, fallback: int = 78) -> int:
        score = self._latest_score(project_id)
        value = getattr(score, attr, None) if score else None
        return int(value) if value is not None else fallback

    def _findings(self, project_id: int, phase: SdlcPhase) -> list[CopilotFinding]:
        return fetch_all(self.db, CopilotFinding, {"project_id": project_id, "phase": phase})

    def _recommendations_for_phase(self, project_id: int, phase: SdlcPhase) -> list[AIRecommendation]:
        copilot = next((c for c, p in COPILOT_PHASE.items() if p == phase), None)
        if copilot is None:
            return []
        return fetch_all(
            self.db, AIRecommendation, {"project_id": project_id, "copilot_type": copilot}
        )

    # --- Requirements ---
    def requirement_summary(self, project_id: int) -> dto.RequirementSummary:
        project = self._project(project_id)
        reqs = fetch_all(self.db, Requirement, {"project_id": project_id}, sort_by="reference")
        by_type: dict[RequirementType, list[Requirement]] = {t: [] for t in RequirementType}
        for r in reqs:
            by_type.setdefault(r.requirement_type, []).append(r)

        req_ids = {r.id for r in reqs}
        gaps = [
            g for g in fetch_all(self.db, RequirementAnalysis)
            if g.requirement_id in req_ids
        ]
        score = self._phase_score(project_id, "requirements_score")
        return dto.RequirementSummary(
            project=self._project_ref(project),
            business_requirements=by_type.get(RequirementType.BUSINESS, []),
            functional_requirements=by_type.get(RequirementType.FUNCTIONAL, []),
            non_functional_requirements=by_type.get(RequirementType.NON_FUNCTIONAL, []),
            assumptions=by_type.get(RequirementType.ASSUMPTION, []),
            dependencies=by_type.get(RequirementType.DEPENDENCY, []),
            acceptance_criteria=by_type.get(RequirementType.ACCEPTANCE_CRITERIA, []),
            gap_analysis=gaps,
            findings=self._findings(project_id, SdlcPhase.REQUIREMENTS),
            recommendations=self._recommendations_for_phase(project_id, SdlcPhase.REQUIREMENTS),
            total_requirements=len(reqs),
            score=score,
            readiness=_readiness_for(score),
        )

    # --- Architecture ---
    def architecture_summary(self, project_id: int) -> dto.ArchitectureSummary:
        project = self._project(project_id)
        arch = fetch_all(self.db, Architecture, {"project_id": project_id}, sort_by="reference")

        def by_view(*keys: str) -> list[Architecture]:
            return [a for a in arch if any(k.lower() in a.view_type.lower() for k in keys)]

        arch_ids = {a.id for a in arch}
        reviews = [r for r in fetch_all(self.db, ArchitectureReview) if r.architecture_id in arch_ids]
        apps = fetch_all(self.db, Application, {"project_id": project_id})
        score = self._phase_score(project_id, "architecture_score")
        return dto.ArchitectureSummary(
            project=self._project_ref(project),
            overview=arch,
            logical_design=by_view("Logical"),
            physical_design=by_view("Physical"),
            integrations=by_view("Integration"),
            apis=by_view("API"),
            database_design=by_view("Database"),
            sequence_metadata=by_view("Sequence"),
            applications=apps,
            review_findings=reviews,
            findings=self._findings(project_id, SdlcPhase.ARCHITECTURE),
            recommendations=self._recommendations_for_phase(project_id, SdlcPhase.ARCHITECTURE),
            score=score,
            readiness=_readiness_for(score),
        )

    # --- Development ---
    def development_summary(self, project_id: int) -> dto.DevelopmentSummary:
        project = self._project(project_id)
        stories = fetch_all(self.db, DevelopmentStory, {"project_id": project_id}, sort_by="reference")
        story_ids = {s.id for s in stories}
        tasks = [t for t in fetch_all(self.db, DevelopmentTask) if t.story_id in story_ids]
        reviews = [r for r in fetch_all(self.db, CodeReview) if r.story_id in story_ids]
        source = [m for m in fetch_all(self.db, SourceCodeMetadata) if m.story_id in story_ids]
        coverages = [m.coverage_pct for m in source if m.coverage_pct is not None]
        avg_cov = round(sum(coverages) / len(coverages)) if coverages else None
        score = self._phase_score(project_id, "development_score")
        return dto.DevelopmentSummary(
            project=self._project_ref(project),
            stories=stories,
            tasks=tasks,
            code_reviews=reviews,
            secure_coding=[r for r in reviews if r.is_secure_coding],
            source_metadata=source,
            findings=self._findings(project_id, SdlcPhase.DEVELOPMENT),
            recommendations=self._recommendations_for_phase(project_id, SdlcPhase.DEVELOPMENT),
            total_stories=len(stories),
            average_coverage=avg_cov,
            score=score,
            readiness=_readiness_for(score),
        )

    # --- Testing ---
    def testing_summary(self, project_id: int) -> dto.TestingSummary:
        project = self._project(project_id)
        cases = fetch_all(self.db, TestCase, {"project_id": project_id}, sort_by="reference")
        case_ids = {c.id for c in cases}
        executions = [e for e in fetch_all(self.db, TestExecution) if e.test_case_id in case_ids]
        defects = fetch_all(self.db, Defect, {"project_id": project_id}, sort_by="reference")

        automated = [c for c in cases if c.is_automated]
        regression = [c for c in cases if getattr(c.test_type, "value", str(c.test_type)) == "Regression"]
        executed = executions
        passed = [e for e in executions if e.result == TestResult.PASSED]
        failed = [e for e in executions if e.result == TestResult.FAILED]
        coverage = dto.TestingCoverage(
            total_cases=len(cases),
            automated=len(automated),
            manual=len(cases) - len(automated),
            automation_pct=round(len(automated) / len(cases) * 100) if cases else 0,
            executed=len(executed),
            passed=len(passed),
            failed=len(failed),
            pass_rate_pct=round(len(passed) / len(executed) * 100) if executed else 0,
        )
        score = self._phase_score(project_id, "testing_score")
        return dto.TestingSummary(
            project=self._project_ref(project),
            test_plan=cases,
            test_cases=cases,
            execution=executions,
            coverage=coverage,
            regression=regression,
            automation=automated,
            defects=defects,
            findings=self._findings(project_id, SdlcPhase.TESTING),
            recommendations=self._recommendations_for_phase(project_id, SdlcPhase.TESTING),
            score=score,
            readiness=_readiness_for(score),
        )

    # --- Release ---
    def release_summary(self, project_id: int) -> dto.ReleaseSummary:
        project = self._project(project_id)
        releases = fetch_all(self.db, Release, {"project_id": project_id}, sort_by="reference")
        rel_ids = {r.id for r in releases}
        deployments = [d for d in fetch_all(self.db, Deployment) if d.release_id in rel_ids]

        rollback = [
            {"release": r.reference, "rollback_plan": r.rollback_plan} for r in releases if r.rollback_plan
        ]
        cab = [{"release": r.reference, "cab_summary": r.cab_summary} for r in releases if r.cab_summary]
        monitoring = [
            {"release": r.reference, "monitoring_plan": r.monitoring_plan} for r in releases if r.monitoring_plan
        ]
        score = self._phase_score(project_id, "release_score")
        return dto.ReleaseSummary(
            project=self._project_ref(project),
            release_plan=releases,
            deployment=deployments,
            rollback=rollback,
            cab=cab,
            monitoring=monitoring,
            findings=self._findings(project_id, SdlcPhase.RELEASE),
            recommendations=self._recommendations_for_phase(project_id, SdlcPhase.RELEASE),
            score=score,
            readiness=_readiness_for(score),
        )

    # --- Go Live ---
    def go_live_summary(self, project_id: int) -> dto.GoLiveSummary:
        project = self._project(project_id)
        releases = fetch_all(self.db, Release, {"project_id": project_id})
        rel_ids = {r.id for r in releases}
        go_lives = [g for g in fetch_all(self.db, GoLive) if g.release_id in rel_ids]

        # Derive go-live sub-views from the go-live + release records.
        business_signoff = [
            {"release_id": g.release_id, "approved_by": g.approved_by, "verdict": g.verdict.value if hasattr(g.verdict, "value") else str(g.verdict)}
            for g in go_lives
        ]
        support_transition = [
            {"release": r.reference, "monitoring_plan": r.monitoring_plan} for r in releases if r.monitoring_plan
        ]
        hypercare = [
            {"release_id": g.release_id, "hypercare": "48h enhanced monitoring and on-call", "go_live_date": str(g.go_live_date)}
            for g in go_lives
        ]
        operational_readiness = [
            {"release_id": g.release_id, "checklist": g.checklist} for g in go_lives if g.checklist
        ]
        # Go-live score blends release + audit readiness.
        rel = self._phase_score(project_id, "release_score")
        aud = self._phase_score(project_id, "audit_score")
        score = round((rel + aud) / 2)
        return dto.GoLiveSummary(
            project=self._project_ref(project),
            go_live_checklist=go_lives,
            business_signoff=business_signoff,
            support_transition=support_transition,
            hypercare=hypercare,
            operational_readiness=operational_readiness,
            score=score,
            readiness=_readiness_for(score),
        )

    # --- Audit ---
    def audit_summary(self, project_id: int) -> dto.AuditSummary:
        project = self._project(project_id)
        evidence = fetch_all(self.db, AuditEvidence, {"project_id": project_id}, sort_by="reference")
        ev_ids = {e.id for e in evidence}
        compliance = [c for c in fetch_all(self.db, ComplianceRecord) if c.evidence_id in ev_ids]
        observations = [o for o in fetch_all(self.db, AuditObservation) if o.evidence_id in ev_ids]
        traceability = fetch_all(self.db, TraceabilityLink, {"project_id": project_id})
        score = self._phase_score(project_id, "audit_score")
        return dto.AuditSummary(
            project=self._project_ref(project),
            evidence=evidence,
            compliance=compliance,
            observations=observations,
            traceability=traceability,
            findings=self._findings(project_id, SdlcPhase.AUDIT),
            recommendations=self._recommendations_for_phase(project_id, SdlcPhase.AUDIT),
            score=score,
            readiness=_readiness_for(score),
        )

    # --- Copilot ---
    def copilot(self, project_id: int, copilot_type: CopilotType) -> dto.CopilotResponse:
        project = self._project(project_id)
        findings = fetch_all(
            self.db, CopilotFinding, {"project_id": project_id, "copilot_type": copilot_type}
        )
        recs = fetch_all(
            self.db, AIRecommendation, {"project_id": project_id, "copilot_type": copilot_type}
        )
        recs_by_finding: dict[int, list[AIRecommendation]] = {}
        for r in recs:
            if r.finding_id is not None:
                recs_by_finding.setdefault(r.finding_id, []).append(r)

        def rec_item(r: AIRecommendation) -> dto.CopilotRecommendationItem:
            return dto.CopilotRecommendationItem(
                id=r.id, title=r.title, rationale=r.rationale, impact=r.impact, priority=r.priority
            )

        finding_items = [
            dto.CopilotFindingItem(
                id=f.id,
                badge=f.badge,
                severity=f.severity.value if hasattr(f.severity, "value") else str(f.severity),
                title=f.title,
                detail=f.detail,
                reasoning=f.reasoning,
                confidence=f.confidence,
                risk=f.risk,
                readiness=f.readiness.value if f.readiness and hasattr(f.readiness, "value") else (f.readiness or None),
                recommendations=[rec_item(r) for r in recs_by_finding.get(f.id, [])],
            )
            for f in findings
        ]

        # Aggregate copilot-level signals.
        confidences = [f.confidence for f in findings if f.confidence is not None]
        avg_conf = round(sum(confidences) / len(confidences)) if confidences else 90
        crit = sum(1 for f in findings if str(getattr(f.severity, "value", f.severity)) in ("critical", "high"))
        risk = "High" if crit >= 5 else "Medium" if crit >= 1 else "Low"
        phase = COPILOT_PHASE.get(copilot_type)
        score_attr = {
            CopilotType.REQUIREMENT: "requirements_score",
            CopilotType.ARCHITECTURE: "architecture_score",
            CopilotType.DEVELOPMENT: "development_score",
            CopilotType.TESTING: "testing_score",
            CopilotType.RELEASE: "release_score",
            CopilotType.GO_LIVE: "release_score",
            CopilotType.AUDIT: "audit_score",
        }.get(copilot_type, "overall_score")
        score = self._phase_score(project_id, score_attr) if copilot_type != CopilotType.EXECUTIVE_ADVISOR else (
            self._latest_score(project_id).overall_score if self._latest_score(project_id) else 80
        )
        # Reasoning bullets: distinct reasoning strings across findings.
        reasoning: list[str] = []
        for f in findings:
            if f.reasoning:
                for part in f.reasoning.split(" · "):
                    if part and part not in reasoning:
                        reasoning.append(part)
        business_impact = (
            "High — customer-facing / regulated scope" if risk == "High"
            else "Medium — contained delivery impact" if risk == "Medium"
            else "Low — routine change"
        )
        priority = "P1" if risk == "High" else "P2" if risk == "Medium" else "P3"
        return dto.CopilotResponse(
            project=self._project_ref(project),
            copilot_type=copilot_type.value,
            phase=phase.value if phase else None,
            findings=finding_items,
            recommendations=[rec_item(r) for r in recs],
            reasoning=reasoning[:8],
            confidence=avg_conf,
            risk=risk,
            readiness=_readiness_for(score),
            business_impact=business_impact,
            priority=priority,
            score=score,
        )

    # --- Executive ---
    def _phase_scores(self, project_id: int) -> list[dto.ExecutivePhaseScore]:
        mapping = [
            ("requirements", "requirements_score"),
            ("architecture", "architecture_score"),
            ("development", "development_score"),
            ("testing", "testing_score"),
            ("release", "release_score"),
            ("audit", "audit_score"),
        ]
        out = []
        for phase, attr in mapping:
            s = self._phase_score(project_id, attr)
            out.append(dto.ExecutivePhaseScore(phase=phase, score=s, readiness=_readiness_for(s)))
        return out

    def executive_summary(self, project_id: int) -> dto.ExecutiveSummaryDTO:
        project = self._project(project_id)
        score = self._latest_score(project_id)
        phase_scores = self._phase_scores(project_id)
        overall = score.overall_score if score else round(
            sum(p.score for p in phase_scores) / len(phase_scores)
        )
        # Engineering health from source coverage if not scored.
        eng_health = 80
        source = fetch_all(self.db, SourceCodeMetadata)
        covs = [m.coverage_pct for m in source if m.coverage_pct is not None]
        if covs:
            eng_health = round(sum(covs) / len(covs))

        # Top recommendations across the project (highest-priority first).
        recs = fetch_all(self.db, AIRecommendation, {"project_id": project_id})
        recs.sort(key=lambda r: {"P1": 0, "P2": 1, "P3": 2}.get(r.priority, 3))
        top = [
            dto.CopilotRecommendationItem(
                id=r.id, title=r.title, rationale=r.rationale, impact=r.impact, priority=r.priority
            )
            for r in recs[:5]
        ]
        return dto.ExecutiveSummaryDTO(
            project=self._project_ref(project),
            overall_score=overall,
            band=_band_for(overall),
            business_value=(score.business_value if score and score.business_value else 80),
            productivity_uplift_pct=(score.productivity_uplift_pct if score and score.productivity_uplift_pct else 30),
            compliance_score=(score.compliance_score if score and score.compliance_score else 85),
            risk_score=(score.risk_score if score and score.risk_score else 45),
            ai_confidence=(score.ai_confidence if score and score.ai_confidence else 90),
            engineering_health=eng_health,
            manual_effort_saved_days=(score.manual_effort_saved_days if score and score.manual_effort_saved_days else 40),
            documentation_pages=(score.documentation_pages if score and score.documentation_pages else 120),
            phase_scores=phase_scores,
            executive_summary=(
                score.executive_summary if score and score.executive_summary
                else f"AI orchestrated an end-to-end SDLC run for {project.name}; overall readiness {overall}/100."
            ),
            top_recommendations=top,
        )

    def portfolio_executive(self) -> dto.PortfolioExecutiveDTO:
        projects = fetch_all(self.db, Project, sort_by="name")
        summaries = [self.executive_summary(p.id) for p in projects]
        if summaries:
            overall = round(sum(s.overall_score for s in summaries) / len(summaries))
            avg_conf = round(sum(s.ai_confidence for s in summaries) / len(summaries))
        else:
            overall = 0
            avg_conf = 0
        return dto.PortfolioExecutiveDTO(
            projects=summaries,
            portfolio_overall_score=overall,
            portfolio_band=_band_for(overall),
            total_manual_effort_saved_days=sum(s.manual_effort_saved_days for s in summaries),
            total_documentation_pages=sum(s.documentation_pages for s in summaries),
            average_ai_confidence=avg_conf,
        )

    # --- Artifacts (business catalog view, not CRUD rows) ---
    def artifact_catalog(self, project_id: int) -> dto.ArtifactCatalog:
        project = self._project(project_id)
        artifacts = fetch_all(self.db, Artifact, {"project_id": project_id}, sort_by="reference")
        groups: dict[str, list] = {}
        for a in artifacts:
            key = a.artifact_type.value if hasattr(a.artifact_type, "value") else str(a.artifact_type)
            groups.setdefault(key, []).append(a)
        group_dtos = [
            dto.ArtifactGroup(artifact_type=k, count=len(v), items=v)
            for k, v in sorted(groups.items())
        ]
        return dto.ArtifactCatalog(
            project=self._project_ref(project),
            total=len(artifacts),
            groups=group_dtos,
        )

    # --- Traceability chain (Prompt -> ... -> Evidence) ---
    def traceability_chain(self, project_id: int) -> dto.TraceabilityChain:
        project = self._project(project_id)
        links = fetch_all(self.db, TraceabilityLink, {"project_id": project_id}, sort_by="id")

        # Build an ordered node list following the canonical SDLC flow.
        order = ["Prompt", "Requirement", "Architecture", "Development", "Testing", "Release", "Go Live", "Audit", "Evidence"]
        node_map: dict[str, dto.TraceabilityNode] = {}

        def upsert(phase_label: str, ref: Optional[str], etype: Optional[str], eid: Optional[int], detail: Optional[str]):
            if phase_label not in node_map:
                node_map[phase_label] = dto.TraceabilityNode(
                    phase=phase_label, label=phase_label, reference=ref,
                    entity_type=etype, entity_id=eid, detail=detail,
                )

        for link in links:
            upsert(link.source_type, link.source_reference, link.source_type, link.source_id, link.detail)
            upsert(link.target_type, link.target_reference, link.target_type, link.target_id, link.detail)

        nodes = [node_map[label] for label in order if label in node_map]
        # Any nodes not in the canonical order are appended.
        nodes += [n for k, n in node_map.items() if k not in order]
        chain_id = links[0].chain_id if links else None
        complete = len(nodes) >= 6
        return dto.TraceabilityChain(
            project=self._project_ref(project),
            chain_id=chain_id,
            nodes=nodes,
            links=links,
            complete=complete,
        )
