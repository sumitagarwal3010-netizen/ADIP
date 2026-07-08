"""Bootstrap backend imports when running repo-root scripts with system python3."""
from __future__ import annotations

import sys
from pathlib import Path

_ROOT = Path(__file__).resolve().parents[1]
_BACKEND = _ROOT / "backend"
_VENV_SITE = _BACKEND / ".venv" / "lib"


def bootstrap() -> Path:
    sys.path.insert(0, str(_BACKEND))
    if _VENV_SITE.exists():
        for sp in sorted(_VENV_SITE.iterdir()):
            if sp.is_dir() and sp.name.startswith("python"):
                sys.path.insert(0, str(sp / "site-packages"))
                break
    return _BACKEND
