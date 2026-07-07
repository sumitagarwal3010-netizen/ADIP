# Artifact Quality Guide

ADIP evaluates artifact quality two complementary ways: the **quality engine**
(14 weighted dimensions, automated scoring) and **rubrics** (10-criterion
descriptors for human/AI graders).

## Quality engine (14 dimensions)

completeness · clarity · structure · required_sections · banking_relevance ·
compliance_coverage · security_coverage · performance_coverage · testability ·
traceability · maintainability · executive_readability · missing_information ·
placeholder_detection. Weights sum to 100. Bands: Excellent ≥90 · Good ≥75 ·
Fair ≥60 · Poor <60.

```bash
curl -s -X POST http://localhost:8000/api/v1/artifact-quality/score \
  -H 'Content-Type: application/json' -d '{"project_id":1,"artifact_type":"BRD"}'
curl -s http://localhost:8000/api/v1/artifact-quality/rules
```

## Rubrics (10 criteria)

Completeness · Business Correctness · Architecture Correctness · Compliance ·
Security · Testing · Traceability · Maintainability · Executive Readability ·
Overall Quality — each with Excellent/Good/Average/Poor descriptors.

```bash
curl -s http://localhost:8000/api/v1/artifact-rubrics
curl -s http://localhost:8000/api/v1/artifact-rubrics/BRD
```

## Review dataset

`docs/examples/review-dataset/<type>/{excellent,good,average,poor,broken}.md`
demonstrate each quality tier with review comments explaining why — training
material for graders and prompt tuning.

## Test commands

```bash
cd backend && pytest -k "quality or rubric"
```
