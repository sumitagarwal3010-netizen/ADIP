"""Prompt Workbench endpoints (Phase 2)."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas import prompt_workbench as dto
from app.services.prompt_workbench_service import PromptWorkbenchService

router = APIRouter(prefix="/prompt-workbench", tags=["Prompt Workbench"])


def get_service(db: Session = Depends(get_db)) -> PromptWorkbenchService:
    return PromptWorkbenchService(db)


def _prompt_dto(service: PromptWorkbenchService, p) -> dto.WorkbenchPromptRead:
    d = dto.WorkbenchPromptRead.model_validate(p)
    d.version_count = service.version_count(p.id)
    return d


@router.post("/prompts", response_model=dto.WorkbenchPromptRead, status_code=status.HTTP_201_CREATED)
def create_prompt(payload: dto.WorkbenchPromptCreate, service: PromptWorkbenchService = Depends(get_service)):
    """Create a workbench prompt (optionally with an initial version)."""
    return _prompt_dto(service, service.create_prompt(payload))


@router.get("/prompts", response_model=list[dto.WorkbenchPromptRead])
def list_prompts(service: PromptWorkbenchService = Depends(get_service)):
    """List workbench prompts."""
    return [_prompt_dto(service, p) for p in service.list_prompts()]


@router.get("/prompts/{prompt_id}", response_model=dto.WorkbenchPromptRead)
def get_prompt(prompt_id: int, service: PromptWorkbenchService = Depends(get_service)):
    """Get a workbench prompt."""
    return _prompt_dto(service, service.get_prompt(prompt_id))


@router.post("/prompts/{prompt_id}/versions", response_model=dto.WorkbenchVersionRead,
             status_code=status.HTTP_201_CREATED)
def add_version(prompt_id: int, payload: dto.WorkbenchVersionCreate,
                service: PromptWorkbenchService = Depends(get_service)):
    """Add a new version/experiment to a prompt."""
    return service.add_version(prompt_id, payload)


@router.get("/prompts/{prompt_id}/versions", response_model=list[dto.WorkbenchVersionRead])
def list_versions(prompt_id: int, service: PromptWorkbenchService = Depends(get_service)):
    """List versions of a prompt."""
    return service.list_versions(prompt_id)


@router.post("/runs", response_model=dto.WorkbenchRunRead, status_code=status.HTTP_201_CREATED)
def create_run(payload: dto.WorkbenchRunCreate, service: PromptWorkbenchService = Depends(get_service)):
    """Execute a prompt (or version) and record quality metrics."""
    return service.create_run(payload)


@router.get("/runs", response_model=list[dto.WorkbenchRunRead])
def list_runs(limit: int = Query(50, ge=1, le=500), service: PromptWorkbenchService = Depends(get_service)):
    """List recent workbench runs."""
    return service.list_runs(limit)


@router.get("/runs/{run_id}", response_model=dto.WorkbenchRunRead)
def get_run(run_id: int, service: PromptWorkbenchService = Depends(get_service)):
    """Get a workbench run."""
    return service.get_run(run_id)


@router.post("/compare", response_model=dto.WorkbenchCompareResult)
def compare(payload: dto.WorkbenchCompareRequest, service: PromptWorkbenchService = Depends(get_service)):
    """Compare two prompt runs (versions)."""
    return service.compare(payload.run_id_a, payload.run_id_b)
