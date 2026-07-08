"""Enterprise connector type definitions."""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class ConnectorCategory(str, Enum):
    ALM = "alm"
    COLLABORATION = "collaboration"
    SECURITY = "security"
    CLOUD = "cloud"
    IDENTITY = "identity"


class ConnectorStatus(str, Enum):
    ENABLED = "enabled"
    DISABLED = "disabled"
    ERROR = "error"
    MOCK = "mock"


class RunStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    DRY_RUN = "dry_run"


class Severity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"


@dataclass
class ConnectorCapability:
    supports_sync: bool = True
    supports_pagination: bool = True
    supports_dry_run: bool = True
    asset_types: list[str] = field(default_factory=list)
    finding_types: list[str] = field(default_factory=list)


@dataclass
class ConnectorHealth:
    healthy: bool
    message: str
    latency_ms: float = 0.0
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class ConnectorTestResult:
    ok: bool
    message: str
    latency_ms: float = 0.0
    mock: bool = False
    dry_run: bool = False


@dataclass
class SyncPage:
    items: list[dict[str, Any]]
    next_cursor: str | None = None
    total: int | None = None


@dataclass
class SyncResult:
    status: RunStatus
    assets_synced: int = 0
    findings_synced: int = 0
    errors: list[str] = field(default_factory=list)
    mock: bool = False
    dry_run: bool = False
    details: dict[str, Any] = field(default_factory=dict)
