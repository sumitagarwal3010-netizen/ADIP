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


@router.get("/estimate")
def llm_estimate(model: str | None = None, prompt: str = "Evaluate UPI settlement requirements") -> dict:
    """Pre-flight token, cost and memory estimate for a prompt."""
    from app.llm.runtime import llm_runtime
    from app.llm.types import Message, Role

    messages = [Message(Role.USER, prompt)]
    return llm_runtime.estimate(messages, model)


@router.get("/gpu")
def llm_gpu() -> dict:
    """GPU/CPU inference context for the active local provider."""
    from app.llm.adapters.ollama_adapter import OllamaAdapter
    return OllamaAdapter().gpu_info()


@router.get("/prompt-log")
def llm_prompt_log(limit: int = 20) -> dict:
    """Recent prompt execution log and aggregate stats."""
    from app.llm.prompt_log import prompt_log
    return {"stats": prompt_log.stats(), "recent": [
        {"provider": e.provider, "model": e.model, "ok": e.ok, "latency_ms": e.latency_ms}
        for e in prompt_log.recent(limit)
    ]}


@router.get("/templates")
def list_templates() -> dict:
    """List available prompt templates."""
    return {
        "templates": [
            {"name": t.name, "version": t.version} for t in template_library.list()
        ]
    }


@router.post("/smoke-test")
def llm_smoke_test() -> dict:
    """Mock-mode LLM smoke test — registry, providers, templates, estimate; no external credentials."""
    from app.llm.runtime import llm_runtime
    from app.llm.types import Message, Role

    checks = []
    models = registry.list()
    checks.append({"check": "models_registered", "ok": len(models) > 0, "count": len(models)})
    providers = llm_service.available_providers()
    checks.append({"check": "providers_available", "ok": len(providers) > 0, "providers": list(providers.keys()) if isinstance(providers, dict) else providers})
    health = llm_service.health()
    checks.append({"check": "health_endpoint", "ok": bool(health), "detail": health.get("status", "ok")})
    estimate = llm_runtime.estimate([Message(Role.USER, "ADIP smoke test prompt")], None)
    checks.append({"check": "token_estimate", "ok": "input_tokens" in estimate, "estimate": estimate})
    templates = template_library.list()
    checks.append({"check": "templates_loaded", "ok": len(templates) > 0, "count": len(templates)})
    all_ok = all(c["ok"] for c in checks)
    return {"status": "pass" if all_ok else "fail", "mode": "mock", "checks": checks}
