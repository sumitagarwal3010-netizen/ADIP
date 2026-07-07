"""Banking domain catalog + per-domain scenario phrasing.

Single source of truth for the 20 banking domains used across the enterprise
prompt matrix (Phase 1), the golden dataset (Phase 2) and the end-to-end
examples (Phase 8). Keeping domains here avoids duplication across features.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class BankingDomain:
    key: str
    name: str
    area: str
    scenario: str
    compliance: tuple[str, ...]


DOMAINS: list[BankingDomain] = [
    BankingDomain("upi", "UPI", "Payments",
                  "UPI transaction processing, auto-reversal and NPCI reconciliation.",
                  ("RBI TAT", "NPCI", "PCI-DSS")),
    BankingDomain("imps", "IMPS", "Payments",
                  "24x7 immediate interbank transfer with instant confirmation.",
                  ("RBI", "NPCI")),
    BankingDomain("neft", "NEFT", "Payments",
                  "Batch settlement within RBI half-hourly windows with returns.",
                  ("RBI",)),
    BankingDomain("rtgs", "RTGS", "Payments",
                  "Real-time gross settlement for high-value payments with screening.",
                  ("RBI", "AML")),
    BankingDomain("cards", "Cards", "Cards",
                  "Card issuance, tokenization, 3DS authorization and disputes.",
                  ("PCI-DSS", "RBI")),
    BankingDomain("loans", "Loans", "Lending",
                  "Digital loan origination, disbursement and servicing.",
                  ("RBI", "KYC")),
    BankingDomain("kyc", "KYC", "Compliance",
                  "Customer KYC onboarding and periodic re-verification.",
                  ("RBI", "KYC")),
    BankingDomain("aml", "AML", "Compliance",
                  "AML transaction monitoring, alerts and STR filing.",
                  ("AML", "FIU-IND", "RBI")),
    BankingDomain("npci", "NPCI", "Payments",
                  "NPCI settlement/dispute reconciliation across rails.",
                  ("NPCI", "RBI TAT")),
    BankingDomain("rbi", "RBI Compliance", "Compliance",
                  "RBI regulatory reporting and control compliance.",
                  ("RBI",)),
    BankingDomain("corporate", "Corporate Banking", "Wholesale",
                  "Corporate bulk payments, host-to-host and maker-checker.",
                  ("RBI", "SOX")),
    BankingDomain("treasury", "Treasury", "Treasury",
                  "FX, money markets, liquidity and settlement.",
                  ("RBI", "FEMA")),
    BankingDomain("trade-finance", "Trade Finance", "Wholesale",
                  "Letters of credit, guarantees and trade document processing.",
                  ("UCP 600", "RBI")),
    BankingDomain("merchant-payments", "Merchant Payments", "Payments",
                  "Merchant onboarding, settlement and MDR handling.",
                  ("RBI", "PCI-DSS")),
    BankingDomain("qr-payments", "QR Payments", "Payments",
                  "Static/dynamic UPI QR generation and scan-and-pay.",
                  ("NPCI",)),
    BankingDomain("atm", "ATM", "Self-Service",
                  "ATM/self-service withdrawal, cardless flows and reconciliation.",
                  ("RBI", "NPCI")),
    BankingDomain("internet-banking", "Internet Banking", "Digital Channels",
                  "Internet banking transfers, bill pay and statements.",
                  ("RBI",)),
    BankingDomain("mobile-banking", "Mobile Banking", "Digital Channels",
                  "Mobile onboarding, biometric login and payments.",
                  ("RBI",)),
    BankingDomain("fraud", "Fraud", "Risk",
                  "Real-time fraud detection, scoring and decisioning.",
                  ("RBI", "PCI-DSS")),
    BankingDomain("digital-payments", "Digital Payments", "Payments",
                  "Unified digital payments hub across UPI/IMPS/NEFT/RTGS.",
                  ("RBI", "NPCI", "PCI-DSS")),
]

DOMAIN_BY_KEY = {d.key: d for d in DOMAINS}

# Artifact types covered by the prompt matrix and golden dataset (Phase 1/2).
MATRIX_ARTIFACT_TYPES = [
    "BRD", "PRD", "FRD", "SRS", "NFR", "HLD", "LLD", "API Design", "Database Design",
    "Sequence Diagram", "Deployment", "Test Plan", "Test Cases", "Regression",
    "UAT", "Go Live", "Audit", "Executive Summary",
]

# Map matrix artifact-type labels to canonical ArtifactGenerator types.
MATRIX_TO_GENERATOR: dict[str, str] = {
    "BRD": "BRD", "PRD": "PRD", "FRD": "FRD", "SRS": "SRS", "NFR": "NFR",
    "HLD": "HLD", "LLD": "LLD", "API Design": "API Spec", "Database Design": "DB Design",
    "Sequence Diagram": "Sequence Flow", "Deployment": "Deployment Guide",
    "Test Plan": "Test Plan", "Test Cases": "Test Cases", "Regression": "Regression Plan",
    "UAT": "UAT Plan", "Go Live": "Go Live Checklist", "Audit": "Audit Checklist",
    "Executive Summary": "Executive Summary",
}
