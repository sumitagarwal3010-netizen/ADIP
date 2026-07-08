"""Hallucination heuristics for offline evaluation (Role 5)."""
from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class HallucinationReport:
    score: float
    flags: list[str]
    confidence: float


_UNGROUNDED_PATTERNS = [
    re.compile(r"\b100% guaranteed\b", re.I),
    re.compile(r"\bzero risk\b", re.I),
    re.compile(r"\bRBI approved\b", re.I),
    re.compile(r"\bPCI Level 1 certified\b", re.I),
]


def detect_hallucinations(text: str, *, reference: str | None = None) -> HallucinationReport:
    flags: list[str] = []
    for pat in _UNGROUNDED_PATTERNS:
        if pat.search(text):
            flags.append(f"Unverified claim: {pat.pattern}")

    if reference:
        ref_tokens = set(reference.lower().split())
        claims = [w for w in text.split() if w.isdigit() and len(w) > 3]
        for c in claims:
            if c not in reference and c not in " ".join(ref_tokens):
                flags.append(f"Numeric claim not in reference: {c}")

    score = min(100.0, 10.0 * len(flags))
    confidence = max(0.0, 100.0 - score * 3)
    return HallucinationReport(score=round(score, 1), flags=flags, confidence=round(confidence, 1))
