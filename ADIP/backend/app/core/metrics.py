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


metrics = Metrics()
