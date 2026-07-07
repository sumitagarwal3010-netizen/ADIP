# Local LLM Quick Start

ADIP runs **fully offline** by default — a deterministic mock reasoner classifies
prompts and **no network call** is made. Enabling a real local LLM is optional.

## Enable Ollama (real local execution)

```bash
# 1. Install & run Ollama, then pull a model
ollama pull llama3.1:8b

# 2. Configure the backend (backend/.env)
LOCAL_LLM_ENABLED=true
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
LLM_TIMEOUT_SECONDS=60
LLM_MAX_TOKENS=2048
LLM_TEMPERATURE=0.2
```

## Check health

```bash
curl -s http://localhost:8000/api/v1/llm/health
curl -s http://localhost:8000/api/v1/llm/providers
```

## Capabilities

- Real **Ollama adapter** (stdlib HTTP — no extra dependency): health check,
  timeout, retry with backoff, non-streaming + streaming, token usage.
- Token estimation, context-window trimming, structured response parsing,
  prompt logging.
- **Future providers** (OpenAI, Gemini, LM Studio) are registered and
  plug-in compatible.

> If `LOCAL_LLM_ENABLED=false` (default) or Ollama is unreachable, the platform
> transparently uses mock reasoning — nothing breaks.

Details: [`../08_Local_LLM/`](../08_Local_LLM/).
