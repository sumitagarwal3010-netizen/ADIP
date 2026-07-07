"""Foundational organizational entities: users, roles, domains, projects, applications."""
from __future__ import annotations

from datetime import date
from typing import Optional

from sqlalchemy import Date, ForeignKey, Integer, String, Table, Column, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import ProjectStatus

# Many-to-many association between users and roles.
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)

    users: Mapped[list["User"]] = relationship(
        secondary=user_roles, back_populates="roles"
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(160))
    is_active: Mapped[bool] = mapped_column(default=True, nullable=False)

    roles: Mapped[list[Role]] = relationship(
        secondary=user_roles, back_populates="users"
    )


class Persona(Base, TimestampMixin):
    """A platform persona (executive/role-based view configuration)."""

    __tablename__ = "personas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    key: Mapped[str] = mapped_column(String(60), unique=True, nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(160))
    mission: Mapped[Optional[str]] = mapped_column(Text)
    nav_hubs: Mapped[Optional[str]] = mapped_column(Text)  # comma-separated hub ids
    default_landing: Mapped[Optional[str]] = mapped_column(String(200))


class BusinessDomain(Base, TimestampMixin):
    __tablename__ = "business_domains"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)

    projects: Mapped[list["Project"]] = relationship(back_populates="domain")
    applications: Mapped[list["Application"]] = relationship(back_populates="domain")


class Project(Base, TimestampMixin):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    status: Mapped[ProjectStatus] = mapped_column(
        String(30), default=ProjectStatus.ON_TRACK, nullable=False
    )
    health_score: Mapped[int] = mapped_column(Integer, default=80)
    sponsor: Mapped[Optional[str]] = mapped_column(String(160))
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    target_date: Mapped[Optional[date]] = mapped_column(Date)

    domain_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("business_domains.id", ondelete="SET NULL")
    )
    domain: Mapped[Optional[BusinessDomain]] = relationship(back_populates="projects")

    applications: Mapped[list["Application"]] = relationship(
        back_populates="project", cascade="all, delete-orphan"
    )


class Application(Base, TimestampMixin):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(40), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    criticality: Mapped[str] = mapped_column(String(20), default="High")
    technology: Mapped[Optional[str]] = mapped_column(String(200))
    lifecycle_state: Mapped[str] = mapped_column(String(40), default="Production")

    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    project: Mapped[Project] = relationship(back_populates="applications")

    domain_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("business_domains.id", ondelete="SET NULL")
    )
    domain: Mapped[Optional[BusinessDomain]] = relationship(back_populates="applications")
