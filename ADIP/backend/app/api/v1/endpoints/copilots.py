"""Copilot endpoints (Phase 3).

One endpoint per copilot returning findings, recommendations, reasoning,
confidence, risk, readiness, business impact and priority — assembled from
existing copilot_findings + ai_recommendations (no CRUD, no new queries).
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.enums import CopilotType
from app.schemas import sdlc as dto
from app.services.sdlc_service import SdlcService

router = APIRouter(prefix="/copilots", tags=["AI SDLC · Copilots"])


def get_service(db: Session = Depends(get_db)) -> SdlcService:
    return SdlcService(db)


def _copilot_endpoint(copilot: CopilotType):
    def endpoint(project_id: int, service: SdlcService = Depends(get_service)) -> dto.CopilotResponse:
        return service.copilot(project_id, copilot)

    return endpoint


_COPILOTS = [
    ("requirement", CopilotType.REQUIREMENT),
    ("architecture", CopilotType.ARCHITECTURE),
    ("development", CopilotType.DEVELOPMENT),
    ("testing", CopilotType.TESTING),
    ("release", CopilotType.RELEASE),
    ("go-live", CopilotType.GO_LIVE),
    ("audit", CopilotType.AUDIT),
    ("executive-advisor", CopilotType.EXECUTIVE_ADVISOR),
]

for _slug, _type in _COPILOTS:
    router.add_api_route(
        f"/{_slug}/projects/{{project_id}}",
        _copilot_endpoint(_type),
        methods=["GET"],
        response_model=dto.CopilotResponse,
        summary=f"{_type.value}",
    )
