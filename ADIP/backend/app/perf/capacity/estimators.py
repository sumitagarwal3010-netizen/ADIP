"""Capacity planning estimators — object storage, DB, vector, network, GPU, Redis, cost."""
from __future__ import annotations

from typing import Any

from app.schemas.capacity_planning import (
    CapacityPlanningInputs,
    CostEstimate,
    DatabaseGrowthEstimate,
    DatabaseGrowthReport,
    Environment,
    GpuEstimate,
    GrowthForecastPoint,
    NetworkEstimate,
    ObjectStorageEstimate,
    RedisEstimate,
    StorageBreakdown,
    StorageCostEstimate,
    VectorDbEstimate,
)

# Object type average sizes (bytes) — enterprise document mix
_OBJECT_TYPES: dict[str, float] = {
    "requirements": 180_000,
    "architecture": 420_000,
    "design": 310_000,
    "user_stories": 45_000,
    "source_code_exports": 2_500_000,
    "test_reports": 95_000,
    "evidence": 120_000,
    "compliance_evidence": 280_000,
    "audit_evidence": 350_000,
    "screenshots": 850_000,
    "images": 1_200_000,
    "pdf": 520_000,
    "docx": 210_000,
    "xlsx": 180_000,
    "csv": 35_000,
    "zip": 5_000_000,
    "generated_artifacts": 48_000,
    "prompt_outputs": 12_000,
    "connector_payloads": 8_000,
    "model_outputs": 25_000,
    "version_history": 55_000,
    "retention_copies": 48_000,
}

# DB table row sizes (bytes)
_DB_TABLES: dict[str, tuple[float, int]] = {
    "artifacts": (0.15, 3072),
    "prompt_history": (0.25, 4096),
    "prompt_replay": (0.05, 2048),
    "prompt_metadata": (0.10, 1536),
    "golden_datasets": (0.01, 8192),
    "benchmark_results": (0.08, 2048),
    "connector_metadata": (0.12, 1536),
    "connector_runs": (0.15, 1024),
    "connector_logs": (0.20, 512),
    "traceability": (0.10, 2048),
    "rule_execution": (0.08, 1024),
    "audit_history": (0.05, 1536),
    "metrics": (0.30, 256),
    "logs": (0.50, 512),
    "embeddings": (0.20, 2048),
}

# GCS pricing USD (approx, per month basis helpers)
_GCS_STD_PER_GB = 0.020
_GCS_NEARLINE_PER_GB = 0.010
_GCS_COLDLINE_PER_GB = 0.004
_GCS_PUT_PER_10K = 0.05
_GCS_GET_PER_10K = 0.004


def inputs_from_profile(profile: str, base: CapacityPlanningInputs | None = None) -> CapacityPlanningInputs:
    from app.perf.infra_sizing_benchmark import PROFILE_ASSUMPTIONS
    cfg = PROFILE_ASSUMPTIONS.get(profile, PROFILE_ASSUMPTIONS["medium"])
    daily_prompts = cfg["daily_active_users"] * cfg["prompts_per_user_per_day"]
    if base:
        return base
    return CapacityPlanningInputs(
        profile=profile,  # type: ignore[arg-type]
        users=cfg["daily_active_users"],
        concurrent_users=max(5, cfg["daily_active_users"] // 4),
        prompts_per_day=daily_prompts,
        artifacts_per_day=int(daily_prompts * 0.35),
        documents_per_day=int(daily_prompts * 0.2),
        uploads_per_day=int(daily_prompts * 0.15),
        connector_syncs_per_day=cfg["connector_syncs_per_day"],
        retention_days=cfg["retention_days"],
        local_llm=cfg.get("local_llm", False),
    )


def estimate_object_storage(inp: CapacityPlanningInputs) -> ObjectStorageEstimate:
    total_uploads = inp.uploads_per_day + inp.documents_per_day * 0.5 + inp.artifacts_per_day * 0.3
    breakdown: list[StorageBreakdown] = []
    daily_bytes = 0.0
    sizes: list[float] = []
    for cat, avg_b in _OBJECT_TYPES.items():
        share = 1.0 / len(_OBJECT_TYPES)
        if cat in ("pdf", "docx", "generated_artifacts", "connector_payloads"):
            share = 0.08
        elif cat in ("requirements", "architecture", "evidence"):
            share = 0.06
        else:
            share = 0.02
        upd = total_uploads * share
        day_b = upd * avg_b
        daily_bytes += day_b
        sizes.append(avg_b)
        breakdown.append(StorageBreakdown(
            category=cat, uploads_per_day=round(upd, 1), avg_size_bytes=avg_b,
            storage_per_day_bytes=day_b,
            storage_year_bytes=day_b * 365,
            storage_3yr_bytes=day_b * 365 * 3,
            storage_5yr_bytes=day_b * 365 * 5,
        ))
    sizes.sort()
    median = sizes[len(sizes) // 2] if sizes else 0
    year_b = daily_bytes * 365 * (inp.retention_days / 365)
    compressed = year_b * 0.65
    deduped = compressed * 0.85
    versioned = deduped * 1.25
    encrypted = versioned * 1.02
    archive = year_b * 0.4
    return ObjectStorageEstimate(
        breakdown=breakdown,
        uploads_per_day=total_uploads,
        uploads_per_month=total_uploads * 30,
        uploads_per_year=total_uploads * 365,
        avg_upload_bytes=daily_bytes / max(total_uploads, 1),
        median_upload_bytes=median,
        max_upload_bytes=max(sizes) if sizes else 0,
        object_count_year=total_uploads * 365,
        storage_per_day_bytes=daily_bytes,
        storage_per_month_bytes=daily_bytes * 30,
        storage_per_year_bytes=year_b,
        storage_3yr_bytes=daily_bytes * 365 * 3,
        storage_5yr_bytes=daily_bytes * 365 * 5,
        after_compression_bytes=compressed,
        after_deduplication_bytes=deduped,
        after_versioning_bytes=versioned,
        after_encryption_bytes=encrypted,
        archive_coldline_bytes=archive,
    )


def estimate_database_growth(inp: CapacityPlanningInputs) -> DatabaseGrowthReport:
    tables: list[DatabaseGrowthEstimate] = []
    total_rows_day = 0.0
    total_bytes_year = 0.0
    for table, (mult, row_b) in _DB_TABLES.items():
        base = inp.prompts_per_day if "prompt" in table else inp.artifacts_per_day
        if table in ("connector_runs", "connector_logs", "connector_metadata"):
            base = inp.connector_syncs_per_day
        elif table == "embeddings":
            base = inp.documents_per_day if inp.embedding_enabled else 0
        rows_day = base * mult
        year_rows = rows_day * inp.retention_days
        year_bytes = year_rows * row_b
        idx = year_bytes * 0.25
        tables.append(DatabaseGrowthEstimate(
            table=table, rows_per_day=round(rows_day, 1), rows_per_month=rows_day * 30,
            rows_per_year=year_rows, bytes_per_row=row_b, storage_year_bytes=year_bytes,
            index_overhead_bytes=idx,
        ))
        total_rows_day += rows_day
        total_bytes_year += year_bytes + idx
    return DatabaseGrowthReport(
        tables=tables,
        total_rows_per_day=total_rows_day,
        total_rows_per_year=total_rows_day * inp.retention_days,
        cloud_sql_gb_year=round(total_bytes_year / (1024 ** 3), 2),
        backup_gb_year=round(total_bytes_year * 1.1 / (1024 ** 3), 2),
        index_growth_gb_year=round(total_bytes_year * 0.25 / (1024 ** 3), 2),
    )


def estimate_vector_db(inp: CapacityPlanningInputs) -> list[VectorDbEstimate]:
    dims_list = [384, 768, 1024, 1536]
    results = []
    vec_per_doc = 3.5 if inp.embedding_enabled else 0
    docs_year = inp.documents_per_day * inp.retention_days
    for dim in dims_list:
        bytes_per_vec = dim * 4 + 64
        storage = docs_year * vec_per_doc * bytes_per_vec
        index_mult = 1.5 if dim <= 768 else 2.0
        results.append(VectorDbEstimate(
            dimensions=dim,
            vectors_per_document=vec_per_doc,
            storage_bytes_year=storage,
            index_size_bytes=storage * index_mult,
            providers={
                "pgvector": {"storage_gb": round(storage / 1e9, 3), "recall_est": 0.92, "latency_ms_p50": 15 + dim // 50},
                "vertex_ai": {"storage_gb": round(storage / 1e9, 3), "recall_est": 0.95, "latency_ms_p50": 25},
                "pinecone": {"storage_gb": round(storage / 1e9, 3), "recall_est": 0.94, "latency_ms_p50": 20},
                "weaviate": {"storage_gb": round(storage / 1e9, 3), "recall_est": 0.93, "latency_ms_p50": 18},
                "milvus": {"storage_gb": round(storage / 1e9, 3), "recall_est": 0.94, "latency_ms_p50": 12},
                "qdrant": {"storage_gb": round(storage / 1e9, 3), "recall_est": 0.93, "latency_ms_p50": 10},
            },
        ))
    return results


def estimate_network(inp: CapacityPlanningInputs) -> NetworkEstimate:
    prompt_gb = inp.prompts_per_day * inp.avg_prompt_size_tokens * 4 / 1e9 * 30
    artifact_gb = inp.artifacts_per_day * inp.avg_artifact_size_kb * 1024 / 1e9 * 30
    connector_gb = inp.connector_syncs_per_day * 8_000 / 1e9 * 30
    dashboard_gb = inp.users * 2.5 / 1e3 * 30
    rest_egress = prompt_gb * 2 + artifact_gb + connector_gb
    rest_ingress = prompt_gb * 0.5 + connector_gb * 0.3
    streaming = prompt_gb * 0.15 if inp.managed_llm else 0
    ws = inp.concurrent_users * 0.01 * 30
    total_egress = rest_egress + streaming + ws + dashboard_gb
    total_ingress = rest_ingress + dashboard_gb * 0.3
    return NetworkEstimate(
        rest_ingress_gb_month=round(rest_ingress, 2),
        rest_egress_gb_month=round(rest_egress, 2),
        streaming_gb_month=round(streaming, 2),
        websocket_gb_month=round(ws, 2),
        connector_traffic_gb_month=round(connector_gb, 2),
        prompt_traffic_gb_month=round(prompt_gb, 2),
        artifact_download_gb_month=round(artifact_gb, 2),
        dashboard_gb_month=round(dashboard_gb, 2),
        total_ingress_gb_month=round(total_ingress, 2),
        total_egress_gb_month=round(total_egress, 2),
        total_annual_gb=round((total_ingress + total_egress) * 12, 2),
    )


def estimate_gpu(inp: CapacityPlanningInputs, avg_latency_ms: float = 150.0) -> GpuEstimate | None:
    if not inp.local_llm:
        return None
    model_gb = 7.0 if inp.profile in ("small", "medium") else 13.0
    vram = model_gb * 1.35 + 2.0
    if vram <= 16:
        gpu = "NVIDIA T4"
    elif vram <= 24:
        gpu = "NVIDIA L4"
    elif vram <= 40:
        gpu = "NVIDIA A10"
    elif vram <= 80:
        gpu = "NVIDIA A100"
    else:
        gpu = "NVIDIA H100"
    rps = max(0.5, 1000 / max(avg_latency_ms, 50))
    concurrent = min(inp.concurrent_users, int(rps * 10))
    return GpuEstimate(
        mode="gpu_inference" if inp.local_llm else "cpu_inference",
        model_size_gb=model_gb,
        vram_required_gb=round(vram, 1),
        recommended_gpu=gpu,
        latency_ms_p50=round(avg_latency_ms, 1),
        throughput_rps=round(rps, 2),
        max_concurrent=concurrent,
        cpu_fallback=not inp.local_llm,
    )


def estimate_redis(inp: CapacityPlanningInputs) -> RedisEstimate:
    prompt_mb = inp.prompts_per_day * 0.5 / 1024
    connector_mb = inp.connector_syncs_per_day * 0.1 / 1024
    session_mb = inp.concurrent_users * 0.05
    artifact_mb = inp.artifacts_per_day * 0.2 / 1024
    meta_mb = inp.projects * 0.5
    total = prompt_mb + connector_mb + session_mb + artifact_mb + meta_mb
    return RedisEstimate(
        prompt_cache_mb=round(prompt_mb, 2),
        connector_cache_mb=round(connector_mb, 2),
        session_cache_mb=round(session_mb, 2),
        artifact_cache_mb=round(artifact_mb, 2),
        metadata_cache_mb=round(meta_mb, 2),
        total_mb=round(total, 2),
        ttl_hours=24,
    )


def estimate_storage_costs(
    obj: ObjectStorageEstimate, db: DatabaseGrowthReport, vec: list[VectorDbEstimate],
) -> list[StorageCostEstimate]:
    gcs_gb = obj.after_encryption_bytes / (1024 ** 3)
    puts = obj.uploads_per_month / 10000
    gets = obj.uploads_per_month * 5 / 10000
    results = []
    for provider, storage_rate, put_rate, get_rate in [
        ("gcs", _GCS_STD_PER_GB, _GCS_PUT_PER_10K, _GCS_GET_PER_10K),
        ("aws_s3", 0.023, 0.005, 0.0004),
        ("azure_blob", 0.018, 0.005, 0.0004),
        ("minio", 0.0, 0.0, 0.0),
    ]:
        st = gcs_gb * storage_rate
        p = puts * put_rate
        g = gets * get_rate
        lifecycle = st * 0.15 if provider == "gcs" else 0
        monthly = st + p + g - lifecycle
        results.append(StorageCostEstimate(
            provider=provider,
            storage_gb_month_usd=round(st, 2),
            put_cost_month_usd=round(p, 2),
            get_cost_month_usd=round(g, 2),
            lifecycle_savings_usd=round(lifecycle, 2),
            monthly_total_usd=round(monthly, 2),
            annual_total_usd=round(monthly * 12, 2),
        ))
    return results


def estimate_costs(
    inp: CapacityPlanningInputs,
    obj: ObjectStorageEstimate,
    db: DatabaseGrowthReport,
    vec: list[VectorDbEstimate],
    network: NetworkEstimate,
    redis: RedisEstimate,
    gke_nodes: int,
    env: Environment,
) -> CostEstimate:
    env_mult = {"development": 0.3, "uat": 0.6, "production": 1.0}[env]
    profile_mult = {"small": 0.5, "medium": 1.0, "large": 2.5, "enterprise": 6.0}[inp.profile]
    compute = gke_nodes * 120 * env_mult * profile_mult
    database = db.cloud_sql_gb_year / 12 * 0.17 * env_mult
    redis_cost = max(25, redis.total_mb / 1024 * 35) * env_mult
    vec_gb = vec[0].storage_bytes_year / (1024 ** 3) if vec else 0
    vector_cost = vec_gb / 12 * 0.25 * env_mult if inp.embedding_enabled else 0
    net_cost = (network.total_ingress_gb_month + network.total_egress_gb_month) * 0.12 * env_mult
    llm_cost = inp.prompts_per_day * 30 * 0.002 * env_mult if inp.managed_llm else 0
    if inp.local_llm:
        llm_cost = gke_nodes * 80 * env_mult
    monitoring = 50 * env_mult * profile_mult
    storage_providers = estimate_storage_costs(obj, db, vec)
    obj_cost = storage_providers[0].monthly_total_usd * env_mult
    monthly = compute + database + redis_cost + obj_cost + vector_cost + net_cost + llm_cost + monitoring
    return CostEstimate(
        environment=env,
        profile=inp.profile,
        compute_monthly_usd=round(compute, 2),
        database_monthly_usd=round(database, 2),
        redis_monthly_usd=round(redis_cost, 2),
        object_storage_monthly_usd=round(obj_cost, 2),
        vector_storage_monthly_usd=round(vector_cost, 2),
        networking_monthly_usd=round(net_cost, 2),
        llm_monthly_usd=round(llm_cost, 2),
        monitoring_monthly_usd=round(monitoring, 2),
        monthly_total_usd=round(monthly, 2),
        annual_total_usd=round(monthly * 12, 2),
        by_provider=storage_providers,
    )


def forecast_growth(
    inp: CapacityPlanningInputs,
    obj: ObjectStorageEstimate,
    db: DatabaseGrowthReport,
) -> list[GrowthForecastPoint]:
    daily_storage = (obj.storage_per_day_bytes + db.cloud_sql_gb_year * 1e9 / max(inp.retention_days, 1)) / 1e9
    points = []
    for label, days in [("day", 1), ("week", 7), ("month", 30), ("quarter", 90), ("year", 365), ("3yr", 1095), ("5yr", 1825)]:
        factor = min(days, inp.retention_days) if days <= inp.retention_days else days * 0.85
        points.append(GrowthForecastPoint(
            period=label,
            storage_gb=round(daily_storage * factor, 2),
            database_gb=round(db.cloud_sql_gb_year * factor / 365, 2),
            object_storage_gb=round(obj.storage_per_year_bytes / 1e9 * factor / 365, 2),
            embeddings_gb=round(inp.documents_per_day * 3.5 * inp.embedding_dimensions * 4 * factor / 1e9, 3),
            artifacts_count=inp.artifacts_per_day * factor,
            prompts_count=inp.prompts_per_day * factor,
        ))
    return points
