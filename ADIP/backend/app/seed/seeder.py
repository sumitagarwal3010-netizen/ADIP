"""Deterministic banking mock-data seeder.

Populates the database with 3 flagship banking projects (Net Banking, Mobile
Banking, Payments), each with 50+ requirements, plus architecture, development,
testing, release, audit, artifacts, copilot findings, recommendations,
executive scores, AI risks, traceability, knowledge and transformation records.

Idempotent: running twice is a no-op unless ``reset=True`` (which drops and
recreates all tables first).
"""
from __future__ import annotations

import random
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.logging import get_logger
from app.db.base import Base
from app.db.session import SessionLocal, engine
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
from app.models.enums import (
    ApprovalStatus,
    ArtifactType,
    ComplianceStatus,
    CopilotType,
    DefectSeverity,
    GoLiveVerdict,
    NotificationLevel,
    Readiness,
    ReleaseStatus,
    RequirementStatus,
    RequirementType,
    RiskStatus,
    SdlcPhase,
    Severity,
    StoryStatus,
    TestResult,
    TestType,
)
from app.models.organization import (
    Application,
    BusinessDomain,
    Project,
    Role,
    User,
)
from app.models.platform import (
    ActivityLog,
    KnowledgeArticle,
    Notification,
    TransformationProgram,
)
from app.models.release import Deployment, GoLive, Release
from app.models.requirements import Requirement, RequirementAnalysis
from app.models.testing import Defect, TestCase, TestExecution
from app.seed import banking_data as bd

logger = get_logger(__name__)

# Deterministic output across runs.
SEED = 20260707

COPILOT_BY_PHASE = {
    SdlcPhase.REQUIREMENTS: CopilotType.REQUIREMENT,
    SdlcPhase.ARCHITECTURE: CopilotType.ARCHITECTURE,
    SdlcPhase.DEVELOPMENT: CopilotType.DEVELOPMENT,
    SdlcPhase.TESTING: CopilotType.TESTING,
    SdlcPhase.RELEASE: CopilotType.RELEASE,
    SdlcPhase.AUDIT: CopilotType.AUDIT,
}


def _cycle(items: list, i: int):
    return items[i % len(items)]


def create_all_tables(reset: bool = False) -> None:
    """Create all tables (optionally dropping first)."""
    if reset:
        logger.info("Dropping all tables (reset=True)...")
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def already_seeded(db: Session) -> bool:
    return db.scalar(select(Project).limit(1)) is not None


def _seed_reference_data(db: Session) -> dict[str, BusinessDomain]:
    """Seed roles, users and business domains. Returns domain lookup by code."""
    for name, label in bd.ROLES:
        db.add(Role(name=name, label=label, description=f"{label} role"))

    domains: dict[str, BusinessDomain] = {}
    for name, code in bd.BUSINESS_DOMAINS:
        domain = BusinessDomain(name=name, code=code, description=f"{name} domain")
        db.add(domain)
        domains[code] = domain

    for username, full_name, title, _role in bd.USERS:
        db.add(
            User(
                username=username,
                email=f"{username}@bank.example.com",
                full_name=full_name,
                title=title,
            )
        )
    db.flush()
    return domains


def _seed_project(db: Session, rng: random.Random, spec: dict, domains: dict) -> dict:
    """Seed a single project and all its child entities. Returns a count dict."""
    counts: dict[str, int] = {}
    code = spec["code"]
    domain = domains.get("PAY") if code == "PAYM" else _cycle(list(domains.values()), hash(code))

    project = Project(
        name=spec["name"],
        code=code,
        description=spec["description"],
        sponsor=spec["sponsor"],
        health_score=rng.randint(72, 92),
        start_date=date(2026, 1, 15),
        target_date=date(2026, 9, 30),
        domain=domain,
    )
    db.add(project)
    db.flush()

    # --- Applications ---
    applications = bd.get_applications(code)
    for name, app_code, tech in applications:
        db.add(
            Application(
                name=name,
                code=app_code,
                technology=tech,
                project_id=project.id,
                domain_id=domain.id if domain else None,
                criticality=rng.choice(["Critical", "High", "High", "Medium"]),
            )
        )
    counts["applications"] = len(applications)

    # --- Requirements (50+): business + functional cycled, plus NFR/assumption/dependency/AC ---
    requirements: list[Requirement] = []
    base_titles = bd.get_requirement_templates(code)
    n_functional = 34
    for i in range(n_functional):
        rtype = RequirementType.BUSINESS if i % 5 == 0 else RequirementType.FUNCTIONAL
        title = _cycle(base_titles, i)
        req = Requirement(
            project_id=project.id,
            reference=f"{code}-REQ-{i + 1:03d}",
            requirement_type=rtype,
            title=title if i < len(base_titles) else f"{title} (variant {i // len(base_titles) + 1})",
            detail=f"{title}. Derived from the {spec['name']} business scenario with RBI/NPCI considerations.",
            priority=_cycle(["P1", "P2", "P2", "P3"], i),
            status=_cycle(
                [RequirementStatus.APPROVED, RequirementStatus.IN_REVIEW, RequirementStatus.DRAFT], i
            ),
            acceptance_criteria=f"Given the {spec['name']} context, when the scenario runs, then the expected outcome is met.",
            quality_score=rng.randint(68, 95),
        )
        requirements.append(req)
        db.add(req)

    for i, title in enumerate(bd.get_nfr_titles()):
        requirements.append(
            _add_req(db, project.id, f"{code}-NFR-{i + 1:03d}", RequirementType.NON_FUNCTIONAL, title, rng)
        )
    for i, title in enumerate(bd.get_assumption_titles()):
        requirements.append(
            _add_req(db, project.id, f"{code}-ASM-{i + 1:03d}", RequirementType.ASSUMPTION, title, rng)
        )
    for i, title in enumerate(bd.get_dependency_titles()):
        requirements.append(
            _add_req(db, project.id, f"{code}-DEP-{i + 1:03d}", RequirementType.DEPENDENCY, title, rng)
        )
    for i in range(6):
        requirements.append(
            _add_req(
                db, project.id, f"{code}-AC-{i + 1:03d}", RequirementType.ACCEPTANCE_CRITERIA,
                f"Acceptance criteria set {i + 1} for {spec['name']}", rng,
            )
        )
    db.flush()
    counts["requirements"] = len(requirements)

    # --- Requirement analysis (gap analysis) on ~40% of requirements ---
    analysis_count = 0
    for i, req in enumerate(requirements):
        if i % 5 in (0, 2):
            issue, finding = _cycle(bd.ANALYSIS_ISSUES, i)
            db.add(
                RequirementAnalysis(
                    requirement_id=req.id,
                    issue_type=issue,
                    severity=_cycle([Severity.HIGH, Severity.MEDIUM, Severity.CRITICAL], i),
                    finding=finding,
                    recommendation="Refine and add explicit, testable acceptance criteria.",
                    gap="Missing measurable threshold / control reference.",
                )
            )
            analysis_count += 1
    counts["requirement_analysis"] = analysis_count

    # --- Architecture views + reviews ---
    architectures: list[Architecture] = []
    for i, (view, desc) in enumerate(bd.get_arch_views()):
        arch = Architecture(
            project_id=project.id,
            reference=f"{code}-ARC-{i + 1:03d}",
            view_type=view,
            title=f"{view} — {spec['name']}",
            detail=desc,
            impacted_systems=", ".join(a[0] for a in applications),
            readiness_score=rng.randint(70, 90),
        )
        architectures.append(arch)
        db.add(arch)
    db.flush()
    counts["architecture"] = len(architectures)

    arch_review_count = 0
    for i, arch in enumerate(architectures):
        for j in range(2):
            cat, sev, finding = _cycle(bd.ARCH_FINDINGS, i + j)
            db.add(
                ArchitectureReview(
                    architecture_id=arch.id,
                    category=cat,
                    severity=Severity(sev),
                    finding=finding,
                    recommendation="Adopt the recommended resilience/decoupling pattern.",
                    verdict=_cycle(["AMBER", "GREEN", "RED"], i + j),
                )
            )
            arch_review_count += 1
    counts["architecture_review"] = arch_review_count

    # --- Development stories (50+) + tasks + source code + code review ---
    stories: list[DevelopmentStory] = []
    story_titles = bd.get_dev_story_templates(code)
    for i in range(52):
        title = _cycle(story_titles, i)
        story = DevelopmentStory(
            project_id=project.id,
            requirement_id=requirements[i % len(requirements)].id,
            reference=f"{code}-DEV-{i + 1:03d}",
            title=title if i < len(story_titles) else f"{title} (part {i // len(story_titles) + 1})",
            description=f"{title} for {spec['name']}.",
            status=_cycle(
                [StoryStatus.DONE, StoryStatus.IN_PROGRESS, StoryStatus.IN_REVIEW, StoryStatus.BACKLOG], i
            ),
            story_points=_cycle([2, 3, 5, 8, 13], i),
            assignee=_cycle([u[1] for u in bd.USERS], i),
            feature_flag=f"{code.lower()}.feature.{i + 1}" if i % 4 == 0 else None,
            readiness_score=rng.randint(60, 92),
        )
        stories.append(story)
        db.add(story)
    db.flush()
    counts["development_stories"] = len(stories)

    task_count = code_meta_count = review_count = 0
    for i, story in enumerate(stories):
        for t in range(rng.randint(1, 3)):
            db.add(
                DevelopmentTask(
                    story_id=story.id,
                    title=f"Task {t + 1} for {story.reference}",
                    status=_cycle([StoryStatus.DONE, StoryStatus.IN_PROGRESS, StoryStatus.BACKLOG], i + t),
                    estimate_hours=rng.choice([4, 8, 16, 24]),
                )
            )
            task_count += 1
        db.add(
            SourceCodeMetadata(
                story_id=story.id,
                repository=f"git@bank:{code.lower()}/{_cycle(applications, i)[1].lower()}.git",
                module=_cycle(applications, i)[0],
                language=rng.choice(["Java", "TypeScript", "Go"]),
                lines_of_code=rng.randint(120, 1800),
                complexity=rng.randint(4, 42),
                coverage_pct=rng.randint(38, 94),
                code_smells=rng.randint(0, 40),
            )
        )
        code_meta_count += 1
        if i % 3 == 0:
            cat, sev, finding = _cycle(bd.DEV_FINDINGS, i)
            db.add(
                CodeReview(
                    story_id=story.id,
                    category=cat,
                    severity=Severity(sev),
                    finding=finding,
                    recommendation="Apply the secure-coding remediation.",
                    is_secure_coding=(cat == "Security"),
                )
            )
            review_count += 1
    counts["development_tasks"] = task_count
    counts["source_code_metadata"] = code_meta_count
    counts["code_review"] = review_count

    # --- Test cases (50+) + executions + defects ---
    test_cases: list[TestCase] = []
    test_titles = bd.get_test_templates(code)
    for i in range(58):
        title = _cycle(test_titles, i)
        tc = TestCase(
            project_id=project.id,
            requirement_id=requirements[i % len(requirements)].id,
            reference=f"{code}-TC-{i + 1:03d}",
            title=title if i < len(test_titles) else f"{title} (case {i // len(test_titles) + 1})",
            test_type=_cycle(
                [TestType.FUNCTIONAL, TestType.NEGATIVE, TestType.REGRESSION, TestType.RECONCILIATION, TestType.PERFORMANCE],
                i,
            ),
            steps=f"1. Set up {spec['name']} preconditions\n2. Execute the scenario\n3. Verify the outcome",
            expected_result="Outcome matches the specification within SLA.",
            is_automated=(i % 3 != 0),
            priority=_cycle(["P1", "P2", "P3"], i),
        )
        test_cases.append(tc)
        db.add(tc)
    db.flush()
    counts["test_cases"] = len(test_cases)

    exec_count = 0
    for i, tc in enumerate(test_cases):
        for r in range(rng.randint(1, 2)):
            db.add(
                TestExecution(
                    test_case_id=tc.id,
                    result=_cycle(
                        [TestResult.PASSED, TestResult.PASSED, TestResult.FAILED, TestResult.BLOCKED, TestResult.NOT_RUN],
                        i + r,
                    ),
                    executed_by=_cycle([u[1] for u in bd.USERS], i),
                    environment=rng.choice(["SIT", "UAT", "Pre-Prod"]),
                    duration_seconds=rng.randint(2, 240),
                    notes=None,
                )
            )
            exec_count += 1
    counts["test_execution"] = exec_count

    defect_count = 0
    for i in range(18):
        db.add(
            Defect(
                project_id=project.id,
                test_case_id=test_cases[i % len(test_cases)].id,
                reference=f"{code}-DEF-{i + 1:03d}",
                title=_cycle(bd.DEFECT_TITLES, i),
                severity=_cycle([DefectSeverity.S1, DefectSeverity.S2, DefectSeverity.S3, DefectSeverity.S4], i),
                status=_cycle(["Open", "In Progress", "Closed", "Deferred"], i),
                description="Observed during test execution; see linked test case.",
            )
        )
        defect_count += 1
    counts["defects"] = defect_count

    # --- Releases + deployments + go-live ---
    releases: list[Release] = []
    for i, name in enumerate(bd.get_release_names(code)):
        rel = Release(
            project_id=project.id,
            reference=f"{code}-REL-{i + 1:03d}",
            name=name,
            version=f"{i + 1}.0.0",
            status=_cycle([ReleaseStatus.PLANNED, ReleaseStatus.IN_PROGRESS, ReleaseStatus.DEPLOYED], i),
            deployment_plan="Blue-green deployment with feature flag defaulted OFF; progressive per-BU enablement.",
            rollback_plan="Disable feature flag, drain in-flight work, revert to N-1. RTO 30 min, RPO 0.",
            cab_summary="Customer money-movement change; requires Payments, Risk and Operations sign-off.",
            monitoring_plan="Reversal-SLA, mismatch rate and NPCI latency dashboards required pre-go-live.",
            readiness_score=rng.randint(70, 88),
            planned_date=date(2026, 6, 15) + timedelta(days=30 * i),
        )
        releases.append(rel)
        db.add(rel)
    db.flush()
    counts["releases"] = len(releases)

    deploy_count = golive_count = 0
    for i, rel in enumerate(releases):
        for env in ["SIT", "UAT", "Production"]:
            db.add(
                Deployment(
                    release_id=rel.id,
                    environment=env,
                    strategy="Blue-Green",
                    status=_cycle(["Success", "Pending", "Success"], i),
                    deployed_by=_cycle([u[1] for u in bd.USERS], i),
                    notes=None,
                )
            )
            deploy_count += 1
        db.add(
            GoLive(
                release_id=rel.id,
                verdict=_cycle(
                    [GoLiveVerdict.CONDITIONAL_GO, GoLiveVerdict.GO, GoLiveVerdict.NO_GO], i
                ),
                checklist="Regression green · rollback rehearsed · monitoring live · on-call confirmed.",
                rationale="Gates green for core scope; conditional items tracked to closure.",
                approved_by="Release Manager",
                go_live_date=date(2026, 6, 20) + timedelta(days=30 * i),
            )
        )
        golive_count += 1
    counts["deployments"] = deploy_count
    counts["go_live"] = golive_count

    # --- Audit evidence + compliance + observations ---
    evidences: list[AuditEvidence] = []
    for i, (etype, title) in enumerate(bd.AUDIT_EVIDENCE):
        ev = AuditEvidence(
            project_id=project.id,
            reference=f"{code}-AUD-{i + 1:03d}",
            evidence_type=etype,
            title=title,
            detail=f"{title} for {spec['name']}.",
            status=_cycle(["Collected", "Pending", "Collected"], i),
            retention_years=7,
        )
        evidences.append(ev)
        db.add(ev)
    db.flush()
    counts["audit_evidence"] = len(evidences)

    compliance_count = obs_count = 0
    for i, ev in enumerate(evidences):
        framework, control = _cycle(bd.COMPLIANCE_FRAMEWORKS, i)
        db.add(
            ComplianceRecord(
                evidence_id=ev.id,
                framework=framework,
                control_reference=control,
                status=_cycle(
                    [ComplianceStatus.COMPLIANT, ComplianceStatus.PARTIAL, ComplianceStatus.NON_COMPLIANT], i
                ),
                notes="Mapped from evidence to control.",
            )
        )
        compliance_count += 1
        if i % 2 == 0:
            db.add(
                AuditObservation(
                    evidence_id=ev.id,
                    severity=_cycle([Severity.HIGH, Severity.MEDIUM, Severity.CRITICAL], i),
                    observation="Evidence gap identified during control testing.",
                    recommendation="Automate evidence capture into the vault.",
                )
            )
            obs_count += 1
    counts["compliance_records"] = compliance_count
    counts["audit_observations"] = obs_count

    # --- Copilot findings (50+) + recommendations across all 6 phases ---
    finding_count = rec_count = 0
    phases = list(SdlcPhase)
    for i in range(54):
        phase = _cycle(phases, i)
        copilot = COPILOT_BY_PHASE[phase]
        score = rng.randint(70, 92)
        finding = CopilotFinding(
            project_id=project.id,
            copilot_type=copilot,
            phase=phase,
            badge=f"{phase.value.title()} · {spec['name']}",
            severity=_cycle([Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM, Severity.INFO], i),
            title=f"{copilot.value} finding {i + 1} for {spec['name']}",
            detail="AI-identified finding derived from the project scenario.",
            reasoning=" · ".join(bd.COPILOT_REASONING[phase.value]),
            confidence=rng.randint(88, 97),
            risk=_cycle(["High", "Medium", "Low"], i),
            readiness=_cycle([Readiness.READY, Readiness.ON_TRACK, Readiness.NEEDS_ATTENTION], i),
        )
        db.add(finding)
        db.flush()
        finding_count += 1
        for r in range(rng.randint(1, 2)):
            db.add(
                AIRecommendation(
                    project_id=project.id,
                    finding_id=finding.id,
                    copilot_type=copilot,
                    badge=phase.value.title(),
                    title=f"Recommendation {r + 1} for {finding.reference if hasattr(finding, 'reference') else finding.id}",
                    rationale="Adopt the recommended control/pattern to close the finding.",
                    impact=_cycle(["Reduces risk", "Improves readiness", "Closes compliance gap"], i + r),
                    priority=_cycle(["P1", "P2", "P3"], i + r),
                )
            )
            rec_count += 1
    counts["copilot_findings"] = finding_count
    counts["ai_recommendations"] = rec_count

    # --- AI risks ---
    risk_count = 0
    for i in range(10):
        db.add(
            AIRisk(
                project_id=project.id,
                reference=f"{code}-RISK-{i + 1:03d}",
                title=f"AI risk {i + 1} for {spec['name']}",
                category=_cycle(["Delivery", "Security", "Compliance", "Operational"], i),
                severity=_cycle([Severity.CRITICAL, Severity.HIGH, Severity.MEDIUM], i),
                likelihood=_cycle(["High", "Medium", "Low"], i),
                impact=_cycle(["Critical", "High", "Medium"], i),
                status=_cycle([RiskStatus.OPEN, RiskStatus.MITIGATING, RiskStatus.CLOSED], i),
                mitigation="Mapped to the remediation plan; tracked to closure.",
                exposure_value=float(rng.randint(5, 320) * 100000),
            )
        )
        risk_count += 1
    counts["ai_risk"] = risk_count

    # --- Executive scores (snapshots) ---
    exec_score_count = 0
    for i in range(3):
        overall = rng.randint(74, 88)
        db.add(
            ExecutiveScore(
                project_id=project.id,
                overall_score=overall,
                band="Ready" if overall >= 82 else "Conditional",
                business_value=rng.randint(60, 95),
                productivity_uplift_pct=rng.randint(22, 40),
                risk_score=rng.randint(30, 70),
                compliance_score=rng.randint(70, 95),
                ai_confidence=rng.randint(85, 96),
                manual_effort_saved_days=rng.randint(20, 60),
                documentation_pages=rng.randint(60, 180),
                executive_summary=f"AI orchestrated an end-to-end SDLC run for {spec['name']}; overall readiness {overall}/100.",
                requirements_score=rng.randint(74, 90),
                architecture_score=rng.randint(70, 88),
                development_score=rng.randint(68, 86),
                testing_score=rng.randint(72, 90),
                release_score=rng.randint(70, 86),
                audit_score=rng.randint(76, 92),
            )
        )
        exec_score_count += 1
    counts["executive_scores"] = exec_score_count

    # --- Artifacts (50+): every artifact type cycled ---
    artifact_types = list(ArtifactType)
    artifact_count = 0
    for i in range(50):
        atype = _cycle(artifact_types, i)
        db.add(
            Artifact(
                project_id=project.id,
                reference=f"{code}-ART-{i + 1:03d}",
                name=f"{spec['name']} {atype.value}"
                + (f" (v{i // len(artifact_types) + 1})" if i >= len(artifact_types) else ""),
                artifact_type=atype,
                phase=_cycle(list(SdlcPhase), i),
                description=f"{atype.value} generated for {spec['name']}.",
                generated_by="AI SDLC Copilot",
                model_used="Gemini",
                version=f"{i // len(artifact_types) + 1}.0",
                approval_status=_cycle(
                    [ApprovalStatus.APPROVED, ApprovalStatus.PENDING_REVIEW, ApprovalStatus.DRAFT], i
                ),
                file_type=_cycle(["docx", "xlsx", "pdf"], i),
                preview_content=f"{atype.value} preview for {spec['name']}...",
                executive_summary=f"AI-generated {atype.value} for {spec['name']}.",
                risk_rating=_cycle(["Low", "Medium", "High"], i),
            )
        )
        artifact_count += 1
    counts["artifacts"] = artifact_count

    # --- Traceability chain: Prompt -> Req -> Arch -> Dev -> Test -> Release -> Audit ---
    trace_count = 0
    chain_pairs = [
        ("Prompt", None, f"{spec['name']} scenario", "Requirement", requirements[0]),
        ("Requirement", requirements[0], None, "Architecture", architectures[0]),
        ("Architecture", architectures[0], None, "Development", stories[0]),
        ("Development", stories[0], None, "Testing", test_cases[0]),
        ("Testing", test_cases[0], None, "Release", releases[0]),
        ("Release", releases[0], None, "Audit", evidences[0]),
    ]
    for src_type, src_obj, src_ref, tgt_type, tgt_obj in chain_pairs:
        db.add(
            TraceabilityLink(
                project_id=project.id,
                chain_id=f"{code}-CHAIN-001",
                source_type=src_type,
                source_id=getattr(src_obj, "id", None),
                source_reference=src_ref or getattr(src_obj, "reference", None),
                target_type=tgt_type,
                target_id=getattr(tgt_obj, "id", None),
                target_reference=getattr(tgt_obj, "reference", None),
                relationship_type="derives",
                detail=f"{src_type} → {tgt_type} for {spec['name']}.",
            )
        )
        trace_count += 1
    counts["traceability_links"] = trace_count

    # --- Knowledge articles ---
    for i, (category, title) in enumerate(bd.KNOWLEDGE_ARTICLES):
        db.add(
            KnowledgeArticle(
                project_id=project.id,
                reference=f"{code}-KB-{i + 1:03d}",
                title=title,
                category=category,
                summary=f"{title} — captured from {spec['name']} delivery.",
                body=f"Full write-up of: {title}.",
                tags=f"{code.lower()},banking,{category.lower().replace(' ', '-')}",
                author=_cycle([u[1] for u in bd.USERS], i),
            )
        )
    counts["knowledge_articles"] = len(bd.KNOWLEDGE_ARTICLES)

    # --- Notifications + activity log ---
    for i in range(6):
        db.add(
            Notification(
                project_id=project.id,
                level=_cycle(
                    [NotificationLevel.INFO, NotificationLevel.WARNING, NotificationLevel.SUCCESS], i
                ),
                title=f"{spec['name']} update {i + 1}",
                message="Automated notification generated during the SDLC run.",
                is_read=(i % 2 == 0),
            )
        )
    counts["notifications"] = 6

    for i in range(8):
        db.add(
            ActivityLog(
                project_id=project.id,
                actor=_cycle([u[1] for u in bd.USERS], i),
                action=_cycle(["created", "updated", "approved", "generated"], i),
                entity_type=_cycle(["Requirement", "Artifact", "Release", "TestCase"], i),
                entity_reference=f"{code}-EVT-{i + 1:03d}",
                detail="Activity recorded by the platform.",
            )
        )
    counts["activity_log"] = 8

    return counts


def _add_req(db: Session, project_id: int, ref: str, rtype: RequirementType, title: str, rng: random.Random) -> Requirement:
    req = Requirement(
        project_id=project_id,
        reference=ref,
        requirement_type=rtype,
        title=title,
        detail=f"{title}.",
        priority=rng.choice(["P1", "P2", "P3"]),
        status=RequirementStatus.APPROVED,
        acceptance_criteria="Measurable threshold defined and verified.",
        quality_score=rng.randint(70, 95),
    )
    db.add(req)
    return req


def _seed_global(db: Session) -> dict:
    """Seed cross-project transformation programs."""
    counts: dict[str, int] = {}
    for i, name in enumerate(bd.TRANSFORMATION_PROGRAMS):
        db.add(
            TransformationProgram(
                reference=f"TP-{i + 1:03d}",
                name=name,
                description=f"{name} — enterprise transformation program.",
                status=_cycle(["On Track", "At Risk", "On Track", "Delayed"], i),
                health_score=random.Random(SEED + i).randint(68, 90),
                benefit_value=random.Random(SEED + i).randint(50, 400),
                owner="Transformation Office",
                start_date=date(2026, 1, 1),
                target_date=date(2026, 12, 31),
            )
        )
    counts["transformation_programs"] = len(bd.TRANSFORMATION_PROGRAMS)
    return counts


def seed(reset: bool = False) -> dict[str, int]:
    """Seed the database. Returns a dict of table -> row count inserted."""
    create_all_tables(reset=reset)
    totals: dict[str, int] = {}

    with SessionLocal() as db:
        if already_seeded(db) and not reset:
            logger.info("Database already seeded; skipping (use reset=True to re-seed).")
            return {}

        rng = random.Random(SEED)
        domains = _seed_reference_data(db)
        totals["roles"] = len(bd.ROLES)
        totals["users"] = len(bd.USERS)
        totals["business_domains"] = len(bd.BUSINESS_DOMAINS)

        for spec in bd.PROJECTS:
            counts = _seed_project(db, rng, spec, domains)
            totals["projects"] = totals.get("projects", 0) + 1
            for k, v in counts.items():
                totals[k] = totals.get(k, 0) + v

        for k, v in _seed_global(db).items():
            totals[k] = totals.get(k, 0) + v

        db.commit()

    logger.info("Seeding complete: %d tables populated.", len(totals))
    return totals
