"""LLM infrastructure meta endpoints (Phase 11).

Read-only introspection of the LLM abstraction (models, providers, templates).
No completions are exposed because the adapters are scaffolds.
"""
from __future__ import annotations

from fastapi import APIRouter

from app.llm import llm_service, registry, template_library

router = APIRouter(prefix="/llm", tags=["LLM Infrastructure"])


@router.get("/models")
def list_models() -> dict:
    """List registered models and the default."""
    return {
        "default": registry.default().id,
        "models": [
            {
                "id": m.id,
                "provider": m.provider,
                "context_window": m.context_window,
                "description": m.description,
                "default": m.default,
            }
            for m in registry.list()
        ],
    }


@router.get("/providers")
def list_providers() -> dict:
    """Report configured providers and availability (health-checked)."""
    return {"providers": llm_service.available_providers()}


@router.get("/health")
def llm_health() -> dict:
    """Active LLM provider health + configuration snapshot."""
    return llm_service.health()


@router.get("/runtime")
def llm_runtime_status() -> dict:
    """Production runtime snapshot: concurrency, circuit breaker, caches, token/cost accounting."""
    from app.llm.runtime import llm_runtime
    return llm_runtime.snapshot()


@router.get("/routing")
def llm_routing(model: str | None = None) -> dict:
    """Model routing plan (preferred model + automatic fallbacks)."""
    from app.llm.runtime import llm_runtime
    return {"plan": llm_runtime.routing_plan(model)}


@router.get("/templates")
def list_templates() -> dict:
    """List available prompt templates."""
    return {
        "templates": [
            {"name": t.name, "version": t.version} for t in template_library.list()
        ]
    }
