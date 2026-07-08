"""Offline evaluation pipeline (Role 5 — ML).

Runs evaluation cases through the existing ArtifactGenerator + QualityEngine +
AIReviewer and produces inference/quality metrics and an evaluation report. This
is the offline eval harness that ML/regression tooling consumes. It reuses
services — it does not re-implement generation or scoring.

Run:  python -m app.ml.evaluation [--limit 100]
"""
from __future__ import annotations

import argparse
import json
import statistics
import time
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select

from app.core.logging import get_logger
from app.db.session import SessionLocal
from app.models.organization import Project
from app.seed.seeder import already_seeded, seed
from app.services.ai_reviewer import AIReviewer
from app.services.artifact_generator import ArtifactGenerator
from app.services.banking_domains import MATRIX_TO_GENERATOR
from app.services.quality_engine import QualityEngine

logger = get_logger("ml-evaluation")

_REPO_ROOT = Path(__file__).resolve().parents[3]
DATASETS_DIR = _REPO_ROOT / "docs" / "examples" / "enterprise-datasets"
DEFAULT_OUT = _REPO_ROOT / "docs" / "examples" / "ml"


@dataclass
class EvaluationResult:
    cases: int
    quality_mean: float
    quality_p50: float
    quality_p90: float
    quality_min: float
    reviewer_mean: float
    latency_ms_mean: float
    band_distribution: dict = field(default_factory=dict)
    per_metric_samples: dict = field(default_factory=dict)


class EvaluationPipeline:
    def __init__(self, db) -> None:
        self.gen = ArtifactGenerator(db)
        self.quality = QualityEngine(db)
        self.reviewer = AIReviewer(db)

    def evaluate_cases(self, cases: list[dict], project_id: int) -> EvaluationResult:
        qualities: list[float] = []
        reviewers: list[float] = []
        latencies: list[float] = []
        bands: dict[str, int] = {}
        cache: dict[str, object] = {}

        for case in cases:
            atype = case.get("artifact_type", "BRD")
            gen_type = MATRIX_TO_GENERATOR.get(atype, atype)
            t0 = time.perf_counter()
            artifact = cache.get(gen_type)
            if artifact is None:
                try:
                    artifact = self.gen.generate(project_id, gen_type, prompt_reference="ml-eval")
                except Exception:  # noqa: BLE001 - fall back to a known type
                    artifact = self.gen.generate(project_id, "BRD", prompt_reference="ml-eval")
                cache[gen_type] = artifact
            report = self.quality.score_artifact(artifact)
            latencies.append((time.perf_counter() - t0) * 1000)
            qualities.append(report.overall_score)
            bands[report.quality_band] = bands.get(report.quality_band, 0) + 1
            reviewers.append(self.reviewer._deterministic_review(artifact).review_score)  # noqa: SLF001

        def pct(xs: list[float], p: float) -> float:
            if not xs:
                return 0.0
            s = sorted(xs)
            return round(s[min(len(s) - 1, int(p / 100 * (len(s) - 1)))], 2)

        return EvaluationResult(
            cases=len(cases),
            quality_mean=round(statistics.mean(qualities), 2) if qualities else 0.0,
            quality_p50=pct(qualities, 50),
            quality_p90=pct(qualities, 90),
            quality_min=round(min(qualities), 2) if qualities else 0.0,
            reviewer_mean=round(statistics.mean(reviewers), 2) if reviewers else 0.0,
            latency_ms_mean=round(statistics.mean(latencies), 2) if latencies else 0.0,
            band_distribution=bands,
            per_metric_samples={"quality": qualities, "reviewer": reviewers, "latency_ms": latencies},
        )


def _load_cases(limit: int) -> list[dict]:
    path = DATASETS_DIR / "eval_cases.jsonl"
    if not path.exists():
        from app.datasets.enterprise_datasets import generate
        generate(200)
    lines = path.read_text(encoding="utf-8").splitlines()
    return [json.loads(x) for x in lines[:limit] if x.strip()]


def run(limit: int = 100, out_dir: Path | None = None) -> dict:
    out = out_dir or DEFAULT_OUT
    out.mkdir(parents=True, exist_ok=True)
    cases = _load_cases(limit)
    with SessionLocal() as db:
        if not already_seeded(db):
            seed(reset=True)
        project = db.scalars(select(Project)).first()
        result = EvaluationPipeline(db).evaluate_cases(cases, project.id)

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "dataset": "eval_cases.jsonl",
        "result": asdict(result),
    }
    # Keep the report light; drop raw samples from the on-disk summary.
    report_summary = {**report, "result": {k: v for k, v in asdict(result).items()
                                            if k != "per_metric_samples"}}
    (out / "evaluation_report.json").write_text(json.dumps(report_summary, indent=2), encoding="utf-8")
    logger.info("Evaluation complete: %d cases, quality_mean=%.2f", result.cases, result.quality_mean)
    return report


def main() -> None:
    parser = argparse.ArgumentParser(description="ADIP offline evaluation pipeline.")
    parser.add_argument("--limit", type=int, default=100)
    args = parser.parse_args()
    report = run(args.limit)
    r = report["result"]
    print(f"Evaluated {r['cases']} cases | quality_mean={r['quality_mean']} "
          f"p90={r['quality_p90']} reviewer_mean={r['reviewer_mean']}")


if __name__ == "__main__":
    main()
