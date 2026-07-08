# 0002. Provider-agnostic LLM abstraction

- **Status:** Accepted
- **Date:** 2026-07-07
- **Deciders:** Principal Architect, Gen AI Engineering

## Context

ADIP must run against a local model (Ollama) today, but should support cloud
providers (OpenAI, Gemini, LM Studio) later without rewriting call sites. Vendor
SDKs differ in request/response shapes, streaming and error semantics.

## Decision

Define a narrow provider protocol and adapter pattern in `app/llm/`:

- `LLMProvider` protocol: `is_available()`, `complete()`, `stream()`.
- Provider-agnostic DTOs: `Message`, `CompletionRequest`, `CompletionResponse`, `StreamChunk`, `Usage`.
- One adapter per provider (`ollama_adapter.py` implemented; others scaffolded).
- A `registry` of model specs (context window, provider) and an `LLMService`
  that selects the active provider from config.

## Consequences

- **Positive:** adding a provider = implement one adapter + register models; no
  changes to services, runtime, routing, caching or cost accounting.
- **Positive:** the runtime layer (ADR-0005) composes cleanly over any provider.
- **Negative:** the lowest common denominator API may not expose every
  vendor-specific feature; those can be passed via `CompletionRequest.metadata`.
