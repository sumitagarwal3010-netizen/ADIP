"""Infrastructure sizing benchmark API — GKE/GCP capacity planning."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.perf.infra_sizing_benchmark import PROFILE_ASSUMPTIONS, InfraSizingBenchmarkService
from app.schemas.infra_sizing import InfraSizingReport, InfraSizingRunRequest, SizingProfile

router = APIRouter(prefix="/benchmarks/infra-sizing", tags=["Infra Sizing Benchmark"])


def _svc(db: Session = Depends(get_db)) -> InfraSizingBenchmarkService:
    return InfraSizingBenchmarkService(db)


@router.get("")
def infra_sizing_info():
    """Profiles, scenarios, and assumptions for infra sizing benchmark."""
    return {
        "profiles": list(PROFILE_ASSUMPTIONS.keys()),
        "default_scenarios": InfraSizingBenchmarkService.DEFAULT_SCENARIOS,
        "assumptions_by_profile": PROFILE_ASSUMPTIONS,
        "endpoints": {
            "run": "POST /api/v1/benchmarks/infra-sizing/run",
        },
    }


@router.get("/profiles/{profile}")
def infra_sizing_profile(profile: SizingProfile):
    return {"profile": profile, "assumptions": PROFILE_ASSUMPTIONS[profile]}


@router.post("/run", response_model=InfraSizingReport)
def run_infra_sizing(body: InfraSizingRunRequest, svc: InfraSizingBenchmarkService = Depends(_svc)):
    """Run mock infra sizing benchmark and return GKE/GCP estimates."""
    scenarios = body.scenarios or None
    return svc.run(profile=body.profile, scenarios=scenarios)
