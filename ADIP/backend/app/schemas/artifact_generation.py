"""DTOs for the artifact generation framework (Phase 5).

A generated artifact is a structured, render-agnostic document: an ordered list
of sections (heading + body). It can be returned as JSON, rendered to Markdown,
or mapped to a DOCX-ready model — all from the same structure.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ArtifactSection(BaseModel):
    """One section of a generated artifact."""

    heading: str
    level: int = 1
    body: str
    bullets: list[str] = []


class GeneratedArtifact(BaseModel):
    """A fully generated, render-agnostic artifact document."""

    artifact_type: str
    title: str
    project_id: int
    project_name: str
    reference: str
    generated_by: str = "AI SDLC Copilot"
    author: str = "AI SDLC Copilot"
    model_used: str = "Gemini"
    version: str = "1.0"
    generated_at: datetime
    prompt_reference: Optional[str] = None
    project_reference: Optional[str] = None
    executive_summary: str
    sections: list[ArtifactSection]


class MarkdownArtifact(BaseModel):
    """A generated artifact rendered as Markdown."""

    artifact_type: str
    title: str
    project_id: int
    reference: str
    markdown: str


class DocxParagraph(BaseModel):
    """A DOCX-ready paragraph (style + text) — consumed by a python-docx writer."""

    style: str  # e.g. "Title", "Heading 1", "Heading 2", "Normal", "List Bullet"
    text: str


class DocxArtifact(BaseModel):
    """A DOCX-ready artifact model: an ordered list of styled paragraphs."""

    artifact_type: str
    title: str
    project_id: int
    reference: str
    paragraphs: list[DocxParagraph]


class PdfBlock(BaseModel):
    """A PDF-ready content block (kind + text) — consumed by a PDF writer."""

    kind: str  # "title" | "heading" | "paragraph" | "bullet"
    text: str


class PdfArtifact(BaseModel):
    """A PDF-ready artifact model (ordered content blocks). Placeholder for a
    future PDF renderer; carries the same structure as DOCX/Markdown."""

    artifact_type: str
    title: str
    project_id: int
    reference: str
    blocks: list[PdfBlock]


class ArtifactTypeInfo(BaseModel):
    """Metadata describing a generatable artifact type."""

    artifact_type: str
    phase: Optional[str]
    description: str


class ArtifactTypeList(BaseModel):
    supported: list[ArtifactTypeInfo]
