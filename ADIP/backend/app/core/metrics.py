"""Lightweight in-process metrics (Phase 16).

Dependency-free request counters and latency accumulation. Suitable for a demo
and as a seam for a real metrics backend (Prometheus) later.
"""
from __future__ import annotations

import threading
from dataclasses import dataclass, field


@dataclass
class Metrics:
    total_requests: int = 0
    total_errors: int = 0
    total_latency_ms: float = 0.0
    by_path: dict[str, int] = field(default_factory=dict)
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    def record(self, path: str, status_code: int, latency_ms: float) -> None:
        with self._lock:
            self.total_requests += 1
            self.total_latency_ms += latency_ms
            if status_code >= 500:
                self.total_errors += 1
            self.by_path[path] = self.by_path.get(path, 0) + 1

    def snapshot(self) -> dict:
        with self._lock:
            avg = (self.total_latency_ms / self.total_requests) if self.total_requests else 0.0
            top = sorted(self.by_path.items(), key=lambda kv: kv[1], reverse=True)[:10]
            return {
                "total_requests": self.total_requests,
                "total_errors": self.total_errors,
                "avg_latency_ms": round(avg, 2),
                "top_paths": [{"path": p, "count": c} for p, c in top],
            }

    def prometheus_format(self) -> str:
        """Render metrics in Prometheus text exposition format (v0.0.4).

        Dependency-free; a seam to later swap in prometheus_client without
        changing the /metrics/prometheus route.
        """
        with self._lock:
            avg = (self.total_latency_ms / self.total_requests) if self.total_requests else 0.0
            lines = [
                "# HELP adip_requests_total Total HTTP requests.",
                "# TYPE adip_requests_total counter",
                f"adip_requests_total {self.total_requests}",
                "# HELP adip_request_errors_total Total HTTP 5xx responses.",
                "# TYPE adip_request_errors_total counter",
                f"adip_request_errors_total {self.total_errors}",
                "# HELP adip_request_latency_ms_avg Average request latency (ms).",
                "# TYPE adip_request_latency_ms_avg gauge",
                f"adip_request_latency_ms_avg {round(avg, 2)}",
                "# HELP adip_requests_by_path_total Requests per path.",
                "# TYPE adip_requests_by_path_total counter",
            ]
            for path, count in sorted(self.by_path.items()):
                safe = path.replace('"', '\\"')
                lines.append(f'adip_requests_by_path_total{{path="{safe}"}} {count}')
        return "\n".join(lines) + "\n"


metrics = Metrics()
