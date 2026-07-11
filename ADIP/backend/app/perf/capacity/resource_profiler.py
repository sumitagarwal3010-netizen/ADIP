"""Real resource profiling — psutil with graceful degradation."""
from __future__ import annotations

import os
import threading
import time

from app.schemas.capacity_planning import ResourceProfile

_psutil = None
try:
    import psutil as _psutil  # type: ignore[import-untyped]
except ImportError:
    pass


class ResourceProfiler:
    """Sample CPU/RAM during a callable execution."""

    def __init__(self) -> None:
        self._samples: list[tuple[float, float]] = []
        self._stop = threading.Event()
        self._thread: threading.Thread | None = None

    def _sample_loop(self) -> None:
        proc = _psutil.Process(os.getpid()) if _psutil else None
        while not self._stop.is_set():
            if proc:
                mem = proc.memory_info().rss / (1024 * 1024)
                cpu = proc.cpu_percent(interval=0.1)
                self._samples.append((mem, cpu))
            time.sleep(0.15)

    def profile(self, fn) -> tuple[ResourceProfile, float]:
        self._samples.clear()
        if _psutil:
            self._thread = threading.Thread(target=self._sample_loop, daemon=True)
            self._thread.start()
        t0 = time.perf_counter()
        fn()
        duration_ms = (time.perf_counter() - t0) * 1000
        self._stop.set()
        if self._thread:
            self._thread.join(timeout=1.0)
        if self._samples:
            mems = [s[0] for s in self._samples]
            cpus = [s[1] for s in self._samples]
            return ResourceProfile(
                peak_ram_mb=round(max(mems), 2),
                avg_ram_mb=round(sum(mems) / len(mems), 2),
                peak_cpu_percent=round(max(cpus), 2),
                avg_cpu_percent=round(sum(cpus) / len(cpus), 2),
                thread_count=_psutil.Process(os.getpid()).num_threads() if _psutil else 1,
                psutil_available=True,
            ), duration_ms
        return ResourceProfile(
            peak_ram_mb=0, avg_ram_mb=0, peak_cpu_percent=0, avg_cpu_percent=0,
            thread_count=1, psutil_available=False,
        ), duration_ms


profiler = ResourceProfiler()
