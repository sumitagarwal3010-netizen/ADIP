"""Enterprise load generator — extends perf.harness patterns."""
from __future__ import annotations

import time
from concurrent.futures import ThreadPoolExecutor

from app.schemas.capacity_planning import LoadTestResult

CONCURRENCY_LEVELS = [1, 10, 50, 100, 250, 500, 1000, 5000]

SCENARIOS: dict[str, str] = {
    "prompt_execution": "POST /api/v1/llm/smoke-test",
    "artifact_generation": "GET /api/v1/artifact-generation/projects/1/generate?artifact_type=BRD",
    "connector_sync": "POST /api/v1/llm/smoke-test",
    "rule_engine": "POST /api/v1/rules/run",
    "prompt_regression": "POST /api/v1/prompt-regression/run-golden?limit=2",
    "traceability": "GET /api/v1/traceability/projects/1/matrix",
}


def _get_client():
    from fastapi.testclient import TestClient
    from app.main import app
    return TestClient(app)


def _percentile(values: list[float], pct: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    k = max(0, min(len(ordered) - 1, int(round((pct / 100) * (len(ordered) - 1)))))
    return round(ordered[k], 2)


def _run_one(client, scenario: str) -> tuple[float, bool]:
    t0 = time.perf_counter()
    ok = False
    try:
        if scenario == "prompt_execution":
            ok = client.post("/api/v1/llm/smoke-test").status_code == 200
        elif scenario == "artifact_generation":
            ok = client.get("/api/v1/artifact-generation/projects/1/generate",
                            params={"artifact_type": "BRD"}).status_code == 200
        elif scenario == "connector_sync":
            ok = client.post("/api/v1/llm/smoke-test").status_code == 200
        elif scenario == "rule_engine":
            ok = client.post("/api/v1/rules/run", json={
                "artifact_type": "BRD",
                "artifact_content": "# BRD\n## REQ-101",
            }).status_code == 200
        elif scenario == "prompt_regression":
            ok = client.post("/api/v1/prompt-regression/run-golden?limit=2").status_code == 200
        elif scenario == "traceability":
            ok = client.get("/api/v1/traceability/projects/1/matrix").status_code == 200
        else:
            ok = client.get("/api/v1/health").status_code == 200
    except Exception:  # noqa: BLE001
        ok = False
    return (time.perf_counter() - t0) * 1000, ok


def run_load_test(
    scenario: str = "prompt_execution",
    concurrency: int = 10,
    samples: int | None = None,
) -> LoadTestResult:
    n = samples or min(concurrency * 3, 60)
    client = _get_client()
    latencies: list[float] = []
    errors = 0
    t0 = time.perf_counter()
    with ThreadPoolExecutor(max_workers=min(concurrency, 32)) as pool:
        for dt, ok in pool.map(lambda _: _run_one(client, scenario), range(n)):
            latencies.append(dt)
            if not ok:
                errors += 1
    wall = max(time.perf_counter() - t0, 1e-6)
    return LoadTestResult(
        concurrency=concurrency,
        scenario=scenario,
        samples=len(latencies),
        p50_ms=_percentile(latencies, 50),
        p95_ms=_percentile(latencies, 95),
        p99_ms=_percentile(latencies, 99),
        errors=errors,
        rps=round(len(latencies) / wall, 2),
    )


def run_load_suite(concurrency: int = 10) -> list[LoadTestResult]:
    return [run_load_test(s, concurrency) for s in SCENARIOS]
