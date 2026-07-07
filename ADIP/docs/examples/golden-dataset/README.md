# Golden Dataset

Enterprise-quality **reference artifacts** for AI evaluation — the "ideal
outputs" ADIP's generation and review are benchmarked against.

## Contents

800 reference artifacts (100 per type) across 20 banking domains, each with an
embedded quality header (`domain`, `project`, quality score/band):

| Type | Folder | Count |
|---|---|---|
| BRD | `brd/` | 100 |
| FRD | `frd/` | 100 |
| HLD | `hld/` | 100 |
| LLD | `lld/` | 100 |
| Test Plan | `test-plan/` | 100 |
| Test Cases | `test-cases/` | 100 |
| Executive Summary | `executive-summary/` | 100 |
| Audit Checklist | `audit-checklist/` | 100 |

Average quality: ~89/100. See `manifest.json` for the full index (file, domain,
project, quality score/band per artifact).

## How it was generated

Deterministically via the existing `ArtifactGenerator` + `QualityEngine`
(no duplicate generator), iterating banking domains × seeded projects:

```bash
cd backend
python -m app.datasets.golden_dataset            # 100 per type
python -m app.datasets.golden_dataset --count 50 # smaller set
```

## Usage

- Reference targets for prompt/artifact benchmarking.
- Regression baselines for artifact authoring quality.
- Training/eval material for future LLM fine-tuning or evaluation.
