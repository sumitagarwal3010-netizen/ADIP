"""Phase 2 tests: CRUD REST APIs (list, get, create/update/delete, pagination, search)."""
from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

API = "/api/v1"


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    r2 = client.get(f"{API}/health")
    assert r2.status_code == 200


@pytest.mark.parametrize(
    "resource",
    [
        "projects", "applications", "requirements", "requirement-analysis",
        "architecture", "architecture-review", "development-stories",
        "development-tasks", "source-code-metadata", "code-review",
        "test-cases", "test-execution", "defects", "releases", "deployments",
        "go-live", "audit-evidence", "compliance-records", "artifacts",
        "traceability-links", "copilot-findings", "ai-recommendations",
        "executive-scores", "ai-risk", "knowledge-articles",
        "transformation-programs", "activity-log", "notifications",
    ],
)
def test_list_endpoint_returns_page_envelope(resource: str):
    r = client.get(f"{API}/{resource}")
    assert r.status_code == 200, r.text
    body = r.json()
    for key in ("items", "total", "page", "page_size", "pages"):
        assert key in body
    assert isinstance(body["items"], list)


def test_seeded_projects_present():
    r = client.get(f"{API}/projects", params={"page_size": 50})
    assert r.status_code == 200
    names = {p["name"] for p in r.json()["items"]}
    assert {"Net Banking", "Mobile Banking", "Payments"} <= names


def test_get_by_id_and_404():
    first = client.get(f"{API}/projects").json()["items"][0]
    r = client.get(f"{API}/projects/{first['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == first["id"]

    missing = client.get(f"{API}/projects/999999")
    assert missing.status_code == 404
    assert "not found" in missing.json()["detail"].lower()


def test_pagination_limits_items():
    r = client.get(f"{API}/requirements", params={"page": 1, "page_size": 5})
    body = r.json()
    assert len(body["items"]) == 5
    assert body["page"] == 1
    assert body["page_size"] == 5
    assert body["total"] >= 150  # 54 per project x 3
    # page 2 differs from page 1
    r2 = client.get(f"{API}/requirements", params={"page": 2, "page_size": 5})
    ids1 = {i["id"] for i in body["items"]}
    ids2 = {i["id"] for i in r2.json()["items"]}
    assert ids1.isdisjoint(ids2)


def test_filter_by_project():
    proj = client.get(f"{API}/projects").json()["items"][0]
    r = client.get(f"{API}/requirements", params={"project_id": proj["id"], "page_size": 100})
    items = r.json()["items"]
    assert items
    assert all(i["project_id"] == proj["id"] for i in items)


def test_search():
    r = client.get(f"{API}/projects", params={"search": "mobile"})
    names = [p["name"] for p in r.json()["items"]]
    assert any("Mobile" in n for n in names)


def test_sorting_desc():
    r = client.get(f"{API}/requirements", params={"sort_by": "id", "sort_dir": "desc", "page_size": 10})
    ids = [i["id"] for i in r.json()["items"]]
    assert ids == sorted(ids, reverse=True)


def test_create_update_delete_project():
    # create
    payload = {"name": "Test Wealth Platform", "code": "ZZWEALTH", "status": "On Track", "health_score": 77}
    created = client.post(f"{API}/projects", json=payload)
    assert created.status_code == 201, created.text
    pid = created.json()["id"]
    assert created.json()["code"] == "ZZWEALTH"

    # get
    assert client.get(f"{API}/projects/{pid}").status_code == 200

    # update (partial)
    updated = client.put(f"{API}/projects/{pid}", json={"health_score": 91, "status": "At Risk"})
    assert updated.status_code == 200
    assert updated.json()["health_score"] == 91
    assert updated.json()["status"] == "At Risk"

    # delete
    assert client.delete(f"{API}/projects/{pid}").status_code == 204
    assert client.get(f"{API}/projects/{pid}").status_code == 404


def test_create_conflict_returns_409():
    existing_code = client.get(f"{API}/projects").json()["items"][0]["code"]
    # projects.code is unique -> duplicate should conflict
    dup = client.post(f"{API}/projects", json={"name": "Dup", "code": existing_code})
    assert dup.status_code == 409


def test_create_child_entity_requirement():
    proj = client.get(f"{API}/projects").json()["items"][0]
    payload = {
        "project_id": proj["id"],
        "reference": "ZZ-REQ-999",
        "requirement_type": "functional",
        "title": "Temp requirement for test",
        "priority": "P2",
        "status": "Draft",
    }
    r = client.post(f"{API}/requirements", json=payload)
    assert r.status_code == 201, r.text
    rid = r.json()["id"]
    # cleanup
    assert client.delete(f"{API}/requirements/{rid}").status_code == 204


def test_validation_error_on_bad_create():
    # missing required fields (name/code) -> 422 from pydantic
    r = client.post(f"{API}/projects", json={"health_score": 10})
    assert r.status_code == 422
