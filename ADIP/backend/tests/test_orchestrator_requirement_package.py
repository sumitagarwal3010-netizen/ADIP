from __future__ import annotations

from typing import cast

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.llm.service import llm_service
from app.services.orchestrator_service import PromptExecutionEngine


class _AvailableAdapter:
    def is_available(self) -> bool:
        return True


def test_biometric_requirement_never_returns_seeded_upi_content(monkeypatch):
    with SessionLocal() as db:
        engine = PromptExecutionEngine(cast(Session, db))
        monkeypatch.setattr(
            "app.services.orchestrator_service.settings.local_llm_enabled",
            False,
            raising=False,
        )
        pkg = engine.generate_requirement_artifact_package(
            "Implement biometric login for mobile banking"
        )
        assert pkg.source == "fallback"
        assert "biometric login" in pkg.normalized_requirement
        combined = " ".join(item.content for item in pkg.artifacts.values()).lower()
        assert "upi limit enhancement" not in combined


def test_invalid_llm_json_returns_explicit_generation_failed(monkeypatch):
    with SessionLocal() as db:
        engine = PromptExecutionEngine(cast(Session, db))
        monkeypatch.setattr(
            "app.services.orchestrator_service.settings.local_llm_enabled",
            True,
            raising=False,
        )
        monkeypatch.setattr(llm_service, "adapter_for", lambda _model=None: _AvailableAdapter())

        class _Resp:
            content = "not-json"

        monkeypatch.setattr(llm_service, "complete", lambda *_args, **_kwargs: _Resp())

        pkg = engine.generate_requirement_artifact_package("Enable passkeys")
        assert pkg.source == "failed"
        assert pkg.failure_reason is not None
        assert "Generation Failed" in pkg.failure_reason
        assert pkg.artifacts == {}

