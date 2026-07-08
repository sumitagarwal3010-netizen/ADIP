# 0007. JSONL for large evaluation datasets

- **Status:** Accepted
- **Date:** 2026-07-08
- **Deciders:** Principal Architect, ML Engineering

## Context

The platform ships thousands of enterprise prompts, benchmark cases, evaluation
cases, artifact examples and review examples. Storing each record as a separate
file would create tens of thousands of files, bloating the repo and slowing
tooling. The data must remain machine-consumable by eval pipelines.

## Decision

Store large datasets as **JSONL** (one JSON record per line), one file per dataset
type, organized by banking domain, with a `manifest.json`:

```
docs/examples/enterprise-datasets/
  prompts.jsonl  benchmark_cases.jsonl  eval_cases.jsonl
  artifact_examples.jsonl  review_examples.jsonl  manifest.json
```

Datasets are produced by a **generator** (`app/datasets/enterprise_datasets.py`)
so they are reproducible and versionable, not hand-authored.

## Consequences

- **Positive:** standard format for ML/eval tooling; streamable; diffs are line-based.
- **Positive:** repo stays manageable (5 files vs thousands).
- **Negative:** individual records aren't independently browsable as files; the
  generator + manifest mitigate this. Dataset versioning is handled via the ML
  dataset-versioning utility.
