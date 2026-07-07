"""Validation + artifact preview/download/metadata endpoints (Phase G)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.orchestrator import OrchestrationMetadata, OrchestrationRequest
from app.schemas.validation import ArtifactQualityReport
from app.services.artifact_generator import ArtifactGenerator
from app.services.artifact_validator import artifact_validator
from app.services.orchestrator_service import PromptExecutionEngine

router = APIRouter(tags=["Validation & Artifact Ops"])


def get_generator(db: Session = Depends(get_db)) -> ArtifactGenerator:
    return ArtifactGenerator(db)


# --- Artifact validation ---
@router.get("/artifact-validation/projects/{project_id}", response_model=ArtifactQualityReport)
def validate_artifact(
    project_id: int,
    artifact_type: str = Query(..., description="Artifact type to generate and validate."),
    gen: ArtifactGenerator = Depends(get_generator),
):
    """Generate an artifact and run quality validation on it."""
    artifact = gen.generate(project_id, artifact_type)
    return artifact_validator.validate(artifact)


# --- Artifact metadata ---
@router.get("/artifact-metadata/projects/{project_id}")
def artifact_metadata(
    project_id: int,
    artifact_type: str = Query(...),
    gen: ArtifactGenerator = Depends(get_generator),
) -> dict:
    """Return only the metadata of a generated artifact (no full body)."""
    a = gen.generate(project_id, artifact_type)
    return {
        "artifact_type": a.artifact_type,
        "title": a.title,
        "reference": a.reference,
        "project_id": a.project_id,
        "project_reference": a.project_reference,
        "prompt_reference": a.prompt_reference,
        "author": a.author,
        "version": a.version,
        "model_used": a.model_used,
        "generated_at": a.generated_at,
        "section_count": len(a.sections),
    }


# --- Artifact preview (markdown) ---
@router.get("/artifact-preview/projects/{project_id}", response_class=PlainTextResponse)
def artifact_preview(
    project_id: int,
    artifact_type: str = Query(...),
    gen: ArtifactGenerator = Depends(get_generator),
) -> str:
    """Markdown preview of a generated artifact."""
    return gen.generate_markdown(project_id, artifact_type).markdown


# --- Artifact download (markdown as attachment) ---
@router.get("/artifact-download/projects/{project_id}")
def artifact_download(
    project_id: int,
    artifact_type: str = Query(...),
    gen: ArtifactGenerator = Depends(get_generator),
):
    """Download a generated artifact as a Markdown attachment."""
    art = gen.generate_markdown(project_id, artifact_type)
    filename = f"{art.reference}.md"
    return PlainTextResponse(
        content=art.markdown,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# --- Prompt validation (dry classification without full artifact generation) ---
@router.post("/prompt-validation")
def validate_prompt(
    request: OrchestrationRequest,
    db: Session = Depends(get_db),
) -> dict:
    """Validate a prompt: classify it and report readiness signals without
    committing a full artifact run (uses the engine's classification path)."""
    engine = PromptExecutionEngine(db)
    meta = request.metadata or OrchestrationMetadata()
    project = engine._resolve_project(request.prompt, meta)  # noqa: SLF001 (intentional reuse)
    classification = engine.reasoner.classify(
        request.prompt, meta.model_dump(exclude_none=True)
    )
    warnings: list[str] = []
    if len(request.prompt.strip()) < 20:
        warnings.append("Prompt is very short — add scenario detail for richer output.")
    if classification.scenario == "generic":
        warnings.append("Prompt did not match a known banking scenario; classification is generic.")
    return {
        "valid": True,
        "resolved_project": project.name,
        "scenario": classification.scenario,
        "business_domain": classification.business_domain,
        "confidence": classification.confidence,
        "complexity": classification.complexity,
        "story_points": classification.story_points,
        "matched_keywords": classification.matched_keywords,
        "warnings": warnings,
    }
