"""Enterprise connector REST APIs."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.connectors import (
    ArtifactUseCaseRead,
    ConnectorCatalogItem,
    ConnectorCreate,
    ConnectorDashboard,
    ConnectorErrorRead,
    ConnectorRead,
    ConnectorRunRead,
    ConnectorTestResponse,
    ConnectorUpdate,
    GenerateArtifactRequest,
    GeneratedConnectorArtifact,
    NormalizedDataResponse,
    PreviewSourcesRequest,
    PreviewSourcesResponse,
    PromptPreviewResponse,
)
from app.services.connector_service import ConnectorService
from app.services.connector_artifact_service import ConnectorArtifactService

router = APIRouter(prefix="/connectors", tags=["Enterprise Connectors"])


def _svc(db: Session = Depends(get_db)) -> ConnectorService:
    return ConnectorService(db)


def _artifact_svc(db: Session = Depends(get_db)) -> ConnectorArtifactService:
    return ConnectorArtifactService(db)


@router.get("/catalog", response_model=list[ConnectorCatalogItem])
def list_catalog(svc: ConnectorService = Depends(_svc)):
    return [
        ConnectorCatalogItem(
            connector_type=d.connector_type,
            display_name=d.display_name,
            category=d.category.value,
            description=d.description,
            credential_ref_keys=d.credential_ref_keys,
            config_schema=d.config_schema,
        )
        for d in svc.list_catalog()
    ]


@router.get("/dashboard", response_model=ConnectorDashboard)
def integration_dashboard(svc: ConnectorService = Depends(_svc)):
    return ConnectorDashboard(**svc.dashboard())


@router.post("/seed-defaults")
def seed_default_connectors(svc: ConnectorService = Depends(_svc)):
    return {"created": svc.seed_defaults()}


@router.get("", response_model=list[ConnectorRead])
def list_connectors(project_id: int | None = None, svc: ConnectorService = Depends(_svc)):
    return svc.list_connectors(project_id=project_id)


@router.post("", response_model=ConnectorRead)
def create_connector(body: ConnectorCreate, svc: ConnectorService = Depends(_svc)):
    try:
        return svc.create_connector(body.model_dump())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/ai/context")
def connector_ai_context(project_id: int = 1, db: Session = Depends(get_db)):
    from app.connectors.ai_context import build_connector_prompt_context
    return {"context": build_connector_prompt_context(db, project_id=project_id)}


@router.get("/artifacts/use-cases", response_model=list[ArtifactUseCaseRead])
def list_artifact_use_cases(svc: ConnectorArtifactService = Depends(_artifact_svc)):
    return svc.list_use_cases()


@router.post("/artifacts/preview-sources", response_model=PreviewSourcesResponse)
def preview_artifact_sources(body: PreviewSourcesRequest, svc: ConnectorArtifactService = Depends(_artifact_svc)):
    return PreviewSourcesResponse(**svc.preview_sources(
        artifact_type=body.artifact_type,
        connector_ids=body.connector_ids or None,
        connector_types=body.connector_types or None,
        project_id=body.project_id,
        limit=body.limit,
    ))


@router.get("/artifacts/prompt-preview", response_model=PromptPreviewResponse)
def preview_artifact_prompt(
    artifact_type: str,
    connector_types: str = "",
    connector_ids: str = "",
    svc: ConnectorArtifactService = Depends(_artifact_svc),
):
    ctypes = [t.strip() for t in connector_types.split(",") if t.strip()] or None
    cids = [int(x) for x in connector_ids.split(",") if x.strip()] or None
    return PromptPreviewResponse(**svc.preview_prompt(
        artifact_type=artifact_type, connector_types=ctypes, connector_ids=cids,
    ))


@router.post("/artifacts/generate", response_model=GeneratedConnectorArtifact)
def generate_connector_artifact(body: GenerateArtifactRequest, svc: ConnectorArtifactService = Depends(_artifact_svc)):
    return GeneratedConnectorArtifact(**svc.generate(
        artifact_type=body.artifact_type,
        connector_ids=body.connector_ids or None,
        connector_types=body.connector_types or None,
        project_id=body.project_id,
        dry_run=body.dry_run,
    ))


@router.get("/artifacts/{artifact_id}", response_model=GeneratedConnectorArtifact)
def get_connector_artifact(artifact_id: str, svc: ConnectorArtifactService = Depends(_artifact_svc)):
    from app.core.exceptions import NotFoundError
    try:
        return GeneratedConnectorArtifact(**svc.get_artifact(artifact_id))
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/artifacts/{artifact_id}/traceability")
def get_artifact_traceability(artifact_id: str, svc: ConnectorArtifactService = Depends(_artifact_svc)):
    from app.core.exceptions import NotFoundError
    try:
        art = svc.get_artifact(artifact_id)
        return {"artifact_id": artifact_id, "traceability": art["traceability"], "evidence_links": art["evidence_links"]}
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{connector_id}", response_model=ConnectorRead)
def get_connector(connector_id: int, svc: ConnectorService = Depends(_svc)):
    return svc.get_connector(connector_id)


@router.patch("/{connector_id}", response_model=ConnectorRead)
def update_connector(connector_id: int, body: ConnectorUpdate, svc: ConnectorService = Depends(_svc)):
    return svc.update_connector(connector_id, body.model_dump(exclude_unset=True))


@router.post("/{connector_id}/test", response_model=ConnectorTestResponse)
def test_connector(connector_id: int, svc: ConnectorService = Depends(_svc)):
    return ConnectorTestResponse(**svc.test_connection(connector_id))


@router.get("/{connector_id}/health")
def connector_health(connector_id: int, svc: ConnectorService = Depends(_svc)):
    return svc.health(connector_id)


@router.post("/{connector_id}/sync", response_model=ConnectorRunRead)
def sync_connector(connector_id: int, svc: ConnectorService = Depends(_svc)):
    try:
        return svc.sync(connector_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{connector_id}/runs", response_model=list[ConnectorRunRead])
def connector_runs(connector_id: int, limit: int = 20, svc: ConnectorService = Depends(_svc)):
    return svc.run_history(connector_id, limit=limit)


@router.get("/{connector_id}/errors", response_model=list[ConnectorErrorRead])
def connector_errors(connector_id: int, limit: int = 20, svc: ConnectorService = Depends(_svc)):
    return svc.errors(connector_id, limit=limit)


@router.get("/{connector_id}/data", response_model=NormalizedDataResponse)
def connector_normalized_data(connector_id: int, limit: int = 50, svc: ConnectorService = Depends(_svc)):
    data = svc.normalized_data(connector_id, limit=limit)
    return NormalizedDataResponse(**data)
