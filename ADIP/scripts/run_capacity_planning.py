#!/usr/bin/env python3
"""Run ADIP Enterprise Capacity Planning Suite.

Usage:
  python3 scripts/run_capacity_planning.py [profile] [--env production] [--load] [--excel]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _bootstrap import bootstrap

bootstrap()

from app.db.session import SessionLocal
from app.perf.capacity.excel_planner import generate_excel
from app.perf.capacity.planner_engine import EnterpriseCapacityPlanner
from app.schemas.capacity_planning import CapacityPlanningInputs, Environment, SizingProfile


def main() -> int:
    parser = argparse.ArgumentParser(description="ADIP Enterprise Capacity Planning Suite.")
    parser.add_argument("profile", nargs="?", default="medium", choices=["small", "medium", "large", "enterprise"])
    parser.add_argument("--env", default="production", choices=["development", "dev", "uat", "production", "prod"])
    parser.add_argument("--out", type=str, default=None, help="Output directory for reports")
    parser.add_argument("--load", action="store_true", help="Run load tests")
    parser.add_argument("--excel", action="store_true", help="Generate Excel planner")
    parser.add_argument("--json-only", action="store_true")
    args = parser.parse_args()
    profile: SizingProfile = args.profile  # type: ignore[assignment]
    _env_map = {"dev": "development", "prod": "production", "development": "development", "uat": "uat", "production": "production"}
    env: Environment = _env_map[args.env]  # type: ignore[assignment]
    out_dir = Path(args.out) if args.out else None

    inputs = CapacityPlanningInputs(
        run_load_test=args.load,
        run_infra_scenarios=True,
        load_concurrency=10,
    )

    with SessionLocal() as db:
        planner = EnterpriseCapacityPlanner(db)
        report = planner.plan(
            profile=profile,
            environment=env,
            inputs=inputs,
            write_reports=True,
            out_dir=out_dir,
        )
        excel_path = None
        if args.excel:
            excel_path = generate_excel(report, out_path=out_dir / "ADIP_Capacity_Planner.xlsx" if out_dir else None)

    if args.json_only:
        print(report.model_dump_json(indent=2))
    else:
        print(f"Profile: {profile} | Environment: {env}")
        print(f"Monthly cost: ${report.costs.monthly_total_usd:,.2f}")
        print(f"Object storage/year: {report.object_storage.storage_per_year_bytes / 1e9:.2f} GB")
        print(f"Cloud SQL/year: {report.database_growth.cloud_sql_gb_year} GB")
        print(f"GKE nodes: {report.gke.get('node_count_est')}")
        print(f"Reports: {report.reports}")
        if excel_path:
            print(f"Excel: {excel_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
