"""Tests for enterprise AI content phases: prompt matrix, benchmark, optimization,
rubrics, and the dataset generators (golden, review, walkthroughs)."""
from __future__ import annotations

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
API = "/api/v1"


# --- Phase 1: prompt matrix ---
def test_prompt_matrix_size_and_shape():
    body = client.get(f"{API}/prompt-templates/matrix").json()
    assert body["total"] == 360           # 20 domains x 18 artifact types
    assert len(body["domains"]) == 20
    assert len(body["artifact_types"]) == 18


def test_prompt_matrix_detail_fields():
    t = client.get(f"{API}/prompt-templates/matrix/upi--brd").json()
    for key in ("role", "context", "objective", "constraints", "expected_sections",
                "expected_output", "quality_checklist", "compliance_checklist"):
        assert key in t and t[key]


def test_prompt_matrix_filter():
    assert client.get(f"{API}/prompt-templates/matrix", params={"domain": "UPI"}).json()["total"] == 18
    assert client.get(f"{API}/prompt-templates/matrix", params={"artifact_type": "BRD"}).json()["total"] == 20


def test_prompt_matrix_missing_404():
    assert client.get(f"{API}/prompt-templates/matrix/nope--nope").status_code == 404


# --- Phase 3: benchmark ---
def test_benchmark():
    body = client.post(f"{API}/prompt-benchmark/run", json={
        "versions": ["Implement UPI Auto-Reversal.",
                     "Implement UPI Auto-Reversal with NPCI reconciliation and audit."]}).json()
    assert len(body["entries"]) == 2
    e = body["entries"][0]
    for key in ("prompt_version", "prompt_score", "artifact_score", "reviewer_score",
                "latency_ms", "input_tokens", "output_tokens", "overall_score"):
        assert key in e
    assert body["best_version"] in {"V1", "V2"}


# --- Phase 4: optimization ---
def test_optimize_v1_v2_v3():
    body = client.post(f"{API}/prompt-benchmark/optimize",
                       json={"base_prompt": "Implement UPI Auto-Reversal for Mobile Banking"}).json()
    versions = [d["version"] for d in body["diffs"]]
    assert versions == ["V1", "V2", "V3"]
    assert body["diffs"][2]["added"]           # V3 has added instructions
    assert body["recommendations"]
    assert body["best_version"] in {"V1", "V2", "V3"}


# --- Phase 6: rubrics ---
def test_rubrics_list_and_detail():
    lst = client.get(f"{API}/artifact-rubrics").json()
    assert lst["total"] >= 40
    r = client.get(f"{API}/artifact-rubrics/BRD").json()
    assert len(r["criteria"]) == 10
    assert r["total_weight"] == 100
    names = {c["criterion"] for c in r["criteria"]}
    assert {"Completeness", "Compliance", "Security", "Testing", "Traceability",
            "Overall Quality"} <= names
    for c in r["criteria"]:
        assert c["excellent"] and c["poor"]


def test_rubric_missing_404():
    assert client.get(f"{API}/artifact-rubrics/NoSuchType").status_code == 404


# --- Dataset generators (small counts for speed) ---
def test_golden_dataset_generator(tmp_path):
    from app.datasets.golden_dataset import GOLDEN_TYPES, generate
    manifest = generate(count=2, out_dir=tmp_path)
    assert manifest["total"] == 2 * len(GOLDEN_TYPES)
    assert (tmp_path / "manifest.json").exists()
    # every type dir has the files
    for label in GOLDEN_TYPES:
        assert manifest["types"][label]["count"] == 2


def test_review_dataset_generator(tmp_path):
    from app.datasets.review_dataset import REVIEW_ARTIFACT_TYPES, generate
    manifest = generate(out_dir=tmp_path)
    assert manifest["total"] == 5 * len(REVIEW_ARTIFACT_TYPES)   # 5 tiers each
    # broken should score lower than excellent for BRD
    brd = {e["tier"]: e["quality_score"] for e in manifest["artifact_types"]["BRD"]}
    assert brd["excellent"] > brd["broken"]


def test_walkthrough_generator(tmp_path):
    from app.datasets.example_walkthroughs import generate
    manifest = generate(out_dir=tmp_path)
    assert len(manifest["examples"]) == 20
    assert all((tmp_path / e["file"]).exists() for e in manifest["examples"])
