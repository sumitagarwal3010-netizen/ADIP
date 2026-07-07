"""Prompt quality benchmark + optimization service (Phases 3 & 4).

Benchmarks prompt versions across prompt score, artifact score, reviewer score,
latency and token estimates → an overall score, and generates/compares V1/V2/V3
prompt variants with diffs and recommendations.

Reuses PromptExecutionEngine, QualityEngine and AIReviewer — no duplication.
"""
from __future__ import annotations

import time

from sqlalchemy.orm import Session

from app.llm.tokens import estimate_tokens
from app.schemas import benchmark as dto
from app.schemas.orchestrator import OrchestrationMetadata, OrchestrationRequest
from app.services.ai_reviewer import AIReviewer
from app.services.orchestrator_service import PromptExecutionEngine
from app.services.quality_engine import QualityEngine


class BenchmarkService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.engine = PromptExecutionEngine(db)
        self.quality = QualityEngine(db)
        self.reviewer = AIReviewer(db)

    def _prompt_score(self, prompt: str) -> int:
        """Heuristic prompt-quality score: length, specificity and banking signal."""
        lc = prompt.lower()
        score = 45
        score += min(25, len(prompt) // 12)
        for kw in ("upi", "npci", "rbi", "reconcil", "audit", "reversal", "compliance",
                   "idempoten", "monitor", "security", "test"):
            if kw in lc:
                score += 3
        return min(100, score)

    def _evaluate(self, version: str, prompt: str, project: str | None) -> dto.BenchmarkEntry:
        meta = OrchestrationMetadata(project=project) if project else None
        started = time.perf_counter()
        orch = self.engine.execute(OrchestrationRequest(prompt=prompt, metadata=meta))
        latency = (time.perf_counter() - started) * 1000

        artifact_scores = [self.quality.score_artifact(a).overall_score for a in orch.artifacts] or [0]
        artifact_score = round(sum(artifact_scores) / len(artifact_scores))
        reviews = [self.reviewer.review_artifact(a).review_score for a in orch.artifacts[:5]] or [0]
        reviewer_score = round(sum(reviews) / len(reviews))
        prompt_score = self._prompt_score(prompt)
        input_tokens = estimate_tokens(prompt)
        output_tokens = sum(estimate_tokens(a.executive_summary) for a in orch.artifacts)

        overall = round(0.25 * prompt_score + 0.4 * artifact_score + 0.35 * reviewer_score)
        return dto.BenchmarkEntry(
            prompt_version=version,
            prompt=prompt,
            prompt_score=prompt_score,
            artifact_score=artifact_score,
            reviewer_score=reviewer_score,
            latency_ms=round(latency, 2),
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            overall_score=overall,
        )

    # --- Phase 3: benchmark ---
    def benchmark(self, request: dto.PromptBenchmarkRequest) -> dto.PromptBenchmarkReport:
        entries = [
            self._evaluate(f"V{i + 1}", text, request.project)
            for i, text in enumerate(request.versions)
        ]
        best = max(entries, key=lambda e: e.overall_score)
        avg = round(sum(e.overall_score for e in entries) / len(entries))
        return dto.PromptBenchmarkReport(
            entries=entries,
            best_version=best.prompt_version,
            best_overall_score=best.overall_score,
            average_overall_score=avg,
        )

    # --- Phase 4: optimization (auto V1/V2/V3) ---
    def optimize(self, request: dto.OptimizationRequest) -> dto.OptimizationResult:
        base = request.base_prompt.strip().rstrip(".")
        v1 = base + "."
        v2_add = "Include NPCI/switch reconciliation and idempotent handling."
        v3_add = "Add operational monitoring, audit trail and RBI compliance controls."
        v2 = f"{v1} {v2_add}"
        v3 = f"{v2} {v3_add}"
        versions = [("V1", v1, []), ("V2", v2, [v2_add]), ("V3", v3, [v2_add, v3_add])]

        entries = [self._evaluate(v, text, request.project) for v, text, _ in versions]
        by_version = {e.prompt_version: e for e in entries}
        diffs = [
            dto.VersionDiff(version=v, prompt=text, added=added, overall_score=by_version[v].overall_score)
            for v, text, added in versions
        ]
        best = max(entries, key=lambda e: e.overall_score)
        recommendations = [
            f"Use {best.version if hasattr(best, 'version') else best.prompt_version} "
            f"(overall {best.overall_score}).",
            "Add explicit reconciliation + idempotency detail to lift artifact quality.",
            "Add monitoring, audit and compliance controls to improve reviewer scores.",
            "Keep prompts banking-specific and regulator-aware for higher prompt scores.",
        ]
        return dto.OptimizationResult(
            entries=entries,
            diffs=diffs,
            best_version=best.prompt_version,
            recommendations=recommendations,
        )
