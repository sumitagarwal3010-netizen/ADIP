"""Dataset versioning (Role 5 — ML).

Content-addressed versioning for JSONL datasets: a stable SHA-256 over the
record content plus record count and a timestamp, written to a sidecar
``<name>.version.json``. Lets eval/benchmark runs pin an exact dataset version
and detect changes.
"""
from __future__ import annotations

import hashlib
import json
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path


@dataclass
class DatasetVersion:
    name: str
    record_count: int
    content_hash: str
    version_id: str  # short hash
    created_at: str
    size_bytes: int


def version_dataset(path: Path) -> DatasetVersion:
    """Compute and persist a content-addressed version for a JSONL dataset."""
    raw = path.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    record_count = sum(1 for line in raw.splitlines() if line.strip())
    version = DatasetVersion(
        name=path.name,
        record_count=record_count,
        content_hash=digest,
        version_id=digest[:12],
        created_at=datetime.now(timezone.utc).isoformat(),
        size_bytes=len(raw),
    )
    sidecar = path.with_suffix(path.suffix + ".version.json")
    sidecar.write_text(json.dumps(asdict(version), indent=2), encoding="utf-8")
    return version


def version_directory(directory: Path, pattern: str = "*.jsonl") -> list[DatasetVersion]:
    """Version every dataset in a directory; write a combined lockfile."""
    versions = [version_dataset(p) for p in sorted(directory.glob(pattern))]
    lock = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "datasets": {v.name: {"version_id": v.version_id, "records": v.record_count,
                              "content_hash": v.content_hash} for v in versions},
    }
    (directory / "datasets.lock.json").write_text(json.dumps(lock, indent=2), encoding="utf-8")
    return versions


def main() -> None:
    import argparse

    repo_root = Path(__file__).resolve().parents[3]
    default = repo_root / "docs" / "examples" / "enterprise-datasets"
    parser = argparse.ArgumentParser(description="Version ADIP JSONL datasets.")
    parser.add_argument("--dir", type=str, default=str(default))
    args = parser.parse_args()
    versions = version_directory(Path(args.dir))
    for v in versions:
        print(f"{v.name}: {v.version_id} ({v.record_count} records)")


if __name__ == "__main__":
    main()
