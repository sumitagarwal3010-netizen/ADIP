#!/usr/bin/env python3
"""LLM smoke test — mock mode, no external credentials."""
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
    r = client.post("/api/v1/llm/smoke-test")
    data = r.json()
    print(json.dumps(data, indent=2))
    return 0 if data.get("status") == "pass" else 1


if __name__ == "__main__":
    raise SystemExit(main())
