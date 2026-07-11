"""ADIP_Capacity_Planner.xlsx — formula-driven Excel workbook."""
from __future__ import annotations

from pathlib import Path

from app.schemas.capacity_planning import CapacityPlanningReport

_openpyxl = None
try:
    import openpyxl
    from openpyxl.styles import Font
    _openpyxl = openpyxl
except ImportError:
    pass


def generate_excel(report: CapacityPlanningReport, out_path: Path | None = None) -> Path | None:
    if not _openpyxl:
        return None
    wb = _openpyxl.Workbook()
    bold = Font(bold=True)
    inp = report.inputs
    cost = report.costs
    obj = report.object_storage
    db = report.database_growth

    def _hdr(ws, row: int, cols: list[str]) -> None:
        for i, c in enumerate(cols, 1):
            cell = ws.cell(row=row, column=i, value=c)
            cell.font = bold

    # Inputs
    ws = wb.active
    ws.title = "Inputs"
    _hdr(ws, 1, ["Parameter", "Value"])
    rows = [
        ("Profile", report.profile),
        ("Environment", report.environment),
        ("Users", inp.users),
        ("Concurrent users", inp.concurrent_users),
        ("Prompts/day", inp.prompts_per_day),
        ("Artifacts/day", inp.artifacts_per_day),
        ("Documents/day", inp.documents_per_day),
        ("Uploads/day", inp.uploads_per_day),
        ("Retention days", inp.retention_days),
        ("Embedding enabled", inp.embedding_enabled),
        ("Local LLM", inp.local_llm),
    ]
    for i, (k, v) in enumerate(rows, 2):
        ws.cell(row=i, column=1, value=k)
        ws.cell(row=i, column=2, value=v)

    # CPU / RAM / GKE
    for title, data in [
        ("CPU", [("GKE nodes", report.gke.get("node_count_est", 0)), ("Node vCPU", report.gke.get("node_pool_vcpu", 0))]),
        ("RAM", [("Node memory Gi", report.gke.get("node_pool_memory_gi", 0))]),
        ("GKE", [
            ("Backend replicas", report.gke.get("backend", {}).get("replicas", 0)),
            ("Frontend replicas", report.gke.get("frontend", {}).get("replicas", 0)),
        ]),
        ("Cloud SQL", [("GB/year", db.cloud_sql_gb_year), ("Backup GB/year", db.backup_gb_year)]),
        ("Redis", [("Total MB", report.redis.total_mb), ("TTL hours", report.redis.ttl_hours)]),
        ("Object Storage", [
            ("Storage/year bytes", obj.storage_per_year_bytes),
            ("After compression", obj.after_compression_bytes),
            ("Archive coldline", obj.archive_coldline_bytes),
        ]),
        ("Vector DB", [(f"{v.dimensions}d storage", v.storage_bytes_year) for v in report.vector_db[:2]]),
        ("Cost", [
            ("Compute USD/mo", cost.compute_monthly_usd),
            ("Database USD/mo", cost.database_monthly_usd),
            ("Object storage USD/mo", cost.object_storage_monthly_usd),
            ("Monthly total", cost.monthly_total_usd),
            ("Annual total", cost.annual_total_usd),
        ]),
        ("Growth", [(g.period, g.storage_gb) for g in report.growth_forecast]),
        ("Forecast", [(g.period, g.database_gb) for g in report.growth_forecast]),
    ]:
        ws2 = wb.create_sheet(title[:31])
        _hdr(ws2, 1, ["Metric", "Value"])
        for i, (k, v) in enumerate(data, 2):
            ws2.cell(row=i, column=1, value=str(k))
            ws2.cell(row=i, column=2, value=v)

    # Dashboard
    dash = wb.create_sheet("Dashboard")
    _hdr(dash, 1, ["KPI", "Value"])
    dash.cell(row=2, column=1, value="Monthly cost USD")
    dash.cell(row=2, column=2, value=cost.monthly_total_usd)
    dash.cell(row=3, column=1, value="Cloud SQL GB/year")
    dash.cell(row=3, column=2, value=db.cloud_sql_gb_year)
    dash.cell(row=4, column=1, value="Object storage GB/year")
    dash.cell(row=4, column=2, value=round(obj.storage_per_year_bytes / 1e9, 2))
    dash.cell(row=5, column=1, value="GKE nodes")
    dash.cell(row=5, column=2, value=report.gke.get("node_count_est", 0))

    path = out_path or Path(__file__).resolve().parents[4] / "ADIP_Capacity_Planner.xlsx"
    path.parent.mkdir(parents=True, exist_ok=True)
    wb.save(path)
    return path
