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
        try:
            from app.connectors.metrics import connector_metrics
            from app.llm.prompt_log import prompt_log
            from app.llm.runtime import llm_runtime
            pl = prompt_log.stats()
            rt = llm_runtime.snapshot()
            cm = connector_metrics.snapshot()
            lines.extend([
                "# HELP adip_prompt_executions_total Prompt log entries.",
                "# TYPE adip_prompt_executions_total counter",
                f"adip_prompt_executions_total {pl.get('total', 0)}",
                "# HELP adip_llm_inflight Current in-flight LLM requests.",
                "# TYPE adip_llm_inflight gauge",
                f"adip_llm_inflight {rt.get('inflight', 0)}",
                "# HELP adip_llm_total_cost_usd Accumulated LLM cost estimate (USD).",
                "# TYPE adip_llm_total_cost_usd counter",
                f"adip_llm_total_cost_usd {rt.get('total_cost_usd', 0)}",
                "# HELP adip_connector_run_total Connector sync runs.",
                "# TYPE adip_connector_run_total counter",
                f"adip_connector_run_total {cm.get('connector_run_total', 0)}",
                "# HELP adip_connector_run_success_total Successful connector runs.",
                "# TYPE adip_connector_run_success_total counter",
                f"adip_connector_run_success_total {cm.get('connector_run_success_total', 0)}",
            ])
            # Capacity planning gauges (estimator snapshots — updated on /capacity-planning/plan)
            from app.perf.capacity.metrics_store import capacity_metrics
            cm2 = capacity_metrics.snapshot()
            lines.extend([
                "# HELP adip_capacity_storage_gb_year Object storage estimate (GB/year).",
                "# TYPE adip_capacity_storage_gb_year gauge",
                f"adip_capacity_storage_gb_year {cm2.get('object_storage_gb_year', 0)}",
                "# HELP adip_capacity_database_gb_year Cloud SQL estimate (GB/year).",
                "# TYPE adip_capacity_database_gb_year gauge",
                f"adip_capacity_database_gb_year {cm2.get('database_gb_year', 0)}",
                "# HELP adip_capacity_monthly_cost_usd Monthly cost estimate (USD).",
                "# TYPE adip_capacity_monthly_cost_usd gauge",
                f"adip_capacity_monthly_cost_usd {cm2.get('monthly_cost_usd', 0)}",
                "# HELP adip_capacity_gke_nodes_est Estimated GKE node count.",
                "# TYPE adip_capacity_gke_nodes_est gauge",
                f"adip_capacity_gke_nodes_est {cm2.get('gke_nodes', 0)}",
                "# HELP adip_capacity_redis_mb Redis memory estimate (MB).",
                "# TYPE adip_capacity_redis_mb gauge",
                f"adip_capacity_redis_mb {cm2.get('redis_mb', 0)}",
                "# HELP adip_capacity_network_egress_gb_month Network egress (GB/month).",
                "# TYPE adip_capacity_network_egress_gb_month gauge",
                f"adip_capacity_network_egress_gb_month {cm2.get('network_egress_gb_month', 0)}",
                "# HELP adip_capacity_vector_storage_gb Vector storage estimate (GB).",
                "# TYPE adip_capacity_vector_storage_gb gauge",
                f"adip_capacity_vector_storage_gb {cm2.get('vector_storage_gb', 0)}",
                "# HELP adip_capacity_prompt_throughput_rps Prompt load-test throughput.",
                "# TYPE adip_capacity_prompt_throughput_rps gauge",
                f"adip_capacity_prompt_throughput_rps {cm2.get('prompt_throughput_rps', 0)}",
                "# HELP adip_capacity_benchmark_runs_total Capacity plan runs.",
                "# TYPE adip_capacity_benchmark_runs_total counter",
                f"adip_capacity_benchmark_runs_total {cm2.get('plan_runs', 0)}",
            ])
        except Exception:  # noqa: BLE001 - metrics must not fail scrape
            pass
        return "\n".join(lines) + "\n"


metrics = Metrics()
