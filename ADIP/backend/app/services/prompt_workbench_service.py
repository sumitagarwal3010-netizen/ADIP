"""Prompt Workbench service (Phase 2).

Persistent prompt engineering: CRUD for prompts + versions, and runs that
execute a prompt through the EXISTING Prompt Execution Engine and record
quality/latency/token metrics (quality derived by reusing the artifact
validator). SQLite dev / PostgreSQL prod compatible.
"""
from __future__ import annotations

import time

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.llm.tokens import estimate_tokens
from app.models.prompt_workbench import (
    WorkbenchPrompt,
    WorkbenchPromptVersion,
    WorkbenchRun,
)
from app.schemas import prompt_workbench as dto
from app.schemas.orchestrator import OrchestrationMetadata, OrchestrationRequest
from app.services.artifact_validator import artifact_validator
from app.services.orchestrator_service import PromptExecutionEngine


def _band(score: int) -> str:
    return "Excellent" if score >= 90 else "Good" if score >= 75 else "Fair" if score >= 60 else "Poor"


class PromptWorkbenchService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.engine = PromptExecutionEngine(db)

    # --- prompts ---
    def create_prompt(self, payload: dto.WorkbenchPromptCreate) -> WorkbenchPrompt:
        prompt = WorkbenchPrompt(
            name=payload.name,
            description=payload.description,
            category=payload.category,
            owner=payload.owner,
        )
        self.db.add(prompt)
        self.db.flush()
        if payload.content:
            self.db.add(WorkbenchPromptVersion(prompt_id=prompt.id, version=1, content=payload.content))
        self.db.commit()
        self.db.refresh(prompt)
        return prompt

    def list_prompts(self) -> list[WorkbenchPrompt]:
        return list(self.db.scalars(select(WorkbenchPrompt).order_by(WorkbenchPrompt.id.desc())).all())

    def get_prompt(self, prompt_id: int) -> WorkbenchPrompt:
        p = self.db.get(WorkbenchPrompt, prompt_id)
        if p is None:
            raise NotFoundError(f"Workbench prompt {prompt_id} not found.")
        return p

    def version_count(self, prompt_id: int) -> int:
        return int(self.db.scalar(
            select(func.count()).select_from(WorkbenchPromptVersion).where(
                WorkbenchPromptVersion.prompt_id == prompt_id
            )
        ) or 0)

    # --- versions ---
    def add_version(self, prompt_id: int, payload: dto.WorkbenchVersionCreate) -> WorkbenchPromptVersion:
        self.get_prompt(prompt_id)
        next_version = self.version_count(prompt_id) + 1
        v = WorkbenchPromptVersion(
            prompt_id=prompt_id,
            version=next_version,
            content=payload.content,
            notes=payload.notes,
            experiment=payload.experiment,
        )
        self.db.add(v)
        self.db.commit()
        self.db.refresh(v)
        return v

    def list_versions(self, prompt_id: int) -> list[WorkbenchPromptVersion]:
        self.get_prompt(prompt_id)
        return list(self.db.scalars(
            select(WorkbenchPromptVersion)
            .where(WorkbenchPromptVersion.prompt_id == prompt_id)
            .order_by(WorkbenchPromptVersion.version)
        ).all())

    # --- runs ---
    def create_run(self, payload: dto.WorkbenchRunCreate) -> WorkbenchRun:
        # Resolve prompt text: explicit, else from version.
        prompt_text = payload.prompt_text
        if not prompt_text and payload.version_id is not None:
            version = self.db.get(WorkbenchPromptVersion, payload.version_id)
            if version is None:
                raise NotFoundError(f"Prompt version {payload.version_id} not found.")
            prompt_text = version.content
        if not prompt_text:
            raise NotFoundError("A prompt_text or a valid version_id is required.")

        meta = OrchestrationMetadata(project=payload.project) if payload.project else None
        started = time.perf_counter()
        run = WorkbenchRun(
            version_id=payload.version_id,
            prompt_text=prompt_text,
            reviewer_comments=payload.reviewer_comments,
        )
        try:
            orch = self.engine.execute(OrchestrationRequest(prompt=prompt_text, metadata=meta))
            latency = (time.perf_counter() - started) * 1000
            # Quality = mean artifact quality across generated artifacts (reuse validator).
            scores = [artifact_validator.validate(a).quality_score for a in orch.artifacts] or [0]
            quality = round(sum(scores) / len(scores))
            run.scenario = orch.classification.scenario
            run.project_name = orch.project.name
            run.model_used = self.engine.reasoner.name
            run.quality_score = quality
            run.output_quality = _band(quality)
            run.latency_ms = round(latency, 2)
            run.prompt_tokens = estimate_tokens(prompt_text)
            run.completion_tokens = sum(estimate_tokens(a.executive_summary) for a in orch.artifacts)
            run.artifact_coverage = len(orch.artifacts)
            run.confidence = orch.classification.confidence
        except Exception as exc:  # noqa: BLE001 - record failed run
            run.latency_ms = round((time.perf_counter() - started) * 1000, 2)
            run.error = str(exc)
            run.output_quality = "Poor"
            run.quality_score = 0
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)
        return run

    def list_runs(self, limit: int = 50) -> list[WorkbenchRun]:
        return list(self.db.scalars(
            select(WorkbenchRun).order_by(WorkbenchRun.id.desc()).limit(limit)
        ).all())

    def get_run(self, run_id: int) -> WorkbenchRun:
        r = self.db.get(WorkbenchRun, run_id)
        if r is None:
            raise NotFoundError(f"Workbench run {run_id} not found.")
        return r

    def compare(self, run_id_a: int, run_id_b: int) -> dto.WorkbenchCompareResult:
        a = self.get_run(run_id_a)
        b = self.get_run(run_id_b)
        q_delta = (b.quality_score or 0) - (a.quality_score or 0)
        verdict = (
            f"Version B is better (+{q_delta} quality)" if q_delta > 0
            else f"Version A is better ({q_delta} quality)" if q_delta < 0
            else "Both versions are equivalent in quality"
        )
        return dto.WorkbenchCompareResult(
            run_a=self._run_dto(a),
            run_b=self._run_dto(b),
            quality_delta=q_delta,
            latency_delta_ms=round((b.latency_ms or 0) - (a.latency_ms or 0), 2),
            coverage_delta=(b.artifact_coverage or 0) - (a.artifact_coverage or 0),
            confidence_delta=(b.confidence or 0) - (a.confidence or 0),
            verdict=verdict,
        )

    @staticmethod
    def _run_dto(r: WorkbenchRun) -> dto.WorkbenchRunRead:
        return dto.WorkbenchRunRead.model_validate(r)
