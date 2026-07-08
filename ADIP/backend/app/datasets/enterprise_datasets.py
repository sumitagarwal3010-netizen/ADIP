"""Enterprise dataset generator (Phase E).

Generates large evaluation datasets as JSONL (one record per line — the standard
format for ML/eval pipelines), organized by banking domain:

  - prompts.jsonl          1000 enterprise prompts (domain × artifact type)
  - benchmark_cases.jsonl  1000 benchmark cases (prompt + expected metrics)
  - eval_cases.jsonl       1000 evaluation cases (prompt + rubric expectations)
  - artifact_examples.jsonl 1000 artifact examples (generated + quality score)
  - review_examples.jsonl  1000 review examples (artifact + review findings)

JSONL (not thousands of loose files) keeps the repo manageable while remaining
standard and machine-consumable. Reuses ArtifactGenerator, QualityEngine,
AIReviewer and the prompt matrix — no duplication.

Run:  python -m app.datasets.enterprise_datasets [--count 1000] [--out DIR]
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
from app.services.ai_reviewer import AIReviewer
from app.services.artifact_generator import ArtifactGenerator
from app.services.banking_domains import DOMAINS, MATRIX_ARTIFACT_TYPES, MATRIX_TO_GENERATOR
from app.services.prompt_template_library import prompt_template_library as lib
from app.services.quality_engine import QualityEngine

logger = get_logger("enterprise-datasets")

DEFAULT_COUNT = 1000
_REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_OUT = _REPO_ROOT / "docs" / "examples" / "enterprise-datasets"


def _write_jsonl(path: Path, records: list[dict]) -> None:
    with path.open("w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")


def generate(count: int = DEFAULT_COUNT, out_dir: Path | None = None) -> dict:
    out = out_dir or DEFAULT_OUT
    out.mkdir(parents=True, exist_ok=True)
    combos = [(d, atype) for d in DOMAINS for atype in MATRIX_ARTIFACT_TYPES]  # 360 combos

    with SessionLocal() as db:
        if not already_seeded(db):
            seed(reset=True)
        projects = list(db.scalars(select(Project)).all())
        gen = ArtifactGenerator(db)
        quality = QualityEngine(db)
        reviewer = AIReviewer(db)

        prompts, benchmark, evals, artifacts, reviews = [], [], [], [], []
        # Cache generated artifacts per (project, gen_type) to keep 1000s fast.
        art_cache: dict[tuple[int, str], object] = {}

        for i in range(count):
            domain, atype = combos[i % len(combos)]
            project = projects[i % len(projects)]
            gen_type = MATRIX_TO_GENERATOR.get(atype, atype)
            mprompt = lib.get_matrix_prompt(f"{domain.key}--{atype.lower().replace(' ', '-')}")
            prompt_text = mprompt.objective if mprompt else f"Author a {atype} for {domain.name}."

            # 1. prompts
            prompts.append({
                "id": f"P-{i + 1:04d}", "domain": domain.name, "artifact_type": atype,
                "prompt": prompt_text,
                "compliance": list(domain.compliance),
            })

            # artifact (cached)
            ckey = (project.id, gen_type)
            artifact = art_cache.get(ckey)
            if artifact is None:
                artifact = gen.generate(project.id, gen_type, prompt_reference=f"dataset-{domain.key}")
                art_cache[ckey] = artifact
            report = quality.score_artifact(artifact)

            # 2. benchmark cases
            benchmark.append({
                "id": f"B-{i + 1:04d}", "domain": domain.name, "artifact_type": atype,
                "prompt": prompt_text,
                "expected_min_quality": 70, "expected_sections": len(artifact.sections),
            })
            # 3. evaluation cases
            evals.append({
                "id": f"E-{i + 1:04d}", "domain": domain.name, "artifact_type": atype,
                "prompt": prompt_text, "rubric": gen_type,
                "expected_band": "Good", "expected_quality_score": report.overall_score,
            })
            # 4. artifact examples
            artifacts.append({
                "id": f"A-{i + 1:04d}", "domain": domain.name, "artifact_type": atype,
                "reference": artifact.reference, "quality_score": report.overall_score,
                "quality_band": report.quality_band, "sections": len(artifact.sections),
                "summary": artifact.executive_summary[:200],
            })
            # 5. review examples (review a subset-cache'd artifact deterministically)
            review = reviewer._deterministic_review(artifact)  # noqa: SLF001 (intentional reuse)
            reviews.append({
                "id": f"R-{i + 1:04d}", "domain": domain.name, "artifact_type": atype,
                "review_score": review.review_score,
                "hallucination_risk": review.hallucination_risk,
                "findings": [{"dimension": f.dimension, "severity": f.severity} for f in review.findings[:4]],
            })

        _write_jsonl(out / "prompts.jsonl", prompts)
        _write_jsonl(out / "benchmark_cases.jsonl", benchmark)
        _write_jsonl(out / "eval_cases.jsonl", evals)
        _write_jsonl(out / "artifact_examples.jsonl", artifacts)
        _write_jsonl(out / "review_examples.jsonl", reviews)

    manifest = {
        "count_per_dataset": count,
        "datasets": {
            "prompts.jsonl": len(prompts),
            "benchmark_cases.jsonl": len(benchmark),
            "eval_cases.jsonl": len(evals),
            "artifact_examples.jsonl": len(artifacts),
            "review_examples.jsonl": len(reviews),
        },
        "domains": [d.name for d in DOMAINS],
        "total_records": len(prompts) + len(benchmark) + len(evals) + len(artifacts) + len(reviews),
    }
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    logger.info("Enterprise datasets complete: %d records at %s", manifest["total_records"], out)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate ADIP enterprise datasets (JSONL).")
    parser.add_argument("--count", type=int, default=DEFAULT_COUNT)
    parser.add_argument("--out", type=str, default=None)
    args = parser.parse_args()
    m = generate(args.count, Path(args.out) if args.out else None)
    print(f"Enterprise datasets: {m['total_records']} records across {len(m['datasets'])} datasets.")


if __name__ == "__main__":
    main()
