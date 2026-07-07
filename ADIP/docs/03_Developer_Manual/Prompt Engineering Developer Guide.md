# Prompt Engineering Developer Guide

For developers extending ADIP's prompt/artifact/review capabilities.

## Component map

```
backend/app/
  services/
    prompt_template_library.py   use-case + artifact-authoring templates
    artifact_spec.py             canonical artifact required-sections (single source of truth)
    artifact_generator.py        the ONE generator (professional envelope + builders)
    artifact_validator.py        lightweight validation
    quality_engine.py            14-dimension quality scoring
    ai_reviewer.py               deterministic + Ollama reviewer, improve, review-run
    prompt_workbench_service.py  prompts/versions/runs (DB)
    prompt_testing.py            ad-hoc runs + benchmark (in-process)
    orchestrator_service.py      PromptExecutionEngine (reused by all of the above)
  llm/                           provider-independent LLM layer (adapters, reasoning, tokens, parser)
  models/prompt_workbench.py     WorkbenchPrompt / Version / Run
```

## Architecture principles

- **One generator, one source of truth.** Extend `artifact_spec.py` +
  `ArtifactGenerator`; never add a second generator.
- **Reuse the engine.** Workbench runs, prompt tests and AI review all call the
  existing `PromptExecutionEngine`.
- **Provider independence.** Reasoning/review go through interfaces; mock is the
  default, Ollama is optional. No provider is mandatory.

## Add a new artifact type

1. Add an `ArtifactSpec` in `artifact_spec.py` (phase, objective, required sections).
2. (Optional) Add a bespoke builder in `ArtifactGenerator._builders()`.
3. It automatically gets the professional envelope, quality scoring, review,
   authoring template and all renderers.

## Add a new quality dimension

Add it to `_DIMENSION_WEIGHTS` (+ description + scoring logic) in
`quality_engine.py` (keep weights summing to 100). The reviewer maps checks to
dimensions in `ai_reviewer.py`.

## APIs quick reference

- Templates: `/prompt-templates`, `/prompt-templates/artifacts[/{type}]`
- Workbench: `/prompt-workbench/prompts|versions|runs|compare`
- Testing: `/prompt-testing/run|benchmark|history|statistics|compare`
- Quality: `/artifact-quality/score|batch-score|rules`
- Review: `/ai-review/review-artifact|improve-artifact|review-run`

## Local LLM setup

See [Local LLM Artifact Generation](../08_Local_LLM/Local%20LLM%20Artifact%20Generation.md).
Mock mode needs no setup.

## Test commands

```bash
cd backend && pytest                     # full suite
cd backend && pytest -k "workbench or quality or review or template"
npx tsc --noEmit                         # frontend types (repo root)
```

## Troubleshooting

- `no such table: workbench_*` → `python -m app.seed.run --reset` or `alembic upgrade head`.
- Ollama review not used → confirm `LOCAL_LLM_ENABLED=true` and `/api/v1/llm/health` shows `available: true`.
- Frontend client methods: import from `src/services/backend` (mock-mode default).

## Developer workflow

Draft prompt → workbench version → run → quality score → AI review → improve →
export (Markdown/DOCX/PDF-ready).
