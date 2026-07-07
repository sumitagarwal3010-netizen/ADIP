"""Banking Prompt Template Library (Phase C).

Provides professional, reusable prompt templates for 25 banking use cases. Each
template is generated from a compact per-use-case spec using shared enterprise
phrasing patterns — so all 16 fields are complete and consistent without
duplicating thousands of lines. Includes multi-dimensional ranking.

Templates feed the Prompt Execution Engine (a template's ``business_prompt`` can
be sent straight to ``POST /orchestrator/execute``).
"""
from __future__ import annotations

from dataclasses import dataclass

from app.schemas.prompt_templates import (
    ArtifactPromptTemplate,
    ArtifactPromptTemplateList,
    ArtifactPromptTemplateSummary,
    MatrixPromptList,
    MatrixPromptSummary,
    MatrixPromptTemplate,
    PromptRanking,
    PromptTemplate,
    PromptTemplateList,
    PromptTemplateSummary,
)
from app.services.artifact_spec import ARTIFACT_SPECS, ArtifactSpec, get_spec
from app.services.banking_domains import (
    DOMAINS,
    MATRIX_ARTIFACT_TYPES,
    MATRIX_TO_GENERATOR,
    BankingDomain,
)


@dataclass(frozen=True)
class _Spec:
    """Compact per-use-case definition expanded into a full template."""

    id: str
    name: str
    category: str
    domain: str
    scenario: str            # one-line problem scenario
    compliance: tuple[str, ...]
    # ranking dimensions (0-100)
    business_value: int
    complexity: int
    compliance_impact: int
    customer_impact: int
    engineering_effort: int
    risk_reduction: int
    ai_confidence: int
    demo_value: int


# 25 banking use cases (compact specs).
_SPECS: list[_Spec] = [
    _Spec("upi-auto-reversal", "UPI Auto-Reversal", "Payments", "UPI",
          "Customer debited but beneficiary not credited due to switch timeout / NPCI failure; detect, reconcile and auto-reverse.",
          ("RBI TAT", "NPCI Dispute Rules", "PCI-DSS"), 95, 80, 95, 95, 70, 85, 95, 98),
    _Spec("imps-transfer", "IMPS Instant Transfer", "Payments", "IMPS",
          "Real-time 24x7 interbank transfer with instant confirmation and reconciliation.",
          ("RBI", "NPCI"), 85, 65, 80, 90, 60, 70, 90, 85),
    _Spec("neft-batch", "NEFT Batch Settlement", "Payments", "NEFT",
          "Batch settlement within RBI half-hourly windows with return handling.",
          ("RBI",), 80, 60, 80, 75, 55, 70, 88, 78),
    _Spec("rtgs-highvalue", "RTGS High-Value Transfer", "Payments", "RTGS",
          "Real-time gross settlement for high-value payments with sanctions screening.",
          ("RBI", "AML"), 82, 65, 85, 78, 58, 75, 87, 80),
    _Spec("credit-card-issuance", "Credit Card Issuance", "Cards", "Credit Cards",
          "End-to-end credit card issuance, activation, limit and tokenization.",
          ("PCI-DSS", "RBI"), 84, 70, 88, 85, 65, 72, 88, 84),
    _Spec("debit-card-controls", "Debit Card Controls", "Cards", "Debit Cards",
          "Customer-managed freeze/unfreeze, channel and limit controls.",
          ("PCI-DSS",), 78, 55, 75, 88, 50, 68, 90, 82),
    _Spec("corporate-bulk-payments", "Corporate Bulk Payments", "Corporate Banking", "Corporate Banking",
          "Bulk payment file upload, validation and maker-checker approval.",
          ("RBI", "SOX"), 86, 75, 82, 80, 70, 74, 85, 83),
    _Spec("trade-finance-lc", "Trade Finance — Letter of Credit", "Corporate Banking", "Trade Finance",
          "LC issuance, amendment and document examination workflow.",
          ("UCP 600", "RBI"), 80, 85, 80, 65, 80, 65, 78, 76),
    _Spec("loan-origination", "Loan Origination", "Lending", "Loan Origination",
          "Digital loan origination: eligibility, KYC, offer, disbursement.",
          ("RBI", "KYC"), 88, 75, 85, 88, 70, 72, 86, 88),
    _Spec("beneficiary-management", "Beneficiary Management", "Payments", "Beneficiary Management",
          "Add/verify beneficiaries with cooling-off and velocity controls.",
          ("RBI",), 76, 50, 78, 85, 45, 78, 92, 80),
    _Spec("standing-instructions", "Standing Instructions", "Payments", "Standing Instructions",
          "Recurring payment mandates with retry and failure notification.",
          ("RBI",), 74, 55, 72, 82, 50, 68, 90, 76),
    _Spec("fastag", "FASTag Recharge & Toll", "Payments", "FASTag",
          "FASTag issuance, recharge and toll deduction reconciliation with NPCI.",
          ("NPCI", "NETC"), 78, 60, 78, 84, 58, 70, 88, 82),
    _Spec("merchant-payments", "Merchant Payments", "Payments", "Merchant Payments",
          "Merchant onboarding, settlement and MDR handling.",
          ("RBI", "PCI-DSS"), 82, 65, 80, 80, 60, 70, 87, 82),
    _Spec("qr-payments", "QR Code Payments", "Payments", "QR Payments",
          "Static/dynamic UPI QR generation, scan-and-pay and reconciliation.",
          ("NPCI",), 80, 55, 78, 88, 52, 70, 90, 86),
    _Spec("atm-cardless", "ATM Cardless Withdrawal", "Self-Service", "ATM",
          "Cardless cash withdrawal via mobile token with partial-dispense reversal.",
          ("RBI", "NPCI"), 79, 65, 80, 85, 60, 76, 88, 84),
    _Spec("treasury-fx", "Treasury FX Deal", "Treasury", "Treasury",
          "FX spot/forward deal capture, confirmation and settlement.",
          ("RBI", "FEMA"), 80, 80, 82, 60, 78, 70, 80, 75),
    _Spec("internet-banking-transfer", "Internet Banking Funds Transfer", "Digital Channels", "Internet Banking",
          "Own/third-party transfer with limits, OTP and audit trail.",
          ("RBI",), 82, 55, 80, 88, 50, 72, 91, 84),
    _Spec("mobile-biometric-login", "Mobile Biometric Login", "Digital Channels", "Mobile Banking",
          "Biometric login with MPIN fallback and device binding.",
          ("RBI",), 84, 60, 82, 92, 55, 78, 90, 88),
    _Spec("customer-onboarding", "Digital Customer Onboarding", "Onboarding", "Customer Onboarding",
          "Digital onboarding with video KYC and account opening.",
          ("RBI", "KYC"), 88, 70, 88, 90, 65, 74, 87, 90),
    _Spec("kyc-reverification", "KYC Re-verification", "Compliance", "KYC",
          "Periodic KYC refresh with risk-based re-verification.",
          ("RBI", "KYC"), 78, 55, 92, 70, 50, 82, 88, 78),
    _Spec("aml-monitoring", "AML Transaction Monitoring", "Compliance", "AML",
          "Rule-based transaction monitoring, alerts and STR filing.",
          ("AML", "FIU-IND", "RBI"), 82, 75, 95, 60, 70, 88, 84, 80),
    _Spec("fraud-detection", "Real-Time Fraud Detection", "Risk", "Fraud Detection",
          "Real-time fraud scoring, rule trace and decisioning.",
          ("RBI", "PCI-DSS"), 88, 80, 90, 85, 78, 90, 85, 88),
    _Spec("npci-reconciliation", "NPCI Reconciliation", "Payments", "NPCI",
          "Reconcile bank ledger with NPCI settlement/dispute files.",
          ("NPCI", "RBI TAT"), 86, 70, 90, 75, 68, 85, 88, 84),
    _Spec("rbi-compliance-reporting", "RBI Compliance Reporting", "Compliance", "RBI Compliance",
          "Automated regulatory return generation and submission.",
          ("RBI",), 80, 65, 95, 55, 62, 84, 85, 78),
    _Spec("digital-payments-hub", "Digital Payments Hub", "Payments", "Digital Payments",
          "Unified payments hub across UPI/IMPS/NEFT/RTGS with routing.",
          ("RBI", "NPCI", "PCI-DSS"), 90, 88, 88, 85, 82, 80, 84, 90),
]


def _composite(s: _Spec) -> int:
    """Weighted composite rank emphasizing value, compliance, customer and demo."""
    return round(
        0.22 * s.business_value
        + 0.16 * s.compliance_impact
        + 0.16 * s.customer_impact
        + 0.14 * s.risk_reduction
        + 0.12 * s.demo_value
        + 0.10 * s.ai_confidence
        + 0.05 * (100 - s.complexity)
        + 0.05 * (100 - s.engineering_effort)
    )


def _build_template(s: _Spec) -> PromptTemplate:
    comp = ", ".join(s.compliance)
    return PromptTemplate(
        id=s.id,
        name=s.name,
        category=s.category,
        domain=s.domain,
        business_context=(
            f"{s.name} is a {s.category} capability in the {s.domain} domain. "
            f"It must meet {comp} expectations and deliver a resilient, auditable customer experience."
        ),
        problem_statement=s.scenario,
        business_prompt=f"Implement {s.name} for the bank. {s.scenario}",
        functional_prompt=(
            f"Define the functional requirements, business rules, validations and edge cases for {s.name}, "
            f"including happy-path, negative and reconciliation flows."
        ),
        architecture_prompt=(
            f"Design the solution architecture for {s.name}: impacted systems, integration and API flows, "
            f"event flows, data model, resilience and timeout handling."
        ),
        development_prompt=(
            f"Produce the development plan for {s.name}: impacted services/modules, API endpoints, validation, "
            f"error handling, feature flags and a secure-coding checklist."
        ),
        testing_prompt=(
            f"Create a test strategy and cases for {s.name}: functional, negative, reconciliation, "
            f"timeout/failure scenarios, regression scope and automation candidates."
        ),
        release_prompt=(
            f"Prepare the release plan for {s.name}: deployment steps, rollback plan, CAB summary, "
            f"PVT checklist and monitoring readiness."
        ),
        audit_prompt=(
            f"Compile the audit-readiness pack for {s.name}: evidence checklist, change/approval/test evidence, "
            f"reconciliation logs and regulatory control mapping ({comp})."
        ),
        executive_prompt=(
            f"Summarize {s.name} for a CIO audience: business value, risk, compliance posture, readiness and effort saved."
        ),
        expected_artifacts=[
            "BRD", "FRD", "NFR", "HLD", "LLD", "API Spec", "DB Design",
            "Test Strategy", "Test Cases", "Deployment Guide", "Rollback Plan",
            "Audit Checklist", "Compliance Matrix", "Traceability Matrix", "Executive Summary",
        ],
        acceptance_criteria=[
            f"{s.name} happy-path completes within SLA",
            "Negative and timeout paths handled without data loss",
            "Idempotent, replay-safe processing",
            f"Regulatory controls satisfied ({comp})",
            "Immutable audit trail for every state transition",
        ],
        risks=[
            "Downstream/integration timeout or failure",
            "Reconciliation mismatch or data inconsistency",
            "Regulatory non-compliance if controls are missed",
            "Customer impact during incidents",
        ],
        compliance=list(s.compliance),
        testing_strategy=[
            "Functional + negative + reconciliation coverage",
            "Timeout/failure and idempotency contract tests",
            "Regression pack with high automation",
            "Performance/soak at peak volume",
        ],
        success_criteria=[
            "All acceptance criteria met and signed off",
            "Zero Sev1 defects at go-live",
            "Monitoring and rollback rehearsed",
            "Audit evidence complete",
        ],
        ranking=PromptRanking(
            business_value=s.business_value,
            implementation_complexity=s.complexity,
            compliance_impact=s.compliance_impact,
            customer_impact=s.customer_impact,
            engineering_effort=s.engineering_effort,
            risk_reduction=s.risk_reduction,
            ai_confidence=s.ai_confidence,
            executive_demo_value=s.demo_value,
            composite=_composite(s),
        ),
    )


def _build_artifact_template(spec: ArtifactSpec) -> ArtifactPromptTemplate:
    """Build an enterprise artifact-authoring prompt template from a spec."""
    comp = ", ".join(spec.compliance) or "applicable banking regulations"
    return ArtifactPromptTemplate(
        artifact_type=spec.artifact_type,
        name=f"{spec.artifact_type} Authoring Template",
        phase=spec.phase,
        role_instruction=(
            f"You are a principal banking {spec.phase} specialist authoring a "
            f"professional, enterprise-grade {spec.artifact_type}. Be precise, "
            f"complete, regulator-aware and free of placeholders."
        ),
        business_context=(
            f"The {spec.artifact_type} supports an Indian retail/enterprise banking "
            f"initiative and must align to {comp}."
        ),
        artifact_objective=spec.objective,
        required_sections=list(spec.required_sections),
        output_format="Structured document with numbered sections; JSON and Markdown supported.",
        banking_domain_assumptions=[
            "Core banking exposes real-time balance/posting APIs",
            "NPCI/RBI integration and settlement windows apply where relevant",
            "PII must be masked; transactions must be idempotent and auditable",
        ],
        compliance_considerations=list(spec.compliance) or ["RBI"],
        quality_checklist=[
            "All required sections present and non-empty",
            "No placeholder text (TBD/TODO)",
            "Banking-specific, testable content",
            "Compliance controls referenced",
            "Traceability to requirements/prompt included",
        ],
        traceability_requirements=[
            "Reference the originating prompt and project",
            "Link sections to requirements/design/test where applicable",
        ],
        json_schema_expectations={
            "type": "object",
            "required": ["artifact_type", "title", "sections"],
            "properties": {
                "artifact_type": {"type": "string"},
                "title": {"type": "string"},
                "sections": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["heading", "body"],
                        "properties": {
                            "heading": {"type": "string"},
                            "body": {"type": "string"},
                            "bullets": {"type": "array", "items": {"type": "string"}},
                        },
                    },
                },
            },
        },
        markdown_expectations=[
            "H1 title, then an Executive Summary",
            "One H2 per required section",
            "Bulleted lists for checklists and criteria",
        ],
    )


def _matrix_id(domain_key: str, artifact_type: str) -> str:
    return f"{domain_key}--{artifact_type.lower().replace(' ', '-')}"


def _build_matrix_prompt(domain: BankingDomain, artifact_type: str) -> MatrixPromptTemplate:
    """Build a domain × artifact-type prompt from the domain + artifact spec."""
    gen_type = MATRIX_TO_GENERATOR.get(artifact_type, artifact_type)
    spec = get_spec(gen_type)
    sections = list(spec.required_sections) if spec else ["Overview", "Details"]
    phase = spec.phase if spec else "requirements"
    comp = ", ".join(domain.compliance) or "applicable RBI regulations"
    return MatrixPromptTemplate(
        id=_matrix_id(domain.key, artifact_type),
        domain=domain.name,
        artifact_type=artifact_type,
        phase=phase,
        role=(f"You are a principal banking {phase} specialist authoring a professional "
              f"{artifact_type} for the {domain.name} domain."),
        context=f"{domain.name} ({domain.area}): {domain.scenario} Must align to {comp}.",
        objective=f"Produce a complete, enterprise-grade {artifact_type} for {domain.name}.",
        constraints=[
            "Banking-specific and regulator-aware content only",
            "No placeholder text (TBD/TODO)",
            "Idempotent, auditable, PII-masked where relevant",
            "Every required section populated",
        ],
        expected_sections=sections,
        expected_output="Structured document; JSON and Markdown supported; DOCX/PDF-ready.",
        quality_checklist=[
            "All expected sections present and non-empty",
            "Banking domain terminology used correctly",
            "Testable and traceable statements",
            "Compliance controls referenced",
        ],
        compliance_checklist=list(domain.compliance) or ["RBI"],
    )


class PromptTemplateLibrary:
    """Access to the banking prompt template catalog + artifact-authoring templates
    + the enterprise domain × artifact prompt matrix (hundreds of prompts)."""

    def __init__(self) -> None:
        self._templates: dict[str, PromptTemplate] = {
            s.id: _build_template(s) for s in _SPECS
        }
        self._artifact_templates: dict[str, ArtifactPromptTemplate] = {
            spec.artifact_type: _build_artifact_template(spec)
            for spec in ARTIFACT_SPECS.values()
        }
        # Enterprise prompt matrix: 20 domains × 18 artifact types = 360 prompts.
        self._matrix: dict[str, MatrixPromptTemplate] = {
            _matrix_id(d.key, atype): _build_matrix_prompt(d, atype)
            for d in DOMAINS
            for atype in MATRIX_ARTIFACT_TYPES
        }

    # --- enterprise prompt matrix (Phase 1) ---
    def list_matrix(self, *, domain: str | None = None, artifact_type: str | None = None) -> MatrixPromptList:
        items = list(self._matrix.values())
        if domain:
            items = [t for t in items if t.domain.lower() == domain.lower()]
        if artifact_type:
            items = [t for t in items if t.artifact_type.lower() == artifact_type.lower()]
        summaries = [
            MatrixPromptSummary(id=t.id, domain=t.domain, artifact_type=t.artifact_type, phase=t.phase)
            for t in items
        ]
        return MatrixPromptList(
            total=len(summaries),
            domains=[d.name for d in DOMAINS],
            artifact_types=list(MATRIX_ARTIFACT_TYPES),
            templates=summaries,
        )

    def get_matrix_prompt(self, prompt_id: str) -> MatrixPromptTemplate | None:
        return self._matrix.get(prompt_id)

    @property
    def matrix_count(self) -> int:
        return len(self._matrix)

    # --- artifact-authoring templates (Phase 1) ---
    def list_artifact_templates(self) -> ArtifactPromptTemplateList:
        items = [
            ArtifactPromptTemplateSummary(
                artifact_type=t.artifact_type, name=t.name, phase=t.phase,
                section_count=len(t.required_sections),
            )
            for t in sorted(self._artifact_templates.values(), key=lambda x: x.artifact_type)
        ]
        return ArtifactPromptTemplateList(total=len(items), templates=items)

    def get_artifact_template(self, artifact_type: str) -> ArtifactPromptTemplate | None:
        return self._artifact_templates.get(artifact_type)

    def list(self, *, category: str | None = None, sort_by_rank: bool = True) -> PromptTemplateList:
        items = list(self._templates.values())
        if category:
            items = [t for t in items if t.category.lower() == category.lower()]
        if sort_by_rank:
            items.sort(key=lambda t: t.ranking.composite, reverse=True)
        summaries = [
            PromptTemplateSummary(
                id=t.id, name=t.name, category=t.category, domain=t.domain,
                composite_rank=t.ranking.composite,
            )
            for t in items
        ]
        return PromptTemplateList(total=len(summaries), templates=summaries)

    def get(self, template_id: str) -> PromptTemplate | None:
        return self._templates.get(template_id)

    def categories(self) -> list[str]:
        return sorted({t.category for t in self._templates.values()})

    def top_ranked(self, limit: int = 10) -> list[PromptTemplate]:
        return sorted(self._templates.values(), key=lambda t: t.ranking.composite, reverse=True)[:limit]


prompt_template_library = PromptTemplateLibrary()
