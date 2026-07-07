"""Aggregate API v1 router.

Phase 2 attaches the CRUD resource routers (built by the CRUD factory).
Phase 3 attaches the business-oriented AI SDLC aggregation routers (phase
summaries, copilots, executive, artifact catalog, traceability chain) which
return composed DTOs rather than CRUD rows.
"""
from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    analytics,
    artifact_generation,
    artifact_views,
    copilots,
    executive,
    knowledge_transformation,
    llm_meta,
    orchestrator,
    sdlc,
    traceability,
)
from app.api.v1.endpoints.resources import routers as resource_routers

api_router = APIRouter()

# Phase 2 — CRUD resources.
for _router in resource_routers:
    api_router.include_router(_router)

# Phase 3 — business aggregation APIs.
api_router.include_router(sdlc.router)
api_router.include_router(copilots.router)
api_router.include_router(executive.router)
api_router.include_router(artifact_views.router)
api_router.include_router(traceability.router)

# Phase 5 — artifact generation framework.
api_router.include_router(artifact_generation.router)

# Phase 6 (traceability matrix/impact) + Phase 7 (executive analytics/trends).
api_router.include_router(analytics.router)

# Phase 8 (knowledge) + Phase 9 (transformation) business APIs.
api_router.include_router(knowledge_transformation.router)

# Phase 11 — LLM infrastructure meta (read-only introspection).
api_router.include_router(llm_meta.router)

# Prompt Execution Engine — the top-level orchestration layer over all services.
api_router.include_router(orchestrator.router)
