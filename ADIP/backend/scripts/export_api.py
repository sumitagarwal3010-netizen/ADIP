"""Export OpenAPI spec + a Postman collection (Role 14 — API Engineer).

Generates, from the live FastAPI app:
  - docs/10_API/openapi.json          (the OpenAPI 3.1 spec)
  - docs/10_API/ADIP.postman_collection.json

The Postman collection is derived from the OpenAPI paths so it stays in sync with
the API. A `baseUrl` collection variable defaults to http://localhost:8000.

Run:  python -m scripts.export_api          (from backend/)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.config import settings  # noqa: E402
from app.main import app  # noqa: E402

_REPO_ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = _REPO_ROOT / "docs" / "10_API"


def _postman_from_openapi(spec: dict) -> dict:
    prefix = settings.api_v1_prefix
    # Group requests by their first path segment after the API prefix.
    folders: dict[str, list] = {}
    for path, methods in spec.get("paths", {}).items():
        seg = path[len(prefix):].strip("/").split("/")[0] if path.startswith(prefix) else \
            path.strip("/").split("/")[0]
        group = seg or "root"
        for method, op in methods.items():
            if method not in {"get", "post", "put", "patch", "delete"}:
                continue
            # Convert {param} to Postman :param in the display URL, keep raw for variables.
            raw_path = path
            url_path = [p for p in path.strip("/").split("/")]
            item = {
                "name": op.get("summary") or f"{method.upper()} {path}",
                "request": {
                    "method": method.upper(),
                    "header": [{"key": "Content-Type", "value": "application/json"}],
                    "url": {
                        "raw": "{{baseUrl}}" + raw_path,
                        "host": ["{{baseUrl}}"],
                        "path": url_path,
                    },
                    "description": op.get("description", ""),
                },
            }
            if method in {"post", "put", "patch"}:
                item["request"]["body"] = {
                    "mode": "raw",
                    "raw": "{\n  \n}",
                    "options": {"raw": {"language": "json"}},
                }
            folders.setdefault(group, []).append(item)

    return {
        "info": {
            "name": "ADIP API",
            "description": "Auto-generated from the ADIP OpenAPI spec.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
        },
        "variable": [{"key": "baseUrl", "value": "http://localhost:8000"}],
        "item": [{"name": name, "item": items} for name, items in sorted(folders.items())],
    }


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    spec = app.openapi()
    (OUT_DIR / "openapi.json").write_text(json.dumps(spec, indent=2), encoding="utf-8")
    collection = _postman_from_openapi(spec)
    (OUT_DIR / "ADIP.postman_collection.json").write_text(
        json.dumps(collection, indent=2), encoding="utf-8")
    n_paths = len(spec.get("paths", {}))
    n_requests = sum(len(f["item"]) for f in collection["item"])
    print(f"OpenAPI: {n_paths} paths -> openapi.json")
    print(f"Postman: {n_requests} requests in {len(collection['item'])} folders -> ADIP.postman_collection.json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
