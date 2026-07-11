"""Enterprise Capacity Planning — DTOs."""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

Environment = Literal["development", "uat", "production"]
SizingProfile = Literal["small", "medium", "large", "enterprise"]


class CapacityPlanningInputs(BaseModel):
    profile: SizingProfile = "medium"
    environment: Environment = "production"
    applications: int = 1
    projects: int = 10
    users: int = 100
    concurrent_users: int = 25
    prompts_per_day: int = 1200
    artifacts_per_day: int = 400
    documents_per_day: int = 200
    uploads_per_day: int = 150
    avg_document_size_kb: float = 250.0
    avg_artifact_size_kb: float = 48.0
    avg_prompt_size_tokens: int = 500
    connector_syncs_per_day: int = 96
    retention_days: int = 90
    embedding_enabled: bool = True
    embedding_dimensions: int = 384
    local_llm: bool = False
    managed_llm: bool = True
    run_load_test: bool = False
    load_concurrency: int = 10
    run_infra_scenarios: bool = True


class StorageBreakdown(BaseModel):
    category: str
    uploads_per_day: float
    avg_size_bytes: float
    storage_per_day_bytes: float
    storage_year_bytes: float
    storage_3yr_bytes: float
    storage_5yr_bytes: float


class ObjectStorageEstimate(BaseModel):
    breakdown: list[StorageBreakdown]
    uploads_per_day: float
    uploads_per_month: float
    uploads_per_year: float
    avg_upload_bytes: float
    median_upload_bytes: float
    max_upload_bytes: float
    object_count_year: float
    storage_per_day_bytes: float
    storage_per_month_bytes: float
    storage_per_year_bytes: float
    storage_3yr_bytes: float
    storage_5yr_bytes: float
    after_compression_bytes: float
    after_deduplication_bytes: float
    after_versioning_bytes: float
    after_encryption_bytes: float
    archive_coldline_bytes: float


class DatabaseGrowthEstimate(BaseModel):
    table: str
    rows_per_day: float
    rows_per_month: float
    rows_per_year: float
    bytes_per_row: int
    storage_year_bytes: float
    index_overhead_bytes: float


class DatabaseGrowthReport(BaseModel):
    tables: list[DatabaseGrowthEstimate]
    total_rows_per_day: float
    total_rows_per_year: float
    cloud_sql_gb_year: float
    backup_gb_year: float
    index_growth_gb_year: float


class VectorDbEstimate(BaseModel):
    dimensions: int
    vectors_per_document: float
    storage_bytes_year: float
    index_size_bytes: float
    providers: dict[str, dict[str, Any]]


class NetworkEstimate(BaseModel):
    rest_ingress_gb_month: float
    rest_egress_gb_month: float
    streaming_gb_month: float
    websocket_gb_month: float
    connector_traffic_gb_month: float
    prompt_traffic_gb_month: float
    artifact_download_gb_month: float
    dashboard_gb_month: float
    total_ingress_gb_month: float
    total_egress_gb_month: float
    total_annual_gb: float


class GpuEstimate(BaseModel):
    mode: str
    model_size_gb: float
    vram_required_gb: float
    recommended_gpu: str
    latency_ms_p50: float
    throughput_rps: float
    max_concurrent: int
    cpu_fallback: bool


class RedisEstimate(BaseModel):
    prompt_cache_mb: float
    connector_cache_mb: float
    session_cache_mb: float
    artifact_cache_mb: float
    metadata_cache_mb: float
    total_mb: float
    ttl_hours: int


class StorageCostEstimate(BaseModel):
    provider: str
    storage_gb_month_usd: float
    put_cost_month_usd: float
    get_cost_month_usd: float
    lifecycle_savings_usd: float
    monthly_total_usd: float
    annual_total_usd: float


class CostEstimate(BaseModel):
    environment: Environment
    profile: SizingProfile
    compute_monthly_usd: float
    database_monthly_usd: float
    redis_monthly_usd: float
    object_storage_monthly_usd: float
    vector_storage_monthly_usd: float
    networking_monthly_usd: float
    llm_monthly_usd: float
    monitoring_monthly_usd: float
    monthly_total_usd: float
    annual_total_usd: float
    by_provider: list[StorageCostEstimate]


class GrowthForecastPoint(BaseModel):
    period: str
    storage_gb: float
    database_gb: float
    object_storage_gb: float
    embeddings_gb: float
    artifacts_count: float
    prompts_count: float


class LoadTestResult(BaseModel):
    concurrency: int
    scenario: str
    samples: int
    p50_ms: float
    p95_ms: float
    p99_ms: float
    errors: int
    rps: float


class ResourceProfile(BaseModel):
    peak_ram_mb: float
    avg_ram_mb: float
    peak_cpu_percent: float
    avg_cpu_percent: float
    thread_count: int
    psutil_available: bool


class CapacityPlanningReport(BaseModel):
    profile: SizingProfile
    environment: Environment
    generated_at: str
    inputs: CapacityPlanningInputs
    object_storage: ObjectStorageEstimate
    database_growth: DatabaseGrowthReport
    vector_db: list[VectorDbEstimate]
    network: NetworkEstimate
    gpu: GpuEstimate | None
    redis: RedisEstimate
    costs: CostEstimate
    growth_forecast: list[GrowthForecastPoint]
    gke: dict[str, Any]
    infra_scenarios: dict[str, Any] | None = None
    load_tests: list[LoadTestResult] = Field(default_factory=list)
    resource_profile: ResourceProfile | None = None
    reports: dict[str, str] = Field(default_factory=dict)


class CapacityPlanRequest(BaseModel):
    inputs: CapacityPlanningInputs | None = None
    profile: SizingProfile = "medium"
    environment: Environment = "production"


class LoadTestRequest(BaseModel):
    concurrency: int = 10
    scenarios: list[str] = Field(default_factory=list)


# --- Enterprise capacity extensions (production-grade) ---

HaTarget = Literal["99", "99.5", "99.9", "99.95", "99.99"]
RegionTopology = Literal["single_region", "multi_zone", "active_passive", "active_active", "cross_region", "geo_dr"]
GkeMode = Literal["gke_standard", "gke_autopilot"]
LlmMode = Literal["local_llm", "managed_llm", "vertex_ai", "ollama"]


class K8sResourceCount(BaseModel):
    kind: str
    count: int
    replicas: int = 1
    notes: str = ""


class K8sPlatformPlan(BaseModel):
    deployments: list[K8sResourceCount]
    statefulsets: list[K8sResourceCount]
    daemonsets: list[K8sResourceCount]
    jobs: list[K8sResourceCount]
    cronjobs: list[K8sResourceCount]
    hpa_count: int
    vpa_count: int
    pdb_count: int
    ingress_count: int
    services_count: int
    pvc_count: int
    pvc_total_gi: float
    configmaps_count: int
    secrets_count: int
    namespaces: list[str]
    total_resources: int
    cluster_complexity: str


class MultiRegionPlan(BaseModel):
    topology: RegionTopology
    regions: int
    zones_per_region: int
    cloud_sql_replicas: int
    object_storage_replication: str
    redis_replication: str
    cross_region_egress_gb_month: float
    replication_lag_ms_est: float
    monthly_cost_multiplier: float
    latency_p50_ms_est: float
    storage_multiplier: float


class HaPlan(BaseModel):
    target: HaTarget
    availability_pct: float
    backend_replicas: int
    frontend_replicas: int
    database_ha: str
    connector_redundancy: int
    llm_redundancy: int
    max_downtime_minutes_month: float


class DisasterRecoveryPlan(BaseModel):
    rpo_minutes: int
    rto_minutes: int
    snapshot_schedule: str
    backup_retention_days: int
    cross_region_backup: bool
    recovery_test_frequency_days: int
    backup_storage_gb: float
    monthly_backup_cost_usd: float


class ConnectorScalingEstimate(BaseModel):
    connector: str
    api_rate_limit_per_min: int
    throughput_per_hour: float
    parallel_workers: int
    queue_depth: int
    retry_window_minutes: int
    daily_sync_duration_min: float
    peak_sync_window: str


class AiWorkloadEstimate(BaseModel):
    workload: str
    cpu_millicores: int
    ram_mb: int
    latency_ms_p50: float
    storage_mb_day: float


class RagBenchmarkEstimate(BaseModel):
    chunk_size_tokens: int
    chunk_count: int
    embedding_latency_ms: float
    retrieval_latency_ms: float
    context_assembly_ms: float
    top_k: int
    context_window_utilization_pct: float
    vector_growth_gb_year: float


class PersonaCapacityEstimate(BaseModel):
    persona: str
    daily_prompts: float
    connector_calls_day: float
    artifacts_day: float
    storage_mb_day: float


class CostOptimizationItem(BaseModel):
    strategy: str
    monthly_savings_usd: float
    annual_savings_usd: float
    effort: str
    recommendation: str


class CostOptimizationReport(BaseModel):
    items: list[CostOptimizationItem]
    total_monthly_savings_usd: float
    total_annual_savings_usd: float


class ScenarioComparisonRow(BaseModel):
    scenario: str
    profile: str
    monthly_cost_usd: float
    gke_nodes: int
    storage_gb_year: float
    cloud_sql_gb_year: float
    latency_ms_est: float
    notes: str = ""


class ScenarioComparisonReport(BaseModel):
    baseline: str
    rows: list[ScenarioComparisonRow]
    deltas: dict[str, float]
    recommendation: str


class BenchmarkHistoryEntry(BaseModel):
    timestamp: str
    profile: str
    monthly_cost_usd: float
    storage_gb_year: float
    database_gb_year: float
    gke_nodes: int


class BenchmarkHistoryReport(BaseModel):
    entries: list[BenchmarkHistoryEntry]
    cost_drift_pct: float
    storage_drift_pct: float
    capacity_drift_pct: float
    trend: str


class CalibrationInput(BaseModel):
    source: Literal["kubectl_top", "prometheus", "cloud_monitoring", "grafana", "mock"]
    cpu_millicores_actual: float | None = None
    ram_mb_actual: float | None = None
    storage_gb_actual: float | None = None
    network_egress_gb_actual: float | None = None
    prompt_rps_actual: float | None = None


class CalibrationReport(BaseModel):
    mock_mode: bool
    estimated: dict[str, float]
    actual: dict[str, float]
    accuracy_pct: dict[str, float]
    correction_factors: dict[str, float]
    future_adjustments: list[str]


class ArchitectRecommendation(BaseModel):
    category: str
    severity: Literal["info", "warning", "critical"]
    finding: str
    recommendation: str


class ArchitectRecommendationReport(BaseModel):
    recommendations: list[ArchitectRecommendation]
    best_gke_profile: str
    best_storage_tier: str
    best_ha_topology: str
    best_dr_topology: str
    overall_status: str


class EnterpriseExtensions(BaseModel):
    kubernetes_platform: K8sPlatformPlan
    multi_region: MultiRegionPlan
    high_availability: HaPlan
    disaster_recovery: DisasterRecoveryPlan
    connector_scaling: list[ConnectorScalingEstimate]
    ai_workloads: list[AiWorkloadEstimate]
    rag_benchmark: RagBenchmarkEstimate
    persona_models: list[PersonaCapacityEstimate]
    cost_optimization: CostOptimizationReport
    scenario_comparison: ScenarioComparisonReport | None = None
    benchmark_history: BenchmarkHistoryReport
    calibration: CalibrationReport | None = None
    architect_recommendations: ArchitectRecommendationReport


class EnterpriseCapacityReport(BaseModel):
    plan: CapacityPlanningReport
    enterprise: EnterpriseExtensions
    extended_reports: dict[str, str] = Field(default_factory=dict)


class EnterprisePlanRequest(BaseModel):
    inputs: CapacityPlanningInputs | None = None
    profile: SizingProfile = "medium"
    environment: Environment = "production"
    region_topology: RegionTopology = "multi_zone"
    ha_target: HaTarget = "99.9"
    gke_mode: GkeMode = "gke_standard"
    llm_mode: LlmMode = "managed_llm"
    run_scenario_comparison: bool = True
    run_calibration: bool = False
    calibration: CalibrationInput | None = None


class ScenarioCompareRequest(BaseModel):
    profiles: list[SizingProfile] = Field(default_factory=lambda: ["small", "medium", "large"])
    region_topologies: list[RegionTopology] = Field(default_factory=lambda: ["single_region", "multi_zone"])
    llm_modes: list[LlmMode] = Field(default_factory=lambda: ["managed_llm", "local_llm"])


class CalibrationRequest(BaseModel):
    profile: SizingProfile = "medium"
    calibration: CalibrationInput
