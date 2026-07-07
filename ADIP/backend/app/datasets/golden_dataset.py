"""Golden Dataset generator (Phase 2).

Materializes enterprise-quality reference artifacts (100+ each of BRD, FRD, HLD,
LLD, Test Plan, Test Cases, Executive Summary, Audit Checklist) by iterating the
banking domains × seeded projects and REUSING the existing ArtifactGenerator +
QualityEngine. Writes Markdown files + a JSON manifest under
``docs/examples/golden-dataset/``.

Run:  python -m app.datasets.golden_dataset [--count N] [--out DIR]
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from sqlalchemy import select

from app.core.logging import get_logger
from app.db.session import SessionLocal
from app.models.organization import Project
from app.seed.seeder import already_seeded, seed
from app.services.artifact_generator import ArtifactGenerator
from app.services.banking_domains import DOMAINS
from app.services.quality_engine import QualityEngine

logger = get_logger("golden-dataset")

# Golden artifact types (label -> generator type).
GOLDEN_TYPES: dict[str, str] = {
    "BRD": "BRD",
    "FRD": "FRD",
    "HLD": "HLD",
    "LLD": "LLD",
    "Test Plan": "Test Plan",
    "Test Cases": "Test Cases",
    "Executive Summary": "Executive Summary",
    "Audit Checklist": "Audit Checklist",
}

DEFAULT_COUNT = 100
# Repo-root docs dir (…/adip/docs), computed from this file's location.
_REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_OUT = _REPO_ROOT / "docs" / "examples" / "golden-dataset"


def _slug(text: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in text).strip("-")


def generate(count: int = DEFAULT_COUNT, out_dir: Path | None = None) -> dict:
    """Generate the golden dataset. Returns a manifest dict."""
    out = out_dir or DEFAULT_OUT
    with SessionLocal() as db:
        if not already_seeded(db):
            seed(reset=True)
        projects = list(db.scalars(select(Project)).all())
        if not projects:
            raise RuntimeError("No projects available; seed the database first.")
        gen = ArtifactGenerator(db)
        quality = QualityEngine(db)

        manifest: dict = {"types": {}, "total": 0}
        for label, gen_type in GOLDEN_TYPES.items():
            type_dir = out / _slug(label)
            type_dir.mkdir(parents=True, exist_ok=True)
            entries = []
            # Cycle (domain × project) until we reach `count` reference artifacts.
            combos = [(d, p) for d in DOMAINS for p in projects]
            for i in range(count):
                domain, project = combos[i % len(combos)]
                artifact = gen.generate(
                    project.id, gen_type,
                    prompt_reference=f"golden-{domain.key}",
                )
                report = quality.score_artifact(artifact)
                md = gen.to_markdown(artifact)
                fname = f"{i + 1:03d}-{domain.key}-{_slug(label)}.md"
                (type_dir / fname).write_text(
                    f"<!-- Golden reference · domain={domain.name} · project={project.name} · "
                    f"quality={report.overall_score}/100 ({report.quality_band}) -->\n\n{md}",
                    encoding="utf-8",
                )
                entries.append({
                    "file": f"{_slug(label)}/{fname}",
                    "domain": domain.name,
                    "project": project.name,
                    "quality_score": report.overall_score,
                    "quality_band": report.quality_band,
                })
            manifest["types"][label] = {"count": len(entries), "dir": _slug(label), "items": entries}
            manifest["total"] += len(entries)
            logger.info("Generated %d %s reference artifacts.", len(entries), label)

    out.mkdir(parents=True, exist_ok=True)
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    avg = round(
        sum(e["quality_score"] for t in manifest["types"].values() for e in t["items"])
        / max(1, manifest["total"])
    )
    manifest["average_quality"] = avg
    logger.info("Golden dataset complete: %d artifacts (avg quality %d/100) at %s",
                manifest["total"], avg, out)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the ADIP golden dataset.")
    parser.add_argument("--count", type=int, default=DEFAULT_COUNT, help="Artifacts per type (default 100).")
    parser.add_argument("--out", type=str, default=None, help="Output directory.")
    args = parser.parse_args()
    manifest = generate(args.count, Path(args.out) if args.out else None)
    total = manifest["total"]
    print(f"Golden dataset: {total} artifacts across {len(manifest['types'])} types "
          f"(avg quality {manifest.get('average_quality')}/100).")


if __name__ == "__main__":
    main()
