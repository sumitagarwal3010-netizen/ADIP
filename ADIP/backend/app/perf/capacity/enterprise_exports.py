"""Extended enterprise report exports."""
from __future__ import annotations

import csv
import json
from pathlib import Path

from app.schemas.capacity_planning import EnterpriseCapacityReport


def write_enterprise_reports(report: EnterpriseCapacityReport, out_dir: Path) -> dict[str, Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    prefix = f"enterprise_capacity_{report.plan.profile}"
    paths: dict[str, Path] = {}

    # JSON full
    p = out_dir / f"{prefix}.json"
    p.write_text(report.model_dump_json(indent=2), encoding="utf-8")
    paths["json"] = p

    # Executive summary
    exec_md = _executive_summary(report)
    p = out_dir / f"{prefix}_executive_summary.md"
    p.write_text(exec_md, encoding="utf-8")
    paths["executive_summary"] = p

    # Architecture summary
    arch_md = _architecture_summary(report)
    p = out_dir / f"{prefix}_architecture_summary.md"
    p.write_text(arch_md, encoding="utf-8")
    paths["architecture_summary"] = p

    # Infrastructure summary
    infra_md = _infrastructure_summary(report)
    p = out_dir / f"{prefix}_infrastructure_summary.md"
    p.write_text(infra_md, encoding="utf-8")
    paths["infrastructure_summary"] = p

    # Calibration report
    if report.enterprise.calibration:
        p = out_dir / f"{prefix}_calibration.md"
        cal = report.enterprise.calibration
        p.write_text(
            f"# Calibration Report\n\nMock mode: {cal.mock_mode}\n\n"
            f"Accuracy: {json.dumps(cal.accuracy_pct, indent=2)}\n\n"
            f"Corrections: {chr(10).join('- ' + a for a in cal.future_adjustments)}\n",
            encoding="utf-8",
        )
        paths["calibration"] = p

    # Cost optimization
    opt = report.enterprise.cost_optimization
    p = out_dir / f"{prefix}_cost_optimization.md"
    lines = ["# Cost Optimization Report\n", f"Total monthly savings: ${opt.total_monthly_savings_usd}\n"]
    for item in opt.items:
        lines.append(f"- **{item.strategy}**: ${item.monthly_savings_usd}/mo — {item.recommendation}")
    p.write_text("\n".join(lines), encoding="utf-8")
    paths["cost_optimization"] = p

    # CSV comparison
    if report.enterprise.scenario_comparison:
        p = out_dir / f"{prefix}_scenario_comparison.csv"
        with p.open("w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["scenario", "monthly_cost", "gke_nodes", "storage_gb", "notes"])
            for row in report.enterprise.scenario_comparison.rows:
                w.writerow([row.scenario, row.monthly_cost_usd, row.gke_nodes, row.storage_gb_year, row.notes])
        paths["scenario_comparison_csv"] = p

    return paths


def _executive_summary(r: EnterpriseCapacityReport) -> str:
    p, e = r.plan, r.enterprise
    return (
        f"# Executive Summary — {p.profile}\n\n"
        f"**Monthly cost:** ${p.costs.monthly_total_usd:,.2f}  \n"
        f"**Potential savings:** ${e.cost_optimization.total_monthly_savings_usd:,.2f}/mo  \n"
        f"**HA target:** {e.high_availability.target} ({e.high_availability.availability_pct}%)  \n"
        f"**Region topology:** {e.multi_region.topology}  \n"
        f"**Architect status:** {e.architect_recommendations.overall_status}  \n"
        f"**RPO/RTO:** {e.disaster_recovery.rpo_minutes}m / {e.disaster_recovery.rto_minutes}m  \n"
    )


def _architecture_summary(r: EnterpriseCapacityReport) -> str:
    k = r.enterprise.kubernetes_platform
    return (
        f"# Architecture Summary\n\n"
        f"- **Namespaces:** {', '.join(k.namespaces)}\n"
        f"- **Deployments:** {len(k.deployments)} | **StatefulSets:** {len(k.statefulsets)}\n"
        f"- **HPA:** {k.hpa_count} | **PDB:** {k.pdb_count} | **Ingress:** {k.ingress_count}\n"
        f"- **PVC total:** {k.pvc_total_gi} Gi\n"
        f"- **Cluster complexity:** {k.cluster_complexity}\n"
        f"- **AI workloads:** {len(r.enterprise.ai_workloads)} tracked\n"
        f"- **Personas:** {len(r.enterprise.persona_models)} modeled\n"
    )


def _infrastructure_summary(r: EnterpriseCapacityReport) -> str:
    p = r.plan
    return (
        f"# Infrastructure Summary\n\n"
        f"| Component | Value |\n|---|---|\n"
        f"| GKE nodes | {p.gke.get('node_count_est')} |\n"
        f"| Cloud SQL GB/year | {p.database_growth.cloud_sql_gb_year} |\n"
        f"| Object storage GB/year | {p.object_storage.storage_per_year_bytes / 1e9:.2f} |\n"
        f"| Redis MB | {p.redis.total_mb} |\n"
        f"| Network egress GB/mo | {p.network.total_egress_gb_month} |\n"
        f"| Vector growth GB/yr | {r.enterprise.rag_benchmark.vector_growth_gb_year} |\n"
    )
