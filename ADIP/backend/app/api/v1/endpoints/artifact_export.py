"""Artifact export endpoints (Phase C)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.quality import BatchQualityRequest  # reuse the {project_id, artifact_types} shape
from app.services.export_engine import EXPORT_FORMATS, ExportEngine

router = APIRouter(prefix="/artifact-export", tags=["Artifact Export"])


def get_engine(db: Session = Depends(get_db)) -> ExportEngine:
    return ExportEngine(db)


@router.get("/formats")
def formats() -> dict:
    """Supported export formats."""
    return {"formats": EXPORT_FORMATS, "bundle": ["zip"]}


@router.get("/projects/{project_id}")
def export_artifact(
    project_id: int,
    artifact_type: str = Query(...),
    format: str = Query("markdown", description="markdown|html|json|csv|docx-model|pdf-model"),
    branding: bool = Query(True),
    watermark: str | None = Query(None),
    engine: ExportEngine = Depends(get_engine),
):
    """Export a generated artifact in the requested format (download)."""
    content, media_type, filename = engine.export(
        project_id, artifact_type, format, branding=branding, watermark=watermark)
    return Response(content=content, media_type=media_type,
                    headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.post("/projects/{project_id}/bundle")
def export_bundle(project_id: int, request: BatchQualityRequest, engine: ExportEngine = Depends(get_engine)):
    """Bundle multiple artifacts into a ZIP archive (Markdown + JSON + HTML + manifest)."""
    data = engine.export_bundle_zip(request.project_id or project_id, request.artifact_types)
    return Response(content=data, media_type="application/zip",
                    headers={"Content-Disposition": f'attachment; filename="artifacts-{project_id}.zip"'})
