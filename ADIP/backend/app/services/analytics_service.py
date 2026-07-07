"""Traceability-enhancement (Phase 6) and executive-analytics (Phase 7) services.

Reuses the aggregation helper (`fetch_all`) and `SdlcService` — no duplicate
queries or services.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.models.ai import AIRisk, ExecutiveScore
from app.models.artifacts import TraceabilityLink
from app.models.development import DevelopmentStory, SourceCodeMetadata
from app.models.enums import DefectSeverity, RiskStatus, Severity, StoryStatus
from app.models.organization import Project
from app.models.requirements import Requirement
from app.models.testing import Defect, TestCase
from app.repositories.aggregation import fetch_all
from app.schemas import analytics as dto
from app.services.sdlc_service import SdlcService, _band_for


class AnalyticsService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.sdlc = SdlcService(db)

    def _project(self, project_id: int) -> Project:
        project = self.db.get(Project, project_id)
        if project is None:
            raise NotFoundError(f"Project {project_id} not found.")
        return project

    # --- Phase 6: traceability matrix ---
    def traceability_matrix(self, project_id: int) -> dto.TraceabilityMatrix:
        project = self._project(project_id)
        requirements = fetch_all(self.db, Requirement, {"project_id": project_id}, sort_by="reference")
        stories = fetch_all(self.db, DevelopmentStory, {"project_id": project_id})
        tests = fetch_all(self.db, TestCase, {"project_id": project_id})

        stories_by_req: dict[int, list[str]] = {}
        for s in stories:
            if s.requirement_id:
                stories_by_req.setdefault(s.requirement_id, []).append(s.reference)
        tests_by_req: dict[int, list[str]] = {}
        for t in tests:
            if t.requirement_id:
                tests_by_req.setdefault(t.requirement_id, []).append(t.reference)

        rows: list[dto.TraceabilityMatrixRow] = []
        covered = 0
        for r in requirements:
            dev_refs = stories_by_req.get(r.id, [])
            test_refs = tests_by_req.get(r.id, [])
            is_covered = bool(dev_refs and test_refs)
            if is_covered:
                covered += 1
            rows.append(
                dto.TraceabilityMatrixRow(
                    requirement_id=r.id,
                    requirement_reference=r.reference,
                    requirement_title=r.title,
                    architecture_refs=[],  # architecture links are project-level in seed
                    development_refs=dev_refs,
                    test_refs=test_refs,
                    covered=is_covered,
                )
            )
        total = len(requirements)
        return dto.TraceabilityMatrix(
            project=self.sdlc._project_ref(project),  # noqa: SLF001
            rows=rows,
            total_requirements=total,
            covered_requirements=covered,
            coverage_pct=round(covered / total * 100) if total else 0,
        )

    def impact_analysis(self, project_id: int, requirement_id: int) -> dto.ImpactAnalysis:
        project = self._project(project_id)
        req = self.db.get(Requirement, requirement_id)
        if req is None or req.project_id != project_id:
            raise NotFoundError(f"Requirement {requirement_id} not found in project {project_id}.")

        stories = [s for s in fetch_all(self.db, DevelopmentStory, {"project_id": project_id})
                   if s.requirement_id == requirement_id]
        tests = [t for t in fetch_all(self.db, TestCase, {"project_id": project_id})
                 if t.requirement_id == requirement_id]
        downstream = (
            [{"type": "DevelopmentStory", "reference": s.reference, "title": s.title} for s in stories]
            + [{"type": "TestCase", "reference": t.reference, "title": t.title} for t in tests]
        )
        upstream = [{"type": "Prompt", "reference": f"{project.code}-PROMPT", "title": f"{project.name} scenario"}]
        return dto.ImpactAnalysis(
            project=self.sdlc._project_ref(project),  # noqa: SLF001
            entity_type="Requirement",
            entity_id=requirement_id,
            entity_reference=req.reference,
            upstream=upstream,
            downstream=downstream,
        )

    # --- Phase 7: executive analytics ---
    def portfolio_health(self) -> dto.PortfolioHealth:
        projects = fetch_all(self.db, Project, sort_by="name")
        items: list[dto.PortfolioHealthItem] = []
        healthy = at_risk = 0
        for p in projects:
            summary = self.sdlc.executive_summary(p.id)
            items.append(
                dto.PortfolioHealthItem(
                    project=self.sdlc._project_ref(p),  # noqa: SLF001
                    overall_score=summary.overall_score,
                    band=summary.band,
                    risk_score=summary.risk_score,
                    compliance_score=summary.compliance_score,
                )
            )
            if summary.overall_score >= 82:
                healthy += 1
            elif summary.overall_score < 72:
                at_risk += 1
        overall = round(sum(i.overall_score for i in items) / len(items)) if items else 0
        return dto.PortfolioHealth(
            items=items,
            portfolio_score=overall,
            portfolio_band=_band_for(overall),
            healthy=healthy,
            at_risk=at_risk,
        )

    def risk_rollup(self) -> dto.RiskRollup:
        projects = fetch_all(self.db, Project, sort_by="name")
        items: list[dto.RiskRollupItem] = []
        total_open = total_crit = 0
        total_exposure = 0.0
        for p in projects:
            risks = fetch_all(self.db, AIRisk, {"project_id": p.id})
            open_risks = [r for r in risks if r.status != RiskStatus.CLOSED]
            crit = [r for r in risks if r.severity == Severity.CRITICAL]
            exposure = sum(r.exposure_value or 0 for r in risks)
            total_open += len(open_risks)
            total_crit += len(crit)
            total_exposure += exposure
            items.append(
                dto.RiskRollupItem(
                    project_id=p.id,
                    project_name=p.name,
                    open_risks=len(open_risks),
                    critical_risks=len(crit),
                    total_exposure=exposure,
                )
            )
        return dto.RiskRollup(
            items=items,
            total_open=total_open,
            total_critical=total_crit,
            total_exposure=total_exposure,
        )

    def engineering_kpis(self, project_id: int) -> dto.EngineeringKpis:
        project = self._project(project_id)
        stories = fetch_all(self.db, DevelopmentStory, {"project_id": project_id})
        done = [s for s in stories if s.status == StoryStatus.DONE]
        velocity = sum(s.story_points or 0 for s in done)
        story_ids = {s.id for s in stories}
        source = [m for m in fetch_all(self.db, SourceCodeMetadata) if m.story_id in story_ids]
        covs = [m.coverage_pct for m in source if m.coverage_pct is not None]
        defects = fetch_all(self.db, Defect, {"project_id": project_id})
        open_def = [d for d in defects if d.status != "Closed"]
        crit_def = [d for d in defects if d.severity in (DefectSeverity.S1, DefectSeverity.S2)]
        cases = fetch_all(self.db, TestCase, {"project_id": project_id})
        automated = [c for c in cases if c.is_automated]
        return dto.EngineeringKpis(
            project=self.sdlc._project_ref(project),  # noqa: SLF001
            total_stories=len(stories),
            done_stories=len(done),
            velocity_points=velocity,
            average_coverage=round(sum(covs) / len(covs)) if covs else 0,
            total_defects=len(defects),
            open_defects=len(open_def),
            critical_defects=len(crit_def),
            automation_pct=round(len(automated) / len(cases) * 100) if cases else 0,
        )

    def executive_trend(self, project_id: int, metric: str = "overall_score") -> dto.ExecutiveTrend:
        project = self._project(project_id)
        allowed = {
            "overall_score", "business_value", "risk_score", "compliance_score", "ai_confidence",
        }
        if metric not in allowed:
            metric = "overall_score"
        scores = fetch_all(self.db, ExecutiveScore, {"project_id": project_id}, sort_by="id", sort_dir="asc")
        points = [
            dto.TrendPoint(
                sequence=i + 1,
                label=f"Snapshot {i + 1}",
                overall_score=s.overall_score,
                business_value=s.business_value,
                risk_score=s.risk_score,
                compliance_score=s.compliance_score,
                ai_confidence=s.ai_confidence,
            )
            for i, s in enumerate(scores)
        ]
        return dto.ExecutiveTrend(
            project=self.sdlc._project_ref(project),  # noqa: SLF001
            metric=metric,
            points=points,
        )

    def value_metrics(self, project_id: int) -> dto.ValueMetrics:
        e = self.sdlc.executive_summary(project_id)
        return dto.ValueMetrics(
            project=e.project,
            business_value=e.business_value,
            productivity_uplift_pct=e.productivity_uplift_pct,
            manual_effort_saved_days=e.manual_effort_saved_days,
            documentation_pages=e.documentation_pages,
            ai_confidence=e.ai_confidence,
        )
