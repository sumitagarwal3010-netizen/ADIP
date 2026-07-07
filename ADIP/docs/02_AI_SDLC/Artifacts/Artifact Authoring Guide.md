# Artifact Authoring Guide

The single `ArtifactGenerator` produces 47 enterprise SDLC artifact types with a
professional envelope and metadata, rendered as JSON / Markdown / DOCX-ready /
PDF-ready.

## Professional structure (every artifact)

- **Document Control** — artifact, reference, project, version, author, review status, prompt reference
- **Business Context · Scope · Assumptions · Dependencies · Risks**
- **Domain sections** — specific to the artifact type (e.g. HLD → Logical Design, Integration, Data Design)
- **Traceability · Approval · Review Status · Appendix**

Structured docs: BRD reads like a BRD, FRD like an FRD, HLD/LLD like designs,
Test Plan like a test plan, **Test Cases** carry Test ID · Type · Precondition ·
Steps · Expected Result, Go-Live Checklist is actionable, Audit Checklist is
evidence-focused, Executive Summary is concise and decision-oriented.

## APIs

| API | Output |
|---|---|
| `GET /artifact-generation/types` | Supported types (47) |
| `GET /artifact-generation/projects/{id}/generate?artifact_type=` | JSON |
| `.../generate/markdown` · `/docx-model` · `/pdf-model` | Renderers |
| `GET /artifact-preview/projects/{id}?artifact_type=` | Markdown preview |
| `GET /artifact-download/projects/{id}?artifact_type=` | Download (attachment) |
| `GET /artifact-metadata/projects/{id}?artifact_type=` | Metadata only |

## Example

```bash
curl -s "http://localhost:8000/api/v1/artifact-generation/projects/1/generate?artifact_type=HLD" | jq '.sections[].heading'
```

## Extending (do NOT create a second generator)

Add the type to `ARTIFACT_SPECS` (canonical sections) in
`backend/app/services/artifact_spec.py`; optionally add a bespoke builder in
`ArtifactGenerator._builders()`. The professional envelope is applied
automatically.

## Test commands

```bash
cd backend && pytest -k "artifact"
```
