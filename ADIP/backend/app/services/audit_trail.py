"""Audit-trail service (Phase 16).

Records system/user actions into the existing ``activity_log`` table (reused —
no new table). Callers pass a session; writes are committed immediately.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.platform import ActivityLog


def record_activity(
    db: Session,
    *,
    action: str,
    actor: str = "system",
    entity_type: str | None = None,
    entity_reference: str | None = None,
    project_id: int | None = None,
    detail: str | None = None,
) -> ActivityLog:
    """Append an immutable audit-trail entry and commit it."""
    entry = ActivityLog(
        action=action,
        actor=actor,
        entity_type=entity_type,
        entity_reference=entity_reference,
        project_id=project_id,
        detail=detail,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry
