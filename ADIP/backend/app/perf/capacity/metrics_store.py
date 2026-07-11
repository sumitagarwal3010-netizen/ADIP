"""In-process capacity planning metrics for Prometheus exposition."""
from __future__ import annotations

import threading
from dataclasses import dataclass, field


@dataclass
class CapacityMetrics:
    object_storage_gb_year: float = 0.0
    database_gb_year: float = 0.0
    monthly_cost_usd: float = 0.0
    gke_nodes: int = 0
    redis_mb: float = 0.0
    network_egress_gb_month: float = 0.0
    vector_storage_gb: float = 0.0
    prompt_throughput_rps: float = 0.0
    plan_runs: int = 0
    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    def record_plan(
        self,
        *,
        object_storage_gb_year: float,
        database_gb_year: float,
        monthly_cost_usd: float,
        gke_nodes: int,
        redis_mb: float,
        network_egress_gb_month: float,
        vector_storage_gb: float,
        prompt_throughput_rps: float = 0.0,
    ) -> None:
        with self._lock:
            self.object_storage_gb_year = object_storage_gb_year
            self.database_gb_year = database_gb_year
            self.monthly_cost_usd = monthly_cost_usd
            self.gke_nodes = gke_nodes
            self.redis_mb = redis_mb
            self.network_egress_gb_month = network_egress_gb_month
            self.vector_storage_gb = vector_storage_gb
            if prompt_throughput_rps:
                self.prompt_throughput_rps = prompt_throughput_rps
            self.plan_runs += 1

    def snapshot(self) -> dict[str, float | int]:
        with self._lock:
            return {
                "object_storage_gb_year": round(self.object_storage_gb_year, 3),
                "database_gb_year": round(self.database_gb_year, 3),
                "monthly_cost_usd": round(self.monthly_cost_usd, 2),
                "gke_nodes": self.gke_nodes,
                "redis_mb": round(self.redis_mb, 2),
                "network_egress_gb_month": round(self.network_egress_gb_month, 2),
                "vector_storage_gb": round(self.vector_storage_gb, 4),
                "prompt_throughput_rps": round(self.prompt_throughput_rps, 2),
                "plan_runs": self.plan_runs,
            }


capacity_metrics = CapacityMetrics()
