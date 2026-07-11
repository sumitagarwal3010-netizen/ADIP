#!/usr/bin/env python3
"""Run all ADIP benchmarks and capacity planning — orchestrates existing scripts.

Usage:
  python3 scripts/run_all_benchmarks.py [--env dev|uat|prod] [--profile small|medium|large|enterprise]
  python3 scripts/run_all_benchmarks.py --all-envs
"""
from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_OUT = _ROOT / "docs" / "examples" / "performance"
_PY = sys.executable


def _run(name: str, cmd: list[str], *, save_as: str | None = None) -> tuple[str, int, float]:
    t0 = time.perf_counter()
    try:
        r = subprocess.run(cmd, cwd=_ROOT, capture_output=True, text=True, timeout=300)
        elapsed = time.perf_counter() - t0
        if save_as and r.stdout.strip():
            (_OUT / save_as).write_text(r.stdout, encoding="utf-8")
        status = "OK" if r.returncode == 0 else f"WARN({r.returncode})"
        if r.returncode != 0 and r.stderr:
            status += f" {r.stderr.strip()[:60]}"
        return status, r.returncode, elapsed
    except subprocess.TimeoutExpired:
        return "TIMEOUT", 1, time.perf_counter() - t0
    except Exception as exc:  # noqa: BLE001
        return f"ERROR: {exc}", 1, time.perf_counter() - t0


def _load_profile(env_key: str) -> dict:
    try:
        import yaml  # type: ignore[import-untyped]
        data = yaml.safe_load((_ROOT / "scripts" / "benchmark_profiles.yaml").read_text(encoding="utf-8"))
        return data.get(env_key, data.get("dev", {}))
    except ImportError:
        defaults = {
            "dev": {"capacity_profile": "small", "adip_env": "development", "load_concurrency": 2},
            "uat": {"capacity_profile": "medium", "adip_env": "uat", "load_concurrency": 10},
            "prod": {"capacity_profile": "enterprise", "adip_env": "production", "load_concurrency": 50},
        }
        return defaults.get(env_key, defaults["dev"])


def run_suite(env_key: str = "dev", profile: str | None = None) -> list[tuple[str, str, float]]:
    cfg = _load_profile(env_key)
    prof = profile or cfg.get("capacity_profile", "medium")
    adip_env = cfg.get("adip_env", "development")
    load = env_key == "prod"
    _OUT.mkdir(parents=True, exist_ok=True)
    results: list[tuple[str, str, float]] = []

    steps: list[tuple[str, list[str], str | None]] = [
        ("infra_sizing", [_PY, "scripts/run_infra_sizing_benchmark.py", prof, "--out", str(_OUT)], None),
        ("capacity_planning", [_PY, "scripts/run_capacity_planning.py", prof, "--env", adip_env, "--excel", "--out", str(_OUT)], None),
        ("llm_smoke", [_PY, "scripts/run_llm_smoke_test.py"], "llm_smoke_test.json"),
        ("prompt_regression", [_PY, "scripts/run_prompt_regression.py"], "prompt_regression_summary.txt"),
        ("artifact_quality", [_PY, "scripts/run_artifact_quality_check.py"], "artifact_quality_brd.json"),
        ("connector_artifact", [_PY, "scripts/run_connector_artifact_demo.py"], "connector_artifact_demo.json"),
    ]
    if load:
        steps[1][1].append("--load")

    if prof in ("large", "enterprise"):
        steps.insert(1, ("infra_sizing_enterprise", [_PY, "scripts/run_infra_sizing_benchmark.py", "enterprise", "--out", str(_OUT)], None))

    for name, cmd, save_as in steps:
        status, code, elapsed = _run(name, cmd, save_as=save_as)
        results.append((name, status, elapsed))
        if code != 0 and name in ("infra_sizing", "capacity_planning"):
            print(f"WARNING: {name} failed — continuing", file=sys.stderr)

    # Enterprise plan via API service (optional — graceful)
    try:
        sys.path.insert(0, str(_ROOT / "scripts"))
        from _bootstrap import bootstrap
        bootstrap()
        from app.db.session import SessionLocal
        from app.perf.capacity.planner_engine import EnterpriseCapacityPlanner
        from app.schemas.capacity_planning import CapacityPlanningInputs, EnterprisePlanRequest

        with SessionLocal() as db:
            EnterpriseCapacityPlanner(db).plan_enterprise(
                EnterprisePlanRequest(
                    profile=prof,  # type: ignore[arg-type]
                    environment=adip_env,  # type: ignore[arg-type]
                    run_scenario_comparison=True,
                    run_calibration=True,
                    inputs=CapacityPlanningInputs(run_infra_scenarios=False),
                ),
                write_reports=True,
                out_dir=_OUT,
            )
        results.append(("enterprise_plan", "OK", 0.0))
    except Exception as exc:  # noqa: BLE001
        results.append(("enterprise_plan", f"SKIP({exc})", 0.0))

    return results


def _print_table(rows: list[tuple[str, str, float]]) -> None:
    print("\n" + "=" * 72)
    print(f"{'Benchmark':<28} {'Status':<24} {'Time (s)':>10}")
    print("-" * 72)
    for name, status, elapsed in rows:
        print(f"{name:<28} {status:<24} {elapsed:>10.1f}")
    print("=" * 72)
    print(f"Output directory: {_OUT}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Run all ADIP benchmarks.")
    parser.add_argument("--env", default="dev", choices=["dev", "uat", "prod"])
    parser.add_argument("--profile", default=None, choices=["small", "medium", "large", "enterprise"])
    parser.add_argument("--all-envs", action="store_true", help="Run dev, uat, and prod suites")
    args = parser.parse_args()

    all_rows: list[tuple[str, str, float]] = []
    envs = ["dev", "uat", "prod"] if args.all_envs else [args.env]
    failed = 0
    for env in envs:
        print(f"\n>>> Running benchmark suite: {env}")
        rows = run_suite(env, args.profile)
        for name, status, elapsed in rows:
            all_rows.append((f"{env}/{name}", status, elapsed))
            if status.startswith("FAIL") or status.startswith("ERROR"):
                failed += 1

    _print_table(all_rows)
    return 1 if failed > 0 else 0


if __name__ == "__main__":
    raise SystemExit(main())
