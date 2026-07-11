"""Architect recommendation engine."""
from __future__ import annotations

from app.schemas.capacity_planning import (
    ArchitectRecommendation,
    ArchitectRecommendationReport,
    CapacityPlanningInputs,
    CapacityPlanningReport,
    EnterpriseExtensions,
)


def generate_recommendations(
    inp: CapacityPlanningInputs,
    report: CapacityPlanningReport,
    enterprise: EnterpriseExtensions,
) -> ArchitectRecommendationReport:
    recs: list[ArchitectRecommendation] = []
    nodes = report.gke.get("node_count_est", 2)
    concurrent_ratio = inp.concurrent_users / max(inp.users, 1)

    if concurrent_ratio > 0.5 and nodes < 4:
        recs.append(ArchitectRecommendation(
            category="cpu_bottleneck",
            severity="warning",
            finding=f"High concurrency ratio ({concurrent_ratio:.0%}) with only {nodes} nodes.",
            recommendation="Scale backend replicas and add HPA target 70% CPU.",
        ))
    if report.redis.total_mb > 1024 and inp.profile in ("small", "medium"):
        recs.append(ArchitectRecommendation(
            category="ram_bottleneck",
            severity="warning",
            finding=f"Redis estimate {report.redis.total_mb:.0f} MB exceeds small/medium baseline.",
            recommendation="Upgrade to Memorystore 2GB or shard prompt cache.",
        ))
    if report.object_storage.storage_per_year_bytes > 500e9:
        recs.append(ArchitectRecommendation(
            category="storage_bottleneck",
            severity="critical",
            finding="Object storage exceeds 500 GB/year.",
            recommendation="Enable lifecycle policies and deduplication immediately.",
        ))
    if report.network.total_egress_gb_month > 500:
        recs.append(ArchitectRecommendation(
            category="network_bottleneck",
            severity="warning",
            finding=f"Egress {report.network.total_egress_gb_month} GB/month is high.",
            recommendation="Add CDN for artifact downloads; compress API payloads.",
        ))
    max_connector = max((c.daily_sync_duration_min for c in enterprise.connector_scaling), default=0)
    if max_connector > 120:
        recs.append(ArchitectRecommendation(
            category="connector_bottleneck",
            severity="warning",
            finding=f"Peak connector sync duration {max_connector:.0f} min.",
            recommendation="Increase parallel workers and stagger sync windows.",
        ))
    if inp.local_llm and report.gpu and report.gpu.max_concurrent < inp.concurrent_users:
        recs.append(ArchitectRecommendation(
            category="llm_bottleneck",
            severity="critical",
            finding=f"LLM max concurrent {report.gpu.max_concurrent} < {inp.concurrent_users} users.",
            recommendation=f"Add {report.gpu.recommended_gpu} nodes or switch to managed LLM.",
        ))
    if nodes > 8 and inp.profile == "small":
        recs.append(ArchitectRecommendation(
            category="over_sized",
            severity="info",
            finding=f"{nodes} nodes for small profile appears over-provisioned.",
            recommendation="Right-size to 2-3 nodes with autoscaling.",
        ))
    if nodes < 2:
        recs.append(ArchitectRecommendation(
            category="under_sized",
            severity="critical",
            finding="Single-node deployment lacks HA.",
            recommendation="Minimum 2 nodes across zones for production.",
        ))

    best_profile = inp.profile
    if report.costs.monthly_total_usd > 5000 and inp.profile == "enterprise":
        best_profile = "large"
    best_storage = "nearline" if report.object_storage.storage_per_year_bytes > 100e9 else "standard"
    best_ha = enterprise.high_availability.target
    best_dr = enterprise.multi_region.topology if enterprise.disaster_recovery.cross_region_backup else "multi_zone"

    status = "healthy"
    if any(r.severity == "critical" for r in recs):
        status = "action_required"
    elif any(r.severity == "warning" for r in recs):
        status = "review_recommended"

    if not recs:
        recs.append(ArchitectRecommendation(
            category="healthy",
            severity="info",
            finding="No bottlenecks detected.",
            recommendation="Continue monitoring via calibration mode.",
        ))

    return ArchitectRecommendationReport(
        recommendations=recs,
        best_gke_profile=best_profile,
        best_storage_tier=best_storage,
        best_ha_topology=best_ha,
        best_dr_topology=best_dr,
        overall_status=status,
    )
