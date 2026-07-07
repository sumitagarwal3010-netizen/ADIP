"""DTOs for Phase 8 (Knowledge) and Phase 9 (Transformation) business APIs."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel

from app.schemas.platform import KnowledgeArticleRead, TransformationProgramRead


# --- Knowledge ---
class KnowledgeCategoryGroup(BaseModel):
    category: str
    count: int
    items: list[KnowledgeArticleRead]


class KnowledgeOverview(BaseModel):
    total: int
    categories: list[KnowledgeCategoryGroup]


class KnowledgeSearchResult(BaseModel):
    query: str
    total: int
    results: list[KnowledgeArticleRead]


class KnowledgeRecommendation(BaseModel):
    article_id: int
    reference: str
    title: str
    category: str
    reason: str


class KnowledgeRecommendations(BaseModel):
    project_id: Optional[int]
    recommendations: list[KnowledgeRecommendation]


# --- Transformation ---
class TransformationPortfolio(BaseModel):
    total_programs: int
    on_track: int
    at_risk: int
    total_benefit_value: int
    average_health: int
    programs: list[TransformationProgramRead]


class RoiItem(BaseModel):
    program_id: int
    reference: str
    name: str
    benefit_value: int
    health_score: int
    status: str
    roi_index: float


class TransformationRoi(BaseModel):
    items: list[RoiItem]
    total_benefit_value: int
    average_roi_index: float
