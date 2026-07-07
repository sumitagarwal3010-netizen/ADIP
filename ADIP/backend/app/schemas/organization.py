"""Schemas for organizational entities."""
from __future__ import annotations

from datetime import date
from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import ProjectStatus
from app.schemas.common import TimestampSchema

# --- Business Domain ---
class BusinessDomainBase(BaseModel):
    name: str = Field(max_length=120)
    code: str = Field(max_length=30)
    description: Optional[str] = None


class BusinessDomainCreate(BusinessDomainBase):
    pass


class BusinessDomainUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None


class BusinessDomainRead(BusinessDomainBase, TimestampSchema):
    id: int


# --- Project ---
class ProjectBase(BaseModel):
    name: str = Field(max_length=160)
    code: str = Field(max_length=30)
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.ON_TRACK
    health_score: int = 80
    sponsor: Optional[str] = None
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    domain_id: Optional[int] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    health_score: Optional[int] = None
    sponsor: Optional[str] = None
    start_date: Optional[date] = None
    target_date: Optional[date] = None
    domain_id: Optional[int] = None


class ProjectRead(ProjectBase, TimestampSchema):
    id: int


# --- Application ---
class ApplicationBase(BaseModel):
    name: str = Field(max_length=160)
    code: str = Field(max_length=40)
    description: Optional[str] = None
    criticality: str = "High"
    technology: Optional[str] = None
    lifecycle_state: str = "Production"
    project_id: int
    domain_id: Optional[int] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    criticality: Optional[str] = None
    technology: Optional[str] = None
    lifecycle_state: Optional[str] = None
    project_id: Optional[int] = None
    domain_id: Optional[int] = None


class ApplicationRead(ApplicationBase, TimestampSchema):
    id: int


# --- Persona ---
class PersonaBase(BaseModel):
    key: str = Field(max_length=60)
    label: str = Field(max_length=120)
    title: Optional[str] = None
    mission: Optional[str] = None
    nav_hubs: Optional[str] = None
    default_landing: Optional[str] = None


class PersonaCreate(PersonaBase):
    pass


class PersonaUpdate(BaseModel):
    key: Optional[str] = None
    label: Optional[str] = None
    title: Optional[str] = None
    mission: Optional[str] = None
    nav_hubs: Optional[str] = None
    default_landing: Optional[str] = None


class PersonaRead(PersonaBase, TimestampSchema):
    id: int


# --- Role ---
class RoleBase(BaseModel):
    name: str = Field(max_length=80)
    label: str = Field(max_length=120)
    description: Optional[str] = None


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    label: Optional[str] = None
    description: Optional[str] = None


class RoleRead(RoleBase, TimestampSchema):
    id: int


# --- User ---
class UserBase(BaseModel):
    username: str = Field(max_length=80)
    email: str = Field(max_length=200)
    full_name: str = Field(max_length=160)
    title: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    title: Optional[str] = None
    is_active: Optional[bool] = None


class UserRead(UserBase, TimestampSchema):
    id: int
