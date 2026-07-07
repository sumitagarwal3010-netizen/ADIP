# Artifact Generation Guide

The **ArtifactGenerator** produces 47 enterprise SDLC artifact types from a
project's aggregated data — in JSON, Markdown, DOCX-ready and PDF-ready models,
with full metadata (author, version, timestamp, prompt/project references).

## Generate

```bash
# List supported types
curl -s http://localhost:8000/api/v1/artifact-generation/types

# JSON
curl -s "http://localhost:8000/api/v1/artifact-generation/projects/1/generate?artifact_type=BRD"

# Markdown / DOCX-ready / PDF-ready
curl -s "http://localhost:8000/api/v1/artifact-generation/projects/1/generate/markdown?artifact_type=HLD"
curl -s "http://localhost:8000/api/v1/artifact-generation/projects/1/generate/docx-model?artifact_type=HLD"
curl -s "http://localhost:8000/api/v1/artifact-generation/projects/1/generate/pdf-model?artifact_type=HLD"
```

## Preview / download / metadata

```bash
curl -s "http://localhost:8000/api/v1/artifact-preview/projects/1?artifact_type=FRD"
curl -s "http://localhost:8000/api/v1/artifact-download/projects/1?artifact_type=FRD"   # attachment
curl -s "http://localhost:8000/api/v1/artifact-metadata/projects/1?artifact_type=FRD"
```

## Quality validation

```bash
curl -s "http://localhost:8000/api/v1/artifact-validation/projects/1?artifact_type=BRD"
```

Returns a **quality score**, per-rule checks (completeness, formatting, required
sections, missing information, placeholder detection, traceability, consistency)
and improvement suggestions.

## Artifact catalog (types)

Concept Note, Vision Document, Business Case, PRD, BRD, FRD, SRS, NFR,
Stakeholder Matrix, User Journey, Process Flow, Architecture, Solution Design,
HLD, LLD, ADR, API Spec, DB Design, Sequence Flow, Deployment Diagram,
Infrastructure Design, Security Design, Performance Design, Security Controls,
Test Strategy/Plan/Scenarios/Cases, Automation Test Pack, Regression Plan,
UAT Plan, Deployment Guide, Go-Live Plan/Checklist, Rollback Guide/Plan,
Operational/Support Runbook, Operational Checklist, Knowledge Transfer,
Release Notes, Implementation Roadmap, Audit Checklist, Compliance Matrix,
Traceability Matrix, Risk Register, Executive Summary.
