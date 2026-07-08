# 0005. LLM runtime resilience layer

- **Status:** Accepted
- **Date:** 2026-07-08
- **Deciders:** Principal Architect, Gen AI Engineering, SRE

## Context

Direct calls to an LLM provider are fragile: providers time out, rate-limit, or go
down; repeated identical prompts waste time and money; a single model may be
unavailable. These concerns are cross-cutting and should not live in each service.

## Decision

Introduce `app/llm/runtime.py` (`LLMRuntime`) as a thin orchestration layer over
`LLMService`:

- **Caching:** prompt + response LRU caches keyed by a content hash.
- **Circuit breaker:** opens after N consecutive failures, half-opens after a reset window.
- **Concurrency control:** bounded semaphore; in-flight accounting.
- **Routing + fallback:** preferred model then automatic fallbacks.
- **Accounting:** cumulative prompt/completion tokens and estimated cost.
- **Batching / streaming / cancellation / conversation history** as first-class methods.
- **Prompt chunking + compression** helpers for oversized inputs.

## Consequences

- **Positive:** every service gets resilience for free by calling the runtime.
- **Positive:** observable via `GET /api/v1/llm/runtime` (breaker state, cache hit
  rate, cost) — feeds SRE dashboards/alerts.
- **Negative:** an extra layer to reason about; kept dependency-free and unit-tested offline.
