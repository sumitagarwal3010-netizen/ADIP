"""Connector artifact workbench service — preview, generate, explainability."""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy.orm import Session

from app.connectors.ai_context import build_evidence_links, map_records_to_traceability
from app.connectors.connector_artifact_prompts import (
    ARTIFACT_USE_CASES,
    get_use_case,
    render_prompt,
)
from app.connectors.mock_catalog import preview_for_connectors, samples_for
from app.connectors.normalizers import normalize_asset, normalize_finding
from app.connectors.registry import connector_registry
from app.core.auth_config import get_auth_settings
from app.services.connector_service import ConnectorService

# In-memory store for demo-generated artifacts (pre-MVP; no new DB table)
_GENERATED_ARTIFACTS: dict[str, dict[str, Any]] = {}


class ConnectorArtifactService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.connectors = ConnectorService(db)

    def list_use_cases(self) -> list[dict[str, Any]]:
        return [
            {
                "id": uc.id,
                "label": uc.label,
                "description": uc.description,
                "supported_connectors": list(uc.supported_connectors),
                "multi_source": uc.multi_source,
            }
            for uc in ARTIFACT_USE_CASES
        ]

    def _resolve_connector_types(self, *, connector_ids: list[int] | None, connector_types: list[str] | None) -> list[str]:
        if connector_types:
            return connector_types
        if connector_ids:
            types: list[str] = []
            for cid in connector_ids:
                row = self.connectors.get_connector(cid)
                types.append(row.connector_type)
            return types
        return []

    def preview_sources(
        self,
        *,
        artifact_type: str,
        connector_ids: list[int] | None = None,
        connector_types: list[str] | None = None,
        project_id: int = 1,
        limit: int = 20,
    ) -> dict[str, Any]:
        ctypes = self._resolve_connector_types(connector_ids=connector_ids, connector_types=connector_types)
        uc = get_use_case(artifact_type)
        if not ctypes and uc:
            ctypes = list(uc.supported_connectors)

        # Prefer synced DB data when available
        db_records: list[dict[str, Any]] = []
        for cid in connector_ids or []:
            data = self.connectors.normalized_data(cid, limit=limit)
            for a in data["assets"]:
                db_records.append(normalize_asset(a))
            for f in data["findings"]:
                db_records.append(normalize_finding(f))

        mock_records = preview_for_connectors(ctypes, artifact_type=artifact_type, limit=limit)
        records = db_records if db_records else mock_records

        auth = get_auth_settings()
        modes = set()
        for cid in connector_ids or []:
            row = self.connectors.get_connector(cid)
            modes.add("mock" if row.mock_mode else "live")
            if row.dry_run:
                modes.add("dry-run")
        if not connector_ids:
            modes.add("mock")

        return {
            "artifact_type": artifact_type,
            "connector_types": ctypes,
            "records": records[:limit],
            "total": len(records[:limit]),
            "mode": "+".join(sorted(modes)) or "mock",
            "project_id": project_id,
            "security_bypassed": auth.security_bypassed,
        }

    def preview_prompt(
        self,
        *,
        artifact_type: str,
        connector_types: list[str] | None = None,
        connector_ids: list[int] | None = None,
    ) -> dict[str, Any]:
        ctypes = self._resolve_connector_types(connector_ids=connector_ids, connector_types=connector_types)
        uc = get_use_case(artifact_type)
        if not ctypes and uc:
            ctypes = list(uc.supported_connectors)
        preview = self.preview_sources(
            artifact_type=artifact_type, connector_types=ctypes, connector_ids=connector_ids, limit=10,
        )
        lines = []
        for r in preview["records"]:
            lines.append(f"- [{r.get('connector_type', '?')}] {r.get('external_id')}: {r.get('title')}")
        source_text = "\n".join(lines) or "(no source records — sync connectors first)"
        prompt = render_prompt(artifact_type, connectors=", ".join(ctypes), source_records=source_text)
        return {
            "artifact_type": artifact_type,
            "connector_types": ctypes,
            "prompt_template_id": artifact_type,
            "prompt": prompt,
            "source_record_count": len(preview["records"]),
        }

    def _score_quality(self, records: list[dict], artifact_type: str) -> dict[str, Any]:
        if not records:
            return {"score": 0.45, "checks": ["No source records — low confidence"], "confidence": "low"}
        checks = [
            f"Source records: {len(records)}",
            "Severity normalized" if any(r.get("severity") for r in records) else "No severity data",
            "Classifications present" if any(r.get("classification") for r in records) else "Generic classifications",
            "Multi-source grounding" if len({r.get("connector_type") for r in records}) > 1 else "Single source",
        ]
        base = 0.55 + min(len(records) * 0.04, 0.25)
        if len({r.get("connector_type") for r in records}) > 1:
            base += 0.08
        if any(r.get("classification") for r in records):
            base += 0.07
        score = min(round(base, 2), 0.96)
        confidence = "high" if score >= 0.8 else "medium" if score >= 0.65 else "low"
        return {"score": score, "checks": checks, "confidence": confidence}

    def _generate_body(self, artifact_type: str, records: list[dict], ctypes: list[str]) -> str:
        uc = get_use_case(artifact_type)
        label = uc.label if uc else artifact_type.replace("_", " ").title()
        sections = [f"# {label}", "", "## Summary", ""]
        sections.append(
            f"Generated from {len(records)} connector record(s) across {', '.join(ctypes)} "
            f"using ADIP connector artifact workbench (mock LLM path)."
        )
        sections.extend(["", "## Key findings from sources", ""])
        for r in records[:8]:
            sev = f" [{r.get('severity')}]" if r.get("severity") else ""
            sections.append(f"- **{r.get('title')}** ({r.get('connector_type')}{sev}) — {r.get('classification', 'evidence')}")
        sections.extend(["", "## Traceability", ""])
        for link in map_records_to_traceability(records)[:6]:
            sections.append(f"- {link.get('label')} → {link.get('phase')} ({link.get('external_id')})")
        sections.extend(["", "## Recommendations", "", "- Review source records in Integration Center", "- Validate findings before production release"])
        return "\n".join(sections)

    def generate(
        self,
        *,
        artifact_type: str,
        connector_ids: list[int] | None = None,
        connector_types: list[str] | None = None,
        project_id: int = 1,
        dry_run: bool = False,
    ) -> dict[str, Any]:
        preview = self.preview_sources(
            artifact_type=artifact_type,
            connector_ids=connector_ids,
            connector_types=connector_types,
            project_id=project_id,
        )
        ctypes = preview["connector_types"]
        records = preview["records"]
        prompt_preview = self.preview_prompt(
            artifact_type=artifact_type, connector_types=ctypes, connector_ids=connector_ids,
        )
        quality = self._score_quality(records, artifact_type)
        artifact_id = str(uuid.uuid4())
        uc = get_use_case(artifact_type)
        title = uc.label if uc else artifact_type.replace("_", " ").title()

        body = self._generate_body(artifact_type, records, ctypes) if not dry_run else f"[DRY RUN] Would generate: {title}"

        artifact = {
            "id": artifact_id,
            "title": title,
            "artifact_type": artifact_type,
            "summary": f"Connector-grounded {title} from {len(records)} source record(s).",
            "body": body,
            "source_connectors": ctypes,
            "source_records": records,
            "prompt": prompt_preview["prompt"],
            "prompt_template_id": artifact_type,
            "quality_score": quality["score"],
            "confidence": quality["confidence"],
            "quality_checks": quality["checks"],
            "traceability": map_records_to_traceability(records),
            "evidence_links": build_evidence_links(records),
            "explainability": {
                "contributing_records": [r.get("external_id") for r in records],
                "prompt_used": prompt_preview["prompt"][:500] + "…" if len(prompt_preview["prompt"]) > 500 else prompt_preview["prompt"],
                "quality_checks": quality["checks"],
                "generation_mode": "mock_llm",
                "provider": "adip-connector-workbench",
            },
            "dry_run": dry_run,
            "mock_mode": preview["mode"] == "mock" or "mock" in preview["mode"],
            "project_id": project_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }
        if not dry_run:
            _GENERATED_ARTIFACTS[artifact_id] = artifact
        return artifact

    def get_artifact(self, artifact_id: str) -> dict[str, Any]:
        if artifact_id not in _GENERATED_ARTIFACTS:
            from app.core.exceptions import NotFoundError
            raise NotFoundError(f"Generated artifact {artifact_id} not found")
        return _GENERATED_ARTIFACTS[artifact_id]

    def validate_connector_config(self, connector_type: str, config: dict[str, Any], *, mock_mode: bool = True) -> dict[str, Any]:
        driver = connector_registry.instantiate(connector_type, config, mock_mode=mock_mode)
        if hasattr(driver, "validate_config"):
            ok, errors = driver.validate_config()
            return {"valid": ok, "errors": errors, "connector_type": connector_type}
        return {"valid": True, "errors": [], "connector_type": connector_type}

    def driver_preview(self, connector_type: str) -> dict[str, Any]:
        """Live mock preview from driver without DB."""
        driver = connector_registry.instantiate(connector_type, {}, mock_mode=True)
        page = driver.fetch_page()
        caps = driver.capabilities
        return {
            "connector_type": connector_type,
            "records": page.items,
            "total": page.total,
            "capabilities": {
                "asset_types": caps.asset_types,
                "finding_types": caps.finding_types,
                "supports_sync": caps.supports_sync,
            },
        }
