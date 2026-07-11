"""DTOs for infrastructure sizing benchmark (GKE/GCP)."""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

SizingProfile = Literal["small", "medium", "large", "enterprise"]


class ScenarioMetrics(BaseModel):
    scenario: str
    input_tokens: int = 0
    output_tokens: int = 0
    total_tokens: int = 0
    latency_ms: float = 0.0
    duration_ms: float = 0.0
    peak_memory_mb: float = 0.0
    cpu_millicores_est: int = 0
    artifact_output_bytes: int = 0
    db_rows_est: int = 0
    vector_embedding_bytes_est: int = 0
    object_storage_bytes_est: int = 0
    log_storage_bytes_est: int = 0
    mock_mode: bool = True
    ok: bool = True
    detail: str = ""


class GkePodSizing(BaseModel):
    component: str
    replicas: int
    cpu_request: str
    cpu_limit: str
    memory_request: str
    memory_limit: str
    notes: str = ""


class GkeSizingEstimate(BaseModel):
    profile: SizingProfile
    backend: GkePodSizing
    frontend: GkePodSizing
    worker: GkePodSizing | None = None
    llm: GkePodSizing | None = None
    node_pool_vcpu: float
    node_pool_memory_gi: float
    node_count_est: int
    cloud_sql_storage_gb: float
    gcs_storage_gb: float
    monthly_storage_growth_gb: float
    assumptions: list[str] = Field(default_factory=list)


class InfraSizingReport(BaseModel):
    profile: SizingProfile
    generated_at: str
    mock_mode: bool = True
    scenarios: list[ScenarioMetrics]
    totals: dict[str, Any]
    gke: GkeSizingEstimate
    markdown_summary: str = ""


class InfraSizingRunRequest(BaseModel):
    profile: SizingProfile = "medium"
    scenarios: list[str] = Field(default_factory=list)
