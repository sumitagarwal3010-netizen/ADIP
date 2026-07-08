# ADIP Extensibility Guide

ADIP is built around **provider- and service-level seams** so future capabilities
can be added without rewriting the core. This guide documents each extension
point, the existing seam it plugs into, and a concrete implementation sketch.

---

## Extension points at a glance

| Future capability | Existing seam | Effort |
|---|---|---|
| MCP integration | Tool-call boundary in copilots / engine | Medium |
| Agent framework | `PromptExecutionEngine` orchestration | Medium |
| Cloud LLM (OpenAI/Gemini/Bedrock) | `LLMProvider` protocol + adapters | Low |
| RAG | Pre-prompt context assembly in the engine | Medium |
| Vector database | New retrieval service behind an interface | Medium |
| Workflow engine | Approval/publish transitions + orchestration | Medium |
| Enterprise plugins | Router registration + service registry | Low |

---

## 1. Future MCP integration

**Seam:** the copilots and the prompt engine already produce structured,
tool-shaped steps. Introduce an MCP client as a *tool provider*.

**Sketch**
- Add `app/integrations/mcp/client.py` exposing `list_tools()` / `call_tool(name, args)`.
- In `PromptExecutionEngine`, when a reasoning step requests an external tool,
  route it through the MCP client instead of a local stub.
- Gate behind `MCP_ENABLED` in `app/core/config.py` (mirror the `LOCAL_LLM_ENABLED`
  pattern) so mock mode is unaffected.

---

## 2. Future agent framework

**Seam:** `PromptExecutionEngine.execute()` is already a single orchestration
entry that fans out to phase copilots.

**Sketch**
- Introduce an `AgentPlan` (list of steps with dependencies) produced from the
  classified prompt.
- Add an executor that runs steps with the existing `LLMRuntime` (concurrency,
  retries, fallback already provided).
- Persist agent runs alongside `WorkbenchRun` for observability and replay.

---

## 3. Future cloud LLM

**Seam:** `app/llm/adapters/` already contains scaffolds (`openai_adapter.py`,
`gemini_adapter.py`, `lmstudio_adapter.py`) implementing the `LLMProvider`
protocol; the model registry and runtime routing are provider-agnostic.

**Sketch**
- Implement `complete()` / `stream()` in the desired adapter using the vendor SDK.
- Register the model in `app/llm/registry.py` with its context window + provider.
- Set `LLM_PROVIDER=openai` (etc.). Routing, fallback, cost accounting
  (`_COST_PER_1K` in `runtime.py`) and caching work unchanged.

---

## 4. Future RAG

**Seam:** artifact generation and prompt execution assemble context before
calling the model — the ideal injection point for retrieved knowledge.

**Sketch**
- Add `app/services/retrieval_service.py` with `retrieve(query, k) -> list[Chunk]`.
- Before completion, prepend retrieved chunks to the message context (respecting
  `fit_to_context_window` in `app/llm/tokens.py`).
- Cite sources in the artifact's Appendix/Traceability envelope section.

---

## 5. Future vector database

**Seam:** keep retrieval behind an interface so the store is swappable
(pgvector / Qdrant / Weaviate / FAISS).

**Sketch**
- Define `VectorStore` protocol: `upsert(id, embedding, metadata)`, `query(embedding, k)`.
- Provide a pgvector implementation first (reuses the existing PostgreSQL).
- Wire it into `retrieval_service` (#4). Embeddings come from the LLM provider
  or a dedicated embedding model in the registry.

---

## 6. Future workflow engine

**Seam:** Prompt Studio already models an approval workflow
(`Draft → In Review → Approved → Published`) and the engine orchestrates phases.

**Sketch**
- Externalize transitions into a declarative state machine
  (`app/workflows/`), with guards and hooks (notifications, audit).
- Drive SDLC phase gates (requirements → design → dev → test → release → go-live)
  through the same engine so approvals become first-class, auditable steps.

---

## 7. Future enterprise plugins

**Seam:** every capability is a FastAPI `APIRouter` + a service; routers are
aggregated in `app/api/v1/router.py`.

**Sketch**
- Define a `Plugin` contract: `router: APIRouter`, `services: list`, `on_startup()`.
- Add a discovery step that imports plugins from an `app/plugins/` package (or
  entry points) and calls `api_router.include_router(plugin.router)`.
- Keep plugins isolated: their own schemas/services, no edits to core modules.

---

## Design principles that make this safe

1. **Config-gated features** — new integrations default off; mock mode always works.
2. **Protocol/interface boundaries** — `LLMProvider`, planned `VectorStore`/`Plugin`.
3. **Additive migrations** — new tables/columns only; never destructive.
4. **No duplication** — extend existing services; register new routers.
5. **Observability by default** — new paths flow through metrics/audit automatically.
