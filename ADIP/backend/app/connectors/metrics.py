"""Connector metrics — Prometheus-friendly counters."""
from __future__ import annotations

import threading
import time
from dataclasses import dataclass, field


@dataclass
class ConnectorMetrics:
    run_total: int = 0
    run_success_total: int = 0
    run_failure_total: int = 0
    run_duration_seconds: float = 0.0
    last_success_timestamp: float = 0.0
    assets_synced_total: int = 0
    findings_synced_total: int = 0
    api_errors_total: int = 0
    by_connector: dict[str, int] = field(default_factory=dict)
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    def record_run(self, connector_type: str, *, success: bool, duration_s: float,
                   assets: int = 0, findings: int = 0) -> None:
        with self._lock:
            self.run_total += 1
            self.run_duration_seconds += duration_s
            self.by_connector[connector_type] = self.by_connector.get(connector_type, 0) + 1
            if success:
                self.run_success_total += 1
                self.last_success_timestamp = time.time()
                self.assets_synced_total += assets
                self.findings_synced_total += findings
            else:
                self.run_failure_total += 1

    def record_api_error(self) -> None:
        with self._lock:
            self.api_errors_total += 1

    def snapshot(self) -> dict:
        with self._lock:
            return {
                "connector_run_total": self.run_total,
                "connector_run_success_total": self.run_success_total,
                "connector_run_failure_total": self.run_failure_total,
                "connector_run_duration_seconds": round(self.run_duration_seconds, 3),
                "connector_last_success_timestamp": self.last_success_timestamp,
                "connector_assets_synced_total": self.assets_synced_total,
                "connector_findings_synced_total": self.findings_synced_total,
                "connector_api_errors_total": self.api_errors_total,
                "by_connector": dict(self.by_connector),
            }

    def prometheus_lines(self) -> list[str]:
        s = self.snapshot()
        lines = [
            "# HELP adip_connector_run_total Total connector sync runs.",
            "# TYPE adip_connector_run_total counter",
            f"adip_connector_run_total {s['connector_run_total']}",
            "# HELP adip_connector_run_success_total Successful connector runs.",
            "# TYPE adip_connector_run_success_total counter",
            f"adip_connector_run_success_total {s['connector_run_success_total']}",
            "# HELP adip_connector_run_failure_total Failed connector runs.",
            "# TYPE adip_connector_run_failure_total counter",
            f"adip_connector_run_failure_total {s['connector_run_failure_total']}",
            "# HELP adip_connector_assets_synced_total Assets synced from connectors.",
            "# TYPE adip_connector_assets_synced_total counter",
            f"adip_connector_assets_synced_total {s['connector_assets_synced_total']}",
            "# HELP adip_connector_findings_synced_total Findings synced from connectors.",
            "# TYPE adip_connector_findings_synced_total counter",
            f"adip_connector_findings_synced_total {s['connector_findings_synced_total']}",
        ]
        return lines


connector_metrics = ConnectorMetrics()
