"""Prompt injection detection and input hardening for LLM endpoints."""
from __future__ import annotations

import re
from dataclasses import dataclass

_INJECTION_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+instructions", re.I),
    re.compile(r"disregard\s+(the\s+)?(system|above)\s+prompt", re.I),
    re.compile(r"you\s+are\s+now\s+(a|an)\s+", re.I),
    re.compile(r"<\s*/?\s*system\s*>", re.I),
    re.compile(r"###\s*instruction", re.I),
    re.compile(r"jailbreak", re.I),
]

_MAX_PROMPT_CHARS = 32_000


@dataclass
class PromptSecurityReport:
    safe: bool
    risk_score: float
    flags: list[str]
    sanitized: str


def sanitize_prompt(text: str) -> str:
    """Normalize whitespace and strip null bytes; cap length."""
    cleaned = text.replace("\x00", "").strip()
    if len(cleaned) > _MAX_PROMPT_CHARS:
        cleaned = cleaned[:_MAX_PROMPT_CHARS]
    return cleaned


def assess_prompt(text: str) -> PromptSecurityReport:
    """Score prompt for injection patterns; return sanitized text."""
    sanitized = sanitize_prompt(text)
    flags: list[str] = []
    for pat in _INJECTION_PATTERNS:
        if pat.search(sanitized):
            flags.append(f"Injection pattern: {pat.pattern[:48]}")
    risk = min(100.0, len(flags) * 25.0)
    return PromptSecurityReport(
        safe=len(flags) == 0,
        risk_score=round(risk, 1),
        flags=flags,
        sanitized=sanitized,
    )
