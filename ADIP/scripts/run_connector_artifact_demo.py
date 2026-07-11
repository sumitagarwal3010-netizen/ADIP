#!/usr/bin/env python3
"""Connector artifact demo — generate sample artifact from mock connectors."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _bootstrap import bootstrap

bootstrap()

from fastapi.testclient import TestClient
from app.main import app


def main() -> int:
    client = TestClient(app)
    r = client.post("/api/v1/connectors/artifacts/generate", json={
        "artifact_type": "release_readiness_report",
        "connector_types": ["jira", "sonarqube", "teams", "jenkins"],
    })
    if r.status_code != 200:
        from app.db.session import SessionLocal
        from app.services.connector_artifact_service import ConnectorArtifactService
        with SessionLocal() as db:
            art = ConnectorArtifactService(db).generate(
                artifact_type="release_readiness_report",
                connector_types=["jira", "sonarqube", "teams", "jenkins"],
            )
        data = {
            "title": art["title"],
            "quality_score": art["quality_score"],
            "source_connectors": art.get("source_connectors", ["jira", "sonarqube"]),
            "summary": art.get("summary", "Mock connector artifact"),
        }
    else:
        data = r.json()
    out = {
        "title": data.get("title"),
        "quality_score": data.get("quality_score"),
        "source_connectors": data.get("source_connectors"),
        "summary": data.get("summary"),
    }
    print(json.dumps(out, indent=2))
    out_path = Path(__file__).resolve().parents[1] / "docs" / "examples" / "performance" / "connector_artifact_demo.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(out, indent=2), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
