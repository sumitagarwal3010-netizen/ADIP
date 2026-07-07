"""Artifact generation endpoints (Phase 5).

Generates structured SDLC documents (BRD, FRD, SRS, HLD, LLD, API Spec, ...) in
JSON, Markdown or a DOCX-ready model, from aggregated project data.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.artifact_generation import (
    ArtifactTypeList,
    DocxArtifact,
    GeneratedArtifact,
    MarkdownArtifact,
    PdfArtifact,
)
from app.services.artifact_generator import ArtifactGenerator

router = APIRouter(prefix="/artifact-generation", tags=["AI SDLC · Artifact Generation"])


def get_generator(db: Session = Depends(get_db)) -> ArtifactGenerator:
    return ArtifactGenerator(db)


@router.get("/types", response_model=ArtifactTypeList)
def supported_types(gen: ArtifactGenerator = Depends(get_generator)):
    """List all supported generatable artifact types."""
    return ArtifactTypeList(supported=gen.supported_types())


@router.get("/projects/{project_id}/generate", response_model=GeneratedArtifact)
def generate(
    project_id: int,
    artifact_type: str = Query(..., description="Artifact type, e.g. 'BRD', 'FRD', 'HLD'."),
    gen: ArtifactGenerator = Depends(get_generator),
):
    """Generate a structured (JSON) artifact for a project."""
    return gen.generate(project_id, artifact_type)


@router.get("/projects/{project_id}/generate/markdown", response_model=MarkdownArtifact)
def generate_markdown(
    project_id: int,
    artifact_type: str = Query(...),
    gen: ArtifactGenerator = Depends(get_generator),
):
    """Generate an artifact rendered as Markdown."""
    return gen.generate_markdown(project_id, artifact_type)


@router.get("/projects/{project_id}/generate/docx-model", response_model=DocxArtifact)
def generate_docx_model(
    project_id: int,
    artifact_type: str = Query(...),
    gen: ArtifactGenerator = Depends(get_generator),
):
    """Generate a DOCX-ready paragraph model (consumable by a python-docx writer)."""
    return gen.generate_docx_model(project_id, artifact_type)


@router.get("/projects/{project_id}/generate/pdf-model", response_model=PdfArtifact)
def generate_pdf_model(
    project_id: int,
    artifact_type: str = Query(...),
    gen: ArtifactGenerator = Depends(get_generator),
):
    """Generate a PDF-ready block model (placeholder for a future PDF renderer)."""
    return gen.generate_pdf_model(project_id, artifact_type)
