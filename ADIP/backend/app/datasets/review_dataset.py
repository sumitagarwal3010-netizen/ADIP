"""Artifact Review Dataset generator (Phase 5).

For each artifact type, produces five graded examples — Excellent, Good, Average,
Poor, Broken — each scored by the QualityEngine and annotated with review
comments explaining *why*. The Excellent example is a full generated artifact;
lower tiers are deterministic degradations (dropped sections, thinned content,
injected placeholders) so the dataset teaches what good vs bad looks like.

Run:  python -m app.datasets.review_dataset [--out DIR]
"""
from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path

from sqlalchemy import select

from app.core.logging import get_logger
from app.db.session import SessionLocal
from app.models.organization import Project
from app.schemas.artifact_generation import ArtifactSection, GeneratedArtifact
from app.seed.seeder import already_seeded, seed
from app.services.artifact_generator import ArtifactGenerator
from app.services.quality_engine import QualityEngine

logger = get_logger("review-dataset")

REVIEW_ARTIFACT_TYPES = ["BRD", "FRD", "HLD", "LLD", "Test Plan", "Test Cases",
                         "Executive Summary", "Audit Checklist"]

_REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_OUT = _REPO_ROOT / "docs" / "examples" / "review-dataset"


def _slug(text: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in text).strip("-")


def _degrade(artifact: GeneratedArtifact, tier: str) -> GeneratedArtifact:
    """Return a degraded copy of the artifact for the given quality tier."""
    a = copy.deepcopy(artifact)
    if tier == "good":
        # Slightly thin one section.
        if len(a.sections) > 4:
            a.sections[3] = ArtifactSection(heading=a.sections[3].heading, body="Brief note.", bullets=[])
    elif tier == "average":
        # Drop ~40% of sections and shorten the summary.
        keep = max(3, int(len(a.sections) * 0.6))
        a.sections = a.sections[:keep]
        a.executive_summary = a.executive_summary[:40]
    elif tier == "poor":
        # Keep few sections, inject placeholders, drop references.
        a.sections = a.sections[:3]
        a.sections.append(ArtifactSection(heading="Details", body="TBD", bullets=["TODO"]))
        a.prompt_reference = None
        a.project_reference = None
        a.executive_summary = "TBD"
    elif tier == "broken":
        # Almost nothing: one empty section, placeholder summary, no metadata.
        a.sections = [ArtifactSection(heading="Overview", body="", bullets=[])]
        a.executive_summary = "lorem ipsum"
        a.prompt_reference = None
        a.project_reference = None
    return a


def _comments(tier: str, score: int, band: str, missing: list[str]) -> list[str]:
    base = {
        "excellent": ["All required sections present and detailed.",
                      "Strong banking/compliance coverage.",
                      "Fully traceable and review-ready."],
        "good": ["Solid overall; one section is thin.",
                 "Minor detail could be added for completeness."],
        "average": ["Several sections missing or shortened.",
                    "Executive summary too brief.",
                    "Needs revision before sign-off."],
        "poor": ["Placeholder text (TBD/TODO) present — not final.",
                 "Traceability references missing.",
                 "Major sections absent."],
        "broken": ["Effectively empty; unusable.",
                   "Placeholder-only summary; no real content.",
                   "Fails completeness, traceability and compliance."],
    }[tier]
    comments = list(base)
    comments.append(f"Quality score {score}/100 ({band}).")
    if missing:
        comments.append(f"Missing sections: {', '.join(missing[:6])}.")
    return comments


def generate(out_dir: Path | None = None) -> dict:
    out = out_dir or DEFAULT_OUT
    tiers = ["excellent", "good", "average", "poor", "broken"]
    with SessionLocal() as db:
        if not already_seeded(db):
            seed(reset=True)
        project = db.scalar(select(Project))
        gen = ArtifactGenerator(db)
        quality = QualityEngine(db)

        manifest: dict = {"artifact_types": {}, "total": 0}
        for atype in REVIEW_ARTIFACT_TYPES:
            type_dir = out / _slug(atype)
            type_dir.mkdir(parents=True, exist_ok=True)
            excellent = gen.generate(project.id, atype, prompt_reference="review-excellent")
            entries = []
            for tier in tiers:
                artifact = excellent if tier == "excellent" else _degrade(excellent, tier)
                report = quality.score_artifact(artifact)
                comments = _comments(tier, report.overall_score, report.quality_band, report.missing_sections)
                md = gen.to_markdown(artifact)
                body = (
                    f"# {tier.title()} example — {atype}\n\n"
                    f"> **Quality:** {report.overall_score}/100 ({report.quality_band})\n\n"
                    f"## Review comments\n\n" + "\n".join(f"- {c}" for c in comments) + "\n\n"
                    f"---\n\n{md}"
                )
                (type_dir / f"{tier}.md").write_text(body, encoding="utf-8")
                entries.append({"tier": tier, "file": f"{_slug(atype)}/{tier}.md",
                                "quality_score": report.overall_score, "band": report.quality_band})
            manifest["artifact_types"][atype] = entries
            manifest["total"] += len(entries)
            logger.info("Generated 5-tier review set for %s.", atype)

    out.mkdir(parents=True, exist_ok=True)
    (out / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    logger.info("Review dataset complete: %d graded examples at %s", manifest["total"], out)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the ADIP artifact review dataset.")
    parser.add_argument("--out", type=str, default=None)
    args = parser.parse_args()
    manifest = generate(Path(args.out) if args.out else None)
    print(f"Review dataset: {manifest['total']} graded examples across "
          f"{len(manifest['artifact_types'])} artifact types.")


if __name__ == "__main__":
    main()
