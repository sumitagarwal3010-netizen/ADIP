"""Enterprise connector service layer."""
from __future__ import annotations

import json
import time
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.connectors.metrics import connector_metrics
from app.connectors.normalizers import partition_sync_items
from app.connectors.registry import connector_registry
from app.connectors.types import RunStatus
from app.core.auth_config import get_auth_settings
from app.core.exceptions import NotFoundError
from app.models.connectors import (
    ConnectorAsset,
    ConnectorCredentialRef,
    ConnectorError,
    ConnectorFinding,
    ConnectorRun,
    EnterpriseConnector,
)


class ConnectorService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_catalog(self) -> list:
        return connector_registry.list_definitions()

    def list_connectors(self, *, project_id: int | None = None) -> list[EnterpriseConnector]:
        q = select(EnterpriseConnector).order_by(EnterpriseConnector.id)
        if project_id is not None:
            q = q.where(EnterpriseConnector.project_id == project_id)
        return list(self.db.scalars(q).all())

    def get_connector(self, connector_id: int) -> EnterpriseConnector:
        row = self.db.get(EnterpriseConnector, connector_id)
        if row is None:
            raise NotFoundError(f"Connector {connector_id} not found")
        return row

    def create_connector(self, data: dict[str, Any]) -> EnterpriseConnector:
        defn = connector_registry.get_definition(data["connector_type"])
        if defn is None:
            raise ValueError(f"Unknown connector type: {data['connector_type']}")
        row = EnterpriseConnector(
            connector_type=data["connector_type"],
            name=data["name"],
            category=defn.category.value,
            status="mock" if data.get("mock_mode", True) else "enabled",
            enabled=data.get("enabled", True),
            mock_mode=data.get("mock_mode", True),
            dry_run=data.get("dry_run", False),
            config_json=json.dumps(data.get("config") or {}),
            project_id=data.get("project_id", 1),
        )
        self.db.add(row)
        self.db.flush()
        for cref in data.get("credential_refs") or []:
            self.db.add(ConnectorCredentialRef(
                connector_id=row.id,
                ref_type=cref.get("ref_type", "env_var"),
                ref_key=cref["ref_key"],
                label=cref.get("label"),
            ))
        self.db.commit()
        self.db.refresh(row)
        return row

    def update_connector(self, connector_id: int, data: dict[str, Any]) -> EnterpriseConnector:
        row = self.get_connector(connector_id)
        for key in ("name", "enabled", "mock_mode", "dry_run", "status"):
            if key in data and data[key] is not None:
                setattr(row, key, data[key])
        if "config" in data and data["config"] is not None:
            row.config_json = json.dumps(data["config"])
        self.db.commit()
        self.db.refresh(row)
        return row

    def _driver(self, row: EnterpriseConnector):
        config = json.loads(row.config_json or "{}")
        return connector_registry.instantiate(
            row.connector_type, config, mock_mode=row.mock_mode, dry_run=row.dry_run,
        )

    def test_connection(self, connector_id: int) -> dict:
        row = self.get_connector(connector_id)
        result = self._driver(row).test_connection()
        row.last_health_at = datetime.now(timezone.utc)
        row.last_health_status = "healthy" if result.ok else "unhealthy"
        self.db.commit()
        return result.__dict__

    def health(self, connector_id: int) -> dict:
        row = self.get_connector(connector_id)
        health = self._driver(row).health_check()
        row.last_health_at = datetime.now(timezone.utc)
        row.last_health_status = "healthy" if health.healthy else "unhealthy"
        self.db.commit()
        return health.__dict__

    def sync(self, connector_id: int) -> ConnectorRun:
        row = self.get_connector(connector_id)
        if not row.enabled:
            raise ValueError("Connector is disabled")
        driver = self._driver(row)
        t0 = time.perf_counter()
        run = ConnectorRun(connector_id=row.id, status=RunStatus.RUNNING.value, dry_run=row.dry_run, mock=row.mock_mode)
        self.db.add(run)
        self.db.flush()
        try:
            page = driver.fetch_page()
            sync_result = driver.sync()
            assets, findings = partition_sync_items(page.items)
            for a in assets:
                self.db.add(ConnectorAsset(
                    connector_id=row.id, external_id=a["external_id"], title=a["title"],
                    kind=a.get("kind", "asset"), project_id=a.get("project_id"), payload_json=json.dumps(a),
                ))
            for f in findings:
                self.db.add(ConnectorFinding(
                    connector_id=row.id, external_id=f["external_id"], title=f["title"],
                    severity=f.get("severity", "medium"), project_id=f.get("project_id"), payload_json=json.dumps(f),
                ))
            duration_ms = (time.perf_counter() - t0) * 1000
            run.status = sync_result.status.value
            run.assets_synced = sync_result.assets_synced or len(assets)
            run.findings_synced = sync_result.findings_synced or len(findings)
            run.duration_ms = duration_ms
            run.message = "Sync completed"
            row.last_sync_at = datetime.now(timezone.utc)
            row.status = "mock" if row.mock_mode else "enabled"
            connector_metrics.record_run(
                row.connector_type, success=True, duration_s=duration_ms / 1000,
                assets=run.assets_synced, findings=run.findings_synced,
            )
        except Exception as exc:  # noqa: BLE001
            run.status = RunStatus.FAILED.value
            run.message = str(exc)
            self.db.add(ConnectorError(connector_id=row.id, run_id=run.id, message=str(exc)))
            connector_metrics.record_run(row.connector_type, success=False, duration_s=time.perf_counter() - t0)
            connector_metrics.record_api_error()
        self.db.commit()
        self.db.refresh(run)
        return run

    def run_history(self, connector_id: int, limit: int = 20) -> list[ConnectorRun]:
        self.get_connector(connector_id)
        q = (
            select(ConnectorRun)
            .where(ConnectorRun.connector_id == connector_id)
            .order_by(ConnectorRun.id.desc())
            .limit(limit)
        )
        return list(self.db.scalars(q).all())

    def errors(self, connector_id: int, limit: int = 20) -> list[ConnectorError]:
        self.get_connector(connector_id)
        q = (
            select(ConnectorError)
            .where(ConnectorError.connector_id == connector_id)
            .order_by(ConnectorError.id.desc())
            .limit(limit)
        )
        return list(self.db.scalars(q).all())

    def normalized_data(self, connector_id: int, limit: int = 50) -> dict:
        self.get_connector(connector_id)
        assets = list(self.db.scalars(
            select(ConnectorAsset).where(ConnectorAsset.connector_id == connector_id).limit(limit)
        ))
        findings = list(self.db.scalars(
            select(ConnectorFinding).where(ConnectorFinding.connector_id == connector_id).limit(limit)
        ))
        return {
            "assets": [json.loads(a.payload_json or "{}") for a in assets],
            "findings": [json.loads(f.payload_json or "{}") for f in findings],
            "total_assets": len(assets),
            "total_findings": len(findings),
        }

    def dashboard(self) -> dict:
        auth = get_auth_settings()
        total = self.db.scalar(select(func.count()).select_from(EnterpriseConnector)) or 0
        enabled = self.db.scalar(
            select(func.count()).select_from(EnterpriseConnector).where(EnterpriseConnector.enabled.is_(True))
        ) or 0
        mock = self.db.scalar(
            select(func.count()).select_from(EnterpriseConnector).where(EnterpriseConnector.mock_mode.is_(True))
        ) or 0
        healthy = self.db.scalar(
            select(func.count()).select_from(EnterpriseConnector).where(EnterpriseConnector.last_health_status == "healthy")
        ) or 0
        since = datetime.now(timezone.utc) - timedelta(hours=24)
        runs_24h = self.db.scalar(
            select(func.count()).select_from(ConnectorRun).where(ConnectorRun.created_at >= since)
        ) or 0
        failures_24h = self.db.scalar(
            select(func.count()).select_from(ConnectorRun).where(
                ConnectorRun.created_at >= since, ConnectorRun.status == RunStatus.FAILED.value,
            )
        ) or 0
        m = connector_metrics.snapshot()
        return {
            "total_connectors": total,
            "enabled_connectors": enabled,
            "mock_connectors": mock,
            "healthy_connectors": healthy,
            "last_24h_runs": runs_24h,
            "last_24h_failures": failures_24h,
            "assets_synced_total": m["connector_assets_synced_total"],
            "findings_synced_total": m["connector_findings_synced_total"],
            "auth_mode": auth.mode.value,
            "security_bypassed": auth.security_bypassed,
        }

    def seed_defaults(self) -> int:
        """Idempotent seed of demo connectors for local prototype."""
        existing = {c.connector_type for c in self.list_connectors()}
        created = 0
        for defn in connector_registry.list_definitions():
            if defn.connector_type in existing:
                continue
            self.create_connector({
                "connector_type": defn.connector_type,
                "name": f"Demo {defn.display_name}",
                "mock_mode": True,
                "enabled": True,
                "project_id": 1,
                "config": {},
            })
            created += 1
        return created
