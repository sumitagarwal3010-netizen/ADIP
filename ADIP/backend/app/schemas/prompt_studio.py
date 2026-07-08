"""DTOs for the Prompt Studio (Phase B)."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel

from app.schemas.common import TimestampSchema


class StudioPromptRead(TimestampSchema):
    id: int
    name: str
    description: Optional[str]
    category: str
    owner: Optional[str]
    tags: list[str]
    is_favorite: bool
    approval_status: str
    is_published: bool
    version_count: int


class TagUpdate(BaseModel):
    tags: list[str]


class FavoriteUpdate(BaseModel):
    is_favorite: bool


class ApprovalUpdate(BaseModel):
    approval_status: str  # Draft | In Review | Approved | Rejected


class PromptExport(BaseModel):
    name: str
    description: Optional[str]
    category: str
    tags: list[str]
    versions: list[dict]


class PromptImport(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "Imported"
    tags: list[str] = []
    versions: list[dict] = []


class StudioSearchResult(BaseModel):
    query: str
    total: int
    results: list[StudioPromptRead]
