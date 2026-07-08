"""Sample enterprise project generator (Phase L).

Produces 10 complete AI-SDLC sample projects (one per banking domain), each with
the full lifecycle — prompt, requirements, architecture, development, testing,
release, go-live, audit — plus a set of generated artifacts. Output is Markdown
under docs/examples/sample-projects/<domain>/.

Reuses SdlcService (phase summaries), ArtifactGenerator, QualityEngine and the
prompt matrix — no duplication.

Run:  python -m app.datasets.sample_projects
"""
from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy import select

from app.core.logging import get_logger
from app.db.session import SessionLocal
from app.models.organization import Project
from app.seed.seeder import already_seeded, seed
from app.services.artifact_generator import ArtifactGenerator
from app.services.quality_engine import QualityEngine
from app.services.sdlc_service import SdlcService

logger = get_logger("sample-projects")

_REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_OUT = _REPO_ROOT / "docs" / "examples" / "sample-projects"

# The 10 sample domains requested (label + representative prompt).
SAMPLES: list[tuple[str, str, str]] = [
    ("upi", "UPI Real-Time Payments",
     "Implement UPI Auto-Reversal with NPCI reconciliation, TAT SLAs, and audit trail."),
    ("cards", "Cards Issuance & Authorization",
     "Build a card authorization engine with fraud checks, EMI conversion, and PCI-DSS controls."),
    ("loans", "Retail Loans Origination",
     "Design a digital loan origination flow with credit scoring, KYC, and disbursement."),
    ("corporate-banking", "Corporate Banking Onboarding",
     "Implement corporate customer onboarding with entity KYC, mandates, and bulk payments."),
    ("trade-finance", "Trade Finance Letters of Credit",
     "Build a Letter of Credit issuance workflow with SWIFT messaging and compliance screening."),
    ("merchant-payments", "Merchant Payments Settlement",
     "Design merchant settlement with T+1 reconciliation, MDR computation, and dispute handling."),
    ("qr-payments", "QR Payments Acceptance",
     "Implement dynamic and static QR acceptance with UPI interoperability and refunds."),
    ("treasury", "Treasury Liquidity Management",
     "Build a treasury liquidity dashboard with position keeping, limits, and regulatory reporting."),
    ("kyc", "KYC / CDD Platform",
     "Design a KYC platform with e-KYC, periodic re-KYC, risk categorization, and audit."),
    ("aml", "AML Transaction Monitoring",
     "Implement AML transaction monitoring with scenario rules, alerts, and STR filing."),
]

# Artifacts to generate per sample project (across the SDLC).
ARTIFACTS = [
    ("Requirements", "BRD"),
    ("Requirements", "FRD"),
    ("Architecture", "HLD"),
    ("Architecture", "API Spec"),
    ("Testing", "Test Strategy"),
    ("Release", "Release Notes"),
]


def _phase_markdown(title: str, summary_obj) -> str:
    """Render a phase summary DTO as a compact Markdown block."""
    if hasattr(summary_obj, "model_dump"):
        data = summary_obj.model_dump(mode="json")
    else:
        data = dict(summary_obj)
    lines = [f"## {title}", ""]
    for k, v in data.items():
        if isinstance(v, (list, dict)):
            v = json.dumps(v, ensure_ascii=False, default=str)
        lines.append(f"- **{k.replace('_', ' ').title()}**: {v}")
    lines.append("")
    return "\n".join(lines)


def generate(out_dir: Path | None = None) -> dict:
    out = out_dir or DEFAULT_OUT
    out.mkdir(parents=True, exist_ok=True)

    with SessionLocal() as db:
        if not already_seeded(db):
            seed(reset=True)
        projects = list(db.scalars(select(Project)).all())
        sdlc = SdlcService(db)
        gen = ArtifactGenerator(db)
        quality = QualityEngine(db)

        manifest = {"projects": []}
        for i, (key, name, prompt) in enumerate(SAMPLES):
            project = projects[i % len(projects)]
            pdir = out / key
            (pdir / "artifacts").mkdir(parents=True, exist_ok=True)

            # 1. prompt
            (pdir / "00_prompt.md").write_text(
                f"# {name} — Driving Prompt\n\n> {prompt}\n\n"
                f"_Domain: {name} · Reference project: {project.code}_\n", encoding="utf-8")

            # 2..8 lifecycle phases (reuse SdlcService)
            phases = [
                ("01_requirements.md", "Requirements", sdlc.requirement_summary(project.id)),
                ("02_architecture.md", "Architecture", sdlc.architecture_summary(project.id)),
                ("03_development.md", "Development", sdlc.development_summary(project.id)),
                ("04_testing.md", "Testing", sdlc.testing_summary(project.id)),
                ("05_release.md", "Release", sdlc.release_summary(project.id)),
                ("06_go_live.md", "Go Live", sdlc.go_live_summary(project.id)),
                ("07_audit.md", "Audit", sdlc.audit_summary(project.id)),
            ]
            for filename, title, obj in phases:
                (pdir / filename).write_text(
                    f"# {name} — {title}\n\n{_phase_markdown(title, obj)}", encoding="utf-8")

            # 9. artifacts (reuse ArtifactGenerator + QualityEngine)
            artifact_index = []
            for phase_label, atype in ARTIFACTS:
                artifact = gen.generate(project.id, atype, prompt_reference=f"sample-{key}")
                report = quality.score_artifact(artifact)
                fname = f"{atype.replace(' ', '_')}.md"
                (pdir / "artifacts" / fname).write_text(gen.to_markdown(artifact), encoding="utf-8")
                artifact_index.append({
                    "phase": phase_label, "type": atype, "file": f"artifacts/{fname}",
                    "quality_score": report.overall_score, "quality_band": report.quality_band,
                })

            # project README
            readme = [f"# {name}", "", f"Complete AI-SDLC sample project for the **{name}** domain.",
                      "", f"**Driving prompt:** {prompt}", "", "## Lifecycle", ""]
            readme += [f"- [{title}]({fn})" for fn, title, _ in phases]
            readme += ["", "## Generated Artifacts", "",
                       "| Phase | Artifact | Quality | Band | File |", "|---|---|--:|---|---|"]
            readme += [f"| {a['phase']} | {a['type']} | {a['quality_score']} | {a['quality_band']} "
                       f"| [{a['file']}]({a['file']}) |" for a in artifact_index]
            (pdir / "README.md").write_text("\n".join(readme) + "\n", encoding="utf-8")

            manifest["projects"].append({
                "key": key, "name": name, "prompt": prompt,
                "phases": len(phases), "artifacts": len(artifact_index)})

        (out / "README.md").write_text(_index_markdown(manifest), encoding="utf-8")
        (out / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    total_files = sum(1 for _ in out.rglob("*.md"))
    logger.info("Sample projects complete: %d projects, %d markdown files at %s",
                len(SAMPLES), total_files, out)
    return {"projects": len(SAMPLES), "markdown_files": total_files, "path": str(out)}


def _index_markdown(manifest: dict) -> str:
    lines = ["# ADIP Sample Enterprise Projects", "",
             "Ten complete AI-SDLC sample projects, each spanning the full lifecycle "
             "(prompt → requirements → architecture → development → testing → release "
             "→ go-live → audit) with generated, quality-scored artifacts.", "",
             "| Project | Domain | Phases | Artifacts |", "|---|---|--:|--:|"]
    for p in manifest["projects"]:
        lines.append(f"| [{p['name']}]({p['key']}/README.md) | {p['key']} "
                     f"| {p['phases']} | {p['artifacts']} |")
    lines.append("")
    return "\n".join(lines)


def main() -> None:
    result = generate()
    print(f"Sample projects: {result['projects']} projects, "
          f"{result['markdown_files']} markdown files.")


if __name__ == "__main__":
    main()
