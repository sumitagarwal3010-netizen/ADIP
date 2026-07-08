#!/usr/bin/env python3
"""Run artifact quality scorecard — deterministic rules + quality dimensions."""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _bootstrap import bootstrap

bootstrap()

from app.db.session import SessionLocal
from app.services.quality_scorecard_service import QualityScorecardService


def main() -> int:
    artifact_type = sys.argv[1] if len(sys.argv) > 1 else "BRD"
    with SessionLocal() as db:
        scorecard = QualityScorecardService(db).scorecard(artifact_type=artifact_type)
    print(json.dumps({"composite_score": scorecard["composite_score"], "grade": scorecard["grade"]}, indent=2))
    print(f"Rules: {scorecard['rule_report']['passed']}/{scorecard['rule_report']['total']} passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
