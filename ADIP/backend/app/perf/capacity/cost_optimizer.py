"""Cost optimization recommendations."""
from __future__ import annotations

from app.schemas.capacity_planning import (
    CapacityPlanningInputs,
    CapacityPlanningReport,
    CostOptimizationItem,
    CostOptimizationReport,
)


def optimize_costs(inp: CapacityPlanningInputs, report: CapacityPlanningReport) -> CostOptimizationReport:
    cost = report.costs
    obj = report.object_storage
    items: list[CostOptimizationItem] = []

    ri_save = cost.compute_monthly_usd * 0.28
    items.append(CostOptimizationItem(
        strategy="reserved_instances",
        monthly_savings_usd=round(ri_save, 2),
        annual_savings_usd=round(ri_save * 12, 2),
        effort="medium",
        recommendation="Commit 1-year GKE/Compute reserved capacity for baseline nodes.",
    ))

    if inp.profile in ("large", "enterprise"):
        spot_save = cost.compute_monthly_usd * 0.15
        items.append(CostOptimizationItem(
            strategy="spot_nodes",
            monthly_savings_usd=round(spot_save, 2),
            annual_savings_usd=round(spot_save * 12, 2),
            effort="high",
            recommendation="Run connector workers and batch jobs on spot/preemptible node pool.",
        ))

    autoscale_save = cost.compute_monthly_usd * 0.12
    items.append(CostOptimizationItem(
        strategy="autoscaling",
        monthly_savings_usd=round(autoscale_save, 2),
        annual_savings_usd=round(autoscale_save * 12, 2),
        effort="low",
        recommendation="Enable HPA on backend; scale to zero for benchmark workers off-peak.",
    ))

    if inp.local_llm:
        gpu_share = cost.llm_monthly_usd * 0.2
        items.append(CostOptimizationItem(
            strategy="gpu_sharing",
            monthly_savings_usd=round(gpu_share, 2),
            annual_savings_usd=round(gpu_share * 12, 2),
            effort="medium",
            recommendation="Share GPU node pool across Ollama and embedding workloads.",
        ))

    lifecycle_save = cost.object_storage_monthly_usd * 0.25
    items.append(CostOptimizationItem(
        strategy="storage_lifecycle",
        monthly_savings_usd=round(lifecycle_save, 2),
        annual_savings_usd=round(lifecycle_save * 12, 2),
        effort="low",
        recommendation="Move aged artifacts to Nearline after 30d, Coldline after 90d.",
    ))

    compress_save = obj.storage_per_year_bytes / 1e9 * 0.02 * 0.35
    items.append(CostOptimizationItem(
        strategy="compression",
        monthly_savings_usd=round(compress_save, 2),
        annual_savings_usd=round(compress_save * 12, 2),
        effort="low",
        recommendation="Enable gzip compression on CSV/JSON exports and log archives.",
    ))

    cache_save = cost.redis_monthly_usd * 0.1 + cost.database_monthly_usd * 0.05
    items.append(CostOptimizationItem(
        strategy="caching",
        monthly_savings_usd=round(cache_save, 2),
        annual_savings_usd=round(cache_save * 12, 2),
        effort="low",
        recommendation="Expand prompt and connector metadata cache TTL during steady state.",
    ))

    dedup_save = cost.object_storage_monthly_usd * 0.12
    items.append(CostOptimizationItem(
        strategy="object_deduplication",
        monthly_savings_usd=round(dedup_save, 2),
        annual_savings_usd=round(dedup_save * 12, 2),
        effort="medium",
        recommendation="Content-hash dedup for version history and retention copies.",
    ))

    cold_save = obj.archive_coldline_bytes / 1e9 * 0.015
    items.append(CostOptimizationItem(
        strategy="cold_storage",
        monthly_savings_usd=round(cold_save, 2),
        annual_savings_usd=round(cold_save * 12, 2),
        effort="low",
        recommendation=f"Archive {obj.archive_coldline_bytes / 1e9:.1f} GB to Coldline tier.",
    ))

    total_m = sum(i.monthly_savings_usd for i in items)
    return CostOptimizationReport(
        items=items,
        total_monthly_savings_usd=round(total_m, 2),
        total_annual_savings_usd=round(total_m * 12, 2),
    )
