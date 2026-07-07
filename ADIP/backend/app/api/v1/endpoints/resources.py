"""Declarative registration of all Phase 2 CRUD resource routers.

Each entry maps an ORM model + its schemas to a REST resource with pagination,
filtering, sorting and search. Keeping this table in one place makes the API
surface easy to audit and extend.
"""
from __future__ import annotations

from app.api.v1.crud_factory import FilterSpec, build_crud_router
from app.models import (
    AIRecommendation,
    AIRisk,
    ActivityLog,
    Application,
    Architecture,
    ArchitectureReview,
    Artifact,
    AuditEvidence,
    CodeReview,
    ComplianceRecord,
    CopilotFinding,
    Defect,
    Deployment,
    DevelopmentStory,
    DevelopmentTask,
    ExecutiveScore,
    GoLive,
    KnowledgeArticle,
    Notification,
    Persona,
    Project,
    Release,
    Requirement,
    RequirementAnalysis,
    SourceCodeMetadata,
    TestCase,
    TestExecution,
    TraceabilityLink,
    TransformationProgram,
)
from app.schemas import ai as ai_s
from app.schemas import architecture as arch_s
from app.schemas import artifacts as art_s
from app.schemas import audit as audit_s
from app.schemas import development as dev_s
from app.schemas import organization as org_s
from app.schemas import platform as plat_s
from app.schemas import release as rel_s
from app.schemas import requirements as req_s
from app.schemas import testing as test_s

# Each router is built once at import time.
routers = [
    # --- Organization ---
    build_crud_router(
        prefix="/projects", tags=["Projects"], model=Project,
        read_schema=org_s.ProjectRead, create_schema=org_s.ProjectCreate,
        update_schema=org_s.ProjectUpdate,
        search_fields=("name", "code", "description", "sponsor"),
        default_sort="name",
        filters=[FilterSpec(name="status", type=str), FilterSpec(name="domain_id")],
    ),
    build_crud_router(
        prefix="/personas", tags=["Personas"], model=Persona,
        read_schema=org_s.PersonaRead, create_schema=org_s.PersonaCreate,
        update_schema=org_s.PersonaUpdate,
        search_fields=("key", "label", "title", "mission"),
        default_sort="key",
    ),
    build_crud_router(
        prefix="/applications", tags=["Applications"], model=Application,
        read_schema=org_s.ApplicationRead, create_schema=org_s.ApplicationCreate,
        update_schema=org_s.ApplicationUpdate,
        search_fields=("name", "code", "technology"),
        default_sort="name",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="domain_id"),
                 FilterSpec(name="criticality", type=str)],
    ),
    # --- Requirements ---
    build_crud_router(
        prefix="/requirements", tags=["Requirements"], model=Requirement,
        read_schema=req_s.RequirementRead, create_schema=req_s.RequirementCreate,
        update_schema=req_s.RequirementUpdate,
        search_fields=("reference", "title", "detail"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"),
                 FilterSpec(name="requirement_type", type=str),
                 FilterSpec(name="status", type=str),
                 FilterSpec(name="priority", type=str)],
    ),
    build_crud_router(
        prefix="/requirement-analysis", tags=["Requirement Analysis"], model=RequirementAnalysis,
        read_schema=req_s.RequirementAnalysisRead, create_schema=req_s.RequirementAnalysisCreate,
        update_schema=req_s.RequirementAnalysisUpdate,
        search_fields=("issue_type", "finding", "recommendation"),
        filters=[FilterSpec(name="requirement_id"),
                 FilterSpec(name="severity", type=str),
                 FilterSpec(name="issue_type", type=str)],
    ),
    # --- Architecture ---
    build_crud_router(
        prefix="/architecture", tags=["Architecture"], model=Architecture,
        read_schema=arch_s.ArchitectureRead, create_schema=arch_s.ArchitectureCreate,
        update_schema=arch_s.ArchitectureUpdate,
        search_fields=("reference", "title", "detail", "view_type"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="view_type", type=str)],
    ),
    build_crud_router(
        prefix="/architecture-review", tags=["Architecture Review"], model=ArchitectureReview,
        read_schema=arch_s.ArchitectureReviewRead, create_schema=arch_s.ArchitectureReviewCreate,
        update_schema=arch_s.ArchitectureReviewUpdate,
        search_fields=("category", "finding", "recommendation"),
        filters=[FilterSpec(name="architecture_id"), FilterSpec(name="severity", type=str)],
    ),
    # --- Development ---
    build_crud_router(
        prefix="/development-stories", tags=["Development Stories"], model=DevelopmentStory,
        read_schema=dev_s.DevelopmentStoryRead, create_schema=dev_s.DevelopmentStoryCreate,
        update_schema=dev_s.DevelopmentStoryUpdate,
        search_fields=("reference", "title", "description", "assignee"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="requirement_id"),
                 FilterSpec(name="status", type=str)],
    ),
    build_crud_router(
        prefix="/development-tasks", tags=["Development Tasks"], model=DevelopmentTask,
        read_schema=dev_s.DevelopmentTaskRead, create_schema=dev_s.DevelopmentTaskCreate,
        update_schema=dev_s.DevelopmentTaskUpdate,
        search_fields=("title",),
        filters=[FilterSpec(name="story_id"), FilterSpec(name="status", type=str)],
    ),
    build_crud_router(
        prefix="/source-code-metadata", tags=["Source Code Metadata"], model=SourceCodeMetadata,
        read_schema=dev_s.SourceCodeMetadataRead, create_schema=dev_s.SourceCodeMetadataCreate,
        update_schema=dev_s.SourceCodeMetadataUpdate,
        search_fields=("repository", "module", "language"),
        filters=[FilterSpec(name="story_id"), FilterSpec(name="language", type=str)],
    ),
    build_crud_router(
        prefix="/code-review", tags=["Code Review"], model=CodeReview,
        read_schema=dev_s.CodeReviewRead, create_schema=dev_s.CodeReviewCreate,
        update_schema=dev_s.CodeReviewUpdate,
        search_fields=("category", "finding", "recommendation"),
        filters=[FilterSpec(name="story_id"), FilterSpec(name="severity", type=str)],
    ),
    # --- Testing ---
    build_crud_router(
        prefix="/test-cases", tags=["Test Cases"], model=TestCase,
        read_schema=test_s.TestCaseRead, create_schema=test_s.TestCaseCreate,
        update_schema=test_s.TestCaseUpdate,
        search_fields=("reference", "title", "steps", "expected_result"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="requirement_id"),
                 FilterSpec(name="test_type", type=str)],
    ),
    build_crud_router(
        prefix="/test-execution", tags=["Test Execution"], model=TestExecution,
        read_schema=test_s.TestExecutionRead, create_schema=test_s.TestExecutionCreate,
        update_schema=test_s.TestExecutionUpdate,
        search_fields=("executed_by", "environment", "notes"),
        filters=[FilterSpec(name="test_case_id"), FilterSpec(name="result", type=str)],
    ),
    build_crud_router(
        prefix="/defects", tags=["Defects"], model=Defect,
        read_schema=test_s.DefectRead, create_schema=test_s.DefectCreate,
        update_schema=test_s.DefectUpdate,
        search_fields=("reference", "title", "description"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="severity", type=str),
                 FilterSpec(name="status", type=str)],
    ),
    # --- Release ---
    build_crud_router(
        prefix="/releases", tags=["Releases"], model=Release,
        read_schema=rel_s.ReleaseRead, create_schema=rel_s.ReleaseCreate,
        update_schema=rel_s.ReleaseUpdate,
        search_fields=("reference", "name", "version"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="status", type=str)],
    ),
    build_crud_router(
        prefix="/deployments", tags=["Deployments"], model=Deployment,
        read_schema=rel_s.DeploymentRead, create_schema=rel_s.DeploymentCreate,
        update_schema=rel_s.DeploymentUpdate,
        search_fields=("environment", "strategy", "status", "deployed_by"),
        filters=[FilterSpec(name="release_id"), FilterSpec(name="environment", type=str)],
    ),
    build_crud_router(
        prefix="/go-live", tags=["Go Live"], model=GoLive,
        read_schema=rel_s.GoLiveRead, create_schema=rel_s.GoLiveCreate,
        update_schema=rel_s.GoLiveUpdate,
        search_fields=("checklist", "rationale", "approved_by"),
        filters=[FilterSpec(name="release_id"), FilterSpec(name="verdict", type=str)],
    ),
    # --- Audit ---
    build_crud_router(
        prefix="/audit-evidence", tags=["Audit Evidence"], model=AuditEvidence,
        read_schema=audit_s.AuditEvidenceRead, create_schema=audit_s.AuditEvidenceCreate,
        update_schema=audit_s.AuditEvidenceUpdate,
        search_fields=("reference", "evidence_type", "title", "detail"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="evidence_type", type=str),
                 FilterSpec(name="status", type=str)],
    ),
    build_crud_router(
        prefix="/compliance-records", tags=["Compliance Records"], model=ComplianceRecord,
        read_schema=audit_s.ComplianceRecordRead, create_schema=audit_s.ComplianceRecordCreate,
        update_schema=audit_s.ComplianceRecordUpdate,
        search_fields=("framework", "control_reference", "notes"),
        filters=[FilterSpec(name="evidence_id"), FilterSpec(name="framework", type=str),
                 FilterSpec(name="status", type=str)],
    ),
    # --- Artifacts + Traceability ---
    build_crud_router(
        prefix="/artifacts", tags=["Artifacts"], model=Artifact,
        read_schema=art_s.ArtifactRead, create_schema=art_s.ArtifactCreate,
        update_schema=art_s.ArtifactUpdate,
        search_fields=("reference", "name", "description", "executive_summary"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="artifact_type", type=str),
                 FilterSpec(name="phase", type=str), FilterSpec(name="approval_status", type=str)],
    ),
    build_crud_router(
        prefix="/traceability-links", tags=["Traceability Links"], model=TraceabilityLink,
        read_schema=art_s.TraceabilityLinkRead, create_schema=art_s.TraceabilityLinkCreate,
        update_schema=art_s.TraceabilityLinkUpdate,
        search_fields=("source_type", "target_type", "source_reference", "target_reference", "detail"),
        filters=[FilterSpec(name="project_id"), FilterSpec(name="chain_id", type=str)],
    ),
    # --- AI ---
    build_crud_router(
        prefix="/copilot-findings", tags=["Copilot Findings"], model=CopilotFinding,
        read_schema=ai_s.CopilotFindingRead, create_schema=ai_s.CopilotFindingCreate,
        update_schema=ai_s.CopilotFindingUpdate,
        search_fields=("title", "detail", "badge", "reasoning"),
        filters=[FilterSpec(name="project_id"), FilterSpec(name="copilot_type", type=str),
                 FilterSpec(name="phase", type=str), FilterSpec(name="severity", type=str)],
    ),
    build_crud_router(
        prefix="/ai-recommendations", tags=["AI Recommendations"], model=AIRecommendation,
        read_schema=ai_s.AIRecommendationRead, create_schema=ai_s.AIRecommendationCreate,
        update_schema=ai_s.AIRecommendationUpdate,
        search_fields=("title", "rationale", "impact", "badge"),
        filters=[FilterSpec(name="project_id"), FilterSpec(name="finding_id"),
                 FilterSpec(name="copilot_type", type=str)],
    ),
    build_crud_router(
        prefix="/executive-scores", tags=["Executive Scores"], model=ExecutiveScore,
        read_schema=ai_s.ExecutiveScoreRead, create_schema=ai_s.ExecutiveScoreCreate,
        update_schema=ai_s.ExecutiveScoreUpdate,
        search_fields=("band", "executive_summary"),
        default_sort="id",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="band", type=str)],
    ),
    build_crud_router(
        prefix="/ai-risk", tags=["AI Risk"], model=AIRisk,
        read_schema=ai_s.AIRiskRead, create_schema=ai_s.AIRiskCreate,
        update_schema=ai_s.AIRiskUpdate,
        search_fields=("reference", "title", "category", "mitigation"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="severity", type=str),
                 FilterSpec(name="status", type=str), FilterSpec(name="category", type=str)],
    ),
    # --- Platform ---
    build_crud_router(
        prefix="/knowledge-articles", tags=["Knowledge Articles"], model=KnowledgeArticle,
        read_schema=plat_s.KnowledgeArticleRead, create_schema=plat_s.KnowledgeArticleCreate,
        update_schema=plat_s.KnowledgeArticleUpdate,
        search_fields=("reference", "title", "summary", "body", "tags"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="category", type=str)],
    ),
    build_crud_router(
        prefix="/transformation-programs", tags=["Transformation Programs"], model=TransformationProgram,
        read_schema=plat_s.TransformationProgramRead, create_schema=plat_s.TransformationProgramCreate,
        update_schema=plat_s.TransformationProgramUpdate,
        search_fields=("reference", "name", "description", "owner"),
        default_sort="reference",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="status", type=str)],
    ),
    build_crud_router(
        prefix="/activity-log", tags=["Activity Log"], model=ActivityLog,
        read_schema=plat_s.ActivityLogRead, create_schema=plat_s.ActivityLogCreate,
        update_schema=plat_s.ActivityLogUpdate,
        search_fields=("actor", "action", "entity_type", "entity_reference", "detail"),
        default_sort="id",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="action", type=str),
                 FilterSpec(name="entity_type", type=str)],
    ),
    build_crud_router(
        prefix="/notifications", tags=["Notifications"], model=Notification,
        read_schema=plat_s.NotificationRead, create_schema=plat_s.NotificationCreate,
        update_schema=plat_s.NotificationUpdate,
        search_fields=("title", "message"),
        default_sort="id",
        filters=[FilterSpec(name="project_id"), FilterSpec(name="level", type=str),
                 FilterSpec(name="is_read", type=bool)],
    ),
]
