"""Experiment tracking (Role 5 — ML).

A minimal, dependency-free experiment log (append-only JSONL). Each run records
params, metrics, a dataset version pin and a timestamp — enough to compare runs
and reproduce evaluations without a heavyweight tracking server. Provides a seam
to later back onto MLflow / Weights & Biases.
"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

_REPO_ROOT = Path(__file__).resolve().parents[3]
DEFAULT_LOG = _REPO_ROOT / "docs" / "examples" / "ml" / "experiments.jsonl"


class ExperimentTracker:
    def __init__(self, log_path: Path | None = None) -> None:
        self.log_path = log_path or DEFAULT_LOG
        self.log_path.parent.mkdir(parents=True, exist_ok=True)

    def log_run(self, name: str, *, params: dict, metrics: dict,
                dataset_version: str | None = None, tags: list[str] | None = None) -> dict:
        run = {
            "run_id": uuid.uuid4().hex[:12],
            "name": name,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "params": params,
            "metrics": metrics,
            "dataset_version": dataset_version,
            "tags": tags or [],
        }
        with self.log_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(run, ensure_ascii=False) + "\n")
        return run

    def list_runs(self) -> list[dict]:
        if not self.log_path.exists():
            return []
        return [json.loads(line) for line in self.log_path.read_text(encoding="utf-8").splitlines()
                if line.strip()]

    def best_run(self, metric: str, *, higher_is_better: bool = True) -> dict | None:
        runs = [r for r in self.list_runs() if metric in r.get("metrics", {})]
        if not runs:
            return None
        return (max if higher_is_better else min)(runs, key=lambda r: r["metrics"][metric])

    def compare(self, run_id_a: str, run_id_b: str, metric: str) -> dict | None:
        runs = {r["run_id"]: r for r in self.list_runs()}
        a, b = runs.get(run_id_a), runs.get(run_id_b)
        if not a or not b:
            return None
        va, vb = a["metrics"].get(metric), b["metrics"].get(metric)
        return {"metric": metric, run_id_a: va, run_id_b: vb,
                "delta": (vb - va) if (va is not None and vb is not None) else None}
