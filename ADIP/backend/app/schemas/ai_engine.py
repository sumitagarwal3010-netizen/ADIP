"""Request bodies for AI engineering endpoints."""
from __future__ import annotations

from pydantic import BaseModel

from app.ai.reasoning_engine import ReasoningStrategy


class AnalyzeRequest(BaseModel):
    prompt: str
    strategy: ReasoningStrategy = ReasoningStrategy.CHAIN_OF_THOUGHT


class ReviewArtifactRequest(BaseModel):
    content: str
    artifact_type: str = "BRD"


class CompareArtifactsRequest(BaseModel):
    left: str
    right: str


class FingerprintRequest(BaseModel):
    prompt: str


class VersionRequest(BaseModel):
    prompt: str
    version: str
    parent_id: str | None = None


class BaselineRequest(BaseModel):
    key: str
    prompt: str


class DriftRequest(BaseModel):
    key: str
    prompt: str
    threshold: float = 0.85
