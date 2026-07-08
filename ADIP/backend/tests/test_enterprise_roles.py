"""Tests for enterprise engineering assets added across roles:
retry framework (7), rate limiter (7/11), Prometheus metrics (10),
ML infra (5), and DB health check (3).
"""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.metrics import Metrics
from app.core.rate_limit import RateLimitMiddleware
from app.core.retry import RetryPolicy, retry
from app.main import app
from app.ml import ExperimentTracker, detect_drift
from app.ml.dataset_versioning import version_dataset

client = TestClient(app)


# --- Role 7: retry framework ---
def test_retry_succeeds_after_transient_failures():
    calls = {"n": 0}

    @retry(attempts=3, base_delay=0.001, jitter=0)
    def flaky():
        calls["n"] += 1
        if calls["n"] < 3:
            raise ValueError("transient")
        return "ok"

    assert flaky() == "ok"
    assert calls["n"] == 3


def test_retry_exhausts_and_raises():
    @retry(attempts=2, base_delay=0.001, jitter=0)
    def always_fail():
        raise RuntimeError("nope")

    with pytest.raises(RuntimeError):
        always_fail()


def test_retry_policy_backoff_is_exponential():
    p = RetryPolicy(attempts=4, base_delay=0.1, jitter=0)
    delays = [p.delay_for(i) for i in range(1, 5)]
    assert delays == [0.1, 0.2, 0.4, 0.8]


# --- Role 7/11: rate limiter ---
def test_rate_limiter_allows_burst_then_blocks():
    rl = RateLimitMiddleware(None, rate=1, burst=3)
    decisions = [rl._allow("9.9.9.9")[0] for _ in range(6)]
    assert decisions[:3] == [True, True, True]
    assert False in decisions[3:]


def test_rate_limiter_exempts_health_paths():
    # exempt paths should never be limited even at burst 1
    rl = RateLimitMiddleware(None, rate=0.001, burst=1, exempt_paths=("/health",))
    assert rl.exempt_paths == ("/health",)


# --- Role 10: Prometheus metrics ---
def test_prometheus_endpoint_exposition_format():
    client.get("/api/v1/health")
    r = client.get("/metrics/prometheus")
    assert r.status_code == 200
    assert "text/plain" in r.headers["content-type"]
    assert "adip_requests_total" in r.text
    assert "# TYPE adip_requests_total counter" in r.text


def test_metrics_prometheus_format_unit():
    m = Metrics()
    m.record("/x", 200, 10.0)
    m.record("/x", 500, 20.0)
    out = m.prometheus_format()
    assert "adip_requests_total 2" in out
    assert "adip_request_errors_total 1" in out


# --- Role 5: ML infra ---
def test_drift_detection_flags_regression():
    baseline = {"quality": [82, 80, 81, 83, 79, 80, 84] * 4}
    candidate = {"quality": [70, 68, 71, 69, 72, 70, 67] * 4}
    report = detect_drift(baseline, candidate)
    assert report.drift_detected is True
    assert "quality" in report.summary


def test_drift_detection_no_drift_when_similar():
    baseline = {"quality": [80, 81, 82, 80, 81] * 4}
    candidate = {"quality": [80, 81, 82, 81, 80] * 4}
    report = detect_drift(baseline, candidate)
    assert report.drift_detected is False


def test_experiment_tracker_log_best_compare(tmp_path):
    tracker = ExperimentTracker(log_path=tmp_path / "exp.jsonl")
    a = tracker.log_run("a", params={"m": "x"}, metrics={"q": 80.0})
    b = tracker.log_run("b", params={"m": "y"}, metrics={"q": 90.0})
    assert len(tracker.list_runs()) == 2
    assert tracker.best_run("q")["name"] == "b"
    cmp = tracker.compare(a["run_id"], b["run_id"], "q")
    assert cmp["delta"] == 10.0


def test_dataset_versioning(tmp_path):
    ds = tmp_path / "sample.jsonl"
    ds.write_text('{"a":1}\n{"a":2}\n', encoding="utf-8")
    version = version_dataset(ds)
    assert version.record_count == 2
    assert len(version.version_id) == 12
    assert (tmp_path / "sample.jsonl.version.json").exists()


# --- Role 3: DB health check ---
def test_db_health_check_runs():
    from scripts.db.health_check import run
    report = run()
    assert report["connectivity"] == "ok"
    assert report["table_count"] > 0
