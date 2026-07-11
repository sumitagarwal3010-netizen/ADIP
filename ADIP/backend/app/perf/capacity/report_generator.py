"""Capacity planning report generation — Markdown, JSON, CSV, HTML."""
from __future__ import annotations

import csv
import json
from pathlib import Path

from app.schemas.capacity_planning import CapacityPlanningReport


def _fmt_bytes(b: float) -> str:
    if b >= 1e12:
        return f"{b / 1e12:.2f} TB"
    if b >= 1e9:
        return f"{b / 1e9:.2f} GB"
    if b >= 1e6:
        return f"{b / 1e6:.2f} MB"
    return f"{b / 1e3:.1f} KB"


def to_markdown(report: CapacityPlanningReport) -> str:
    obj = report.object_storage
    db = report.database_growth
    net = report.network
    cost = report.costs
    lines = [
        f"# ADIP Enterprise Capacity Planning Report — {report.profile}",
        "",
        f"_Generated: {report.generated_at}_ | Environment: **{report.environment}**",
        "",
        "## Executive Summary",
        "",
        f"- Monthly cost estimate: **${cost.monthly_total_usd:,.2f}** (annual ${cost.annual_total_usd:,.2f})",
        f"- Object storage/year: **{_fmt_bytes(obj.storage_per_year_bytes)}**",
        f"- Cloud SQL/year: **{db.cloud_sql_gb_year} GB**",
        f"- Network egress/month: **{net.total_egress_gb_month} GB**",
        f"- GKE nodes (est.): **{report.gke.get('node_count_est', 'N/A')}**",
        "",
        "## Inputs",
        "",
        f"| Metric | Value |",
        f"|---|---|",
        f"| Users | {report.inputs.users} |",
        f"| Concurrent users | {report.inputs.concurrent_users} |",
        f"| Prompts/day | {report.inputs.prompts_per_day} |",
        f"| Artifacts/day | {report.inputs.artifacts_per_day} |",
        f"| Retention days | {report.inputs.retention_days} |",
        "",
        "## Object Storage",
        "",
        f"- Uploads/day: {obj.uploads_per_day:.0f} | month: {obj.uploads_per_month:.0f}",
        f"- Storage/day: {_fmt_bytes(obj.storage_per_day_bytes)}",
        f"- After compression: {_fmt_bytes(obj.after_compression_bytes)}",
        f"- After deduplication: {_fmt_bytes(obj.after_deduplication_bytes)}",
        f"- After versioning: {_fmt_bytes(obj.after_versioning_bytes)}",
        f"- Archive (coldline): {_fmt_bytes(obj.archive_coldline_bytes)}",
        "",
        "## Database Growth",
        "",
        f"| Table | Rows/day | Year storage |",
        f"|---|---:|---:|",
    ]
    for t in db.tables[:8]:
        lines.append(f"| {t.table} | {t.rows_per_day:.0f} | {_fmt_bytes(t.storage_year_bytes)} |")
    lines += [
        "",
        f"**Total Cloud SQL:** {db.cloud_sql_gb_year} GB/year | Backup: {db.backup_gb_year} GB",
        "",
        "## Network",
        "",
        f"- Ingress/month: {net.total_ingress_gb_month} GB | Egress/month: {net.total_egress_gb_month} GB",
        f"- Annual bandwidth: {net.total_annual_gb} GB",
        "",
        "## Cost Breakdown",
        "",
        f"| Component | Monthly USD |",
        f"|---|---:|",
        f"| Compute | ${cost.compute_monthly_usd:,.2f} |",
        f"| Database | ${cost.database_monthly_usd:,.2f} |",
        f"| Redis | ${cost.redis_monthly_usd:,.2f} |",
        f"| Object storage | ${cost.object_storage_monthly_usd:,.2f} |",
        f"| Vector storage | ${cost.vector_storage_monthly_usd:,.2f} |",
        f"| Networking | ${cost.networking_monthly_usd:,.2f} |",
        f"| LLM | ${cost.llm_monthly_usd:,.2f} |",
        f"| Monitoring | ${cost.monitoring_monthly_usd:,.2f} |",
        f"| **Total** | **${cost.monthly_total_usd:,.2f}** |",
        "",
        "## Growth Forecast",
        "",
        f"| Period | Storage GB | Database GB | Artifacts |",
        f"|---|---:|---:|---:|",
    ]
    for g in report.growth_forecast:
        lines.append(f"| {g.period} | {g.storage_gb} | {g.database_gb} | {g.artifacts_count:.0f} |")
    if report.gpu:
        lines += [
            "",
            "## GPU Sizing",
            "",
            f"- Recommended: **{report.gpu.recommended_gpu}**",
            f"- VRAM required: {report.gpu.vram_required_gb} GB",
            f"- Throughput: {report.gpu.throughput_rps} RPS | Latency p50: {report.gpu.latency_ms_p50} ms",
        ]
    lines.append("")
    return "\n".join(lines)


def to_html(report: CapacityPlanningReport) -> str:
    md = to_markdown(report)
    body = md.replace("\n", "<br>\n").replace("|", " | ")
    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>ADIP Capacity Plan — {report.profile}</title>
<style>body{{font-family:system-ui;max-width:900px;margin:2rem auto;padding:0 1rem}}</style>
</head><body>{body}</body></html>"""


def to_csv_rows(report: CapacityPlanningReport) -> list[list[str]]:
    rows = [["section", "metric", "value"]]
    rows.append(["cost", "monthly_total_usd", str(report.costs.monthly_total_usd)])
    rows.append(["object_storage", "storage_per_year_bytes", str(report.object_storage.storage_per_year_bytes)])
    rows.append(["database", "cloud_sql_gb_year", str(report.database_growth.cloud_sql_gb_year)])
    rows.append(["network", "total_annual_gb", str(report.network.total_annual_gb)])
    for g in report.growth_forecast:
        rows.append(["forecast", g.period, str(g.storage_gb)])
    return rows


def write_all_reports(report: CapacityPlanningReport, out_dir: Path) -> dict[str, Path]:
    out_dir.mkdir(parents=True, exist_ok=True)
    prefix = f"capacity_plan_{report.profile}"
    paths: dict[str, Path] = {}
    json_path = out_dir / f"{prefix}.json"
    json_path.write_text(report.model_dump_json(indent=2), encoding="utf-8")
    paths["json"] = json_path
    md_path = out_dir / f"{prefix}.md"
    md_path.write_text(to_markdown(report), encoding="utf-8")
    paths["markdown"] = md_path
    html_path = out_dir / f"{prefix}.html"
    html_path.write_text(to_html(report), encoding="utf-8")
    paths["html"] = html_path
    csv_path = out_dir / f"{prefix}.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        csv.writer(f).writerows(to_csv_rows(report))
    paths["csv"] = csv_path
    exec_path = out_dir / f"{prefix}_executive_summary.md"
    exec_path.write_text(_executive_summary(report), encoding="utf-8")
    paths["executive_summary"] = exec_path
    return paths


def _executive_summary(report: CapacityPlanningReport) -> str:
    return (
        f"# Executive Summary — ADIP Capacity Plan ({report.profile})\n\n"
        f"**Environment:** {report.environment}  \n"
        f"**Monthly cost:** ${report.costs.monthly_total_usd:,.2f}  \n"
        f"**Annual cost:** ${report.costs.annual_total_usd:,.2f}  \n"
        f"**GKE nodes:** {report.gke.get('node_count_est', 'N/A')}  \n"
        f"**Cloud SQL:** {report.database_growth.cloud_sql_gb_year} GB/year  \n"
        f"**Object storage:** {_fmt_bytes(report.object_storage.storage_per_year_bytes)}/year  \n"
    )
