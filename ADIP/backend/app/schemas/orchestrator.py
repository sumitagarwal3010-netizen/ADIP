"""DTOs for the Prompt Execution Engine (orchestration layer).

The orchestration response composes the EXISTING phase-summary, copilot,
executive, artifact and traceability DTOs — it does not redefine them.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.artifact_generation import GeneratedArtifact, MarkdownArtifact
from app.schemas.sdlc import (
    ArchitectureSummary,
    AuditSummary,
    CopilotResponse,
    DevelopmentSummary,
    ExecutiveSummaryDTO,
    GoLiveSummary,
    ProjectRef,
    ReleaseSummary,
    RequirementSummary,
    TestingSummary,
    TraceabilityChain,
)


class OrchestrationMetadata(BaseModel):
    """Optional metadata to steer orchestration."""

    project: Optional[str] = Field(default=None, description="Target project name/code (else auto-resolved).")
    application: Optional[str] = None
    priority: Optional[str] = None
    complexity: Optional[str] = None
    regulation: Optional[str] = None


class OrchestrationRequest(BaseModel):
    """A single business prompt plus optional metadata."""

    prompt: str = Field(min_length=3, description="Business prompt, e.g. 'Implement UPI Auto-Reversal for Mobile Banking.'")
    metadata: Optional[OrchestrationMetadata] = None
    artifact_types: Optional[list[str]] = Field(
        default=None,
        description="Artifact types to generate (defaults to the standard SDLC set).",
    )
    include_markdown: bool = Field(default=False, description="Also return Markdown renders of artifacts.")


class ClassificationDTO(BaseModel):
    business_domain: str
    application: str
    capability: str
    technology: str
    security_impact: str
    compliance_impact: str
    risk: str
    complexity: str
    story_points: int
    sprint_estimate: int
    confidence: int
    matched_keywords: list[str]
    scenario: str


class ExecutiveDashboard(BaseModel):
    overall_sdlc_score: int
    band: str
    business_value: int
    engineering_productivity: int
    risk_score: int
    compliance_score: int
    ai_confidence: int
    manual_effort_saved_days: int
    automation_pct: int


class OrchestrationResponse(BaseModel):
    """The complete AI SDLC orchestration for one prompt."""

    run_id: str
    prompt: str
    generated_at: datetime
    reasoner: str
    project: ProjectRef
    classification: ClassificationDTO

    # Phase outputs (reused summary DTOs).
    requirements: RequirementSummary
    architecture: ArchitectureSummary
    development: DevelopmentSummary
    testing: TestingSummary
    release: ReleaseSummary
    go_live: GoLiveSummary
    audit: AuditSummary

    # Copilots keyed by slug.
    copilots: dict[str, CopilotResponse]

    # Executive rollup + dashboard.
    executive: ExecutiveSummaryDTO
    dashboard: ExecutiveDashboard

    # Knowledge + artifacts + traceability.
    knowledge_recommendations: list[dict]
    artifacts: list[GeneratedArtifact]
    artifacts_markdown: list[MarkdownArtifact]
    traceability: TraceabilityChain


class RequirementArtifactItem(BaseModel):
    name: str
    file_type: str
    content: str
    metadata: dict[str, str] = Field(default_factory=dict)


class RequirementArtifactPackage(BaseModel):
    session_key: str
    normalized_requirement: str
    source: str = Field(description="llm | fallback | failed")
    failure_reason: Optional[str] = None
    requirement_profile: dict[str, str]
    artifacts: dict[str, RequirementArtifactItem]
