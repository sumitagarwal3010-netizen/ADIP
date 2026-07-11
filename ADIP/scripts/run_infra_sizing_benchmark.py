#!/usr/bin/env python3
"""Run ADIP infrastructure sizing benchmark for GKE/GCP (mock mode).

Usage:
  python3 scripts/run_infra_sizing_benchmark.py [profile] [--out DIR]

Profiles: small, medium, large, enterprise (default: medium)
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _bootstrap import bootstrap

bootstrap()

from app.db.session import SessionLocal
from app.perf.infra_sizing_benchmark import InfraSizingBenchmarkService
from app.schemas.infra_sizing import SizingProfile


def main() -> int:
    parser = argparse.ArgumentParser(description="ADIP infra sizing benchmark (GKE/GCP).")
    parser.add_argument("profile", nargs="?", default="medium", choices=["small", "medium", "large", "enterprise"])
    parser.add_argument("--out", type=str, default=None, help="Output directory for JSON/MD reports")
    parser.add_argument("--json-only", action="store_true", help="Print JSON to stdout only")
    args = parser.parse_args()
    profile: SizingProfile = args.profile  # type: ignore[assignment]
    out_dir = Path(args.out) if args.out else None

    with SessionLocal() as db:
        svc = InfraSizingBenchmarkService(db)
        report = svc.run(profile=profile)
        json_path, md_path = svc.write_reports(report, out_dir)

    if args.json_only:
        print(report.model_dump_json(indent=2))
    else:
        print(f"Profile: {profile}")
        print(f"Scenarios OK: {report.totals.get('scenarios_ok')}/{report.totals.get('scenarios_total')}")
        print(f"Total tokens: {report.totals.get('total_tokens')}")
        print(f"GKE nodes (est.): {report.gke.node_count_est}")
        print(f"Cloud SQL: {report.gke.cloud_sql_storage_gb} GB | GCS: {report.gke.gcs_storage_gb} GB")
        print(f"Reports: {json_path} , {md_path}")
    return 0 if report.totals.get("scenarios_ok", 0) == report.totals.get("scenarios_total", 0) else 1


if __name__ == "__main__":
    raise SystemExit(main())
