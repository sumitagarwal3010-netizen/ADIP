"""Team takeover pack metadata API."""
from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter

router = APIRouter(prefix="/team-takeover", tags=["Team Takeover"])

_REPO = Path(__file__).resolve().parents[5]
_TAKEOVER = _REPO / "enterprise" / "team-takeover"


@router.get("/metadata")
def takeover_metadata():
    docs = []
    if _TAKEOVER.exists():
        docs = sorted(p.name for p in _TAKEOVER.glob("*.md"))
    scripts = [
        "scripts/run_prompt_regression.py",
        "scripts/run_llm_smoke_test.py",
        "scripts/run_artifact_quality_check.py",
        "scripts/run_connector_artifact_demo.py",
    ]
    workbenches = [
        {"route": "/ai-sdlc/connector-artifact-workbench", "name": "Connector Artifact Workbench"},
        {"route": "/platform/team-engineering-workbench", "name": "Team Engineering Workbench"},
        {"route": "/administration/integrations", "name": "Integration Center"},
    ]
    return {
        "pack_version": "1.0.0",
        "documentation_folder": "enterprise/team-takeover/",
        "documents": docs,
        "scripts": scripts,
        "workbenches": workbenches,
        "apis": [
            "/api/v1/rules",
            "/api/v1/team-takeover/metadata",
            "/api/v1/prompt-regression",
            "/api/v1/artifact-quality/scorecard",
            "/api/v1/llm/smoke-test",
            "/api/v1/connectors/artifacts",
        ],
    }
