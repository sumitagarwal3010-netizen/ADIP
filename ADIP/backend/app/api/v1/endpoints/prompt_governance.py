"""Prompt governance endpoints — replay, fingerprint, lineage (Role 3)."""
from __future__ import annotations

from fastapi import APIRouter

from app.prompt.governance import fingerprint_prompt, prompt_governance
from app.schemas.ai_engine import BaselineRequest, DriftRequest, FingerprintRequest, VersionRequest

router = APIRouter(prefix="/prompt-governance", tags=["Prompt Governance"])


@router.get("/replay")
def prompt_replay(limit: int = 20) -> dict:
    return {"entries": prompt_governance.replay_recent(limit)}


@router.get("/audit")
def prompt_audit(limit: int = 20) -> dict:
    records = prompt_governance.audit_history(limit)
    return {
        "records": [
            {
                "fingerprint": r.fingerprint.hash,
                "provider": r.entry.provider,
                "model": r.entry.model,
                "ok": r.entry.ok,
                "latency_ms": r.entry.latency_ms,
            }
            for r in records
        ]
    }


@router.post("/fingerprint")
def prompt_fingerprint(body: FingerprintRequest) -> dict:
    fp = fingerprint_prompt(body.prompt)
    return fp.__dict__


@router.post("/version")
def register_prompt_version(body: VersionRequest) -> dict:
    node = prompt_governance.record_version(body.prompt, body.version, body.parent_id)
    return node.__dict__


@router.post("/baseline")
def register_baseline(body: BaselineRequest) -> dict:
    fp = prompt_governance.set_baseline(body.key, body.prompt)
    return {"key": body.key, "fingerprint": fp.hash}


@router.post("/drift")
def detect_prompt_drift(body: DriftRequest) -> dict:
    report = prompt_governance.detect_drift(body.key, body.prompt, threshold=body.threshold)
    return report.__dict__
