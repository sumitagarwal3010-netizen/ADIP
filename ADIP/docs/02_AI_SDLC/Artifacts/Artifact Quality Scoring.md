# Artifact Quality Scoring

A professional scoring engine grades each artifact across **14 dimensions**
(weights sum to 100), producing section-level scores, an overall score, a
quality band, improvement suggestions, missing sections and risk notes.

## Dimensions (weights)

completeness (12) · clarity (8) · structure (8) · required_sections (12) ·
banking_relevance (8) · compliance_coverage (8) · security_coverage (6) ·
performance_coverage (6) · testability (6) · traceability (8) ·
maintainability (4) · executive_readability (4) · missing_information (6) ·
placeholder_detection (4).

Bands: **Excellent** ≥ 90 · **Good** ≥ 75 · **Fair** ≥ 60 · **Poor** < 60.

## APIs

| API | Purpose |
|---|---|
| `GET /api/v1/artifact-quality/rules` | Dimensions + weights |
| `POST /api/v1/artifact-quality/score` | Score one artifact |
| `POST /api/v1/artifact-quality/batch-score` | Score many artifact types |

## Example

```bash
curl -s -X POST http://localhost:8000/api/v1/artifact-quality/score \
  -H 'Content-Type: application/json' -d '{"project_id":1,"artifact_type":"BRD"}'
```
```jsonc
{
  "overall_score": 89, "quality_band": "Good",
  "dimension_scores": [{ "dimension": "completeness", "score": 96, "weight": 12 }, "..."],
  "section_scores": [{ "heading": "Business Objectives", "score": 100, "issues": [] }],
  "missing_sections": [], "improvement_suggestions": ["..."], "risk_notes": []
}
```

## Test commands

```bash
cd backend && pytest -k "quality"
```

## Troubleshooting

- Low `compliance_coverage`/`security_coverage` → the artifact lacks regulatory
  or security wording; enrich the source data or prompt.
- `placeholder_detection` < 100 → remove TBD/TODO text.
