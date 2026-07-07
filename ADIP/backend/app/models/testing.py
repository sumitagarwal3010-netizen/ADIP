"""Testing module: test cases, test execution, defects."""
from __future__ import annotations

from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base_class import Base, TimestampMixin
from app.models.enums import DefectSeverity, TestResult, TestType


class TestCase(Base, TimestampMixin):
    """A test case, optionally traced to a requirement/story."""

    __tablename__ = "test_cases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    requirement_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("requirements.id", ondelete="SET NULL"), index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    test_type: Mapped[TestType] = mapped_column(String(30), default=TestType.FUNCTIONAL)
    steps: Mapped[Optional[str]] = mapped_column(Text)
    expected_result: Mapped[Optional[str]] = mapped_column(Text)
    is_automated: Mapped[bool] = mapped_column(Boolean, default=False)
    priority: Mapped[str] = mapped_column(String(10), default="P2")

    executions: Mapped[list["TestExecution"]] = relationship(
        back_populates="test_case", cascade="all, delete-orphan"
    )
    defects: Mapped[list["Defect"]] = relationship(
        back_populates="test_case", cascade="all, delete-orphan"
    )


class TestExecution(Base, TimestampMixin):
    """A single execution run of a test case."""

    __tablename__ = "test_execution"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    test_case_id: Mapped[int] = mapped_column(
        ForeignKey("test_cases.id", ondelete="CASCADE"), nullable=False, index=True
    )
    result: Mapped[TestResult] = mapped_column(String(20), default=TestResult.NOT_RUN)
    executed_by: Mapped[Optional[str]] = mapped_column(String(160))
    environment: Mapped[Optional[str]] = mapped_column(String(60))
    duration_seconds: Mapped[Optional[int]] = mapped_column(Integer)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    test_case: Mapped[TestCase] = relationship(back_populates="executions")


class Defect(Base, TimestampMixin):
    """A defect raised, optionally linked to a failing test case."""

    __tablename__ = "defects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    test_case_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("test_cases.id", ondelete="SET NULL"), index=True
    )
    reference: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    severity: Mapped[DefectSeverity] = mapped_column(String(10), default=DefectSeverity.S3)
    status: Mapped[str] = mapped_column(String(30), default="Open")
    description: Mapped[Optional[str]] = mapped_column(Text)

    test_case: Mapped[Optional[TestCase]] = relationship(back_populates="defects")
