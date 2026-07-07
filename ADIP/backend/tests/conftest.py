"""Pytest fixtures.

Forces an isolated on-disk SQLite database for the test session so tests never
touch the developer's ``adip.db``. Must run before app modules import settings.
"""
from __future__ import annotations

import os
import tempfile

# Point the app at a throwaway SQLite file BEFORE importing anything app-related.
_TMP_DB = os.path.join(tempfile.gettempdir(), "adip_test.db")
os.environ["DATABASE_URL"] = f"sqlite:///{_TMP_DB}"
os.environ["ENVIRONMENT"] = "test"

import pytest  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _seeded_db():
    """Create schema + seed once for the whole test session, then clean up."""
    if os.path.exists(_TMP_DB):
        os.remove(_TMP_DB)

    from app.seed.seeder import seed

    seed(reset=True)
    yield
    if os.path.exists(_TMP_DB):
        os.remove(_TMP_DB)
