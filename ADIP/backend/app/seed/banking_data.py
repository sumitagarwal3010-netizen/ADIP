"""Realistic banking-domain vocabularies used by the seed generator.

Kept separate from the seeding logic so the phrasing can be tuned without
touching insert code. All content is illustrative mock data.
"""
from __future__ import annotations

# Project definitions (flagship banking programs across channels & rails).
PROJECTS = [
    {
        "name": "Net Banking",
        "code": "NETB",
        "sponsor": "Head of Digital Banking",
        "description": "Internet banking platform for retail and corporate customers: funds transfer, bill pay, statements and service requests.",
    },
    {
        "name": "Mobile Banking",
        "code": "MOBB",
        "sponsor": "Head of Mobile Channels",
        "description": "Mobile banking super-app: onboarding, payments, cards, biometric login and personal finance management.",
    },
    {
        "name": "Payments",
        "code": "PAYM",
        "sponsor": "Head of Payments",
        "description": "Enterprise payments platform spanning UPI, IMPS, NEFT and RTGS with NPCI integration and reconciliation.",
    },
    {
        "name": "Cards",
        "code": "CARD",
        "sponsor": "Head of Cards",
        "description": "Debit/credit card platform: issuance, tokenization, 3DS authorization, disputes and rewards.",
    },
    {
        "name": "ATM Channel",
        "code": "ATMC",
        "sponsor": "Head of Self-Service Banking",
        "description": "ATM/self-service channel: cash withdrawal, cardless withdrawal, switch routing and reconciliation.",
    },
    {
        "name": "Corporate Banking",
        "code": "CORP",
        "sponsor": "Head of Wholesale Banking",
        "description": "Corporate banking portal: bulk payments, host-to-host, trade finance and maker-checker workflows.",
    },
    {
        "name": "Treasury",
        "code": "TRES",
        "sponsor": "Head of Treasury",
        "description": "Treasury and markets platform: FX, money markets, liquidity, settlement and regulatory reporting.",
    },
]

BUSINESS_DOMAINS = [
    ("Retail Banking", "RETAIL"),
    ("Payments", "PAY"),
    ("Cards", "CARDS"),
    ("Lending", "LEND"),
    ("Risk & Compliance", "RISK"),
    ("Core Banking", "CORE"),
]

ROLES = [
    ("cio", "Chief Information Officer"),
    ("cto", "Chief Technology Officer"),
    ("solution-architect", "Solution Architect"),
    ("developer", "Developer"),
    ("tester", "QA Engineer"),
    ("release-manager", "Release Manager"),
    ("audit-head", "Head of Audit"),
    ("compliance-officer", "Compliance Officer"),
]

USERS = [
    ("a.rao", "Anita Rao", "Chief Information Officer", "cio"),
    ("s.mehta", "Sanjay Mehta", "Chief Technology Officer", "cto"),
    ("p.iyer", "Priya Iyer", "Principal Solution Architect", "solution-architect"),
    ("r.khan", "Rehan Khan", "Senior Engineer", "developer"),
    ("d.nair", "Divya Nair", "QA Lead", "tester"),
    ("v.singh", "Vikram Singh", "Release Manager", "release-manager"),
    ("m.das", "Meera Das", "Head of Internal Audit", "audit-head"),
    ("k.pillai", "Karan Pillai", "Compliance Officer", "compliance-officer"),
]

APPLICATIONS = {
    "NETB": [
        ("Net Banking Web", "NB-WEB", "Java 8 monolith · Spring MVC"),
        ("Net Banking BFF", "NB-BFF", "Node.js BFF"),
        ("Funds Transfer Service", "NB-FT", "Java · Spring Boot"),
        ("Statements Service", "NB-STMT", "Java · Batch"),
    ],
    "MOBB": [
        ("Mobile App (iOS/Android)", "MB-APP", "React Native"),
        ("Mobile BFF", "MB-BFF", "Node.js BFF"),
        ("Onboarding Service", "MB-ONB", "Java · Spring Boot"),
        ("Notification Service", "MB-NOTIF", "Go · Kafka"),
    ],
    "PAYM": [
        ("UPI Switch", "PM-UPI", "Java · low-latency"),
        ("Reconciliation Service", "PM-RECON", "Java · Spring Batch"),
        ("NPCI Adapter", "PM-NPCI", "Java · Spring Boot"),
        ("Payments Orchestrator", "PM-ORCH", "Kafka · event-driven"),
    ],
    "CARD": [
        ("Card Management System", "CD-CMS", "Java · Spring Boot"),
        ("Tokenization Vault", "CD-VAULT", "HSM-backed · Java"),
        ("Authorization Switch", "CD-AUTH", "C++ · low-latency"),
        ("Disputes Service", "CD-DISP", "Java · Spring Boot"),
    ],
    "ATMC": [
        ("ATM Switch", "AT-SW", "Base24 · ISO 8583"),
        ("ATM Monitoring", "AT-MON", "Go · telemetry"),
        ("Cash Management Service", "AT-CASH", "Java · Spring Boot"),
        ("Reconciliation Service", "AT-RECON", "Java · Spring Batch"),
    ],
    "CORP": [
        ("Corporate Portal", "CB-PORTAL", "React · Java BFF"),
        ("Host-to-Host Gateway", "CB-H2H", "Java · SFTP/API"),
        ("Bulk Payments Engine", "CB-BULK", "Java · Spring Batch"),
        ("Trade Finance Service", "CB-TRADE", "Java · Spring Boot"),
    ],
    "TRES": [
        ("Treasury Management System", "TR-TMS", "Java · Spring Boot"),
        ("FX Trading Engine", "TR-FX", "Java · low-latency"),
        ("Settlement Service", "TR-SETL", "Java · Spring Batch"),
        ("Regulatory Reporting", "TR-REG", "Python · reporting"),
    ],
}

# --- Requirements phrasing per project ---
REQUIREMENT_TITLES = {
    "NETB": [
        "Enable same-account funds transfer with instant confirmation",
        "Support scheduled and recurring bill payments",
        "Provide downloadable account statements (PDF/CSV)",
        "Enforce concurrent-session limits per customer policy",
        "Support beneficiary management with cooling-off period",
        "Provide cheque-book and service requests online",
        "Enable positive-pay confirmation for high-value cheques",
        "Support corporate maker-checker on bulk transfers",
        "Provide transaction search with 12-month history",
        "Enable standing instructions for utility payments",
    ],
    "MOBB": [
        "Enable biometric login with MPIN fallback",
        "Support digital onboarding with video KYC",
        "Enable card controls (freeze/unfreeze, limits)",
        "Provide push notifications for every transaction",
        "Support UPI payments from the mobile app",
        "Enable in-app dispute raising for failed transactions",
        "Provide personal finance insights and spend categories",
        "Support cardless cash withdrawal via mobile",
        "Enable device binding and jailbreak/root detection",
        "Provide accessibility (screen-reader) compliant journeys",
    ],
    "PAYM": [
        "Detect failed / pending UPI transactions in near real-time",
        "Reconcile bank ledger against NPCI settlement files",
        "Trigger auto-reversal for debit-success / credit-failed UPI",
        "Notify customer on auto-reversal completion",
        "Maintain immutable audit trail for reversal state transitions",
        "Enforce idempotency on all payment mutations",
        "Support NEFT/RTGS batch settlement within RBI windows",
        "Provide operational monitoring dashboards for payments",
        "Handle switch timeout and NPCI response failures gracefully",
        "Support dispute and chargeback reconciliation with NPCI",
    ],
    "CARD": [
        "Support card issuance and activation workflows",
        "Enable card tokenization for card-on-file payments",
        "Process 3DS challenge authorization flows",
        "Support card freeze/unfreeze and limit controls",
        "Handle chargeback and dispute lifecycle with networks",
        "Enforce PCI-DSS controls on PAN handling",
        "Support EMV contactless and tap-to-pay",
        "Provide rewards and cashback accrual",
        "Detect card fraud in real-time with rule scoring",
        "Reconcile card settlement with networks (Visa/Mastercard/RuPay)",
    ],
    "ATMC": [
        "Route ATM transactions via ISO 8583 switch",
        "Support cardless cash withdrawal via mobile token",
        "Monitor ATM cash levels and health in real-time",
        "Reconcile ATM dispense against switch and core",
        "Handle partial/failed dispense reversal",
        "Enforce daily withdrawal limits per customer",
        "Support cash deposit at recyclers",
        "Detect ATM skimming/fraud anomalies",
        "Provide ATM uptime and availability dashboards",
        "Support fastcash and preferred-amount flows",
    ],
    "CORP": [
        "Support bulk payment file upload and validation",
        "Enable host-to-host (H2H) payment integration",
        "Enforce maker-checker approval on corporate payments",
        "Provide trade finance (LC/BG) processing",
        "Support multi-currency corporate accounts",
        "Provide corporate mandate and entitlement management",
        "Enable virtual account and collections management",
        "Provide MIS and cash-flow forecasting dashboards",
        "Support sweep and pooling for liquidity management",
        "Reconcile bulk disbursements with beneficiary confirmations",
    ],
    "TRES": [
        "Support FX spot and forward deal capture",
        "Enable money-market and liquidity management",
        "Process settlement across nostro/vostro accounts",
        "Provide regulatory reporting (LCR/NSFR)",
        "Support limit and exposure monitoring in real-time",
        "Enable deal confirmation and matching",
        "Provide mark-to-market valuation",
        "Support hedge accounting workflows",
        "Reconcile treasury positions with the general ledger",
        "Provide intraday liquidity monitoring dashboards",
    ],
}

NFR_TITLES = [
    "System availability of 99.95% during business hours",
    "P95 API latency under 800ms at peak volume",
    "Horizontal scalability to 5,000 TPS sustained",
    "All PII masked in logs (PCI-DSS Req 3.4)",
    "Idempotent, replay-safe transaction processing",
    "RPO of zero and RTO under 30 minutes",
]

ASSUMPTION_TITLES = [
    "Core banking exposes real-time balance APIs",
    "NPCI reconciliation files are available on the agreed cadence",
    "Customer mobile numbers are verified and current",
    "Downstream sanctions screening meets its stated SLA",
]

DEPENDENCY_TITLES = [
    "NPCI settlement/dispute feed integration",
    "Core banking ledger posting service",
    "Enterprise notification (SMS/push) platform",
    "Fraud & risk scoring engine",
]

ANALYSIS_ISSUES = [
    ("ambiguous", "Requirement wording is ambiguous and untestable as written."),
    ("missing-ac", "No acceptance criteria defined; cannot be verified at sign-off."),
    ("missing-nfr", "Performance / availability thresholds are not specified."),
    ("missing-control", "Regulatory control reference is missing; flagged for audit."),
    ("frequently-changing", "Requirement has changed repeatedly; scope is unstable."),
]

# --- Architecture ---
ARCH_VIEWS = [
    ("Logical Architecture", "Logical component view across channels and services"),
    ("Physical Architecture", "Deployment topology across zones and clusters"),
    ("Integration", "Integration architecture with NPCI, core banking and notifications"),
    ("Sequence", "End-to-end sequence for the primary transaction journey"),
    ("API Inventory", "Catalog of exposed and consumed APIs"),
    ("Database Design", "Logical and physical data model for the domain"),
]

ARCH_FINDINGS = [
    ("Resilience", "critical", "Single-AZ deployment risks a full outage on zone failure."),
    ("Integration", "high", "Synchronous downstream call cascades timeouts under load."),
    ("Data Model", "high", "Reconciliation store not keyed by RRN, limiting traceability."),
    ("Modularity", "medium", "Monolith coupling increases release blast radius."),
    ("Observability", "medium", "Missing distributed tracing across the payment path."),
]

# --- Development ---
DEV_STORY_TITLES = {
    "NETB": [
        "Implement funds-transfer confirmation screen",
        "Add covering index to funds-transfer query",
        "Implement concurrent-session guard",
        "Add positive-pay confirmation flow",
        "Refactor statements batch for incremental generation",
    ],
    "MOBB": [
        "Implement biometric login with MPIN fallback",
        "Add device binding and root detection",
        "Implement card freeze/unfreeze controls",
        "Add response aggregator for balance screen",
        "Implement in-app dispute submission",
    ],
    "PAYM": [
        "Implement reversal orchestrator saga",
        "Add idempotency keys to reversal endpoints",
        "Implement NPCI reconciliation adapter",
        "Add masked secure logging for account/RRN",
        "Implement reversal-SLA monitoring metrics",
    ],
    "CARD": [
        "Implement card tokenization vault integration",
        "Add 3DS challenge orchestration",
        "Implement card freeze/unfreeze API",
        "Add chargeback lifecycle state machine",
        "Implement network settlement reconciliation",
    ],
    "ATMC": [
        "Implement ISO 8583 switch adapter",
        "Add cardless withdrawal token flow",
        "Implement partial-dispense reversal handler",
        "Add ATM health telemetry pipeline",
        "Implement cash-level forecasting job",
    ],
    "CORP": [
        "Implement bulk payment file parser and validator",
        "Add maker-checker approval workflow",
        "Implement H2H SFTP ingestion adapter",
        "Add virtual account allocation service",
        "Implement liquidity sweep scheduler",
    ],
    "TRES": [
        "Implement FX deal capture screen",
        "Add settlement instruction generator",
        "Implement exposure/limit monitoring engine",
        "Add mark-to-market valuation job",
        "Implement regulatory report extract (LCR)",
    ],
}

DEV_FINDINGS = [
    ("Security", "critical", "PAN/account logged in plaintext (PCI-DSS 3.4 violation)."),
    ("Code Quality", "high", "Reconciliation method complexity exceeds the gate of 15."),
    ("Performance", "medium", "Endpoint p95 exceeds target due to nested DB join."),
    ("Security", "high", "Duplicated JWT validation skips audience checks."),
    ("Code Quality", "low", "Empty catch blocks swallow funds-transfer errors."),
]

# --- Testing ---
TEST_TITLES = {
    "NETB": [
        "Funds transfer own-account success within SLA",
        "Funds transfer to closed account rejected",
        "Concurrent session blocked per policy",
        "Bill payment scheduled and executed",
        "Statement download returns 12-month history",
    ],
    "MOBB": [
        "Biometric login success issues session",
        "Biometric failure falls back to MPIN",
        "Card freeze blocks subsequent authorization",
        "Push notification delivered for each transaction",
        "Rooted device blocked at login",
    ],
    "PAYM": [
        "Debit success + credit fail triggers auto-reversal",
        "Switch timeout does not double-debit",
        "NPCI shows beneficiary credited: no reversal",
        "NPCI response failure retries then reverses",
        "Duplicate request key yields single debit",
    ],
    "CARD": [
        "Card-on-file tokenization succeeds",
        "3DS challenge abandoned declines gracefully",
        "Card freeze blocks subsequent authorization",
        "Chargeback raised and network-acknowledged",
        "Settlement reconciles with network file",
    ],
    "ATMC": [
        "Cash withdrawal within limit dispenses correctly",
        "Partial dispense triggers reversal",
        "Cardless withdrawal token validated and honored",
        "Withdrawal beyond daily limit rejected",
        "ATM offline routes to standby switch",
    ],
    "CORP": [
        "Bulk file with valid records processed fully",
        "Maker-checker rejects unapproved bulk batch",
        "H2H payload validated and ingested",
        "Virtual account collection auto-reconciled",
        "Liquidity sweep executes on schedule",
    ],
    "TRES": [
        "FX spot deal captured and confirmed",
        "Settlement instruction generated for matched deal",
        "Limit breach blocks deal booking",
        "Mark-to-market valuation computed correctly",
        "LCR regulatory extract balances to source",
    ],
}

DEFECT_TITLES = [
    "Auto-reversal misses SLA under peak load",
    "Double-debit on retry without idempotency key",
    "Card token expiry not propagated to merchant",
    "Balance refresh slow path drains battery",
    "Funds-transfer p95 exceeds target under load",
]

# --- Release ---
RELEASE_NAMES = {
    "NETB": ["Net Banking Q3 Release", "Net Banking Funds-Transfer Hotfix"],
    "MOBB": ["Mobile Banking v5 Release", "Mobile Biometric Hardening"],
    "PAYM": ["UPI Auto-Reversal Release", "Payments Reconciliation Uplift"],
    "CARD": ["Cards Tokenization Release", "3DS Authorization Uplift"],
    "ATMC": ["ATM Switch Modernization", "Cardless Withdrawal Release"],
    "CORP": ["Corporate H2H Release", "Bulk Payments Resilience Uplift"],
    "TRES": ["Treasury FX Release", "Regulatory Reporting Uplift"],
}

# --- Audit ---
AUDIT_EVIDENCE = [
    ("Change Evidence", "Change ticket, ARB approval and CAB minutes linked"),
    ("Approval Evidence", "Maker-checker approvals for money-movement change"),
    ("Test Evidence", "Reconciliation & reversal test results attached to release"),
    ("Reconciliation Logs", "NPCI reconciliation logs retained per policy"),
    ("Access Evidence", "Privileged access recertification for the service"),
]

COMPLIANCE_FRAMEWORKS = [
    ("RBI", "Master Direction · Digital Payment Security"),
    ("PCI-DSS", "Req 3.4 · PAN masking"),
    ("PCI-DSS", "Req 11.3 · ASV scans"),
    ("RBI", "Harmonisation of TAT · Failed Transactions"),
    ("SOX", "ITGC · Change Management"),
    ("AML", "Transaction Monitoring Thresholds"),
]

# --- Knowledge ---
KNOWLEDGE_ARTICLES = [
    ("Lesson Learned", "Idempotency keys eliminate double-debit on retries"),
    ("Best Practice", "Saga pattern for reliable auto-reversal"),
    ("Playbook", "NPCI reconciliation incident runbook"),
    ("Pattern", "Circuit breaker + bulkhead for channel BFFs"),
    ("Lesson Learned", "Feature flags enable safe money-movement rollout"),
    ("Best Practice", "Masked secure logging for PII compliance"),
]

# --- Transformation ---
TRANSFORMATION_PROGRAMS = [
    "Digital Channels Modernization",
    "Payments Resilience Program",
    "Cloud Migration Wave 2",
    "Regulatory Compliance Uplift",
]

# ---------------------------------------------------------------------------
# Generic fallback datasets + accessors
# ---------------------------------------------------------------------------
# The seeder must never raise KeyError for a project code that lacks a
# hand-authored dataset. Accessors return the project-specific list when present
# and otherwise synthesize a realistic, generic banking dataset from the project
# metadata — so ANY future banking project seeds correctly (DRY, no duplication).

# Generic per-project vocab used to derive fallbacks. Keyed by the project's
# short label word (derived from name); falls back to neutral banking phrasing.
_GENERIC_APPLICATION_SUFFIXES = [
    ("Core Service", "CORE", "Java · Spring Boot"),
    ("Channel Gateway", "GW", "Java · API gateway"),
    ("Processing Engine", "ENG", "Java · Spring Batch"),
    ("Reconciliation Service", "RECON", "Java · Spring Batch"),
]

_GENERIC_REQUIREMENT_TITLES = [
    "Capture and validate the core business transaction",
    "Integrate with core banking for posting and balances",
    "Enforce maker-checker on sensitive operations",
    "Provide real-time status and notifications to customers",
    "Maintain an immutable audit trail for all state changes",
    "Reconcile transactions against downstream systems",
    "Enforce regulatory and compliance controls",
    "Provide operational monitoring and alerting",
    "Handle timeouts and downstream failures gracefully",
    "Support dispute handling and resolution",
]

_GENERIC_DEV_STORY_TITLES = [
    "Implement the core transaction service",
    "Add validation and error-handling on the primary flow",
    "Integrate with the core banking adapter",
    "Add idempotency and retry handling",
    "Implement monitoring and audit instrumentation",
]

_GENERIC_TEST_TITLES = [
    "Primary transaction succeeds within SLA",
    "Invalid input is rejected with a clear error",
    "Downstream timeout is handled without data loss",
    "Duplicate request is de-duplicated (idempotent)",
    "Audit trail records every state transition",
]


def _short_label(project_code: str) -> str:
    """Return a project prefix for generated codes."""
    return (project_code or "GEN")[:3].upper()


def get_applications(project_code: str) -> list[tuple[str, str, str]]:
    """Applications for a project (specific if defined, else generic fallback)."""
    if project_code in APPLICATIONS:
        return APPLICATIONS[project_code]
    prefix = _short_label(project_code)
    return [
        (f"{project_code} {name}", f"{prefix}-{code}", tech)
        for name, code, tech in _GENERIC_APPLICATION_SUFFIXES
    ]


def get_requirement_templates(project_code: str) -> list[str]:
    """Requirement titles for a project (specific if defined, else generic)."""
    return REQUIREMENT_TITLES.get(project_code) or list(_GENERIC_REQUIREMENT_TITLES)


def get_dev_story_templates(project_code: str) -> list[str]:
    """Development story titles for a project (specific if defined, else generic)."""
    return DEV_STORY_TITLES.get(project_code) or list(_GENERIC_DEV_STORY_TITLES)


def get_test_templates(project_code: str) -> list[str]:
    """Test-case titles for a project (specific if defined, else generic)."""
    return TEST_TITLES.get(project_code) or list(_GENERIC_TEST_TITLES)


def get_release_names(project_code: str) -> list[str]:
    """Release names for a project (specific if defined, else generic)."""
    return RELEASE_NAMES.get(project_code) or [
        f"{project_code} Foundation Release",
        f"{project_code} Resilience Uplift",
    ]


# Shared (project-agnostic) datasets — exposed via trivial accessors so the
# seeder uses a uniform helper style everywhere. Accessors that take a
# ``project_code`` keep a consistent, future-proof signature even when the
# underlying dataset is currently shared across projects.
def get_architecture_templates(project_code: str) -> list[tuple[str, str]]:
    """Architecture view templates for a project (shared banking set today)."""
    return ARCH_VIEWS


def get_artifact_templates(project_code: str) -> list[str]:
    """Artifact-type names relevant to a project (shared banking set today)."""
    return [
        "Concept Note", "BRD", "FRD", "SRS", "NFR",
        "HLD", "LLD", "API Specification", "Database Design",
        "Test Plan", "Deployment Guide", "Audit Checklist", "Executive Summary",
    ]


def get_copilot_templates(project_code: str) -> dict[str, list[str]]:
    """Per-phase copilot reasoning templates (shared banking set today)."""
    return COPILOT_REASONING


def get_arch_views() -> list[tuple[str, str]]:
    return ARCH_VIEWS


def get_arch_findings() -> list[tuple[str, str, str]]:
    return ARCH_FINDINGS


def get_dev_findings() -> list[tuple[str, str, str]]:
    return DEV_FINDINGS


def get_nfr_titles() -> list[str]:
    return NFR_TITLES


def get_assumption_titles() -> list[str]:
    return ASSUMPTION_TITLES


def get_dependency_titles() -> list[str]:
    return DEPENDENCY_TITLES


def get_defect_titles() -> list[str]:
    return DEFECT_TITLES


def get_audit_evidence() -> list[tuple[str, str]]:
    return AUDIT_EVIDENCE


def get_compliance_frameworks() -> list[tuple[str, str]]:
    return COMPLIANCE_FRAMEWORKS


def get_knowledge_articles() -> list[tuple[str, str]]:
    return KNOWLEDGE_ARTICLES


# --- Copilot reasoning per phase (checklist bullets) ---
COPILOT_REASONING = {
    "requirements": [
        "Banking domain detected",
        "Payments workflow detected",
        "Customer-impacting feature",
        "RBI regulatory impact identified",
        "Compliance review required",
    ],
    "architecture": [
        "Event-driven architecture detected",
        "NPCI integration detected",
        "Retry strategy required",
        "Timeout handling required",
        "High availability recommended",
    ],
    "development": [
        "New APIs required",
        "Existing payment service impacted",
        "Feature toggle recommended",
        "Secure coding checklist required",
    ],
    "testing": [
        "Reconciliation scenarios detected",
        "Negative & timeout paths required",
        "Double-debit risk identified",
        "High automation coverage recommended",
    ],
    "release": [
        "Customer money-movement change detected",
        "CAB approval required",
        "Kill-switch rollback required",
        "Monitoring readiness is a go-live gate",
    ],
    "audit": [
        "Regulated money-movement change detected",
        "RBI TAT & NPCI control mapping required",
        "Immutable reversal evidence required",
        "7-year reconciliation log retention required",
    ],
}
