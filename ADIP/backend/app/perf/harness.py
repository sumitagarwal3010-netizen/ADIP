"""Performance framework (Phase F).

Load, stress, latency, concurrency, token- and prompt-throughput benchmarks for
the ADIP backend. Runs in-process against the FastAPI app via TestClient (no
external server / infra needed), and against the LLM runtime accounting layer.
Writes a JSON + Markdown report to docs/examples/performance/.

Run:  python -m app.perf.harness [--requests 200] [--concurrency 16]
"""
from __future__ import annotations

import argparse
import json
import statistics
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

from fastapi.testclient import TestClient

from app.main import app

_REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_OUT = _REPO_ROOT / "docs" / "examples" / "performance"


@dataclass
class LatencyStats:
    label: str
    samples: int
    min_ms: float
    p50_ms: float
    p90_ms: float
    p95_ms: float
    p99_ms: float
    max_ms: float
    mean_ms: float
    throughput_rps: float
    errors: int


def _percentile(values: list[float], pct: float) -> float:
    if not values:
        return 0.0
    ordered = sorted(values)
    k = max(0, min(len(ordered) - 1, int(round((pct / 100) * (len(ordered) - 1)))))
    return round(ordered[k], 2)


def _measure(label: str, fn, requests: int, concurrency: int) -> LatencyStats:
    latencies: list[float] = []
    errors = 0
    start = time.perf_counter()

    def one(_: int):
        t0 = time.perf_counter()
        try:
            ok = fn()
        except Exception:  # noqa: BLE001
            ok = False
        dt = (time.perf_counter() - t0) * 1000
        return dt, ok

    with ThreadPoolExecutor(max_workers=concurrency) as pool:
        for dt, ok in pool.map(one, range(requests)):
            latencies.append(dt)
            if not ok:
                errors += 1
    wall = time.perf_counter() - start
    return LatencyStats(
        label=label, samples=len(latencies),
        min_ms=round(min(latencies), 2), p50_ms=_percentile(latencies, 50),
        p90_ms=_percentile(latencies, 90), p95_ms=_percentile(latencies, 95),
        p99_ms=_percentile(latencies, 99), max_ms=round(max(latencies), 2),
        mean_ms=round(statistics.mean(latencies), 2),
        throughput_rps=round(requests / wall, 1) if wall else 0.0, errors=errors,
    )


def run(requests: int = 200, concurrency: int = 16, out_dir: Path | None = None) -> dict:
    out = out_dir or DEFAULT_OUT
    out.mkdir(parents=True, exist_ok=True)
    client = TestClient(app)

    scenarios = {
        "health_check": lambda: client.get("/api/v1/health").status_code == 200,
        "list_projects": lambda: client.get("/api/v1/projects", params={"size": 20}).status_code == 200,
        "sdlc_summary": lambda: client.get("/api/v1/sdlc/projects/1/requirements/summary").status_code == 200,
        "portfolio_health": lambda: client.get("/api/v1/analytics/portfolio-health").status_code == 200,
        "prompt_templates": lambda: client.get("/api/v1/prompt-templates/matrix").status_code == 200,
        "artifact_generate": lambda: client.get(
            "/api/v1/artifact-generation/projects/1/generate",
            params={"artifact_type": "BRD"}).status_code == 200,
    }

    results: list[LatencyStats] = []
    # Latency (low concurrency) + load (target concurrency) + stress (2x).
    for label, fn in scenarios.items():
        results.append(_measure(f"latency:{label}", fn, max(30, requests // 4), 1))
        results.append(_measure(f"load:{label}", fn, requests, concurrency))
    # Stress test on the two heaviest endpoints.
    results.append(_measure("stress:artifact_generate", scenarios["artifact_generate"],
                            requests * 2, concurrency * 2))
    results.append(_measure("stress:portfolio_health", scenarios["portfolio_health"],
                            requests * 2, concurrency * 2))

    # Token / prompt throughput via the LLM runtime accounting (mock-safe).
    from app.llm.runtime import estimate_cost
    from app.llm.tokens import estimate_tokens
    sample_prompt = "Author a Business Requirements Document for UPI Auto-Reversal. " * 40
    t0 = time.perf_counter()
    total_tokens = 0
    n_prompts = 500
    for _ in range(n_prompts):
        total_tokens += estimate_tokens(sample_prompt)
    elapsed = max(time.perf_counter() - t0, 1e-6)
    token_throughput = {
        "prompts_processed": n_prompts,
        "tokens_estimated": total_tokens,
        "prompt_throughput_per_s": round(n_prompts / elapsed, 1),
        "token_throughput_per_s": round(total_tokens / elapsed, 1),
        "sample_cost_usd_openai_equiv": estimate_cost("openai", total_tokens, 0),
    }

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "config": {"requests": requests, "concurrency": concurrency},
        "http_scenarios": [asdict(r) for r in results],
        "token_throughput": token_throughput,
        "summary": {
            "total_scenarios": len(results),
            "total_errors": sum(r.errors for r in results),
            "fastest_p95_ms": min(r.p95_ms for r in results),
            "slowest_p95_ms": max(r.p95_ms for r in results),
        },
    }
    (out / "performance_report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    _write_markdown(out / "performance_report.md", report)
    return report


def _write_markdown(path: Path, report: dict) -> None:
    lines = ["# ADIP Performance Report", "",
             f"_Generated: {report['generated_at']}_", "",
             f"Config: **{report['config']['requests']} requests**, "
             f"**{report['config']['concurrency']} concurrency**", "",
             "## HTTP Scenarios", "",
             "| Scenario | Samples | p50 (ms) | p95 (ms) | p99 (ms) | RPS | Errors |",
             "|---|--:|--:|--:|--:|--:|--:|"]
    for r in report["http_scenarios"]:
        lines.append(f"| {r['label']} | {r['samples']} | {r['p50_ms']} | {r['p95_ms']} "
                     f"| {r['p99_ms']} | {r['throughput_rps']} | {r['errors']} |")
    tt = report["token_throughput"]
    lines += ["", "## Token & Prompt Throughput", "",
              f"- Prompts processed: **{tt['prompts_processed']}**",
              f"- Prompt throughput: **{tt['prompt_throughput_per_s']}/s**",
              f"- Token throughput: **{tt['token_throughput_per_s']}/s**",
              f"- Tokens estimated: {tt['tokens_estimated']}", "",
              "## Summary", "",
              f"- Total scenarios: {report['summary']['total_scenarios']}",
              f"- Total errors: {report['summary']['total_errors']}",
              f"- Fastest p95: {report['summary']['fastest_p95_ms']} ms",
              f"- Slowest p95: {report['summary']['slowest_p95_ms']} ms", ""]
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="ADIP performance framework.")
    parser.add_argument("--requests", type=int, default=200)
    parser.add_argument("--concurrency", type=int, default=16)
    parser.add_argument("--out", type=str, default=None)
    args = parser.parse_args()
    report = run(args.requests, args.concurrency, Path(args.out) if args.out else None)
    print(f"Performance report: {report['summary']['total_scenarios']} scenarios, "
          f"{report['summary']['total_errors']} errors, "
          f"p95 {report['summary']['fastest_p95_ms']}–{report['summary']['slowest_p95_ms']} ms.")


if __name__ == "__main__":
    main()
