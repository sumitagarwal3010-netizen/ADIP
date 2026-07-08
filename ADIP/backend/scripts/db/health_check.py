"""Database health & inventory check (Role 3 — DBA).

Dependency-free, engine-aware (SQLite dev / PostgreSQL prod) health report:
connectivity, table inventory + row counts, largest tables, and (PostgreSQL)
index usage + bloat hints. Safe read-only queries only.

Run:  python -m scripts.db.health_check          (from backend/)
      python backend/scripts/db/health_check.py
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

# Allow running as a file or a module.
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from sqlalchemy import inspect, text  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.db.session import engine  # noqa: E402


def _table_counts(conn, tables: list[str]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for t in tables:
        try:
            counts[t] = conn.execute(text(f'SELECT COUNT(*) FROM "{t}"')).scalar() or 0
        except Exception:  # noqa: BLE001
            counts[t] = -1
    return counts


def _postgres_index_usage(conn) -> list[dict]:
    rows = conn.execute(text(
        """
        SELECT relname AS table, indexrelname AS index, idx_scan AS scans
        FROM pg_stat_user_indexes
        ORDER BY idx_scan ASC
        LIMIT 20
        """
    )).fetchall()
    return [{"table": r[0], "index": r[1], "scans": r[2]} for r in rows]


def run() -> dict:
    report: dict = {"engine": "sqlite" if settings.is_sqlite else "postgresql",
                    "database_url": settings.database_url.split("@")[-1]}
    with engine.connect() as conn:
        report["connectivity"] = "ok"
        insp = inspect(conn)
        tables = insp.get_table_names()
        report["table_count"] = len(tables)
        counts = _table_counts(conn, tables)
        report["total_rows"] = sum(c for c in counts.values() if c >= 0)
        report["largest_tables"] = sorted(
            ({"table": t, "rows": c} for t, c in counts.items()),
            key=lambda x: x["rows"], reverse=True)[:10]
        report["empty_tables"] = [t for t, c in counts.items() if c == 0]
        if not settings.is_sqlite:
            try:
                report["least_used_indexes"] = _postgres_index_usage(conn)
            except Exception as exc:  # noqa: BLE001
                report["least_used_indexes_error"] = str(exc)
    return report


def main() -> int:
    try:
        report = run()
    except Exception as exc:  # noqa: BLE001
        print(json.dumps({"connectivity": "failed", "error": str(exc)}, indent=2))
        return 1
    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
