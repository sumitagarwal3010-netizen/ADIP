"""Prompt regression framework (Phase D).

Compares a candidate prompt/model against a baseline across artifact score,
reviewer score, overall score, execution time and tokens, flagging regressions.
Reuses the BenchmarkService evaluation (no duplication).
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.schemas import regression as dto
from app.schemas.benchmark import BenchmarkEntry
from app.services.benchmark_service import BenchmarkService

# For "higher is better" metrics a negative delta is a regression; for
# latency/tokens ("lower is better") a positive delta beyond tolerance is.
_HIGHER_BETTER = {"prompt_score", "artifact_score", "reviewer_score", "overall_score"}
_LOWER_BETTER = {"latency_ms", "input_tokens", "output_tokens"}
_TOLERANCE = 2  # points/ms/tokens noise band


class RegressionService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.bench = BenchmarkService(db)

    def _metric(self, name: str, base: float, cand: float) -> dto.RegressionMetric:
        delta = round(cand - base, 2)
        if name in _HIGHER_BETTER:
            regressed = delta < -_TOLERANCE
        elif name in _LOWER_BETTER:
            regressed = delta > max(_TOLERANCE, base * 0.15)
        else:
            regressed = False
        return dto.RegressionMetric(metric=name, baseline=base, candidate=cand,
                                    delta=delta, regressed=regressed)

    def compare(self, request: dto.RegressionRequest) -> dto.RegressionReport:
        base: BenchmarkEntry = self.bench._evaluate(  # noqa: SLF001 (intentional reuse)
            request.baseline_label, request.baseline_prompt, request.project)
        cand: BenchmarkEntry = self.bench._evaluate(  # noqa: SLF001
            request.candidate_label, request.candidate_prompt, request.project)

        metrics = [
            self._metric("prompt_score", base.prompt_score, cand.prompt_score),
            self._metric("artifact_score", base.artifact_score, cand.artifact_score),
            self._metric("reviewer_score", base.reviewer_score, cand.reviewer_score),
            self._metric("overall_score", base.overall_score, cand.overall_score),
            self._metric("latency_ms", base.latency_ms, cand.latency_ms),
            self._metric("input_tokens", base.input_tokens, cand.input_tokens),
            self._metric("output_tokens", base.output_tokens, cand.output_tokens),
        ]
        regressions = [m.metric for m in metrics if m.regressed]
        improvements = [
            m.metric for m in metrics
            if (m.metric in _HIGHER_BETTER and m.delta > _TOLERANCE)
            or (m.metric in _LOWER_BETTER and m.delta < -_TOLERANCE)
        ]
        verdict = ("PASS — no regressions" if not regressions
                   else f"FAIL — {len(regressions)} regression(s): {', '.join(regressions)}")
        return dto.RegressionReport(
            baseline_label=request.baseline_label, candidate_label=request.candidate_label,
            metrics=metrics, overall_verdict=verdict,
            regressions=regressions, improvements=improvements,
        )
