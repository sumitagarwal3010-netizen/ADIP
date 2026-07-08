"""Prompt Studio endpoints (Phase B).

Studio operations over the existing Prompt Workbench: tags, favorites, approval,
publishing, search, cloning, rollback and import/export. The editor / template
browser / variable injection / history / versioning / comparison / replay /
benchmarking are served by existing routers (prompt-workbench, prompt-templates,
prompt-testing, prompt-benchmark) — this router adds only the studio-specific
capabilities without duplicating them.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import prompt_studio as dto
from app.services.prompt_studio_service import PromptStudioService

router = APIRouter(prefix="/prompt-studio", tags=["Prompt Studio"])


def get_service(db: Session = Depends(get_db)) -> PromptStudioService:
    return PromptStudioService(db)


@router.get("/favorites", response_model=list[dto.StudioPromptRead])
def favorites(service: PromptStudioService = Depends(get_service)):
    """List favorited prompts."""
    return [service.to_dto(p) for p in service.list_favorites()]


@router.get("/search", response_model=dto.StudioSearchResult)
def search(q: str = Query(..., min_length=1), service: PromptStudioService = Depends(get_service)):
    """Search prompts by name, description, tags or category."""
    results = service.search(q)
    return dto.StudioSearchResult(query=q, total=len(results),
                                  results=[service.to_dto(p) for p in results])


@router.put("/prompts/{prompt_id}/tags", response_model=dto.StudioPromptRead)
def set_tags(prompt_id: int, payload: dto.TagUpdate, service: PromptStudioService = Depends(get_service)):
    """Set the tags on a prompt."""
    return service.to_dto(service.set_tags(prompt_id, payload.tags))


@router.put("/prompts/{prompt_id}/favorite", response_model=dto.StudioPromptRead)
def set_favorite(prompt_id: int, payload: dto.FavoriteUpdate, service: PromptStudioService = Depends(get_service)):
    """Mark/unmark a prompt as favorite."""
    return service.to_dto(service.set_favorite(prompt_id, payload.is_favorite))


@router.put("/prompts/{prompt_id}/approval", response_model=dto.StudioPromptRead)
def set_approval(prompt_id: int, payload: dto.ApprovalUpdate, service: PromptStudioService = Depends(get_service)):
    """Advance the prompt approval workflow (Draft/In Review/Approved/Rejected)."""
    return service.to_dto(service.set_approval(prompt_id, payload.approval_status))


@router.post("/prompts/{prompt_id}/publish", response_model=dto.StudioPromptRead)
def publish(prompt_id: int, service: PromptStudioService = Depends(get_service)):
    """Publish an approved prompt."""
    return service.to_dto(service.publish(prompt_id))


@router.post("/prompts/{prompt_id}/clone", response_model=dto.StudioPromptRead)
def clone(prompt_id: int, service: PromptStudioService = Depends(get_service)):
    """Clone a prompt (with all versions)."""
    return service.to_dto(service.clone(prompt_id))


@router.post("/prompts/{prompt_id}/rollback")
def rollback(prompt_id: int, version: int = Query(..., ge=1), service: PromptStudioService = Depends(get_service)):
    """Roll back to an older version (creates a new version from it)."""
    v = service.rollback(prompt_id, version)
    return {"prompt_id": prompt_id, "new_version": v.version, "restored_from": version}


@router.get("/prompts/{prompt_id}/export", response_model=dto.PromptExport)
def export_prompt(prompt_id: int, service: PromptStudioService = Depends(get_service)):
    """Export a prompt (name, tags, all versions) as JSON."""
    return service.export(prompt_id)


@router.post("/import", response_model=dto.StudioPromptRead)
def import_prompt(payload: dto.PromptImport, service: PromptStudioService = Depends(get_service)):
    """Import a prompt from an exported JSON payload."""
    return service.to_dto(service.import_prompt(payload))
