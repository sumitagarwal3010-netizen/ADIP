#!/usr/bin/env python3
"""Run mock prompt regression — no live LLM or credentials required."""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _bootstrap import bootstrap

bootstrap()

from app.db.session import SessionLocal
from app.services.regression_service import RegressionService


def main() -> int:
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 5
    with SessionLocal() as db:
        report = RegressionService(db).run_golden_mock(limit=limit)
    print(f"Verdict: {report.overall_verdict}")
    for case in report.cases:
        status = "PASS" if case.passed else "FAIL"
        print(f"  [{status}] {case.case_id} similarity={case.similarity_score}")
    return 0 if report.failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
