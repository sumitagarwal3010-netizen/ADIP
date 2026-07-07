"""Structured response parsing for LLM outputs (Phase A).

Best-effort extraction of structured data from free-form model text: JSON blocks
(fenced or bare) and Markdown-style section headings. Never raises — returns a
predictable structure so callers can degrade gracefully.
"""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from typing import Any, Optional

_JSON_FENCE = re.compile(r"```(?:json)?\s*(\{.*?\}|\[.*?\])\s*```", re.DOTALL)
_HEADING = re.compile(r"^\s{0,3}(#{1,6})\s+(.*)$", re.MULTILINE)


@dataclass
class ParsedResponse:
    raw: str
    json: Optional[Any] = None
    sections: dict[str, str] = field(default_factory=dict)


def extract_json(text: str) -> Optional[Any]:
    """Extract the first JSON object/array from a text blob, if any."""
    if not text:
        return None
    # 1. fenced ```json blocks
    m = _JSON_FENCE.search(text)
    candidates = [m.group(1)] if m else []
    # 2. first bare {...} or [...] span
    for opener, closer in (("{", "}"), ("[", "]")):
        start = text.find(opener)
        end = text.rfind(closer)
        if 0 <= start < end:
            candidates.append(text[start : end + 1])
    for candidate in candidates:
        try:
            return json.loads(candidate)
        except (json.JSONDecodeError, ValueError):
            continue
    return None


def extract_sections(text: str) -> dict[str, str]:
    """Split Markdown text into {heading: body} sections."""
    if not text:
        return {}
    matches = list(_HEADING.finditer(text))
    sections: dict[str, str] = {}
    for i, m in enumerate(matches):
        heading = m.group(2).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections[heading] = text[start:end].strip()
    return sections


def parse_response(text: str) -> ParsedResponse:
    """Parse an LLM response into JSON (if present) and Markdown sections."""
    return ParsedResponse(
        raw=text or "",
        json=extract_json(text or ""),
        sections=extract_sections(text or ""),
    )
