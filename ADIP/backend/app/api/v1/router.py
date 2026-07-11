"""Aggregate API v1 router.

Phase 2 attaches the CRUD resource routers (built by the CRUD factory).
Phase 3 attaches the business-oriented AI SDLC aggregation routers (phase
summaries, copilots, executive, artifact catalog, traceability chain) which
return composed DTOs rather than CRUD rows.
"""
from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import (
    ai_engine,
    ai_review,
    analytics,
    artifact_export,
    artifact_generation,
    artifact_quality,
    artifact_views,
    connectors,
    copilots,
    executive,
    capacity_planning,
    infra_sizing_benchmark,
    knowledge_transformation,
    llm_meta,
    orchestrator,
    platform_meta,
    prompt_benchmark,
    prompt_governance,
    prompt_studio,
    prompt_templates,
    prompt_testing,
    prompt_workbench,
    regression,
    rubrics,
    rules,
    sdlc,
    team_takeover,
    traceability,
    validation,
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

# Prompt template library, prompt testing/benchmark, and validation/artifact ops.
api_router.include_router(prompt_templates.router)
api_router.include_router(prompt_testing.router)
api_router.include_router(validation.router)

# Prompt Workbench (versioning, experiments, runs, comparison).
api_router.include_router(prompt_workbench.router)

# Artifact quality scoring + AI reviewer/critic.
api_router.include_router(artifact_quality.router)
api_router.include_router(ai_review.router)

# Prompt benchmark/optimization + artifact quality rubrics.
api_router.include_router(prompt_benchmark.router)
api_router.include_router(infra_sizing_benchmark.router)
api_router.include_router(capacity_planning.router)
api_router.include_router(rubrics.router)

# Prompt Studio, artifact export engine, and prompt regression framework.
api_router.include_router(prompt_studio.router)
api_router.include_router(artifact_export.router)
api_router.include_router(regression.router)

# Enterprise engineering layer (additive meta APIs).
api_router.include_router(ai_engine.router)
api_router.include_router(prompt_governance.router)
api_router.include_router(platform_meta.router)
api_router.include_router(connectors.router)
api_router.include_router(rules.router)
api_router.include_router(team_takeover.router)
