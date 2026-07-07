"""End-to-end example walkthroughs generator (Phase 8).

Generates 20+ complete walkthroughs — one per banking domain — each showing the
full flow: Prompt → Classification → Requirements → Architecture → Development →
Testing → Release → Go-Live → Audit → Artifacts → Review → Quality Score →
Executive Summary. Reuses the orchestrator + reviewer + quality engine.

Run:  python -m app.datasets.example_walkthroughs [--out DIR]
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from app.core.logging import get_logger
from app.db.session import SessionLocal
from app.schemas.orchestrator import OrchestrationRequest
from app.seed.seeder import already_seeded, seed
from app.services.ai_reviewer import AIReviewer
from app.services.banking_domains import DOMAINS
from app.services.orchestrator_service import PromptExecutionEngine
from app.services.quality_engine import QualityEngine

logger = get_logger("examples")

_REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_OUT = _REPO_ROOT / "docs" / "examples" / "walkthroughs"


def _slug(text: str) -> str:
    return "".join(ch.lower() if ch.isalnum() else "-" for ch in text).strip("-")


def _walkthrough_md(orch, reviews, avg_quality, avg_review) -> str:
    c = orch.classification
    lines = [
        f"# End-to-End Walkthrough — {orch.project.name}",
        "",
        f"**Prompt:** {orch.prompt}",
        "",
        "## 1. Classification",
        f"- Scenario: {c.scenario}",
        f"- Business domain: {c.business_domain}",
        f"- Complexity: {c.complexity} · Story points: {c.story_points} · Sprints: {c.sprint_estimate}",
        f"- Confidence: {c.confidence}%",
        "",
    ]
    phases = [
        ("2. Requirements", orch.requirements),
        ("3. Architecture", orch.architecture),
        ("4. Development", orch.development),
        ("5. Testing", orch.testing),
        ("6. Release", orch.release),
        ("7. Go-Live", orch.go_live),
        ("8. Audit", orch.audit),
    ]
    for title, phase in phases:
        score = getattr(phase, "score", "n/a")
        readiness = getattr(phase, "readiness", "n/a")
        findings = getattr(phase, "findings", [])
        lines.append(f"## {title}")
        lines.append(f"- Score: {score}/100 ({readiness})")
        if findings:
            lines.append(f"- Key finding: {findings[0].title}")
        lines.append("")
    lines += [
        "## 9. Artifacts",
        f"- Generated: {len(orch.artifacts)} artifacts",
        "  - " + ", ".join(a.artifact_type for a in orch.artifacts[:12]),
        "",
        "## 10. Review",
        f"- Artifacts reviewed: {len(reviews)}",
        f"- Average review score: {avg_review}/100",
        f"- Sample finding: {reviews[0].findings[0].finding if reviews and reviews[0].findings else 'No blocking findings.'}",
        "",
        "## 11. Quality Score",
        f"- Average artifact quality: {avg_quality}/100",
        "",
        "## 12. Executive Summary",
        orch.executive.executive_summary,
        "",
        f"**Overall AI SDLC score:** {orch.dashboard.overall_sdlc_score}/100 ({orch.dashboard.band}) · "
        f"business value {orch.dashboard.business_value} · automation {orch.dashboard.automation_pct}%",
        "",
    ]
    return "\n".join(lines)


def generate(out_dir: Path | None = None) -> dict:
    out = out_dir or DEFAULT_OUT
    out.mkdir(parents=True, exist_ok=True)
    with SessionLocal() as db:
        if not already_seeded(db):
            seed(reset=True)
        engine = PromptExecutionEngine(db)
        reviewer = AIReviewer(db)
        quality = QualityEngine(db)

        manifest: dict = {"examples": []}
        for domain in DOMAINS:
            prompt = f"Implement {domain.name} capability: {domain.scenario}"
            orch = engine.execute(OrchestrationRequest(prompt=prompt))
            reviews = [reviewer.review_artifact(a) for a in orch.artifacts[:6]]
            avg_review = round(sum(r.review_score for r in reviews) / len(reviews)) if reviews else 0
            q = [quality.score_artifact(a).overall_score for a in orch.artifacts] or [0]
            avg_quality = round(sum(q) / len(q))
            md = _walkthrough_md(orch, reviews, avg_quality, avg_review)
            fname = f"{_slug(domain.key)}-walkthrough.md"
            (out / fname).write_text(md, encoding="utf-8")
            manifest["examples"].append({
                "domain": domain.name, "file": fname,
                "overall_score": orch.dashboard.overall_sdlc_score,
                "avg_quality": avg_quality, "avg_review": avg_review,
                "artifacts": len(orch.artifacts),
            })
            logger.info("Walkthrough generated for %s.", domain.name)

    (out / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    logger.info("Walkthroughs complete: %d examples at %s", len(manifest["examples"]), out)
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate ADIP end-to-end example walkthroughs.")
    parser.add_argument("--out", type=str, default=None)
    args = parser.parse_args()
    manifest = generate(Path(args.out) if args.out else None)
    print(f"Walkthroughs: {len(manifest['examples'])} end-to-end examples.")


if __name__ == "__main__":
    main()
