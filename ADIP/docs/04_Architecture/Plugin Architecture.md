# ADIP Plugin & Extension Architecture

How to extend ADIP with new capabilities without modifying core code. This
documents the **contract** and **registration** model; it does not ship a
third-party integration (per project policy).

---

## 1. What a plugin is

A plugin is a self-contained package that provides one or more of:

- **Routers** — new `APIRouter`s under `/api/v1/...`
- **Services** — new business logic
- **Models + migrations** — new tables (additive; ADR-0006)
- **LLM providers** — new adapters implementing `LLMProvider`
- **Lifecycle hooks** — `on_startup()` / `on_shutdown()`

Plugins never edit core modules. They register through the extension points below.

---

## 2. Plugin contract

```python
# app/plugins/base.py (proposed contract)
from dataclasses import dataclass, field
from fastapi import APIRouter

@dataclass
class Plugin:
    name: str
    version: str
    routers: list[APIRouter] = field(default_factory=list)
    on_startup: "callable | None" = None
    on_shutdown: "callable | None" = None
```

A plugin module exposes `PLUGIN: Plugin`.

---

## 3. Registration model

```python
# app/plugins/registry.py (proposed)
import importlib, pkgutil
from app.api.v1.router import api_router

def load_plugins(package="app.plugins.contrib") -> list[str]:
    loaded = []
    pkg = importlib.import_module(package)
    for _, name, _ in pkgutil.iter_modules(pkg.__path__):
        mod = importlib.import_module(f"{package}.{name}")
        plugin = getattr(mod, "PLUGIN", None)
        if plugin:
            for r in plugin.routers:
                api_router.include_router(r)
            loaded.append(plugin.name)
    return loaded
```

Call `load_plugins()` during app startup after core routers are registered.
Discovery can also be driven by Python entry points for out-of-tree plugins.

---

## 4. Existing extension points (available today)

| Extension | Seam | Reference |
|---|---|---|
| New LLM provider | `LLMProvider` protocol + `registry` | ADR-0002, `app/llm/adapters/` |
| New CRUD entity | CRUD factory | `app.cli scaffold <Name>` |
| New capability API | additive `APIRouter` | `app/api/v1/router.py` |
| New artifact type | `ARTIFACT_SPECS` + builder | `app/services/artifact_spec.py` |
| New prompt templates | template library | `app/services/prompt_template_library.py` |
| Context assembly (RAG hook) | pre-prompt context | `app/llm/context_builder.py` |

---

## 5. Feature-flag & configuration framework

Plugins and optional features are gated via configuration (mirroring
`LOCAL_LLM_ENABLED`):

- Add a boolean/string setting to `app/core/config.py` (env-overridable).
- Default new integrations to **off** so mock mode and existing behavior are unaffected.
- Expose current flags via a read-only endpoint for the frontend to consume
  (feature-flag usage) — see `docs/14_Extensibility/Extensibility Guide.md`.

---

## 6. Multi-tenant readiness (future)

- **Tenant abstraction:** add a `tenant_id` to tenant-scoped models and a request
  context resolver (middleware already carries a request context / correlation id).
- **Isolation options:** row-level (shared schema + `tenant_id` filter) → schema-per-tenant → DB-per-tenant, in increasing isolation/cost.
- Keep tenant resolution in one place (dependency) so services stay tenant-agnostic.

This is documented as a seam; no tenant coupling exists in core today.
