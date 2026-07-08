"""Composed artifact quality scorecard — quality engine + validator + rules + rubric."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.schemas.rules import RuleRunRequest
from app.services.artifact_generator import ArtifactGenerator
from app.services.quality_engine import QualityEngine
from app.services.rule_engine import rule_engine
from app.services.rubric_service import RubricService


class QualityScorecardService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.quality = QualityEngine(db)
        self.rubrics = RubricService()
        self.generator = ArtifactGenerator(db)

    def scorecard(
        self,
        *,
        project_id: int = 1,
        artifact_type: str = "BRD",
        artifact_content: str | None = None,
        connector_records: list[dict] | None = None,
    ) -> dict:
        quality_report = self.quality.score_generated(project_id, artifact_type)
        rubric = self.rubrics.get(artifact_type)
        rule_report = rule_engine.run(RuleRunRequest(
            artifact_type=artifact_type,
            artifact_content=artifact_content or quality_report.artifact_type,
            connector_records=connector_records or [],
            project_id=project_id,
        ))
        composite = round(
            (quality_report.overall_score * 0.5)
            + (rule_report.passed / max(rule_report.total, 1) * 100 * 0.3)
            + (20 if rule_report.overall_status == "pass" else 10),
        )
        return {
            "project_id": project_id,
            "artifact_type": artifact_type,
            "composite_score": min(composite, 100),
            "quality_dimensions": quality_report.model_dump(),
            "rubric_criteria": rubric.model_dump() if rubric else None,
            "rule_report": rule_report.model_dump(),
            "grade": "A" if composite >= 85 else "B" if composite >= 70 else "C" if composite >= 55 else "D",
        }
