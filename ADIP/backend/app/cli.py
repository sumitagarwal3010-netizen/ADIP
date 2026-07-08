"""ADIP developer CLI (Phase G).

A single entry point for common developer tasks. Reuses existing modules
(seeder, datasets, perf harness, benchmark service) — it orchestrates, it does
not reimplement.

Usage:
  python -m app.cli seed [--reset]
  python -m app.cli datasets [--count 1000]
  python -m app.cli perf [--requests 200] [--concurrency 16]
  python -m app.cli benchmark "<prompt>" ["<prompt2>" ...]
  python -m app.cli routes
  python -m app.cli scaffold <ResourceName>
  python -m app.cli export-prompts <out.json>
  python -m app.cli import-prompts <in.json>
  python -m app.cli migrate            # alembic upgrade head
  python -m app.cli doctor             # environment self-check
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parents[1]


def _cmd_seed(args: argparse.Namespace) -> int:
    from app.seed.seeder import seed
    seed(reset=args.reset)
    print(f"Seed complete (reset={args.reset}).")
    return 0


def _cmd_datasets(args: argparse.Namespace) -> int:
    from app.datasets.enterprise_datasets import generate
    m = generate(args.count)
    print(f"Generated {m['total_records']} records across {len(m['datasets'])} datasets.")
    return 0


def _cmd_perf(args: argparse.Namespace) -> int:
    from app.perf.harness import run
    r = run(args.requests, args.concurrency)
    print(f"Performance report written: {r['summary']['total_scenarios']} scenarios.")
    return 0


def _cmd_benchmark(args: argparse.Namespace) -> int:
    from app.db.session import SessionLocal
    from app.schemas.benchmark import PromptBenchmarkRequest
    from app.services.benchmark_service import BenchmarkService
    with SessionLocal() as db:
        report = BenchmarkService(db).benchmark(PromptBenchmarkRequest(versions=args.prompts))
    print(f"Benchmark: {len(report.entries)} prompts | best='{report.best_version}' "
          f"| avg_score={report.average_overall_score}")
    for e in report.entries:
        print(f"  - {e.prompt_version}: overall={e.overall_score} artifact={e.artifact_score} "
              f"reviewer={e.reviewer_score}")
    return 0


def _cmd_routes(_: argparse.Namespace) -> int:
    from app.main import app
    paths = app.openapi()["paths"]
    print(f"{len(paths)} API paths:")
    for path in sorted(paths):
        methods = ",".join(sorted(m.upper() for m in paths[path]))
        print(f"  {methods:12} {path}")
    return 0


def _cmd_scaffold(args: argparse.Namespace) -> int:
    """Print a ready-to-paste CRUD resource registration for a new entity."""
    name = args.name
    snippet = f'''# Add to backend/app/api/v1/endpoints/resources.py RESOURCES list:
CrudResource(
    prefix="/{name.lower()}s",
    tags=["{name}"],
    model={name},
    create_schema={name}Create,
    update_schema={name}Update,
    read_schema={name}Read,
),

# Create backend/app/models/{name.lower()}.py with a SQLAlchemy model,
# backend/app/schemas/{name.lower()}.py with Create/Update/Read Pydantic schemas,
# then run:  python -m app.cli migrate
'''
    print(snippet)
    return 0


def _cmd_export_prompts(args: argparse.Namespace) -> int:
    from sqlalchemy import select
    from app.db.session import SessionLocal
    from app.models.prompt_workbench import WorkbenchPrompt
    from app.services.prompt_studio_service import PromptStudioService
    with SessionLocal() as db:
        svc = PromptStudioService(db)
        ids = [p.id for p in db.scalars(select(WorkbenchPrompt)).all()]
        data = [svc.export(pid).model_dump() for pid in ids]
    Path(args.out).write_text(json.dumps(data, indent=2), encoding="utf-8")
    print(f"Exported {len(data)} prompts to {args.out}.")
    return 0


def _cmd_import_prompts(args: argparse.Namespace) -> int:
    from app.db.session import SessionLocal
    from app.schemas.prompt_studio import PromptImport
    from app.services.prompt_studio_service import PromptStudioService
    payload = json.loads(Path(args.inp).read_text(encoding="utf-8"))
    with SessionLocal() as db:
        svc = PromptStudioService(db)
        n = sum(1 for item in payload if svc.import_prompt(PromptImport(**item)))
    print(f"Imported {n} prompts from {args.inp}.")
    return 0


def _cmd_migrate(_: argparse.Namespace) -> int:
    return subprocess.call(["alembic", "upgrade", "head"], cwd=str(_BACKEND_ROOT))


def _cmd_doctor(_: argparse.Namespace) -> int:
    from app.core.config import settings
    from app.llm.service import llm_service
    print("ADIP environment check")
    print(f"  python           : {sys.version.split()[0]}")
    print(f"  database_url     : {settings.database_url}")
    print(f"  local_llm_enabled: {settings.local_llm_enabled}")
    print(f"  llm_provider     : {settings.llm_provider}")
    print(f"  llm available    : {llm_service.enabled}")
    try:
        from app.main import app
        print(f"  api paths        : {len(app.openapi()['paths'])}")
        print("  status           : OK")
        return 0
    except Exception as exc:  # noqa: BLE001
        print(f"  status           : FAILED — {exc}")
        return 1


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="adip", description="ADIP developer CLI.")
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("seed", help="Seed the database.")
    p.add_argument("--reset", action="store_true")
    p.set_defaults(func=_cmd_seed)

    p = sub.add_parser("datasets", help="Generate enterprise datasets (JSONL).")
    p.add_argument("--count", type=int, default=1000)
    p.set_defaults(func=_cmd_datasets)

    p = sub.add_parser("perf", help="Run the performance framework.")
    p.add_argument("--requests", type=int, default=200)
    p.add_argument("--concurrency", type=int, default=16)
    p.set_defaults(func=_cmd_perf)

    p = sub.add_parser("benchmark", help="Benchmark one or more prompts.")
    p.add_argument("prompts", nargs="+")
    p.set_defaults(func=_cmd_benchmark)

    p = sub.add_parser("routes", help="List all API routes.")
    p.set_defaults(func=_cmd_routes)

    p = sub.add_parser("scaffold", help="Print a CRUD resource scaffold.")
    p.add_argument("name")
    p.set_defaults(func=_cmd_scaffold)

    p = sub.add_parser("export-prompts", help="Export all workbench prompts to JSON.")
    p.add_argument("out")
    p.set_defaults(func=_cmd_export_prompts)

    p = sub.add_parser("import-prompts", help="Import workbench prompts from JSON.")
    p.add_argument("inp")
    p.set_defaults(func=_cmd_import_prompts)

    p = sub.add_parser("migrate", help="Run alembic upgrade head.")
    p.set_defaults(func=_cmd_migrate)

    p = sub.add_parser("doctor", help="Environment self-check.")
    p.set_defaults(func=_cmd_doctor)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
