"""Semantic similarity scoring without external ML dependencies.

Uses character n-gram Jaccard and token overlap for grounding checks,
artifact comparison, and prompt regression detection.
"""
from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass
class SimilarityReport:
    score: float
    jaccard: float
    token_overlap: float
    grounded: bool


def _tokenize(text: str) -> set[str]:
    return {t.lower() for t in re.findall(r"[a-zA-Z0-9]{2,}", text)}


def _char_ngrams(text: str, n: int = 3) -> set[str]:
    t = re.sub(r"\s+", " ", text.lower().strip())
    if len(t) < n:
        return {t} if t else set()
    return {t[i : i + n] for i in range(len(t) - n + 1)}


def jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)


def similarity_score(candidate: str, reference: str, *, threshold: float = 0.35) -> SimilarityReport:
    """Compare candidate text against a reference for grounding."""
    tok_a, tok_b = _tokenize(candidate), _tokenize(reference)
    ng_a, ng_b = _char_ngrams(candidate), _char_ngrams(reference)
    tok_j = jaccard(tok_a, tok_b)
    ng_j = jaccard(ng_a, ng_b)
    score = round(0.6 * tok_j + 0.4 * ng_j, 4)
    return SimilarityReport(
        score=score,
        jaccard=round(ng_j, 4),
        token_overlap=round(tok_j, 4),
        grounded=score >= threshold,
    )
