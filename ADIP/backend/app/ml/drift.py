"""Drift detection (Role 5 — ML).

Dependency-free distribution-drift checks between a baseline and a candidate set
of metric samples (e.g. quality scores across two evaluation runs / model
versions). Uses mean shift and the Population Stability Index (PSI), a standard
model-monitoring metric.
"""
from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass
class DriftMetric:
    metric: str
    baseline_mean: float
    candidate_mean: float
    mean_shift: float
    psi: float
    drift: bool


@dataclass
class DriftReport:
    metrics: list[DriftMetric]
    drift_detected: bool
    summary: str


def _mean(xs: list[float]) -> float:
    return sum(xs) / len(xs) if xs else 0.0


def _population_stability_index(baseline: list[float], candidate: list[float],
                                bins: int = 10) -> float:
    """PSI over equal-width bins across the combined value range.

    PSI < 0.1 = no significant shift; 0.1–0.25 = moderate; > 0.25 = major shift.
    """
    if not baseline or not candidate:
        return 0.0
    lo = min(min(baseline), min(candidate))
    hi = max(max(baseline), max(candidate))
    if hi == lo:
        return 0.0
    width = (hi - lo) / bins

    def dist(xs: list[float]) -> list[float]:
        counts = [0] * bins
        for x in xs:
            idx = min(bins - 1, int((x - lo) / width))
            counts[idx] += 1
        total = len(xs)
        # Laplace smoothing to avoid log(0).
        return [(c + 1e-6) / (total + bins * 1e-6) for c in counts]

    b = dist(baseline)
    c = dist(candidate)
    return sum((c_i - b_i) * math.log(c_i / b_i) for b_i, c_i in zip(b, c))


def detect_drift(baseline: dict[str, list[float]], candidate: dict[str, list[float]],
                 *, psi_threshold: float = 0.25, mean_shift_pct: float = 0.15) -> DriftReport:
    """Compare per-metric sample lists and flag drift.

    ``baseline``/``candidate`` map a metric name to a list of samples.
    """
    metrics: list[DriftMetric] = []
    for name in sorted(set(baseline) & set(candidate)):
        b_vals, c_vals = baseline[name], candidate[name]
        bm, cm = _mean(b_vals), _mean(c_vals)
        shift = (cm - bm)
        rel_shift = abs(shift) / bm if bm else 0.0
        psi = _population_stability_index(b_vals, c_vals)
        drift = psi > psi_threshold or rel_shift > mean_shift_pct
        metrics.append(DriftMetric(metric=name, baseline_mean=round(bm, 3),
                                   candidate_mean=round(cm, 3), mean_shift=round(shift, 3),
                                   psi=round(psi, 4), drift=drift))
    drifted = [m.metric for m in metrics if m.drift]
    return DriftReport(
        metrics=metrics,
        drift_detected=bool(drifted),
        summary=("No significant drift detected." if not drifted
                 else f"Drift detected in: {', '.join(drifted)}."),
    )
