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

    def run_golden_mock(self, *, limit: int = 5) -> dto.GoldenRegressionReport:
        """Mock golden-dataset regression — no live LLM; uses semantic similarity heuristics."""
        from app.ml.semantic_similarity import similarity_score

        cases_data = [
            ("golden-brd-1", "Generate BRD for UPI settlement modernization", "UPI settlement BRD requirements NPCI"),
            ("golden-frd-1", "Generate FRD for beneficiary management", "beneficiary management functional requirements"),
            ("golden-hld-1", "Generate HLD for payments API", "payments API architecture microservices"),
            ("golden-test-1", "Generate test plan for release 2.4", "test plan regression integration release"),
            ("golden-audit-1", "Generate audit checklist for SOX", "audit checklist SOX control evidence"),
        ][:limit]
        cases: list[dto.GoldenRegressionCase] = []
        for case_id, prompt, reference in cases_data:
            mock_output = f"ADIP generated artifact for: {prompt}. Includes enterprise SDLC sections."
            sim = similarity_score(mock_output, reference)
            passed = sim.score >= 0.15
            cases.append(dto.GoldenRegressionCase(
                case_id=case_id, prompt=prompt, passed=passed,
                similarity_score=round(sim.score, 3),
                message="PASS" if passed else f"Low similarity {sim.score:.2f}",
            ))
        passed_n = sum(1 for c in cases if c.passed)
        verdict = f"PASS {passed_n}/{len(cases)}" if passed_n == len(cases) else f"FAIL {passed_n}/{len(cases)}"
        return dto.GoldenRegressionReport(
            total=len(cases), passed=passed_n, failed=len(cases) - passed_n,
            cases=cases, overall_verdict=verdict,
        )
