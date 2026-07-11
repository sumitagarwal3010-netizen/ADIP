"""Scenario comparison engine."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.perf.capacity.estimators import inputs_from_profile
from app.schemas.capacity_planning import (
    CapacityPlanningInputs,
    ScenarioCompareRequest,
    ScenarioComparisonReport,
    ScenarioComparisonRow,
    SizingProfile,
)


def _run_variant(
    db: Session,
    profile: SizingProfile,
    *,
    local_llm: bool = False,
    managed_llm: bool = True,
) -> ScenarioComparisonRow:
    from app.perf.capacity.planner_engine import EnterpriseCapacityPlanner

    inp = CapacityPlanningInputs(
        run_infra_scenarios=False,
        local_llm=local_llm,
        managed_llm=managed_llm,
    )
    report = EnterpriseCapacityPlanner(db).plan(profile=profile, inputs=inp, write_reports=False)
    return ScenarioComparisonRow(
        scenario=f"{profile}",
        profile=profile,
        monthly_cost_usd=report.costs.monthly_total_usd,
        gke_nodes=report.gke.get("node_count_est", 0),
        storage_gb_year=round(report.object_storage.storage_per_year_bytes / 1e9, 2),
        cloud_sql_gb_year=report.database_growth.cloud_sql_gb_year,
        latency_ms_est=150 if not local_llm else 80,
        notes="managed_llm" if managed_llm else "local_llm",
    )


def compare_scenarios(db: Session, req: ScenarioCompareRequest) -> ScenarioComparisonReport:
    rows: list[ScenarioComparisonRow] = []
    for profile in req.profiles:
        rows.append(_run_variant(db, profile, local_llm=False, managed_llm=True))
        rows.append(_run_variant(db, profile, local_llm=True, managed_llm=False))
    for topo in req.region_topologies:
        mult = {"single_region": 1.0, "multi_zone": 1.15, "active_active": 1.85, "geo_dr": 2.4}.get(topo, 1.2)
        base = rows[0] if rows else _run_variant(db, "medium")
        rows.append(ScenarioComparisonRow(
            scenario=f"region_{topo}",
            profile="medium",
            monthly_cost_usd=round(base.monthly_cost_usd * mult, 2),
            gke_nodes=base.gke_nodes + (1 if topo != "single_region" else 0),
            storage_gb_year=round(base.storage_gb_year * mult, 2),
            cloud_sql_gb_year=base.cloud_sql_gb_year,
            latency_ms_est=25 + mult * 10,
            notes=topo,
        ))
    for mode in req.llm_modes:
        local = mode in ("local_llm", "ollama")
        rows.append(ScenarioComparisonRow(
            scenario=f"llm_{mode}",
            profile="medium",
            monthly_cost_usd=_run_variant(db, "medium", local_llm=local, managed_llm=not local).monthly_cost_usd,
            gke_nodes=_run_variant(db, "medium", local_llm=local).gke_nodes,
            storage_gb_year=_run_variant(db, "medium", local_llm=local).storage_gb_year,
            cloud_sql_gb_year=_run_variant(db, "medium").cloud_sql_gb_year,
            latency_ms_est=80 if local else 150,
            notes=mode,
        ))
    baseline_cost = rows[0].monthly_cost_usd if rows else 0
    deltas = {r.scenario: round(r.monthly_cost_usd - baseline_cost, 2) for r in rows[1:]}
    cheapest = min(rows, key=lambda r: r.monthly_cost_usd)
    return ScenarioComparisonReport(
        baseline=rows[0].scenario if rows else "none",
        rows=rows,
        deltas=deltas,
        recommendation=f"Lowest cost: {cheapest.scenario} at ${cheapest.monthly_cost_usd}/mo",
    )
