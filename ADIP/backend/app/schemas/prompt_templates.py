"""DTOs for the Banking Prompt Template Library (Phase C)."""
from __future__ import annotations

from pydantic import BaseModel


class PromptRanking(BaseModel):
    """Multi-dimensional ranking scores (0-100) for a template."""

    business_value: int
    implementation_complexity: int
    compliance_impact: int
    customer_impact: int
    engineering_effort: int
    risk_reduction: int
    ai_confidence: int
    executive_demo_value: int
    composite: int


class PromptTemplate(BaseModel):
    """A reusable banking prompt template with per-phase prompts + metadata."""

    id: str
    name: str
    category: str
    domain: str

    business_context: str
    problem_statement: str

    business_prompt: str
    functional_prompt: str
    architecture_prompt: str
    development_prompt: str
    testing_prompt: str
    release_prompt: str
    audit_prompt: str
    executive_prompt: str

    expected_artifacts: list[str]
    acceptance_criteria: list[str]
    risks: list[str]
    compliance: list[str]
    testing_strategy: list[str]
    success_criteria: list[str]

    ranking: PromptRanking


class PromptTemplateSummary(BaseModel):
    """Compact template listing entry."""

    id: str
    name: str
    category: str
    domain: str
    composite_rank: int


class PromptTemplateList(BaseModel):
    total: int
    templates: list[PromptTemplateSummary]


class ArtifactPromptTemplate(BaseModel):
    """An enterprise-grade prompt template for authoring a specific SDLC artifact
    type (e.g. BRD, FRD, HLD). Steers an LLM (or the deterministic authoring
    engine) to produce a professional, banking-grade document."""

    artifact_type: str
    name: str
    phase: str
    role_instruction: str
    business_context: str
    artifact_objective: str
    required_sections: list[str]
    output_format: str
    banking_domain_assumptions: list[str]
    compliance_considerations: list[str]
    quality_checklist: list[str]
    traceability_requirements: list[str]
    json_schema_expectations: dict
    markdown_expectations: list[str]


class ArtifactPromptTemplateSummary(BaseModel):
    artifact_type: str
    name: str
    phase: str
    section_count: int


class ArtifactPromptTemplateList(BaseModel):
    total: int
    templates: list[ArtifactPromptTemplateSummary]


class MatrixPromptTemplate(BaseModel):
    """A domain × artifact-type prompt from the enterprise prompt matrix."""

    id: str
    domain: str
    artifact_type: str
    phase: str
    role: str
    context: str
    objective: str
    constraints: list[str]
    expected_sections: list[str]
    expected_output: str
    quality_checklist: list[str]
    compliance_checklist: list[str]


class MatrixPromptSummary(BaseModel):
    id: str
    domain: str
    artifact_type: str
    phase: str


class MatrixPromptList(BaseModel):
    total: int
    domains: list[str]
    artifact_types: list[str]
    templates: list[MatrixPromptSummary]
