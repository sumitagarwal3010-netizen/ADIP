"""Prompt template library endpoints (Phase G)."""
from __future__ import annotations

from fastapi import APIRouter, Query

from app.core.exceptions import NotFoundError
from app.schemas.prompt_templates import (
    ArtifactPromptTemplate,
    ArtifactPromptTemplateList,
    MatrixPromptList,
    MatrixPromptTemplate,
    PromptTemplate,
    PromptTemplateList,
)
from app.services.prompt_template_library import prompt_template_library as lib

router = APIRouter(prefix="/prompt-templates", tags=["Prompt Templates"])


@router.get("", response_model=PromptTemplateList)
def list_templates(
    category: str | None = Query(None, description="Filter by category."),
    sort_by_rank: bool = Query(True, description="Sort by composite rank descending."),
):
    """List banking prompt templates (ranked)."""
    return lib.list(category=category, sort_by_rank=sort_by_rank)


@router.get("/categories")
def list_categories() -> dict:
    """List template categories."""
    return {"categories": lib.categories()}


@router.get("/top", response_model=list[PromptTemplate])
def top_templates(limit: int = Query(10, ge=1, le=25)):
    """Top-ranked templates by composite score."""
    return lib.top_ranked(limit)


@router.get("/artifacts", response_model=ArtifactPromptTemplateList)
def list_artifact_templates():
    """List enterprise artifact-authoring prompt templates (BRD, FRD, HLD, ...)."""
    return lib.list_artifact_templates()


@router.get("/matrix", response_model=MatrixPromptList)
def list_matrix(
    domain: str | None = Query(None, description="Filter by banking domain."),
    artifact_type: str | None = Query(None, description="Filter by artifact type."),
):
    """List the enterprise prompt matrix (domain × artifact-type, hundreds of prompts)."""
    return lib.list_matrix(domain=domain, artifact_type=artifact_type)


@router.get("/matrix/{prompt_id}", response_model=MatrixPromptTemplate)
def get_matrix_prompt(prompt_id: str):
    """Get a single domain × artifact-type prompt (role, context, constraints, checklists)."""
    t = lib.get_matrix_prompt(prompt_id)
    if t is None:
        raise NotFoundError(f"Matrix prompt '{prompt_id}' not found.")
    return t


@router.get("/artifacts/{artifact_type}", response_model=ArtifactPromptTemplate)
def get_artifact_template(artifact_type: str):
    """Get the authoring prompt template for a specific artifact type."""
    t = lib.get_artifact_template(artifact_type)
    if t is None:
        raise NotFoundError(f"Artifact prompt template '{artifact_type}' not found.")
    return t


@router.get("/{template_id}", response_model=PromptTemplate)
def get_template(template_id: str):
    """Get a single use-case template with all prompts and ranking."""
    t = lib.get(template_id)
    if t is None:
        raise NotFoundError(f"Prompt template '{template_id}' not found.")
    return t
