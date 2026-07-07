"""Knowledge (Phase 8) and Transformation (Phase 9) business services.

Reuses the generic aggregation helper; no duplicate queries.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.platform import KnowledgeArticle, TransformationProgram
from app.repositories.aggregation import fetch_all
from app.repositories.base import BaseRepository
from app.schemas import knowledge_transformation as dto


class KnowledgeService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def overview(self) -> dto.KnowledgeOverview:
        articles = fetch_all(self.db, KnowledgeArticle, sort_by="reference")
        groups: dict[str, list] = {}
        for a in articles:
            groups.setdefault(a.category, []).append(a)
        return dto.KnowledgeOverview(
            total=len(articles),
            categories=[
                dto.KnowledgeCategoryGroup(category=k, count=len(v), items=v)
                for k, v in sorted(groups.items())
            ],
        )

    def search(self, query: str, limit: int = 50) -> dto.KnowledgeSearchResult:
        # Reuse BaseRepository search over knowledge text fields.
        repo_cls = type(
            "KnowledgeSearchRepo",
            (BaseRepository,),
            {"model": KnowledgeArticle, "search_fields": ("reference", "title", "summary", "body", "tags")},
        )
        items, total = repo_cls(self.db).list(offset=0, limit=limit, search=query, sort_by="reference")
        return dto.KnowledgeSearchResult(query=query, total=total, results=items)

    def recommendations(self, project_id: int | None = None, limit: int = 5) -> dto.KnowledgeRecommendations:
        filters = {"project_id": project_id} if project_id is not None else None
        articles = fetch_all(self.db, KnowledgeArticle, filters, sort_by="reference")
        if not articles:  # fall back to global knowledge if project has none
            articles = fetch_all(self.db, KnowledgeArticle, sort_by="reference")
        recs = [
            dto.KnowledgeRecommendation(
                article_id=a.id,
                reference=a.reference,
                title=a.title,
                category=a.category,
                reason=f"Relevant {a.category.lower()} for the current delivery context.",
            )
            for a in articles[:limit]
        ]
        return dto.KnowledgeRecommendations(project_id=project_id, recommendations=recs)


class TransformationService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def portfolio(self) -> dto.TransformationPortfolio:
        programs = fetch_all(self.db, TransformationProgram, sort_by="reference")
        on_track = sum(1 for p in programs if p.status == "On Track")
        at_risk = sum(1 for p in programs if p.status in ("At Risk", "Delayed"))
        benefit = sum(p.benefit_value or 0 for p in programs)
        healths = [p.health_score for p in programs if p.health_score is not None]
        return dto.TransformationPortfolio(
            total_programs=len(programs),
            on_track=on_track,
            at_risk=at_risk,
            total_benefit_value=benefit,
            average_health=round(sum(healths) / len(healths)) if healths else 0,
            programs=programs,
        )

    def roi(self) -> dto.TransformationRoi:
        programs = fetch_all(self.db, TransformationProgram, sort_by="reference")
        items: list[dto.RoiItem] = []
        for p in programs:
            benefit = p.benefit_value or 0
            health = p.health_score or 0
            # Simple deterministic ROI index blending benefit and health.
            roi_index = round((benefit / 100) * (health / 100), 2)
            items.append(
                dto.RoiItem(
                    program_id=p.id,
                    reference=p.reference,
                    name=p.name,
                    benefit_value=benefit,
                    health_score=health,
                    status=p.status,
                    roi_index=roi_index,
                )
            )
        total_benefit = sum(i.benefit_value for i in items)
        avg_roi = round(sum(i.roi_index for i in items) / len(items), 2) if items else 0.0
        return dto.TransformationRoi(
            items=items,
            total_benefit_value=total_benefit,
            average_roi_index=avg_roi,
        )
