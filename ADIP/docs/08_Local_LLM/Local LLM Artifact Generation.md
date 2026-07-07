# Local LLM Artifact Generation

ADIP generates artifacts and reviews them using a **provider-independent** LLM
layer. It runs **fully offline by default** (deterministic mock reasoner, no
network). A local LLM (Ollama) can be enabled optionally — nothing is mandatory.

## Modes

| Mode | Behaviour |
|---|---|
| **Mock** (default) | Deterministic reasoning/review; no network call |
| **Ollama** | Real local model for classification & AI review |

## Enable Ollama

```bash
ollama pull llama3.1:8b
# backend/.env
LOCAL_LLM_ENABLED=true
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
LLM_TIMEOUT_SECONDS=60
LLM_MAX_TOKENS=2048
LLM_TEMPERATURE=0.2
```

## Health

```bash
curl -s http://localhost:8000/api/v1/llm/health
curl -s http://localhost:8000/api/v1/llm/providers
```

## Capabilities

- Real **Ollama adapter** (stdlib HTTP): health check, timeout, retry with
  backoff, non-streaming + streaming, token usage.
- Token estimation + context-window trimming + structured response parser.
- AI Reviewer uses the Ollama reviewer prompt when enabled; otherwise
  deterministic. Both paths return the same structured output.
- Future providers (OpenAI, Gemini, LM Studio) are registered and plug-in
  compatible; only Ollama is wired for real execution.

## Fallback guarantee

If `LOCAL_LLM_ENABLED=false` or Ollama is unreachable, the platform
transparently uses the deterministic path — **artifact generation and review
never break**.

## Test commands

```bash
cd backend && pytest -k "llm or review"
```
