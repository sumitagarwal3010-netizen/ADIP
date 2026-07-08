"""Connector context builder for AI workflows (Phase 10)."""
from __future__ import annotations

import json
from typing import Any

from sqlalchemy.orm import Session

from app.connectors.normalizers import normalize_finding
from app.models.connectors import ConnectorAsset, ConnectorFinding, EnterpriseConnector
from app.services.connector_service import ConnectorService


def build_connector_prompt_context(db: Session, *, project_id: int = 1, limit: int = 10) -> str:
    """Summarize recent connector assets/findings for LLM grounding."""
    service = ConnectorService(db)
    connectors = [c for c in service.list_connectors(project_id=project_id) if c.enabled][:5]
    if not connectors:
        return "No enterprise connectors configured."
    parts = ["Enterprise connector context:"]
    for conn in connectors:
        data = service.normalized_data(conn.id, limit=limit)
        parts.append(f"- {conn.name} ({conn.connector_type}): {data['total_assets']} assets, {data['total_findings']} findings")
        for f in data["findings"][:3]:
            parts.append(f"  · [{f.get('severity', 'medium')}] {f.get('title')}")
    return "\n".join(parts)


def summarize_connector_finding(finding: dict[str, Any]) -> dict[str, Any]:
    norm = normalize_finding(finding)
    return {
        "title": norm["title"],
        "severity": norm["severity"],
        "risk_summary": f"{norm['severity'].upper()} finding from {norm.get('connector_type')}: {norm['title']}",
        "recommended_action": "Review in ADIP AI Governance / Security views",
    }


def map_finding_to_traceability(finding: dict[str, Any]) -> dict[str, Any]:
    return {
        "node_type": "security_finding",
        "external_id": finding.get("external_id"),
        "label": finding.get("title"),
        "phase": "testing",
        "evidence_source": finding.get("connector_type"),
    }


def map_asset_to_artifact(asset: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": f"{asset.get('title', 'Connector Asset')}.md",
        "artifact_type": asset.get("artifact_role", "EVIDENCE"),
        "source": asset.get("connector_type"),
        "classification": asset.get("classification"),
        "preview": json.dumps(asset, indent=2)[:500],
    }


def map_records_to_traceability(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    links = []
    for r in records:
        if r.get("kind") == "finding" or r.get("severity"):
            links.append(map_finding_to_traceability(r))
        else:
            links.append({
                "node_type": "connector_asset",
                "external_id": r.get("external_id"),
                "label": r.get("title"),
                "phase": _phase_for_classification(r.get("classification", "")),
                "evidence_source": r.get("connector_type"),
            })
    return links


def build_evidence_links(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "external_id": r.get("external_id"),
            "title": r.get("title"),
            "connector_type": r.get("connector_type"),
            "classification": r.get("classification"),
            "artifact_role": r.get("artifact_role"),
        }
        for r in records
    ]


def _phase_for_classification(classification: str) -> str:
    mapping = {
        "requirement": "requirements",
        "epic": "requirements",
        "story": "requirements",
        "architecture": "architecture",
        "design_decision": "architecture",
        "test_evidence": "testing",
        "build_failure": "testing",
        "release": "release",
        "approval": "release",
        "vulnerability": "testing",
        "policy_violation": "governance",
        "posture_finding": "governance",
    }
    return mapping.get(classification, "delivery")
