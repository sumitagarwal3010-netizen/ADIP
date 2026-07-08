"""Enterprise connector REST APIs."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.connectors import (
    ConnectorCatalogItem,
    ConnectorCreate,
    ConnectorDashboard,
    ConnectorErrorRead,
    ConnectorRead,
    ConnectorRunRead,
    ConnectorTestResponse,
    ConnectorUpdate,
    NormalizedDataResponse,
)
from app.services.connector_service import ConnectorService

router = APIRouter(prefix="/connectors", tags=["Enterprise Connectors"])


def _svc(db: Session = Depends(get_db)) -> ConnectorService:
    return ConnectorService(db)


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
