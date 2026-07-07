"""Phase 1 tests: database schema and seed integrity."""
from __future__ import annotations

from sqlalchemy import func, select

from app.db.session import SessionLocal
from app.models.ai import CopilotFinding, ExecutiveScore
from app.models.artifacts import Artifact, TraceabilityLink
from app.models.organization import Project
from app.models.requirements import Requirement
from app.models.testing import TestCase


def test_three_projects_seeded():
    with SessionLocal() as db:
        names = set(db.scalars(select(Project.name)).all())
    assert {"Net Banking", "Mobile Banking", "Payments"} <= names


def test_each_project_has_50_plus_requirements():
    with SessionLocal() as db:
        for project in db.scalars(select(Project)).all():
            count = db.scalar(
                select(func.count()).select_from(Requirement).where(
                    Requirement.project_id == project.id
                )
            )
            assert count >= 50, f"{project.name} has only {count} requirements"


def test_each_project_has_50_plus_test_cases_and_artifacts():
    with SessionLocal() as db:
        for project in db.scalars(select(Project)).all():
            tcs = db.scalar(
                select(func.count()).select_from(TestCase).where(TestCase.project_id == project.id)
            )
            arts = db.scalar(
                select(func.count()).select_from(Artifact).where(Artifact.project_id == project.id)
            )
            assert tcs >= 50, f"{project.name} test cases: {tcs}"
            assert arts >= 50, f"{project.name} artifacts: {arts}"


def test_copilot_findings_cover_all_projects():
    with SessionLocal() as db:
        for project in db.scalars(select(Project)).all():
            count = db.scalar(
                select(func.count()).select_from(CopilotFinding).where(
                    CopilotFinding.project_id == project.id
                )
            )
            assert count >= 50, f"{project.name} copilot findings: {count}"


def test_executive_scores_present():
    with SessionLocal() as db:
        count = db.scalar(select(func.count()).select_from(ExecutiveScore))
    assert count >= 3


def test_traceability_chain_present():
    with SessionLocal() as db:
        links = db.scalars(select(TraceabilityLink)).all()
    # 6 edges per project x 3 projects.
    assert len(links) >= 18
    types = {(l.source_type, l.target_type) for l in links}
    assert ("Prompt", "Requirement") in types
    assert ("Release", "Audit") in types
