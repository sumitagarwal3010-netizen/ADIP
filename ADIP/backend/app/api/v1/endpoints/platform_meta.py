"""Platform registry endpoints (Role 15)."""
from __future__ import annotations

from fastapi import APIRouter

from app.platform.plugin_sdk import plugin_sdk
from app.platform.registry import dependency_registry, feature_registry, service_registry

router = APIRouter(prefix="/platform", tags=["Platform"])


@router.get("/services")
def list_services() -> dict:
    return {"services": [e.__dict__ for e in service_registry.list()]}


@router.get("/features")
def list_features() -> dict:
    return {"features": [e.__dict__ for e in feature_registry.list()]}


@router.get("/dependencies")
def dependency_graph() -> dict:
    return {"graph": dependency_registry.graph()}


@router.get("/plugins")
def list_plugins() -> dict:
    return {"plugins": [p.__dict__ for p in plugin_sdk.list_plugins()]}
