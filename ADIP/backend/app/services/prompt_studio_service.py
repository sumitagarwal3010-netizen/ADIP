"""Prompt Studio service (Phase B).

Studio operations layered on top of the existing Prompt Workbench: tagging,
favorites, approval workflow, publishing, search, cloning, rollback and
import/export. Reuses WorkbenchPrompt/Version models and the workbench service —
no duplication.
"""
from __future__ import annotations

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.models.prompt_workbench import WorkbenchPrompt, WorkbenchPromptVersion
from app.schemas import prompt_studio as dto

_APPROVAL_STATES = {"Draft", "In Review", "Approved", "Rejected"}


class PromptStudioService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _get(self, prompt_id: int) -> WorkbenchPrompt:
        p = self.db.get(WorkbenchPrompt, prompt_id)
        if p is None:
            raise NotFoundError(f"Prompt {prompt_id} not found.")
        return p

    def _version_count(self, prompt_id: int) -> int:
        return int(self.db.scalar(
            select(func.count()).select_from(WorkbenchPromptVersion).where(
                WorkbenchPromptVersion.prompt_id == prompt_id)
        ) or 0)

    def to_dto(self, p: WorkbenchPrompt) -> dto.StudioPromptRead:
        return dto.StudioPromptRead(
            id=p.id, name=p.name, description=p.description, category=p.category,
            owner=p.owner, tags=[t for t in (p.tags or "").split(",") if t],
            is_favorite=p.is_favorite, approval_status=p.approval_status,
            is_published=p.is_published, version_count=self._version_count(p.id),
            created_at=p.created_at, updated_at=p.updated_at,
        )

    # --- tagging / favorites ---
    def set_tags(self, prompt_id: int, tags: list[str]) -> WorkbenchPrompt:
        p = self._get(prompt_id)
        p.tags = ",".join(sorted({t.strip() for t in tags if t.strip()}))
        self.db.commit(); self.db.refresh(p)
        return p

    def set_favorite(self, prompt_id: int, value: bool) -> WorkbenchPrompt:
        p = self._get(prompt_id)
        p.is_favorite = value
        self.db.commit(); self.db.refresh(p)
        return p

    def list_favorites(self) -> list[WorkbenchPrompt]:
        return list(self.db.scalars(
            select(WorkbenchPrompt).where(WorkbenchPrompt.is_favorite.is_(True))
        ).all())

    # --- approval workflow / publishing ---
    def set_approval(self, prompt_id: int, status: str) -> WorkbenchPrompt:
        if status not in _APPROVAL_STATES:
            raise ValidationError(f"Invalid approval status. Allowed: {', '.join(sorted(_APPROVAL_STATES))}.")
        p = self._get(prompt_id)
        p.approval_status = status
        if status != "Approved":
            p.is_published = False
        self.db.commit(); self.db.refresh(p)
        return p

    def publish(self, prompt_id: int) -> WorkbenchPrompt:
        p = self._get(prompt_id)
        if p.approval_status != "Approved":
            raise ValidationError("Only Approved prompts can be published.")
        p.is_published = True
        self.db.commit(); self.db.refresh(p)
        return p

    # --- search ---
    def search(self, query: str, limit: int = 50) -> list[WorkbenchPrompt]:
        term = f"%{query.lower()}%"
        stmt = select(WorkbenchPrompt).where(or_(
            func.lower(WorkbenchPrompt.name).like(term),
            func.lower(WorkbenchPrompt.description).like(term),
            func.lower(WorkbenchPrompt.tags).like(term),
            func.lower(WorkbenchPrompt.category).like(term),
        )).limit(limit)
        return list(self.db.scalars(stmt).all())

    # --- cloning ---
    def clone(self, prompt_id: int) -> WorkbenchPrompt:
        src = self._get(prompt_id)
        clone = WorkbenchPrompt(
            name=f"{src.name} (copy)", description=src.description, category=src.category,
            owner=src.owner, tags=src.tags, approval_status="Draft", is_published=False,
        )
        self.db.add(clone); self.db.flush()
        for v in self.db.scalars(
            select(WorkbenchPromptVersion).where(WorkbenchPromptVersion.prompt_id == src.id)
            .order_by(WorkbenchPromptVersion.version)
        ).all():
            self.db.add(WorkbenchPromptVersion(
                prompt_id=clone.id, version=v.version, content=v.content,
                notes=v.notes, experiment=v.experiment))
        self.db.commit(); self.db.refresh(clone)
        return clone

    # --- rollback: make an older version the newest ---
    def rollback(self, prompt_id: int, version: int) -> WorkbenchPromptVersion:
        self._get(prompt_id)
        src = self.db.scalar(select(WorkbenchPromptVersion).where(
            WorkbenchPromptVersion.prompt_id == prompt_id,
            WorkbenchPromptVersion.version == version))
        if src is None:
            raise NotFoundError(f"Version {version} not found for prompt {prompt_id}.")
        new_version = self._version_count(prompt_id) + 1
        rolled = WorkbenchPromptVersion(
            prompt_id=prompt_id, version=new_version, content=src.content,
            notes=f"Rollback of v{version}", experiment=src.experiment)
        self.db.add(rolled); self.db.commit(); self.db.refresh(rolled)
        return rolled

    # --- import / export ---
    def export(self, prompt_id: int) -> dto.PromptExport:
        p = self._get(prompt_id)
        versions = self.db.scalars(
            select(WorkbenchPromptVersion).where(WorkbenchPromptVersion.prompt_id == p.id)
            .order_by(WorkbenchPromptVersion.version)).all()
        return dto.PromptExport(
            name=p.name, description=p.description, category=p.category,
            tags=[t for t in (p.tags or "").split(",") if t],
            versions=[{"version": v.version, "content": v.content, "notes": v.notes,
                       "experiment": v.experiment} for v in versions],
        )

    def import_prompt(self, payload: dto.PromptImport) -> WorkbenchPrompt:
        p = WorkbenchPrompt(
            name=payload.name, description=payload.description, category=payload.category,
            tags=",".join(payload.tags), approval_status="Draft")
        self.db.add(p); self.db.flush()
        versions = payload.versions or [{"version": 1, "content": "(imported)"}]
        for i, v in enumerate(versions, start=1):
            self.db.add(WorkbenchPromptVersion(
                prompt_id=p.id, version=v.get("version", i), content=v.get("content", ""),
                notes=v.get("notes"), experiment=v.get("experiment")))
        self.db.commit(); self.db.refresh(p)
        return p
