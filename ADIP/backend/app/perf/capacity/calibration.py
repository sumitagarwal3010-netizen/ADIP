"""Calibration mode — compare estimated vs actual metrics (mock-safe)."""
from __future__ import annotations

from app.schemas.capacity_planning import CalibrationInput, CalibrationReport, CapacityPlanningReport


_MOCK_ACTUAL = {
    "cpu_millicores": 850,
    "ram_mb": 2048,
    "storage_gb": 45.0,
    "network_egress_gb": 120.0,
    "prompt_rps": 12.5,
}


def calibrate(
    report: CapacityPlanningReport,
    inp: CalibrationInput,
) -> CalibrationReport:
    gke = report.gke
    estimated = {
        "cpu_millicores": float(gke.get("backend", {}).get("cpu_limit", "500m").replace("m", "") or 500),
        "ram_mb": 512.0,
        "storage_gb": report.object_storage.storage_per_year_bytes / 1e9,
        "network_egress_gb": report.network.total_egress_gb_month,
        "prompt_rps": 10.0,
    }
    if inp.source == "mock" or not any([
        inp.cpu_millicores_actual, inp.ram_mb_actual, inp.storage_gb_actual,
        inp.network_egress_gb_actual, inp.prompt_rps_actual,
    ]):
        actual = dict(_MOCK_ACTUAL)
        mock_mode = True
    else:
        actual = {
            "cpu_millicores": inp.cpu_millicores_actual or estimated["cpu_millicores"],
            "ram_mb": inp.ram_mb_actual or estimated["ram_mb"],
            "storage_gb": inp.storage_gb_actual or estimated["storage_gb"],
            "network_egress_gb": inp.network_egress_gb_actual or estimated["network_egress_gb"],
            "prompt_rps": inp.prompt_rps_actual or estimated["prompt_rps"],
        }
        mock_mode = False

    accuracy: dict[str, float] = {}
    factors: dict[str, float] = {}
    for key in estimated:
        est, act = estimated[key], actual[key]
        if act > 0:
            accuracy[key] = round(100 - abs(est - act) / act * 100, 1)
            factors[key] = round(act / max(est, 0.01), 3)
        else:
            accuracy[key] = 100.0
            factors[key] = 1.0

    adjustments = []
    for key, factor in factors.items():
        if factor > 1.15:
            adjustments.append(f"Increase {key} estimate by {(factor - 1) * 100:.0f}%")
        elif factor < 0.85:
            adjustments.append(f"Decrease {key} estimate by {(1 - factor) * 100:.0f}%")
    if not adjustments:
        adjustments.append("Estimates within 15% — no correction needed.")

    return CalibrationReport(
        mock_mode=mock_mode,
        estimated=estimated,
        actual=actual,
        accuracy_pct=accuracy,
        correction_factors=factors,
        future_adjustments=adjustments,
    )
