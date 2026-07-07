"""Schemas for the testing module."""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.models.enums import DefectSeverity, TestResult, TestType
from app.schemas.common import TimestampSchema


class TestCaseBase(BaseModel):
    project_id: int
    requirement_id: Optional[int] = None
    reference: str = Field(max_length=40)
    title: str = Field(max_length=300)
    test_type: TestType = TestType.FUNCTIONAL
    steps: Optional[str] = None
    expected_result: Optional[str] = None
    is_automated: bool = False
    priority: str = "P2"


class TestCaseCreate(TestCaseBase):
    pass


class TestCaseUpdate(BaseModel):
    project_id: Optional[int] = None
    requirement_id: Optional[int] = None
    reference: Optional[str] = None
    title: Optional[str] = None
    test_type: Optional[TestType] = None
    steps: Optional[str] = None
    expected_result: Optional[str] = None
    is_automated: Optional[bool] = None
    priority: Optional[str] = None


class TestCaseRead(TestCaseBase, TimestampSchema):
    id: int


class TestExecutionBase(BaseModel):
    test_case_id: int
    result: TestResult = TestResult.NOT_RUN
    executed_by: Optional[str] = None
    environment: Optional[str] = None
    duration_seconds: Optional[int] = None
    notes: Optional[str] = None


class TestExecutionCreate(TestExecutionBase):
    pass


class TestExecutionUpdate(BaseModel):
    test_case_id: Optional[int] = None
    result: Optional[TestResult] = None
    executed_by: Optional[str] = None
    environment: Optional[str] = None
    duration_seconds: Optional[int] = None
    notes: Optional[str] = None


class TestExecutionRead(TestExecutionBase, TimestampSchema):
    id: int


class DefectBase(BaseModel):
    project_id: int
    test_case_id: Optional[int] = None
    reference: str = Field(max_length=40)
    title: str = Field(max_length=300)
    severity: DefectSeverity = DefectSeverity.S3
    status: str = "Open"
    description: Optional[str] = None


class DefectCreate(DefectBase):
    pass


class DefectUpdate(BaseModel):
    project_id: Optional[int] = None
    test_case_id: Optional[int] = None
    reference: Optional[str] = None
    title: Optional[str] = None
    severity: Optional[DefectSeverity] = None
    status: Optional[str] = None
    description: Optional[str] = None


class DefectRead(DefectBase, TimestampSchema):
    id: int
