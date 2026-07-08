"""Tests for enterprise engineering extensions (Roles 3–8, 15)."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.ai.reasoning_engine import ReasoningEngine, ReasoningStrategy
from app.ai.planning_engine import PlanningEngine
from app.ai.reflection_engine import ReflectionEngine
from app.ai.artifact_ops import ArtifactReviewer
from app.llm.adapters.claude_adapter import ClaudeAdapter
from app.llm.adapters.deepseek_adapter import DeepSeekAdapter
from app.llm.adapters.mistral_adapter import MistralAdapter
from app.main import app
from app.ml.hallucination import detect_hallucinations
from app.platform.registry import service_registry
from app.prompt.governance import fingerprint_prompt, prompt_governance
from app.jobs.scheduler import TaskScheduler, Job

client = TestClient(app)


def test_new_llm_adapters_register():
    assert MistralAdapter().name == "mistral"
    assert DeepSeekAdapter().name == "deepseek"
    assert ClaudeAdapter().name == "claude"


def test_ai_reasoning_planning_reflection_chain():
    reasoning = ReasoningEngine(ReasoningStrategy.CHAIN_OF_THOUGHT).analyze("UPI limit enhancement")
    plan = PlanningEngine().plan(reasoning)
    reflection = ReflectionEngine().reflect(reasoning, plan)
    assert len(plan.steps) >= 6
    assert reflection.adjusted_confidence >= 0


def test_artifact_reviewer():
    review = ArtifactReviewer().review("Business objective for payments", "BRD")
    assert review.score > 0


def test_hallucination_detection():
    report = detect_hallucinations("This is 100% guaranteed with zero risk")
    assert report.score > 0
    assert report.flags


def test_prompt_fingerprint_stable():
    a = fingerprint_prompt("  hello   world  ")
    b = fingerprint_prompt("hello world")
    assert a.hash == b.hash


def test_prompt_governance_replay_endpoint():
    r = client.get("/api/v1/prompt-governance/replay")
    assert r.status_code == 200
    assert "entries" in r.json()


def test_ai_engine_analyze_endpoint():
    r = client.post("/api/v1/ai-engine/analyze", json={"prompt": "Merchant settlement for UPI"})
    assert r.status_code == 200
    body = r.json()
    assert "plan" in body and "reflection" in body


def test_platform_services_endpoint():
    r = client.get("/api/v1/platform/services")
    assert r.status_code == 200
    names = [s["name"] for s in r.json()["services"]]
    assert "orchestrator" in names


def test_task_scheduler_runs_job():
    ran = {"ok": False}

    def job_fn():
        ran["ok"] = True

    sched = TaskScheduler()
    sched.register(Job(id="t1", name="test", handler=job_fn, interval_s=0.01))
    sched.start()
    import time
    time.sleep(0.05)
    sched.stop()
    assert ran["ok"]


def test_service_registry_bootstrap():
    assert service_registry.get("orchestrator") is not None
