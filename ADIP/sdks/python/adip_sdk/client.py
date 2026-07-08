"""ADIP REST API client (stdlib-only)."""
from __future__ import annotations

import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


class ADIPError(Exception):
    """Raised when the ADIP API returns an error or is unreachable."""

    def __init__(self, message: str, status: int | None = None, body: str | None = None):
        super().__init__(message)
        self.status = status
        self.body = body


class ADIPClient:
    """Thin, typed-ish client over the ADIP REST API (`/api/v1`)."""

    def __init__(self, base_url: str = "http://localhost:8000", *,
                 api_prefix: str = "/api/v1", timeout: float = 30.0,
                 token: str | None = None) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_prefix = api_prefix
        self.timeout = timeout
        self.token = token

    # --- low-level request ---
    def _request(self, method: str, path: str, *, params: dict | None = None,
                 body: dict | None = None) -> Any:
        url = f"{self.base_url}{self.api_prefix}{path}"
        if params:
            clean = {k: v for k, v in params.items() if v is not None}
            if clean:
                url += "?" + urllib.parse.urlencode(clean)
        data = json.dumps(body).encode() if body is not None else None
        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        req = urllib.request.Request(url, data=data, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                raw = resp.read().decode()
                ctype = resp.headers.get("Content-Type", "")
                return json.loads(raw) if "application/json" in ctype else raw
        except urllib.error.HTTPError as exc:
            body_text = exc.read().decode(errors="replace")
            raise ADIPError(f"HTTP {exc.code} for {method} {path}", exc.code, body_text) from exc
        except urllib.error.URLError as exc:
            raise ADIPError(f"Cannot reach ADIP at {url}: {exc.reason}") from exc

    # --- health & meta ---
    def health(self) -> dict:
        return self._request("GET", "/health")

    def llm_health(self) -> dict:
        return self._request("GET", "/llm/health")

    def llm_runtime(self) -> dict:
        return self._request("GET", "/llm/runtime")

    # --- projects ---
    def list_projects(self, page: int = 1, size: int = 50) -> dict:
        return self._request("GET", "/projects", params={"page": page, "size": size})

    def get_project(self, project_id: int) -> dict:
        return self._request("GET", f"/projects/{project_id}")

    # --- SDLC ---
    def sdlc_summary(self, project_id: int, phase: str) -> dict:
        """phase in {requirements, architecture, development, testing, release, go-live, audit}."""
        return self._request("GET", f"/sdlc/projects/{project_id}/{phase}/summary")

    # --- orchestration (one prompt → full SDLC) ---
    def orchestrate(self, prompt: str, **options: Any) -> dict:
        return self._request("POST", "/orchestrator/run",
                             body={"prompt": prompt, **options})

    # --- artifacts ---
    def generate_artifact(self, project_id: int, artifact_type: str) -> dict:
        return self._request("GET", f"/artifact-generation/projects/{project_id}/generate",
                             params={"artifact_type": artifact_type})

    def export_artifact(self, project_id: int, artifact_type: str, fmt: str = "markdown",
                        *, watermark: str | None = None) -> str:
        return self._request("GET", f"/artifact-export/projects/{project_id}",
                             params={"artifact_type": artifact_type, "format": fmt,
                                     "watermark": watermark})

    def score_artifact_quality(self, project_id: int, artifact_type: str) -> dict:
        return self._request("POST", "/artifact-quality/score",
                             body={"project_id": project_id, "artifact_type": artifact_type})

    # --- prompt studio ---
    def create_prompt(self, name: str, content: str, **kw: Any) -> dict:
        return self._request("POST", "/prompt-workbench/prompts",
                             body={"name": name, "content": content, **kw})

    def search_prompts(self, query: str) -> dict:
        return self._request("GET", "/prompt-studio/search", params={"q": query})

    def favorite_prompt(self, prompt_id: int, value: bool = True) -> dict:
        return self._request("PUT", f"/prompt-studio/prompts/{prompt_id}/favorite",
                             body={"is_favorite": value})

    # --- benchmark & regression ---
    def benchmark(self, versions: list[str], project: str | None = None) -> dict:
        return self._request("POST", "/prompt-benchmark/benchmark",
                             body={"versions": versions, "project": project})

    def regression_compare(self, baseline: str, candidate: str) -> dict:
        return self._request("POST", "/prompt-regression/compare",
                             body={"baseline_prompt": baseline, "candidate_prompt": candidate})

    # --- prompt templates ---
    def list_templates(self) -> Any:
        return self._request("GET", "/prompt-templates")

    def list_matrix_prompts(self) -> Any:
        return self._request("GET", "/prompt-templates/matrix")
