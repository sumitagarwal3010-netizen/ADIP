"""Artifact Export Engine (Phase C).

Production-grade export of generated artifacts to HTML, Markdown, JSON, CSV and
DOCX/PDF-ready models, plus corporate branding (header/footer/watermark), a
table of contents, revision history, an approvals block and a digital-signature
placeholder. Reuses the existing ArtifactGenerator (JSON/Markdown/DOCX/PDF
models) — no second renderer for those. HTML/CSV are added here.
"""
from __future__ import annotations

import csv
import html
import io
import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.exceptions import ValidationError
from app.schemas.artifact_generation import GeneratedArtifact
from app.services.artifact_generator import ArtifactGenerator

EXPORT_FORMATS = ["markdown", "html", "json", "csv", "docx-model", "pdf-model"]

_BRAND = "ADIP — Automation Delivery Integration Platform"


def _toc(artifact: GeneratedArtifact) -> str:
    items = "".join(f"<li><a href='#sec{i}'>{html.escape(s.heading)}</a></li>"
                    for i, s in enumerate(artifact.sections))
    return f"<nav class='toc'><h2>Table of Contents</h2><ol>{items}</ol></nav>"


def _to_html(artifact: GeneratedArtifact, *, branding: bool = True,
             watermark: str | None = None) -> str:
    wm = (f"<div class='watermark'>{html.escape(watermark)}</div>" if watermark else "")
    header = (f"<header>{_BRAND}</header>" if branding else "")
    footer = (f"<footer>{_BRAND} · Confidential · Generated {artifact.generated_at:%Y-%m-%d} · "
              f"{html.escape(artifact.reference)}</footer>" if branding else "")
    body = [f"<h1>{html.escape(artifact.title)}</h1>"]
    body.append("<section class='meta'><h2>Document Control</h2><ul>"
                f"<li>Reference: {html.escape(artifact.reference)}</li>"
                f"<li>Version: {html.escape(artifact.version)}</li>"
                f"<li>Author: {html.escape(artifact.author)}</li>"
                f"<li>Generated: {artifact.generated_at:%Y-%m-%d %H:%M} UTC</li>"
                f"<li>Review Status: Draft — pending review</li></ul></section>")
    body.append("<section class='summary'><h2>Executive Summary</h2>"
                f"<p>{html.escape(artifact.executive_summary)}</p></section>")
    body.append(_toc(artifact))
    for i, s in enumerate(artifact.sections):
        body.append(f"<section id='sec{i}'><h2>{html.escape(s.heading)}</h2>")
        if s.body:
            body.append(f"<p>{html.escape(s.body).replace(chr(10), '<br/>')}</p>")
        if s.bullets:
            body.append("<ul>" + "".join(f"<li>{html.escape(b)}</li>" for b in s.bullets) + "</ul>")
        body.append("</section>")
    # Approvals + revision history + signature placeholder.
    body.append("<section class='approvals'><h2>Approvals</h2><table>"
                "<tr><th>Role</th><th>Name</th><th>Status</th><th>Date</th></tr>"
                "<tr><td>Business Sponsor</td><td>—</td><td>Pending</td><td>—</td></tr>"
                "<tr><td>Solution Architect</td><td>—</td><td>Pending</td><td>—</td></tr>"
                "<tr><td>Risk &amp; Compliance</td><td>—</td><td>Pending</td><td>—</td></tr></table></section>")
    body.append("<section class='revisions'><h2>Revision History</h2><table>"
                "<tr><th>Version</th><th>Date</th><th>Author</th><th>Change</th></tr>"
                f"<tr><td>{html.escape(artifact.version)}</td>"
                f"<td>{artifact.generated_at:%Y-%m-%d}</td>"
                f"<td>{html.escape(artifact.author)}</td><td>Initial AI-generated version</td></tr></table></section>")
    body.append("<section class='signature'><h2>Digital Signature</h2>"
                "<p class='sig-placeholder'>[Digital signature placeholder — to be applied by the signing service]</p></section>")
    style = (
        "<style>body{font-family:Segoe UI,Arial,sans-serif;margin:2rem;color:#1a1a1a;position:relative}"
        "header,footer{color:#555;font-size:.8rem;border-bottom:1px solid #ddd;padding:.5rem 0}"
        "footer{border-top:1px solid #ddd;border-bottom:none;margin-top:2rem}"
        "h1{color:#0b5} .toc{background:#f6f8fa;padding:1rem;border-radius:8px}"
        "table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:.4rem;text-align:left}"
        ".watermark{position:fixed;top:40%;left:20%;font-size:5rem;color:rgba(0,0,0,.06);"
        "transform:rotate(-30deg);pointer-events:none;z-index:0}"
        "@media print{header,footer{position:fixed}}</style>"
    )
    return (f"<!doctype html><html><head><meta charset='utf-8'>"
            f"<title>{html.escape(artifact.title)}</title>{style}</head>"
            f"<body>{wm}{header}{''.join(body)}{footer}</body></html>")


def _to_csv(artifact: GeneratedArtifact) -> str:
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["section_index", "heading", "body", "bullets"])
    for i, s in enumerate(artifact.sections):
        w.writerow([i, s.heading, s.body, " | ".join(s.bullets)])
    return buf.getvalue()


class ExportEngine:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.generator = ArtifactGenerator(db)

    def export(self, project_id: int, artifact_type: str, fmt: str,
               *, branding: bool = True, watermark: str | None = None) -> tuple[str, str, str]:
        """Return (content, media_type, filename) for the requested format."""
        if fmt not in EXPORT_FORMATS:
            raise ValidationError(f"Unsupported format '{fmt}'. Supported: {', '.join(EXPORT_FORMATS)}.")
        artifact = self.generator.generate(project_id, artifact_type)
        stem = artifact.reference
        if fmt == "markdown":
            return self.generator.to_markdown(artifact), "text/markdown", f"{stem}.md"
        if fmt == "html":
            return _to_html(artifact, branding=branding, watermark=watermark), "text/html", f"{stem}.html"
        if fmt == "json":
            return artifact.model_dump_json(indent=2), "application/json", f"{stem}.json"
        if fmt == "csv":
            return _to_csv(artifact), "text/csv", f"{stem}.csv"
        if fmt == "docx-model":
            return self.generator.generate_docx_model(project_id, artifact_type).model_dump_json(indent=2), \
                "application/json", f"{stem}.docx.json"
        # pdf-model
        return self.generator.generate_pdf_model(project_id, artifact_type).model_dump_json(indent=2), \
            "application/json", f"{stem}.pdf.json"

    def export_bundle_zip(self, project_id: int, artifact_types: list[str]) -> bytes:
        """Bundle multiple artifacts (Markdown + JSON) into a ZIP archive."""
        import zipfile

        buf = io.BytesIO()
        manifest = {"generated_at": datetime.now(timezone.utc).isoformat(), "artifacts": []}
        with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
            for atype in artifact_types:
                artifact = self.generator.generate(project_id, atype)
                zf.writestr(f"{artifact.reference}.md", self.generator.to_markdown(artifact))
                zf.writestr(f"{artifact.reference}.json", artifact.model_dump_json(indent=2))
                zf.writestr(f"{artifact.reference}.html", _to_html(artifact))
                manifest["artifacts"].append({"type": atype, "reference": artifact.reference})
            zf.writestr("manifest.json", json.dumps(manifest, indent=2))
        return buf.getvalue()
