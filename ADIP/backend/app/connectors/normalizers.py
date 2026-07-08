"""Normalize connector payloads into ADIP evidence/artifact/traceability views."""
from __future__ import annotations

from app.connectors.types import Severity


def normalize_severity(raw: str | None) -> str:
    if not raw:
        return Severity.INFO.value
    val = raw.lower()
    for sev in Severity:
        if sev.value in val or val == sev.name.lower():
            return sev.value
    return Severity.MEDIUM.value


def normalize_finding(item: dict) -> dict:
    return {
        "external_id": item.get("external_id"),
        "title": item.get("title", "Finding"),
        "severity": normalize_severity(item.get("severity")),
        "connector_type": item.get("connector_type"),
        "source": item.get("connector_type"),
        "project_id": item.get("project_id", 1),
        "description": item.get("description", item.get("title", "")),
        "status": "open",
    }


def normalize_asset(item: dict) -> dict:
    return {
        "external_id": item.get("external_id"),
        "title": item.get("title", "Asset"),
        "kind": item.get("kind", "asset"),
        "connector_type": item.get("connector_type"),
        "project_id": item.get("project_id", 1),
        "metadata": {k: v for k, v in item.items() if k not in {"kind", "title", "external_id"}},
    }


def normalize_evidence(item: dict) -> dict:
    asset = normalize_asset(item)
    asset["evidence_type"] = "connector_sync"
    return asset


def partition_sync_items(items: list[dict]) -> tuple[list[dict], list[dict]]:
    assets, findings = [], []
    for item in items:
        if item.get("kind") == "finding":
            findings.append(normalize_finding(item))
        else:
            assets.append(normalize_asset(item))
    return assets, findings
