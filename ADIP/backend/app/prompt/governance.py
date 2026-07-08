"""Prompt governance utilities — fingerprint, lineage, replay (Role 3)."""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.llm.prompt_log import PromptLogEntry, prompt_log
from app.llm.runtime import compress_prompt


@dataclass
class PromptFingerprint:
    hash: str
    length: int
    compressed_length: int
    token_estimate: int


@dataclass
class PromptLineageNode:
    id: str
    parent_id: str | None
    version: str
    fingerprint: str
    created_at: str


@dataclass
class PromptAuditRecord:
    fingerprint: PromptFingerprint
    entry: PromptLogEntry
    lineage: list[PromptLineageNode] = field(default_factory=list)


def fingerprint_prompt(prompt: str) -> PromptFingerprint:
    compressed = compress_prompt(prompt)
    digest = hashlib.sha256(compressed.encode()).hexdigest()
    return PromptFingerprint(
        hash=digest,
        length=len(prompt),
        compressed_length=len(compressed),
        token_estimate=max(1, len(compressed) // 4),
    )


class PromptGovernance:
    """In-process prompt audit, replay and lineage (no new DB tables)."""

    def __init__(self) -> None:
        self._lineage: dict[str, PromptLineageNode] = {}

    def record_version(self, prompt: str, version: str, parent_id: str | None = None) -> PromptLineageNode:
        fp = fingerprint_prompt(prompt)
        node_id = fp.hash[:16]
        node = PromptLineageNode(
            id=node_id,
            parent_id=parent_id,
            version=version,
            fingerprint=fp.hash,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self._lineage[node_id] = node
        return node

    def replay_recent(self, limit: int = 20) -> list[dict]:
        return [
            {
                "prompt_preview": e.prompt[:120],
                "provider": e.provider,
                "model": e.model,
                "latency_ms": e.latency_ms,
                "ok": e.ok,
                "at": e.at.isoformat(),
            }
            for e in prompt_log.recent(limit)
        ]

    def audit_history(self, limit: int = 20) -> list[PromptAuditRecord]:
        records: list[PromptAuditRecord] = []
        for entry in prompt_log.recent(limit):
            fp = fingerprint_prompt(entry.prompt)
            lineage = [n for n in self._lineage.values() if n.fingerprint == fp.hash]
            records.append(PromptAuditRecord(fingerprint=fp, entry=entry, lineage=lineage))
        return records

    def export_lineage(self) -> str:
        return json.dumps([n.__dict__ for n in self._lineage.values()], indent=2)


prompt_governance = PromptGovernance()
