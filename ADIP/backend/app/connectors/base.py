"""Base enterprise connector — shared execution policies."""
from __future__ import annotations

import time
from abc import ABC, abstractmethod
from typing import Any

from app.connectors.types import (
    ConnectorCapability,
    ConnectorCategory,
    ConnectorHealth,
    ConnectorTestResult,
    RunStatus,
    SyncPage,
    SyncResult,
)
from app.core.logging import get_logger
from app.core.retry import RetryPolicy

logger = get_logger("connector")


class BaseConnector(ABC):
    """Production-shaped connector foundation with mock/dry-run/retry/timeout."""

    connector_type: str
    category: ConnectorCategory
    display_name: str = ""
    description: str = ""

    def __init__(
        self,
        config: dict[str, Any] | None = None,
        *,
        mock_mode: bool = True,
        dry_run: bool = False,
        timeout_seconds: int = 30,
        max_retries: int = 2,
    ) -> None:
        self.config = config or {}
        self.mock_mode = mock_mode
        self.dry_run = dry_run
        self.timeout_seconds = timeout_seconds
        self._retry = RetryPolicy(attempts=max(1, max_retries), base_delay=0.3, max_delay=3.0)

    @property
    def capabilities(self) -> ConnectorCapability:
        return ConnectorCapability()

    def test_connection(self) -> ConnectorTestResult:
        t0 = time.perf_counter()
        if self.dry_run:
            return ConnectorTestResult(
                ok=True, message="Dry-run: connection not attempted.", dry_run=True,
                latency_ms=(time.perf_counter() - t0) * 1000,
            )
        if self.mock_mode:
            return ConnectorTestResult(
                ok=True, message=f"Mock mode: {self.connector_type} reachable.",
                mock=True, latency_ms=(time.perf_counter() - t0) * 1000,
            )
        return self._test_connection_live()

    @abstractmethod
    def _test_connection_live(self) -> ConnectorTestResult:
        """Subclass implements real connectivity (not used in mock/demo)."""

    def health_check(self) -> ConnectorHealth:
        result = self.test_connection()
        return ConnectorHealth(
            healthy=result.ok,
            message=result.message,
            latency_ms=result.latency_ms,
            details={"mock": result.mock, "dry_run": result.dry_run},
        )

    def sync(self, *, cursor: str | None = None) -> SyncResult:
        if self.dry_run:
            page = self.fetch_page(cursor)
            return SyncResult(
                status=RunStatus.DRY_RUN,
                assets_synced=len(page.items),
                dry_run=True,
                details={"cursor": cursor, "preview_count": len(page.items)},
            )
        if self.mock_mode:
            page = self.fetch_page(cursor)
            assets = [i for i in page.items if i.get("kind") != "finding"]
            findings = [i for i in page.items if i.get("kind") == "finding"]
            return SyncResult(
                status=RunStatus.SUCCESS,
                assets_synced=len(assets),
                findings_synced=len(findings),
                mock=True,
                details={"cursor": cursor},
            )
        return self._sync_live(cursor=cursor)

    def _sync_live(self, *, cursor: str | None = None) -> SyncResult:
        return SyncResult(status=RunStatus.FAILED, errors=["Live sync not configured — enable mock mode."])

    @abstractmethod
    def fetch_page(self, cursor: str | None = None) -> SyncPage:
        """Return a page of normalized items for mock/demo or live sync."""

    def audit_event(self, action: str, detail: str) -> dict[str, str]:
        logger.info("connector_audit type=%s action=%s detail=%s", self.connector_type, action, detail)
        return {"connector": self.connector_type, "action": action, "detail": detail}
