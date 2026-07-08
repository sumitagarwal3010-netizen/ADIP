"""Background job scheduler scaffold (Role 7)."""
from __future__ import annotations

import threading
import time
from collections.abc import Callable
from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class Job:
    id: str
    name: str
    handler: Callable[[], None]
    interval_s: float
    last_run: str | None = None
    runs: int = 0
    errors: int = 0


class TaskScheduler:
    """In-process periodic scheduler for maintenance jobs."""

    def __init__(self) -> None:
        self._jobs: dict[str, Job] = {}
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def register(self, job: Job) -> None:
        self._jobs[job.id] = job

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop.clear()
        self._thread = threading.Thread(target=self._loop, daemon=True)
        self._thread.start()

    def stop(self) -> None:
        self._stop.set()

    def _loop(self) -> None:
        last_run: dict[str, float] = {}
        while not self._stop.is_set():
            now = time.monotonic()
            for job in self._jobs.values():
                prev = last_run.get(job.id, 0.0)
                if now - prev >= job.interval_s:
                    try:
                        job.handler()
                        job.runs += 1
                        job.last_run = datetime.now(timezone.utc).isoformat()
                    except Exception:  # noqa: BLE001
                        job.errors += 1
                    last_run[job.id] = now
            time.sleep(0.5)

    def status(self) -> list[dict]:
        return [
            {"id": j.id, "name": j.name, "runs": j.runs, "errors": j.errors, "last_run": j.last_run}
            for j in self._jobs.values()
        ]


task_scheduler = TaskScheduler()
