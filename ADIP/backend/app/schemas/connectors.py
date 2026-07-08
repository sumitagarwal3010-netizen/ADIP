"""Pydantic schemas for enterprise connector APIs."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class CredentialRefIn(BaseModel):
    ref_type: str = "env_var"
    ref_key: str
    label: Optional[str] = None


class ConnectorCreate(BaseModel):
    connector_type: str
    name: str
    project_id: Optional[int] = 1
    enabled: bool = True
    mock_mode: bool = True
    dry_run: bool = False
    config: dict[str, Any] = Field(default_factory=dict)
    credential_refs: list[CredentialRefIn] = Field(default_factory=list)


class ConnectorUpdate(BaseModel):
    name: Optional[str] = None
    enabled: Optional[bool] = None
    mock_mode: Optional[bool] = None
    dry_run: Optional[bool] = None
    config: Optional[dict[str, Any]] = None
    status: Optional[str] = None


class ConnectorRead(BaseModel):
    id: int
    connector_type: str
    name: str
    category: str
    status: str
    enabled: bool
    mock_mode: bool
    dry_run: bool
    project_id: Optional[int]
    last_sync_at: Optional[datetime]
    last_health_status: Optional[str]
    model_config = {"from_attributes": True}


class ConnectorCatalogItem(BaseModel):
    connector_type: str
    display_name: str
    category: str
    description: str
    credential_ref_keys: list[str]
    config_schema: dict[str, str]


class ConnectorRunRead(BaseModel):
    id: int
    connector_id: int
    status: str
    dry_run: bool
    mock: bool
    assets_synced: int
    findings_synced: int
    duration_ms: Optional[float]
    message: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


class ConnectorErrorRead(BaseModel):
    id: int
    connector_id: int
    run_id: Optional[int]
    error_code: Optional[str]
    message: str
    created_at: datetime
    model_config = {"from_attributes": True}


class ConnectorDashboard(BaseModel):
    total_connectors: int
    enabled_connectors: int
    mock_connectors: int
    healthy_connectors: int
    last_24h_runs: int
    last_24h_failures: int
    assets_synced_total: int
    findings_synced_total: int
    auth_mode: str
    security_bypassed: bool


class ConnectorTestResponse(BaseModel):
    ok: bool
    message: str
    latency_ms: float = 0.0
    mock: bool = False
    dry_run: bool = False


class NormalizedDataResponse(BaseModel):
    assets: list[dict[str, Any]]
    findings: list[dict[str, Any]]
    total_assets: int
    total_findings: int


class ArtifactUseCaseRead(BaseModel):
    id: str
    label: str
    description: str
    supported_connectors: list[str]
    multi_source: bool


class PreviewSourcesRequest(BaseModel):
    artifact_type: str
    connector_ids: list[int] = Field(default_factory=list)
    connector_types: list[str] = Field(default_factory=list)
    project_id: int = 1
    limit: int = 20


class PreviewSourcesResponse(BaseModel):
    artifact_type: str
    connector_types: list[str]
    records: list[dict[str, Any]]
    total: int
    mode: str
    project_id: int
    security_bypassed: bool


class PromptPreviewResponse(BaseModel):
    artifact_type: str
    connector_types: list[str]
    prompt_template_id: str
    prompt: str
    source_record_count: int


class GenerateArtifactRequest(BaseModel):
    artifact_type: str
    connector_ids: list[int] = Field(default_factory=list)
    connector_types: list[str] = Field(default_factory=list)
    project_id: int = 1
    dry_run: bool = False


class GeneratedConnectorArtifact(BaseModel):
    id: str
    title: str
    artifact_type: str
    summary: str
    body: str
    source_connectors: list[str]
    source_records: list[dict[str, Any]]
    prompt: str
    prompt_template_id: str
    quality_score: float
    confidence: str
    quality_checks: list[str]
    traceability: list[dict[str, Any]]
    evidence_links: list[dict[str, Any]]
    explainability: dict[str, Any]
    dry_run: bool
    mock_mode: bool
    project_id: int
    generated_at: str
