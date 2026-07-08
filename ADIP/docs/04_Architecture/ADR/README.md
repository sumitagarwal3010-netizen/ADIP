# Architecture Decision Records (ADR)

This directory captures the significant architectural decisions for ADIP using
the lightweight [MADR](https://adr.github.io/madr/)-style format:
**Context → Decision → Consequences**.

| ADR | Title | Status |
|---|---|---|
| [0001](0001-layered-backend-architecture.md) | Layered backend architecture (endpoints → services → repositories) | Accepted |
| [0002](0002-provider-agnostic-llm-abstraction.md) | Provider-agnostic LLM abstraction | Accepted |
| [0003](0003-mock-first-deterministic-mode.md) | Mock-first deterministic mode (LLM optional) | Accepted |
| [0004](0004-sqlite-dev-postgres-prod.md) | SQLite for dev, PostgreSQL for production | Accepted |
| [0005](0005-runtime-resilience-layer.md) | LLM runtime resilience layer (cache, breaker, routing) | Accepted |
| [0006](0006-additive-only-migrations.md) | Additive-only database migrations | Accepted |
| [0007](0007-jsonl-datasets.md) | JSONL for large evaluation datasets | Accepted |

## Writing a new ADR

1. Copy the template below into `NNNN-short-title.md` (next number).
2. Fill Context / Decision / Consequences.
3. Add a row to the table above.

```md
# NNNN. <Title>

- **Status:** Proposed | Accepted | Superseded by ADR-XXXX
- **Date:** YYYY-MM-DD
- **Deciders:** <roles>

## Context
<forces at play, constraints>

## Decision
<what we chose and why>

## Consequences
<positive, negative, follow-ups>
```
