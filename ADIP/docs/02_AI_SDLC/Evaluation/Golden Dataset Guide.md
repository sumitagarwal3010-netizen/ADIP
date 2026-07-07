# Golden Dataset Guide

The golden dataset is ADIP's set of **enterprise-quality reference artifacts** —
the "ideal outputs" used to benchmark and regression-test AI generation.

## Contents

800 reference artifacts (100 each) across 20 banking domains:

BRD · FRD · HLD · LLD · Test Plan · Test Cases · Executive Summary · Audit Checklist.

Stored under `docs/examples/golden-dataset/<type>/NNN-<domain>-<type>.md`, each
with an embedded quality header. `manifest.json` indexes every artifact
(file, domain, project, quality score/band). Average quality ≈ 89/100.

## Regenerate

```bash
cd backend
python -m app.datasets.golden_dataset            # 100 per type (800 total)
python -m app.datasets.golden_dataset --count 25 # smaller (200 total)
python -m app.datasets.golden_dataset --out /tmp/gd
```

Generated deterministically via the existing `ArtifactGenerator` + `QualityEngine`
(no duplicate generator).

## Usage

- **Benchmark targets** — compare fresh generations against these references.
- **Regression baselines** — detect quality drift over time.
- **Eval material** — datasets for future LLM evaluation/fine-tuning.
