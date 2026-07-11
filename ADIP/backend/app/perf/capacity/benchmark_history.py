"""Benchmark history store — in-process trend tracking."""
from __future__ import annotations

import threading
from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.schemas.capacity_planning import BenchmarkHistoryEntry, BenchmarkHistoryReport, CapacityPlanningReport


@dataclass
class BenchmarkHistoryStore:
    _entries: list[BenchmarkHistoryEntry] = field(default_factory=list)
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)
    _max: int = 100

    def record(self, report: CapacityPlanningReport) -> None:
        entry = BenchmarkHistoryEntry(
            timestamp=report.generated_at or datetime.now(timezone.utc).isoformat(),
            profile=report.profile,
            monthly_cost_usd=report.costs.monthly_total_usd,
            storage_gb_year=round(report.object_storage.storage_per_year_bytes / 1e9, 3),
            database_gb_year=report.database_growth.cloud_sql_gb_year,
            gke_nodes=report.gke.get("node_count_est", 0),
        )
        with self._lock:
            self._entries.append(entry)
            if len(self._entries) > self._max:
                self._entries = self._entries[-self._max:]

    def report(self) -> BenchmarkHistoryReport:
        with self._lock:
            entries = list(self._entries)
        if len(entries) < 2:
            return BenchmarkHistoryReport(
                entries=entries,
                cost_drift_pct=0.0,
                storage_drift_pct=0.0,
                capacity_drift_pct=0.0,
                trend="insufficient_data",
            )
        first, last = entries[0], entries[-1]
        cost_drift = ((last.monthly_cost_usd - first.monthly_cost_usd) / max(first.monthly_cost_usd, 1)) * 100
        storage_drift = ((last.storage_gb_year - first.storage_gb_year) / max(first.storage_gb_year, 0.01)) * 100
        cap_drift = ((last.gke_nodes - first.gke_nodes) / max(first.gke_nodes, 1)) * 100
        trend = "growing" if cost_drift > 5 else "stable" if abs(cost_drift) <= 5 else "declining"
        return BenchmarkHistoryReport(
            entries=entries,
            cost_drift_pct=round(cost_drift, 2),
            storage_drift_pct=round(storage_drift, 2),
            capacity_drift_pct=round(cap_drift, 2),
            trend=trend,
        )


benchmark_history = BenchmarkHistoryStore()
