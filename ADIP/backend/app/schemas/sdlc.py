"""Business DTOs for the Phase 3 AI SDLC aggregation APIs.

These are read-only, composed responses assembled from many tables — not CRUD
payloads. They reuse the Phase 2 Read schemas as nested item types.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel

from app.schemas.ai import AIRecommendationRead, CopilotFindingRead
from app.schemas.architecture import ArchitectureRead, ArchitectureReviewRead
from app.schemas.artifacts import ArtifactRead, TraceabilityLinkRead
from app.schemas.audit import (
    AuditEvidenceRead,
    AuditObservationRead,
    ComplianceRecordRead,
)
from app.schemas.development import (
    CodeReviewRead,
    DevelopmentStoryRead,
    DevelopmentTaskRead,
    SourceCodeMetadataRead,
)
from app.schemas.organization import ApplicationRead, ProjectRead
from app.schemas.release import DeploymentRead, GoLiveRead, ReleaseRead
from app.schemas.requirements import RequirementAnalysisRead, RequirementRead
from app.schemas.testing import DefectRead, TestCaseRead, TestExecutionRead


class ProjectRef(BaseModel):
    """Compact project reference embedded in every summary."""

    id: int
    name: str
    code: str
    status: str
    health_score: int


class PhaseScore(BaseModel):
    """Common score + readiness block shared by phase summaries."""

    score: int
    readiness: str
    band: str


# --- Requirements summary ---
class RequirementSummary(BaseModel):
    project: ProjectRef
    business_requirements: list[RequirementRead]
    functional_requirements: list[RequirementRead]
    non_functional_requirements: list[RequirementRead]
    assumptions: list[RequirementRead]
    dependencies: list[RequirementRead]
    acceptance_criteria: list[RequirementRead]
    gap_analysis: list[RequirementAnalysisRead]
    findings: list[CopilotFindingRead]
    recommendations: list[AIRecommendationRead]
    total_requirements: int
    score: int
    readiness: str


# --- Architecture summary ---
class ArchitectureSummary(BaseModel):
    project: ProjectRef
    overview: list[ArchitectureRead]
    logical_design: list[ArchitectureRead]
    physical_design: list[ArchitectureRead]
    integrations: list[ArchitectureRead]
    apis: list[ArchitectureRead]
    database_design: list[ArchitectureRead]
    sequence_metadata: list[ArchitectureRead]
    applications: list[ApplicationRead]
    review_findings: list[ArchitectureReviewRead]
    findings: list[CopilotFindingRead]
    recommendations: list[AIRecommendationRead]
    score: int
    readiness: str


# --- Development summary ---
class DevelopmentSummary(BaseModel):
    project: ProjectRef
    stories: list[DevelopmentStoryRead]
    tasks: list[DevelopmentTaskRead]
    code_reviews: list[CodeReviewRead]
    secure_coding: list[CodeReviewRead]
    source_metadata: list[SourceCodeMetadataRead]
    findings: list[CopilotFindingRead]
    recommendations: list[AIRecommendationRead]
    total_stories: int
    average_coverage: Optional[int]
    score: int
    readiness: str


# --- Testing summary ---
class TestingCoverage(BaseModel):
    total_cases: int
    automated: int
    manual: int
    automation_pct: int
    executed: int
    passed: int
    failed: int
    pass_rate_pct: int


class TestingSummary(BaseModel):
    project: ProjectRef
    test_plan: list[TestCaseRead]
    test_cases: list[TestCaseRead]
    execution: list[TestExecutionRead]
    coverage: TestingCoverage
    regression: list[TestCaseRead]
    automation: list[TestCaseRead]
    defects: list[DefectRead]
    findings: list[CopilotFindingRead]
    recommendations: list[AIRecommendationRead]
    score: int
    readiness: str


# --- Release summary ---
class ReleaseSummary(BaseModel):
    project: ProjectRef
    release_plan: list[ReleaseRead]
    deployment: list[DeploymentRead]
    rollback: list[dict]
    cab: list[dict]
    monitoring: list[dict]
    findings: list[CopilotFindingRead]
    recommendations: list[AIRecommendationRead]
    score: int
    readiness: str


# --- Go Live summary ---
class GoLiveSummary(BaseModel):
    project: ProjectRef
    go_live_checklist: list[GoLiveRead]
    business_signoff: list[dict]
    support_transition: list[dict]
    hypercare: list[dict]
    operational_readiness: list[dict]
    score: int
    readiness: str


# --- Audit summary ---
class AuditSummary(BaseModel):
    project: ProjectRef
    evidence: list[AuditEvidenceRead]
    compliance: list[ComplianceRecordRead]
    observations: list[AuditObservationRead]
    traceability: list[TraceabilityLinkRead]
    findings: list[CopilotFindingRead]
    recommendations: list[AIRecommendationRead]
    score: int
    readiness: str


# --- Copilot DTO ---
class CopilotRecommendationItem(BaseModel):
    id: int
    title: str
    rationale: Optional[str]
    impact: Optional[str]
    priority: str


class CopilotFindingItem(BaseModel):
    id: int
    badge: Optional[str]
    severity: str
    title: str
    detail: Optional[str]
    reasoning: Optional[str]
    confidence: Optional[int]
    risk: Optional[str]
    readiness: Optional[str]
    recommendations: list[CopilotRecommendationItem]


class CopilotResponse(BaseModel):
    project: ProjectRef
    copilot_type: str
    phase: Optional[str]
    findings: list[CopilotFindingItem]
    recommendations: list[CopilotRecommendationItem]
    reasoning: list[str]
    confidence: int
    risk: str
    readiness: str
    business_impact: str
    priority: str
    score: int


# --- Executive DTO ---
class ExecutivePhaseScore(BaseModel):
    phase: str
    score: int
    readiness: str


class ExecutiveSummaryDTO(BaseModel):
    project: ProjectRef
    overall_score: int
    band: str
    business_value: int
    productivity_uplift_pct: int
    compliance_score: int
    risk_score: int
    ai_confidence: int
    engineering_health: int
    manual_effort_saved_days: int
    documentation_pages: int
    phase_scores: list[ExecutivePhaseScore]
    executive_summary: str
    top_recommendations: list[CopilotRecommendationItem]


class PortfolioExecutiveDTO(BaseModel):
    """Portfolio-wide executive rollup across all projects."""

    projects: list[ExecutiveSummaryDTO]
    portfolio_overall_score: int
    portfolio_band: str
    total_manual_effort_saved_days: int
    total_documentation_pages: int
    average_ai_confidence: int


# --- Artifact views ---
class ArtifactGroup(BaseModel):
    artifact_type: str
    count: int
    items: list[ArtifactRead]


class ArtifactCatalog(BaseModel):
    project: ProjectRef
    total: int
    groups: list[ArtifactGroup]


# --- Traceability chain ---
class TraceabilityNode(BaseModel):
    phase: str
    label: str
    reference: Optional[str]
    entity_type: Optional[str]
    entity_id: Optional[int]
    detail: Optional[str]


class TraceabilityChain(BaseModel):
    project: ProjectRef
    chain_id: Optional[str]
    nodes: list[TraceabilityNode]
    links: list[TraceabilityLinkRead]
    complete: bool
