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
    """Report configured providers and availability (scaffolds report False)."""
    return {"providers": llm_service.available_providers()}


@router.get("/templates")
def list_templates() -> dict:
    """List available prompt templates."""
    return {
        "templates": [
            {"name": t.name, "version": t.version} for t in template_library.list()
        ]
    }
