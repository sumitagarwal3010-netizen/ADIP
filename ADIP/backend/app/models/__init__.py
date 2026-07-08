"""ORM models package.

Importing this package imports every model so that ``Base.metadata`` is fully
populated (used by ``create_all`` and Alembic autogenerate).
"""
from app.db.base_class import Base
from app.models.ai import (
    AIRecommendation,
    AIRisk,
    CopilotFinding,
    ExecutiveScore,
)
from app.models.architecture import Architecture, ArchitectureReview
from app.models.artifacts import Artifact, TraceabilityLink
from app.models.audit import AuditEvidence, AuditObservation, ComplianceRecord
from app.models.development import (
    CodeReview,
    DevelopmentStory,
    DevelopmentTask,
    SourceCodeMetadata,
)
from app.models.organization import (
    Application,
    BusinessDomain,
    Persona,
    Project,
    Role,
    User,
    user_roles,
)
from app.models.platform import (
    ActivityLog,
    KnowledgeArticle,
    Notification,
    TransformationProgram,
)
from app.models.connectors import (
    ConnectorAsset,
    ConnectorCredentialRef,
    ConnectorError,
    ConnectorFinding,
    ConnectorRun,
    EnterpriseConnector,
    IdentityProviderConfig,
)
from app.models.prompt_workbench import (
    WorkbenchPrompt,
    WorkbenchPromptVersion,
    WorkbenchRun,
)
from app.models.release import Deployment, GoLive, Release
from app.models.requirements import Requirement, RequirementAnalysis
from app.models.testing import Defect, TestCase, TestExecution

__all__ = [
    "Base",
    # organization
    "User",
    "Role",
    "user_roles",
    "Persona",
    "BusinessDomain",
    "Project",
    "Application",
    # requirements
    "Requirement",
    "RequirementAnalysis",
    # architecture
    "Architecture",
    "ArchitectureReview",
    # development
    "DevelopmentStory",
    "DevelopmentTask",
    "SourceCodeMetadata",
    "CodeReview",
    # testing
    "TestCase",
    "TestExecution",
    "Defect",
    # release
    "Release",
    "Deployment",
    "GoLive",
    # audit
    "AuditEvidence",
    "ComplianceRecord",
    "AuditObservation",
    # ai
    "CopilotFinding",
    "AIRecommendation",
    "ExecutiveScore",
    "AIRisk",
    # artifacts + traceability
    "Artifact",
    "TraceabilityLink",
    # platform
    "KnowledgeArticle",
    "TransformationProgram",
    "ActivityLog",
    "Notification",
    # prompt workbench
    "WorkbenchPrompt",
    "WorkbenchPromptVersion",
    "WorkbenchRun",
    # connectors
    "EnterpriseConnector",
    "ConnectorCredentialRef",
    "ConnectorRun",
    "ConnectorError",
    "ConnectorAsset",
    "ConnectorFinding",
    "IdentityProviderConfig",
]
