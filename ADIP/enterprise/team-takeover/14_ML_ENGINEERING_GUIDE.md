# ML Engineering Guide

## Datasets

- Golden: `docs/examples/golden-dataset/` (802 artifacts)
- Enterprise JSONL: `docs/examples/enterprise-datasets/`
- Generator: `python -m app.datasets.golden_dataset`

## Evaluation

`python -m app.ml.evaluation` — offline eval pipeline.

## Golden sets

Used by prompt regression mock runner (`POST /prompt-regression/run-golden`).

## Prompt regression

```bash
python scripts/run_prompt_regression.py 5
```

Uses `app/ml/semantic_similarity.py` for grounding scores.

## Semantic similarity

`similarity_score(text, reference)` — Jaccard/token grounding.

## Hallucination checks

`app/ml/hallucination.py` — `detect_hallucinations(text, reference=...)`.

## Scoring

QualityEngine 14 dimensions + rule engine + composite scorecard.

## Drift

`app/ml/drift.py` — PSI/mean-shift (integrate with regression in future).

Cross-reference: `docs/02_AI_SDLC/Evaluation/`.
