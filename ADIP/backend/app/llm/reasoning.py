"""Provider-independent reasoning interface for the orchestration engine.

The Prompt Execution Engine classifies a business prompt through a ``Reasoner``.
Today a deterministic ``MockReasoner`` performs keyword-based classification;
tomorrow an LLM-backed reasoner can implement the same protocol (using the
existing adapters in ``app.llm.adapters``) with NO change to the engine.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol, runtime_checkable


@dataclass
class PromptClassification:
    """Structured classification of a business prompt."""

    business_domain: str
    application: str
    capability: str
    technology: str
    security_impact: str
    compliance_impact: str
    risk: str
    complexity: str
    story_points: int
    sprint_estimate: int
    confidence: int
    matched_keywords: list[str] = field(default_factory=list)
    scenario: str = "generic"


@runtime_checkable
class Reasoner(Protocol):
    """Anything that can classify a prompt. Implemented by mock today, LLM later."""

    name: str

    def classify(self, prompt: str, metadata: dict | None = None) -> PromptClassification:
        ...


# --- keyword tables (banking scenarios) ---
_DOMAIN_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("Payments · UPI", ("upi", "auto-reversal", "reversal", "npci", "reconcile", "reconciliation")),
    ("Payments", ("payment", "neft", "rtgs", "imps", "beneficiary", "remittance")),
    ("Digital Channels · Mobile", ("mobile banking", "mobile app", "biometric", "mpin", "device")),
    ("Cards", ("card", "tokenization", "3ds", "pan")),
    ("Lending", ("loan", "emi", "disbursement", "credit")),
    ("Core Banking", ("core banking", "ledger", "account", "debit", "statement")),
    ("Security & Fraud", ("fraud", "aml", "sanction", "authentication", "login")),
]

_TECH_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("Event-driven microservices · NPCI integration", ("upi", "npci", "reversal", "reconcile")),
    ("Mobile SDK · Biometric APIs · Secure enclave", ("biometric", "mpin", "device", "mobile")),
    ("REST APIs · Core Banking integration", ("beneficiary", "account", "transfer", "payment")),
    ("OAuth2 / OIDC · MFA", ("login", "authentication", "sso")),
]

_HIGH_RISK_SIGNALS = ("upi", "reversal", "payment", "money", "fraud", "npci", "debit", "beneficiary")
_SECURITY_SIGNALS = ("biometric", "login", "authentication", "token", "fraud", "pan", "card", "otp")
_COMPLIANCE_SIGNALS = ("upi", "npci", "rbi", "pci", "aml", "kyc", "reversal", "payment", "audit")


def _match(prompt_lc: str, words: tuple[str, ...]) -> list[str]:
    return [w for w in words if w in prompt_lc]


class MockReasoner:
    """Deterministic, keyword-driven classifier (no LLM, no network)."""

    name = "mock"

    def classify(self, prompt: str, metadata: dict | None = None) -> PromptClassification:
        meta = metadata or {}
        lc = prompt.lower()

        # Domain + technology from keyword rules.
        domain = "Enterprise Banking"
        matched: list[str] = []
        for name, words in _DOMAIN_RULES:
            hits = _match(lc, words)
            if hits:
                domain = name
                matched.extend(hits)
                break
        technology = "Enterprise standard stack"
        for name, words in _TECH_RULES:
            if _match(lc, words):
                technology = name
                break

        is_upi = "upi" in lc and any(k in lc for k in ("revers", "npci", "reconcil", "not credited"))
        scenario = "upi-auto-reversal" if is_upi else "generic"

        # Capability = the crux of the prompt (trimmed).
        capability = prompt.strip().rstrip(".")
        if len(capability) > 90:
            capability = capability[:90] + "…"

        # Impact signals.
        security_impact = "High" if _match(lc, _SECURITY_SIGNALS) else "Medium"
        compliance_hits = _match(lc, _COMPLIANCE_SIGNALS)
        compliance_impact = "High" if compliance_hits else "Low"
        risk = "High" if _match(lc, _HIGH_RISK_SIGNALS) else "Medium"

        # Complexity + estimates (overridable via metadata).
        complexity = str(meta.get("complexity") or ("High" if is_upi or risk == "High" else "Medium"))
        story_points = {"Low": 21, "Medium": 34, "High": 55}.get(complexity, 34)
        sprint_estimate = 1 if story_points <= 21 else 2 if story_points <= 55 else 3
        confidence = 95 if is_upi else 88 if matched else 80

        return PromptClassification(
            business_domain=str(meta.get("business_domain") or domain),
            application=str(meta.get("application") or self._infer_application(lc, domain)),
            capability=capability,
            technology=technology,
            security_impact=security_impact,
            compliance_impact=compliance_impact,
            risk=str(meta.get("risk") or risk),
            complexity=complexity,
            story_points=story_points,
            sprint_estimate=sprint_estimate,
            confidence=confidence,
            matched_keywords=sorted(set(matched)),
            scenario=scenario,
        )

    @staticmethod
    def _infer_application(lc: str, domain: str) -> str:
        if "mobile" in lc or "biometric" in lc:
            return "Mobile Banking"
        if "upi" in lc or "npci" in lc or "payment" in lc or "beneficiary" in lc:
            return "Payments"
        if "net banking" in lc or "internet banking" in lc:
            return "Net Banking"
        return domain.split(" · ")[0]


# Default reasoner used by the orchestration engine (swap for an LLM reasoner later).
default_reasoner: Reasoner = MockReasoner()
