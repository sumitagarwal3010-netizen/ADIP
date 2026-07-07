"""Shared enumerations used across ORM models and Pydantic schemas.

Stored as plain strings in the database (portable across SQLite/Postgres) but
exposed as ``str, Enum`` so both SQLAlchemy and Pydantic can validate values.
"""
from __future__ import annotations

from enum import Enum


class SdlcPhase(str, Enum):
    REQUIREMENTS = "requirements"
    ARCHITECTURE = "architecture"
    DEVELOPMENT = "development"
    TESTING = "testing"
    RELEASE = "release"
    AUDIT = "audit"


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


class Readiness(str, Enum):
    READY = "Ready"
    ON_TRACK = "On Track"
    NEEDS_ATTENTION = "Needs Attention"
    AT_RISK = "At Risk"


class RequirementType(str, Enum):
    BUSINESS = "business"
    FUNCTIONAL = "functional"
    NON_FUNCTIONAL = "non_functional"
    ASSUMPTION = "assumption"
    DEPENDENCY = "dependency"
    ACCEPTANCE_CRITERIA = "acceptance_criteria"


class RequirementStatus(str, Enum):
    DRAFT = "Draft"
    IN_REVIEW = "In Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class StoryStatus(str, Enum):
    BACKLOG = "Backlog"
    IN_PROGRESS = "In Progress"
    IN_REVIEW = "In Review"
    DONE = "Done"
    BLOCKED = "Blocked"


class TestType(str, Enum):
    FUNCTIONAL = "Functional"
    NEGATIVE = "Negative"
    REGRESSION = "Regression"
    RECONCILIATION = "Reconciliation"
    PERFORMANCE = "Performance"
    UAT = "UAT"


class TestResult(str, Enum):
    PASSED = "Passed"
    FAILED = "Failed"
    BLOCKED = "Blocked"
    NOT_RUN = "Not Run"


class DefectSeverity(str, Enum):
    S1 = "S1"
    S2 = "S2"
    S3 = "S3"
    S4 = "S4"


class ReleaseStatus(str, Enum):
    PLANNED = "Planned"
    IN_PROGRESS = "In Progress"
    DEPLOYED = "Deployed"
    ROLLED_BACK = "Rolled Back"
    ON_HOLD = "On Hold"


class GoLiveVerdict(str, Enum):
    GO = "Go"
    CONDITIONAL_GO = "Conditional Go"
    NO_GO = "No-Go"


class ApprovalStatus(str, Enum):
    DRAFT = "Draft"
    PENDING_REVIEW = "Pending Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"


class ArtifactType(str, Enum):
    BRD = "BRD"
    FRD = "FRD"
    ARCHITECTURE_DOCUMENT = "Architecture Document"
    API_SPECIFICATION = "API Specification"
    DATA_MODEL = "Data Model"
    TEST_PLAN = "Test Plan"
    TEST_CASES = "Test Cases"
    DEPLOYMENT_GUIDE = "Deployment Guide"
    GO_LIVE_CHECKLIST = "Go Live Checklist"
    AUDIT_CHECKLIST = "Audit Checklist"
    COMPLIANCE_MATRIX = "Compliance Matrix"
    EXECUTIVE_SUMMARY = "Executive Summary"


class CopilotType(str, Enum):
    REQUIREMENT = "Requirement Copilot"
    ARCHITECTURE = "Architecture Copilot"
    DEVELOPMENT = "Development Copilot"
    TESTING = "Testing Copilot"
    RELEASE = "Release Copilot"
    GO_LIVE = "Go-Live Copilot"
    AUDIT = "Audit Copilot"
    EXECUTIVE_ADVISOR = "Executive AI Advisor"


class RiskStatus(str, Enum):
    OPEN = "Open"
    MITIGATING = "Mitigating"
    CLOSED = "Closed"
    ACCEPTED = "Accepted"


class ComplianceStatus(str, Enum):
    COMPLIANT = "Compliant"
    PARTIAL = "Partial"
    NON_COMPLIANT = "Non-Compliant"
    NOT_ASSESSED = "Not Assessed"


class ProjectStatus(str, Enum):
    ON_TRACK = "On Track"
    AT_RISK = "At Risk"
    DELAYED = "Delayed"
    COMPLETED = "Completed"


class NotificationLevel(str, Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
