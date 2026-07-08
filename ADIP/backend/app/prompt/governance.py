"""Prompt governance utilities — fingerprint, lineage, replay, drift (Role 3)."""
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.llm.prompt_log import PromptLogEntry, prompt_log
from app.llm.runtime import compress_prompt
from app.ml.semantic_similarity import similarity_score


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


@dataclass
class PromptDriftReport:
    baseline_fingerprint: str
    candidate_fingerprint: str
    similarity: float
    drift_detected: bool
    summary: str


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
    """In-process prompt audit, replay, lineage and drift detection."""

    def __init__(self) -> None:
        self._lineage: dict[str, PromptLineageNode] = {}
        self._baselines: dict[str, str] = {}

    def set_baseline(self, key: str, prompt: str) -> PromptFingerprint:
        fp = fingerprint_prompt(prompt)
        self._baselines[key] = fp.hash
        return fp

    def detect_drift(self, key: str, prompt: str, *, threshold: float = 0.85) -> PromptDriftReport:
        """Compare a prompt against a registered baseline by fingerprint and semantics."""
        baseline_hash = self._baselines.get(key)
        candidate_fp = fingerprint_prompt(prompt)
        if not baseline_hash:
            return PromptDriftReport(
                baseline_fingerprint="",
                candidate_fingerprint=candidate_fp.hash,
                similarity=0.0,
                drift_detected=False,
                summary=f"No baseline registered for key '{key}'.",
            )
        exact_match = baseline_hash == candidate_fp.hash
        if exact_match:
            return PromptDriftReport(
                baseline_fingerprint=baseline_hash,
                candidate_fingerprint=candidate_fp.hash,
                similarity=1.0,
                drift_detected=False,
                summary="Exact fingerprint match — no drift.",
            )
        baseline_text = next(
            (e.prompt for e in prompt_log.recent(200) if fingerprint_prompt(e.prompt).hash == baseline_hash),
            "",
        )
        sim = similarity_score(prompt, baseline_text).score if baseline_text else 0.0
        drift = sim < threshold
        return PromptDriftReport(
            baseline_fingerprint=baseline_hash,
            candidate_fingerprint=candidate_fp.hash,
            similarity=round(sim, 4),
            drift_detected=drift,
            summary=("Semantic drift detected." if drift else "Minor variation within tolerance."),
        )

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
