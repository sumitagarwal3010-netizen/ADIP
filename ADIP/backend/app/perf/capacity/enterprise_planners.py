"""Enterprise capacity planners — K8s, multi-region, HA, DR, connectors, AI, RAG, personas."""
from __future__ import annotations

from app.schemas.capacity_planning import (
    AiWorkloadEstimate,
    CapacityPlanningInputs,
    CapacityPlanningReport,
    ConnectorScalingEstimate,
    DisasterRecoveryPlan,
    HaPlan,
    HaTarget,
    K8sPlatformPlan,
    K8sResourceCount,
    MultiRegionPlan,
    PersonaCapacityEstimate,
    RagBenchmarkEstimate,
    RegionTopology,
    SizingProfile,
)

_CONNECTORS = [
    "sharepoint", "teams", "outlook", "onedrive", "jira", "confluence",
    "azure_devops", "github", "gitlab", "sonarqube", "prisma", "servicenow",
]

_PERSONAS = [
    "executive", "program_manager", "project_manager", "developer", "architect",
    "tester", "auditor", "operations", "sre", "devops", "platform_admin", "compliance_officer",
]

_HA_REPLICAS: dict[HaTarget, tuple[int, int, float]] = {
    "99": (2, 2, 99.0),
    "99.5": (2, 2, 99.5),
    "99.9": (3, 2, 99.9),
    "99.95": (4, 3, 99.95),
    "99.99": (5, 4, 99.99),
}

_REGION_CFG: dict[RegionTopology, dict] = {
    "single_region": {"regions": 1, "zones": 1, "mult": 1.0, "lag": 5, "latency": 25},
    "multi_zone": {"regions": 1, "zones": 3, "mult": 1.15, "lag": 8, "latency": 30},
    "active_passive": {"regions": 2, "zones": 2, "mult": 1.45, "lag": 120, "latency": 45},
    "active_active": {"regions": 2, "zones": 3, "mult": 1.85, "lag": 40, "latency": 35},
    "cross_region": {"regions": 3, "zones": 2, "mult": 2.1, "lag": 180, "latency": 55},
    "geo_dr": {"regions": 3, "zones": 3, "mult": 2.4, "lag": 300, "latency": 65},
}


def estimate_kubernetes_platform(inp: CapacityPlanningInputs, gke: dict) -> K8sPlatformPlan:
    be_rep = gke.get("backend", {}).get("replicas", 3)
    fe_rep = gke.get("frontend", {}).get("replicas", 2)
    worker_rep = (gke.get("worker") or {}).get("replicas", 1)
    llm_rep = (gke.get("llm") or {}).get("replicas", 0)
    deployments = [
        K8sResourceCount(kind="adip-backend", count=1, replicas=be_rep),
        K8sResourceCount(kind="adip-frontend", count=1, replicas=fe_rep),
        K8sResourceCount(kind="connector-worker", count=1, replicas=worker_rep),
    ]
    if llm_rep:
        deployments.append(K8sResourceCount(kind="llm-ollama", count=1, replicas=llm_rep))
    statefulsets = [K8sResourceCount(kind="redis", count=1, replicas=1 if inp.profile == "small" else 3)]
    daemonsets = [
        K8sResourceCount(kind="prometheus-node-exporter", count=1, replicas=1, notes="Per node"),
        K8sResourceCount(kind="fluent-bit", count=1, replicas=1, notes="Log shipping"),
    ]
    cronjobs = [
        K8sResourceCount(kind="connector-sync", count=1, replicas=1),
        K8sResourceCount(kind="backup-snapshot", count=1, replicas=1),
        K8sResourceCount(kind="benchmark-scheduler", count=1, replicas=1),
    ]
    jobs = [K8sResourceCount(kind="migration-job", count=2, replicas=1)]
    pvc_gi = max(10, inp.retention_days * inp.uploads_per_day * 0.001)
    namespaces = ["adip-app", "adip-connectors", "adip-observability"]
    if inp.local_llm:
        namespaces.append("adip-llm")
    total = (
        sum(d.count for d in deployments + statefulsets + daemonsets + cronjobs + jobs)
        + be_rep + fe_rep + worker_rep + llm_rep + 3 + 2 + 4
    )
    complexity = "low" if inp.profile == "small" else "medium" if inp.profile == "medium" else "high"
    if inp.profile == "enterprise":
        complexity = "very_high"
    return K8sPlatformPlan(
        deployments=deployments,
        statefulsets=statefulsets,
        daemonsets=daemonsets,
        jobs=jobs,
        cronjobs=cronjobs,
        hpa_count=2 if inp.profile in ("large", "enterprise") else 1,
        vpa_count=1 if inp.profile == "enterprise" else 0,
        pdb_count=2,
        ingress_count=1,
        services_count=be_rep + fe_rep + 3,
        pvc_count=3,
        pvc_total_gi=round(pvc_gi, 1),
        configmaps_count=8 + inp.projects,
        secrets_count=12 + inp.applications * 2,
        namespaces=namespaces,
        total_resources=total,
        cluster_complexity=complexity,
    )


def estimate_multi_region(
    inp: CapacityPlanningInputs,
    topology: RegionTopology,
    report: CapacityPlanningReport,
) -> MultiRegionPlan:
    cfg = _REGION_CFG[topology]
    egress = report.network.total_egress_gb_month * (cfg["regions"] - 1) * 0.35
    return MultiRegionPlan(
        topology=topology,
        regions=cfg["regions"],
        zones_per_region=cfg["zones"],
        cloud_sql_replicas=cfg["regions"] if topology != "single_region" else 1,
        object_storage_replication="regional" if cfg["zones"] > 1 else "standard",
        redis_replication="cross_zone" if cfg["zones"] > 1 else "single",
        cross_region_egress_gb_month=round(egress, 2),
        replication_lag_ms_est=cfg["lag"],
        monthly_cost_multiplier=cfg["mult"],
        latency_p50_ms_est=cfg["latency"],
        storage_multiplier=1.0 + (cfg["regions"] - 1) * 0.2,
    )


def estimate_ha(inp: CapacityPlanningInputs, target: HaTarget, gke: dict) -> HaPlan:
    be, fe, avail = _HA_REPLICAS[target]
    downtime = (1 - avail / 100) * 30 * 24 * 60
    return HaPlan(
        target=target,
        availability_pct=avail,
        backend_replicas=max(be, gke.get("backend", {}).get("replicas", be)),
        frontend_replicas=max(fe, gke.get("frontend", {}).get("replicas", fe)),
        database_ha="regional_ha" if target in ("99.9", "99.95", "99.99") else "zonal",
        connector_redundancy=2 if target in ("99.95", "99.99") else 1,
        llm_redundancy=2 if inp.local_llm and target in ("99.95", "99.99") else 1,
        max_downtime_minutes_month=round(downtime, 1),
    )


def estimate_disaster_recovery(inp: CapacityPlanningInputs, topology: RegionTopology, db_gb: float) -> DisasterRecoveryPlan:
    rpo = 60 if topology == "single_region" else 15 if topology == "geo_dr" else 30
    rto = 240 if topology == "single_region" else 60 if topology == "geo_dr" else 120
    backup_gb = db_gb * 1.5 + inp.uploads_per_day * inp.retention_days * 0.0005
    return DisasterRecoveryPlan(
        rpo_minutes=rpo,
        rto_minutes=rto,
        snapshot_schedule="every 6h" if inp.profile in ("large", "enterprise") else "daily",
        backup_retention_days=max(inp.retention_days, 30),
        cross_region_backup=topology in ("cross_region", "geo_dr", "active_passive"),
        recovery_test_frequency_days=90 if inp.profile == "enterprise" else 180,
        backup_storage_gb=round(backup_gb, 2),
        monthly_backup_cost_usd=round(backup_gb * 0.08, 2),
    )


def estimate_connector_scaling(inp: CapacityPlanningInputs) -> list[ConnectorScalingEstimate]:
    results = []
    sync_share = inp.connector_syncs_per_day / max(len(_CONNECTORS), 1)
    for i, conn in enumerate(_CONNECTORS):
        rate = 60 if conn in ("jira", "github", "gitlab") else 30
        workers = 1 if sync_share < 10 else 2 if sync_share < 50 else 4
        duration = sync_share * (2.5 + i * 0.1)
        results.append(ConnectorScalingEstimate(
            connector=conn,
            api_rate_limit_per_min=rate,
            throughput_per_hour=round(sync_share * 2.2, 1),
            parallel_workers=workers,
            queue_depth=max(5, int(sync_share / 2)),
            retry_window_minutes=15,
            daily_sync_duration_min=round(duration, 1),
            peak_sync_window="02:00-04:00 UTC",
        ))
    return results


def estimate_ai_workloads(inp: CapacityPlanningInputs, avg_latency: float = 150.0) -> list[AiWorkloadEstimate]:
    base_cpu = 250
    workloads = [
        ("prompt_execution", 1.0, 1.0, 1.0, 0.5),
        ("prompt_replay", 0.3, 0.5, 0.8, 0.2),
        ("prompt_regression", 0.5, 0.8, 1.2, 0.3),
        ("artifact_generation", 0.8, 1.2, 1.5, 1.0),
        ("embeddings", 0.6, 1.5, 2.0, 0.8),
        ("hallucination_detection", 0.4, 0.6, 1.1, 0.1),
        ("semantic_similarity", 0.3, 0.5, 0.9, 0.2),
        ("rule_engine", 0.2, 0.3, 0.5, 0.1),
        ("traceability", 0.25, 0.4, 0.7, 0.15),
        ("connector_ai", 0.5, 0.7, 1.0, 0.4),
    ]
    return [
        AiWorkloadEstimate(
            workload=name,
            cpu_millicores=int(base_cpu * cpu_m),
            ram_mb=int(128 * ram_m * (2 if inp.profile == "enterprise" else 1)),
            latency_ms_p50=round(avg_latency * lat_m, 1),
            storage_mb_day=round(inp.prompts_per_day * stor_m * 0.01, 2),
        )
        for name, cpu_m, ram_m, lat_m, stor_m in workloads
    ]


def estimate_rag_benchmark(inp: CapacityPlanningInputs) -> RagBenchmarkEstimate:
    chunks = int(inp.documents_per_day * inp.retention_days * 3.5)
    chunk_size = 512 if inp.embedding_dimensions <= 384 else 768
    vec_gb = chunks * inp.embedding_dimensions * 4 / 1e9
    return RagBenchmarkEstimate(
        chunk_size_tokens=chunk_size,
        chunk_count=chunks,
        embedding_latency_ms=25 + inp.embedding_dimensions // 20,
        retrieval_latency_ms=15 + inp.embedding_dimensions // 30,
        context_assembly_ms=8,
        top_k=5,
        context_window_utilization_pct=min(95, 40 + inp.avg_prompt_size_tokens / 50),
        vector_growth_gb_year=round(vec_gb, 3),
    )


def estimate_persona_models(inp: CapacityPlanningInputs) -> list[PersonaCapacityEstimate]:
    weights: dict[str, tuple[float, float, float]] = {
        "executive": (0.02, 0.01, 0.05),
        "program_manager": (0.08, 0.06, 0.1),
        "project_manager": (0.1, 0.08, 0.12),
        "developer": (0.25, 0.15, 0.2),
        "architect": (0.12, 0.1, 0.15),
        "tester": (0.1, 0.05, 0.08),
        "auditor": (0.05, 0.12, 0.06),
        "operations": (0.06, 0.1, 0.05),
        "sre": (0.08, 0.15, 0.04),
        "devops": (0.07, 0.12, 0.05),
        "platform_admin": (0.04, 0.08, 0.04),
        "compliance_officer": (0.03, 0.08, 0.06),
    }
    per_user_prompts = inp.prompts_per_day / max(inp.users, 1)
    return [
        PersonaCapacityEstimate(
            persona=p,
            daily_prompts=round(per_user_prompts * w[0] * inp.users, 1),
            connector_calls_day=round(inp.connector_syncs_per_day * w[1], 1),
            artifacts_day=round(inp.artifacts_per_day * w[2], 1),
            storage_mb_day=round(inp.avg_artifact_size_kb * w[2] * 2 / 1024, 2),
        )
        for p, w in weights.items()
    ]
