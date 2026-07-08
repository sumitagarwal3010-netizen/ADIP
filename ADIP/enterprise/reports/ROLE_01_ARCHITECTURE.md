# Role 1 — Architecture Review (Principal Software Architect)

## Scores

| Dimension | Score |
|-----------|-------|
| Architecture | **74 / 100** |
| Maintainability | **68 / 100** |
| Technical debt | **62 / 100** (lower is better debt) |

## Layer validation

```
┌─────────────────────────────────────────┐
│  React 19 + MUI 9 (src/pages, components) │
├─────────────────────────────────────────┤
│  Contexts + SDK (src/context, src/sdk)    │
├─────────────────────────────────────────┤
│  Mock engines (src/data, services/*.js)   │◄── default runtime
├─────────────────────────────────────────┤
│  apiClient (src/services/backend)         │◄── optional backend mode
├─────────────────────────────────────────┤
│  FastAPI v1 (backend/app/api)           │
├─────────────────────────────────────────┤
│  Services / LLM / ML / AI (backend/app) │
├─────────────────────────────────────────┤
│  SQLAlchemy + Alembic (backend/app/db)  │
└─────────────────────────────────────────┘
```

**DDD alignment:** Bounded contexts map to executive centers (Portfolio, EA, SDLC hubs). Shared kernel: artifacts, workflow, traceability.

## Dependency graph (package level)

- `pages` → `components`, `context`, `data`, `hooks`, `sdk`
- `context` → `data/*Engine`, `persistence`
- `backend/api` → `services` → `models` / `repositories`
- `llm` → `adapters` (provider abstraction)
- `ai` → `llm.reasoning` (no circular import)

**Circular dependencies:** None hard-detected. Soft coupling: `WorkflowContext` ↔ `unifiedLifecycleEngine`.

## Module ownership

| Module | Owner domain |
|--------|----------------|
| `src/components/workflow` | AI Workspace / artifacts |
| `backend/app/orchestrator` | Prompt Execution Engine |
| `backend/app/llm` | LLM platform |
| `backend/app/ml` | Offline evaluation |
| `backend/app/ai` | Reasoning / planning / reflection |
| `backend/app/platform` | Extension registry |

## Refactoring roadmap (additive)

1. Wire `src/sdk` into hubs via `useAdipQuery` (hub-by-hub)
2. Route-level `React.lazy` code splitting
3. Split `hubArtifactDefinitions.ts` by hub key
4. Consolidate `AIWorkspacePanel` + `TransformationAiWorkspace` configs
5. Delete dead: `AnalyzeWithAIPanel`, `LearningHub`, `ProductionCenter`

## Future roadmap

Q3: Backend mode on Traceability + Artifacts  
Q4: Auth + Postgres production path  
Q1: Prompt regression CI + frontend tests
