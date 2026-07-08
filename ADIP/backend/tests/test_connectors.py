"""Enterprise connector framework tests."""
from __future__ import annotations

import os

from fastapi.testclient import TestClient

from app.connectors.drivers import DRIVER_FACTORIES
from app.connectors.normalizers import normalize_finding, normalize_severity, partition_sync_items
from app.connectors.registry import connector_registry
from app.main import app

client = TestClient(app)


def test_connector_catalog_lists_all_types():
    r = client.get("/api/v1/connectors/catalog")
    assert r.status_code == 200
    types = {item["connector_type"] for item in r.json()}
    assert "jira" in types
    assert "sonarqube" in types
    assert "aws" in types
    assert len(types) == len(DRIVER_FACTORIES)


def test_seed_and_list_connectors():
    client.post("/api/v1/connectors/seed-defaults")
    r = client.get("/api/v1/connectors")
    assert r.status_code == 200
    assert len(r.json()) >= 10


def test_connector_test_and_sync_mock():
    client.post("/api/v1/connectors/seed-defaults")
    connectors = client.get("/api/v1/connectors").json()
    cid = connectors[0]["id"]
    test = client.post(f"/api/v1/connectors/{cid}/test")
    assert test.status_code == 200
    assert test.json()["ok"] is True
    sync = client.post(f"/api/v1/connectors/{cid}/sync")
    assert sync.status_code == 200
    assert sync.json()["status"] in ("success", "dry_run")


def test_connector_dashboard():
    r = client.get("/api/v1/connectors/dashboard")
    assert r.status_code == 200
    body = r.json()
    assert "security_bypassed" in body
    assert "total_connectors" in body


def test_connector_ai_context():
    r = client.get("/api/v1/connectors/ai/context")
    assert r.status_code == 200
    assert "context" in r.json()


def test_normalizers():
    items = [{"kind": "finding", "title": "X", "severity": "CRITICAL", "external_id": "1", "connector_type": "snyk"}]
    assets, findings = partition_sync_items(items)
    assert len(findings) == 1
    assert normalize_severity("CRITICAL") == "critical"


def test_jira_mock_driver():
    driver = connector_registry.instantiate("jira", mock_mode=True)
    page = driver.fetch_page()
    assert len(page.items) >= 2
    result = driver.sync()
    assert result.assets_synced + result.findings_synced >= 1


def test_auth_demo_mode_bypass(monkeypatch):
    monkeypatch.setenv("ADIP_AUTH_MODE", "demo")
    from app.core.auth_config import get_auth_settings
    get_auth_settings.cache_clear()
    s = get_auth_settings()
    assert s.security_bypassed is True
    from app.core.oidc import oidc_validator
    result = oidc_validator.validate_token(None)
    assert result.valid and result.bypassed


def test_auth_oidc_config_without_credentials(monkeypatch):
    monkeypatch.setenv("ADIP_AUTH_MODE", "oidc")
    monkeypatch.setenv("OIDC_ISSUER", "https://login.microsoftonline.com/tenant/v2.0")
    from app.core.auth_config import get_auth_settings
    get_auth_settings.cache_clear()
    s = get_auth_settings()
    assert s.mode.value == "oidc"
    assert s.security_bypassed is False
