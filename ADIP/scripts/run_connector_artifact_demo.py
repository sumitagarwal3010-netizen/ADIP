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
    client.post("/api/v1/connectors/seed-defaults")
    r = client.post("/api/v1/connectors/artifacts/generate", json={
        "artifact_type": "release_readiness_report",
        "connector_types": ["jira", "sonarqube", "teams", "jenkins"],
    })
    data = r.json()
    print(json.dumps({
        "title": data.get("title"),
        "quality_score": data.get("quality_score"),
        "source_connectors": data.get("source_connectors"),
        "summary": data.get("summary"),
    }, indent=2))
    return 0 if r.status_code == 200 else 1


if __name__ == "__main__":
    raise SystemExit(main())
