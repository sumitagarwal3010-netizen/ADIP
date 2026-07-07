# 08 · Local LLM

Documentation for ADIP's **provider-independent LLM integration layer**.

ADIP ships an LLM abstraction (infrastructure only — no runtime dependency).
The orchestration engine classifies prompts through a `Reasoner` interface; a
deterministic mock reasoner is used today, and a local/remote LLM can be plugged
in later with no rewrite.

## Supported provider adapters (scaffolds)

| Provider | Adapter | Default base URL |
|---|---|---|
| Ollama | `OllamaAdapter` | `http://localhost:11434` |
| OpenAI-compatible | `OpenAIAdapter` | `https://api.openai.com/v1` |
| LM Studio | `LMStudioAdapter` | `http://localhost:1234/v1` |
| Gemini-compatible | `GeminiAdapter` | `https://generativelanguage.googleapis.com/v1beta` |

Adapters raise `NotImplementedError` until wired to a real provider — the
platform runs fully without any live LLM.

## Where it lives

- Abstraction & adapters: `backend/app/llm/`
- Read-only introspection API: `GET /api/v1/llm/{models,providers,templates}`
- AI orchestration flow diagram: [`../04_Architecture/07_SOLUTION_ARCHITECTURE.md`](../04_Architecture/07_SOLUTION_ARCHITECTURE.md)

See also the "Local LLM integration" section of
[`../03_Developer_Manual/Developer Onboarding.md`](../03_Developer_Manual/Developer%20Onboarding.md).
