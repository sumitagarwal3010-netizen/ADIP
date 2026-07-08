# 0003. Mock-first deterministic mode (LLM optional)

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Principal Architect, Product, QA

## Context

The platform must be demoable and testable with **zero external dependencies** —
no GPU, no model download, no network. At the same time, it must produce
realistic, consistent SDLC artifacts for reviews and automated tests.

## Decision

Make the LLM **optional**, gated by `LOCAL_LLM_ENABLED` (default `false`):

- When disabled, the prompt engine, artifact generator, quality engine and
  reviewer produce **deterministic** output from structured project data and
  templates — no model call.
- When enabled, calls route through the runtime to a real provider.

## Consequences

- **Positive:** CI runs the full suite offline and deterministically (190+ tests).
- **Positive:** demos never fail due to model/infra issues; enabling a model is a
  pure enhancement.
- **Positive:** dataset/sample-project generators run anywhere.
- **Negative:** deterministic output is templated, not generative; acceptable
  because real generation is a config flip away and quality scoring applies to both.
