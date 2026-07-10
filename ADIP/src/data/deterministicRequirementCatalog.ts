import { normalizeRequirement, requirementSessionKey } from './aiSessionStore';
import type { RequirementArtifactPackage } from '../types/copilot';

const GENERATED_BY = 'Requirements Copilot (Deterministic Demo)';
const MODEL = 'Not applicable';

function buildPackage(
  requirement: string,
  feature: string,
  businessContext: string,
  constraints: string,
  technologyStack: string,
  acceptanceCriteriaSummary: string,
  artifacts: RequirementArtifactPackage['artifacts'],
): RequirementArtifactPackage {
  const normalized = normalizeRequirement(requirement);
  return {
    session_key: requirementSessionKey(normalized),
    normalized_requirement: normalized,
    source: 'deterministic-fallback',
    requirement_profile: {
      feature,
      business_context: businessContext,
      constraints,
      technology_stack: technologyStack,
      acceptance_criteria: acceptanceCriteriaSummary,
    },
    artifacts,
  };
}

function withMeta(name: string, fileType: 'docx' | 'xlsx', content: string) {
  return {
    name,
    file_type: fileType,
    content,
    metadata: {
      generated_by: GENERATED_BY,
      model: MODEL,
    },
  };
}

const CATALOG: Record<string, RequirementArtifactPackage> = {
  [normalizeRequirement('Create BRD for UPI limit enhancement')]: buildPackage(
    'Create BRD for UPI limit enhancement',
    'UPI Limit Enhancement',
    'Increase transaction limits for verified users while preserving fraud controls and RBI/NPCI compliance.',
    'Daily and per-transaction caps by KYC tier; issuer/acquirer parity; regulator reporting.',
    'Mobile Banking App, UPI Switch, Limits Service, Risk Engine, Audit Ledger.',
    'Tier-aware limit checks, approval workflow, customer notifications, and full auditability.',
    {
      brd: withMeta(
        'BRD_UPI_Limit_Enhancement.docx',
        'docx',
        `BRD - UPI Limit Enhancement
1. Document Purpose
Define business requirements to increase UPI transaction limits for eligible customer cohorts while preserving fraud, compliance, and operational controls.

2. Business Problem / Background
Current default limits constrain high-value digital transactions for verified users and drive avoidable branch/assisted banking interactions. Product teams need higher limit tiers with controlled risk exposure.

3. Objectives
- Increase successful UPI high-value transaction completion rate for KYC L2/L3 customers.
- Reduce manual exception handling caused by ad-hoc limit overrides.
- Maintain regulator-compliant controls, alerts, and evidence.

4. Scope
- Tier-based per-transaction and daily cumulative limit policies.
- Segment/risk-band policy variants (retail, affluent, SME proprietor).
- Near-threshold customer messaging and breach reason codes.
- Operations maker-checker workflow for policy changes.

5. Out of Scope
- Changes to IMPS, NEFT, RTGS, cards, or branch channels.
- Core switch redesign.
- Credit underwriting policy changes.

6. Stakeholders
- Product Owner, UPI Payments
- Fraud Risk and Financial Crime Control
- Compliance and Regulatory Reporting
- Operations Control Tower
- Mobile and Internet Banking Engineering

7. Functional Requirements
- Evaluate customer tier, risk segment, and policy version before authorization.
- Enforce per-transaction, per-day, and velocity controls.
- Apply temporary campaign uplift policies with expiry.
- Provide deterministic customer-facing denial reasons.
- Capture immutable decision evidence for each authorization.

8. Non-Functional Requirements
- Limit decision latency p95 <= 120 ms.
- Availability >= 99.95% for policy decision service.
- End-to-end audit retrieval <= 2 minutes for compliance requests.

9. Dependencies
- Customer profile tier source of truth.
- Fraud score feed and anomaly signal service.
- Notification service for threshold messaging.
- Regulatory policy update calendar.

10. Assumptions
- KYC status data is synchronized within 5 minutes.
- Fraud score is available for >99% requests.
- Existing monitoring and alerting channels remain active.

11. Risks and Mitigations
- Risk: Fraud uplift from expanded limits.
  Mitigation: Progressive rollout by cohort with anomaly guardrails.
- Risk: Misconfigured limits by operations.
  Mitigation: Maker-checker, validation rails, staged activation.
- Risk: Reconciliation mismatches.
  Mitigation: Daily policy-effect report with automated variance checks.

12. Success Metrics
- >= 12% improvement in eligible high-value transaction success.
- >= 40% reduction in manual limit override tickets.
- 100% decision traceability for compliance sample audits.

13. Approval Criteria
- Product, Risk, Compliance, and Operations sign-off.
- No unresolved P1 control gaps.
- Pilot cohort performance within approved fraud threshold.`,
      ),
      frd: withMeta(
        'FRD_UPI_Limit_Enhancement.docx',
        'docx',
        `FRD - UPI Limit Enhancement
1. Functional Overview
This specification defines service-level behavior for calculating and enforcing UPI limits based on customer tier, segment policy, and risk context.

2. Actors and Roles
- Customer: initiates UPI transaction.
- Authorization Service: requests policy decision.
- Limits Engine: computes allow/deny decision.
- Operations Controller: approves policy change sets.
- Audit Consumer: retrieves decision evidence.

3. User Journey / Process Flow
Step 1: Authorization service sends request with customer id, amount, timestamp, channel.
Step 2: Limits engine resolves active policy bundle and risk modifiers.
Step 3: Engine evaluates per-transaction and daily aggregate thresholds.
Step 4: Decision and reason code returned; notification event emitted where required.
Step 5: Full decision envelope written to audit stream.

4. Functional Requirements with IDs
- FR-UPI-001: Resolve effective policy by customer segment and validity window.
- FR-UPI-002: Evaluate amount against per-transaction threshold.
- FR-UPI-003: Evaluate cumulative daily usage and velocity constraints.
- FR-UPI-004: Produce canonical decision reason codes.
- FR-UPI-005: Persist decision metadata (policy id, rule id, evaluated values).
- FR-UPI-006: Support maker-checker lifecycle for policy publication.

5. Business Rules
- BR-UPI-01: Tier L1 cannot consume uplift policies.
- BR-UPI-02: Campaign uplift must include explicit start/end timestamps.
- BR-UPI-03: Denial reason code must be deterministic for same input state.

6. Data Requirements
- Customer tier and segment id.
- Policy id, policy version, validity window.
- Transaction amount, currency, channel, and correlation id.
- Cumulative consumption counters.

7. Validation Rules
- Reject request if amount <= 0 or currency != INR.
- Reject policy publish if thresholds are null, negative, or overlapping.
- Reject runtime decision when policy version is missing.

8. Error and Exception Handling
- ERR-UPI-01 Policy unavailable -> fail-safe deny with reason POLICY_UNAVAILABLE.
- ERR-UPI-02 Counter store timeout -> deny with SYSTEM_RETRY and alert.
- ERR-UPI-03 Notification publish failure -> decision continues, notify via retry queue.

9. Audit and Security Requirements
- Log every decision with actor/service identity and rule path.
- Sign policy publications with approver identity.
- Encrypt policy and audit payloads at rest.

10. Integration Requirements
- Sync customer tier feed from profile service.
- Consume fraud segment risk weight from risk service.
- Publish threshold alert events to notification bus.

11. Non-Functional Requirements
- Throughput: 2,000 decisions per second sustained.
- Latency: p95 <= 120 ms, p99 <= 180 ms.
- Reliability: no data loss in audit stream with at-least-once guarantees.`,
      ),
      user_stories: withMeta(
        'User_Stories_UPI_Limit_Enhancement.xlsx',
        'xlsx',
        `User Stories - UPI Limit Enhancement
US-UPI-01 | Persona: Verified customer
As a verified customer, I want higher UPI limits based on my profile tier so that I can complete larger legitimate transactions.

US-UPI-02 | Persona: Risk analyst
As a risk analyst, I want segment-based limit profiles so that risk appetite can vary by customer behavior and cohort.

US-UPI-03 | Persona: Operations controller
As operations, I want maker-checker approval for limit policies so that unauthorized changes cannot impact production.

US-UPI-04 | Persona: Compliance auditor
As compliance, I want full decision lineage so that every limit decision is explainable during regulatory review.`,
      ),
      acceptance_criteria: withMeta(
        'Acceptance_Criteria_UPI_Limit_Enhancement.docx',
        'docx',
        `Acceptance Criteria - UPI Limit Enhancement
AC-UPI-01
Given an L2 customer with active uplift policy
When the transaction amount is within configured limit
Then authorization is approved and decision contains policy id/version.

AC-UPI-02
Given a request above per-transaction threshold
When policy evaluation completes
Then authorization is denied with reason LIMIT_TXN_EXCEEDED and customer message template id.

AC-UPI-03
Given daily cumulative usage has reached threshold
When next transaction request arrives
Then request is denied with reason LIMIT_DAILY_EXCEEDED and audit event type UPI_LIMIT_DENY_DAILY.

AC-UPI-04
Given a policy update request
When maker and checker approvals are complete
Then policy transitions to ACTIVE at scheduled effective timestamp.

AC-UPI-05
Given any approved or denied decision
When audit retrieval API is called by compliance role
Then payload includes correlation id, rule path, inputs, outputs, and actor metadata.`,
      ),
      test_scenarios: withMeta(
        'Test_Scenarios_UPI_Limit_Enhancement.docx',
        'docx',
        `Test Scenarios - UPI Limit Enhancement
TS-UPI-01 Positive flow
Validate approval for L2 customer at 95% of per-transaction threshold with expected audit payload.

TS-UPI-02 Per-transaction denial
Submit amount above threshold and confirm deny code LIMIT_TXN_EXCEEDED, no debit initiation.

TS-UPI-03 Daily threshold boundary
Run sequence to exactly reach daily cap and verify next request is denied deterministically.

TS-UPI-04 Policy lifecycle
Publish future-dated policy and verify it activates only after effective timestamp.

TS-UPI-05 Resilience
Simulate counter-store timeout and confirm fail-safe deny, alert generation, and no crash.

TS-UPI-06 Audit retrieval
Query decision history for sampled transaction and verify complete rule trace and actor metadata.`,
      ),
      traceability_matrix: withMeta(
        'RTM_UPI_Limit_Enhancement.xlsx',
        'xlsx',
        `Traceability Matrix - UPI Limit Enhancement
| Business Requirement | Functional Requirement | Acceptance Criteria | Test Scenario | Owner |
| REQ-UPI-01 Tier-based uplift | FR-UPI-001, FR-UPI-002 | AC-UPI-01 | TS-UPI-01 | Product |
| REQ-UPI-02 Threshold enforcement | FR-UPI-002, FR-UPI-003 | AC-UPI-02, AC-UPI-03 | TS-UPI-02, TS-UPI-03 | Engineering |
| REQ-UPI-03 Controlled policy release | FR-UPI-006 | AC-UPI-04 | TS-UPI-04 | Operations |
| REQ-UPI-04 Compliance explainability | FR-UPI-005 | AC-UPI-05 | TS-UPI-06 | Compliance |
| REQ-UPI-05 Failure safety | FR-UPI-003, FR-UPI-005 | AC-UPI-03 | TS-UPI-05 | SRE |`,
      ),
      requirement_review: withMeta(
        'Requirement_Review_UPI_Limit_Enhancement.docx',
        'docx',
        `Requirement Review - UPI Limit Enhancement
Review Outcome: Approved for pilot with controls.

Coverage Assessment
- Business objective clarity: Strong
- Requirement granularity: Strong
- Testability: Strong
- Compliance mapping: Adequate

Open Items
1. Finalize pilot cohort values for affluent and SME segments.
2. Confirm fraud alert threshold and escalation matrix.
3. Confirm support playbook for high-value customer denials.

Readiness Score
- Product: 4/5
- Engineering: 4/5
- Risk & Compliance: 4/5
- Operations: 4/5`,
      ),
    },
  ),
  [normalizeRequirement('Generate requirements for merchant auto settlement')]: buildPackage(
    'Generate requirements for merchant auto settlement',
    'Merchant Auto Settlement',
    'Automate settlement lifecycle to reduce manual operations and improve merchant payout predictability.',
    'Settlement windows by merchant class; holiday calendar handling; retry and exception workflows.',
    'Merchant Platform, Settlement Engine, Core Banking, Reconciliation Service, Notification Service.',
    'Automated settlement orchestration with deterministic cutoff handling, reconciliation, and dispute visibility.',
    {
      brd: withMeta(
        'BRD_Merchant_Auto_Settlement.docx',
        'docx',
        `BRD - Merchant Auto Settlement
1. Document Purpose
Specify business requirements for automated merchant settlement execution, exception handling, and payout transparency.

2. Business Problem / Background
Settlement operations rely on manual interventions for holds, retries, and reconciliation, causing payout delays, support escalations, and financial operations overhead.

3. Objectives
- Achieve predictable payout timelines by merchant contract terms.
- Reduce failed settlement interventions through automated retry and exception routing.
- Improve merchant trust with transparent settlement statements.

4. Scope
- Automated batch and intraday settlement scheduling.
- Rule-based hold/release lifecycle for disputes and chargebacks.
- Net payout calculation and statement generation.
- Reconciliation and exception queue orchestration.

5. Out of Scope
- Merchant onboarding KYC workflows.
- Fee plan contract renegotiation.
- Ledger redesign beyond integration points.

6. Stakeholders
- Merchant Payments Product
- Finance Operations
- Disputes Management
- Reconciliation Team
- Merchant Support

7. Functional Requirements
- Determine merchant eligibility per cycle and contract.
- Compute net settlement from gross amount, fees, taxes, holds, reversals.
- Execute payout posting with status transitions.
- Route failures through retry policy and exception queue.
- Publish merchant-facing settlement breakdown.

8. Non-Functional Requirements
- Settlement cycle completion within agreed window.
- Idempotent posting for all retries.
- Full traceability for every payout calculation component.

9. Dependencies
- Merchant profile and contract repository.
- Core banking posting APIs.
- Dispute and chargeback data feed.
- Notification and reporting services.

10. Assumptions
- Merchant contract metadata is accurate and current.
- Fee/tax rule engine is externally validated.
- Core posting service SLA remains stable.

11. Risks and Mitigations
- Risk: Incorrect net payout due to stale contract.
  Mitigation: pre-run contract freshness checks.
- Risk: Posting outages delaying payouts.
  Mitigation: retry policy plus exception queue SLA.
- Risk: Merchant dispute due to opaque statement.
  Mitigation: detailed component-level statement lines.

12. Success Metrics
- >= 80% reduction in manual settlement interventions.
- >= 99% settlements completed within contractual SLA.
- <= 1% merchant statement-related support escalations.

13. Approval Criteria
- Product, Finance Ops, and Reconciliation sign-off.
- End-to-end UAT with exception handling scenarios complete.`,
      ),
      frd: withMeta(
        'FRD_Merchant_Auto_Settlement.docx',
        'docx',
        `FRD - Merchant Auto Settlement
1. Functional Overview
Defines behavior for orchestrating merchant payout cycles from eligibility to posting, reconciliation, and statement delivery.

2. Actors and Roles
- Settlement Scheduler: triggers payout runs.
- Settlement Engine: calculates and posts payouts.
- Core Banking Interface: confirms posting outcome.
- Operations Analyst: handles exception queue.
- Merchant Portal: displays statement and status.

3. User Journey / Process Flow
Step 1: Scheduler triggers cycle by merchant cohort.
Step 2: Engine computes net payable amount and checks hold state.
Step 3: Posting request submitted to core banking.
Step 4: Success updates merchant payout status; failure enters retry pipeline.
Step 5: Statement is published and reconciliation marker is emitted.

4. Functional Requirements with IDs
- FR-MER-001: Eligibility determination per settlement calendar and contract.
- FR-MER-002: Deterministic net payout calculation.
- FR-MER-003: Posting lifecycle with idempotency keys.
- FR-MER-004: Retry and exception routing strategy.
- FR-MER-005: Statement generation with componentized breakdown.
- FR-MER-006: Reconciliation marker emission.

5. Business Rules
- BR-MER-01: Merchant under dispute hold cannot receive payout.
- BR-MER-02: Retry attempts capped at configured policy threshold.
- BR-MER-03: Net payout cannot be negative; carry-forward rule applies.

6. Data Requirements
- Merchant settlement contract attributes.
- Payout cycle id and scheduled window.
- Gross volume, fee lines, tax lines, hold amounts.
- Posting status, retry count, exception reason.

7. Validation Rules
- Reject cycle if contract status is inactive.
- Reject posting if amount precision mismatch is detected.
- Reject statement publish if posting confirmation absent.

8. Error and Exception Handling
- ERR-MER-01 Posting timeout -> retry with exponential backoff.
- ERR-MER-02 Reconciliation mismatch -> flag cycle for manual review.
- ERR-MER-03 Statement generation failure -> queue asynchronous reprocessing.

9. Audit and Security Requirements
- Capture who approved hold release and when.
- Persist immutable settlement computation inputs and outputs.
- Restrict exception actioning by role-based access control.

10. Integration Requirements
- Core banking posting API.
- Dispute hold state service.
- Merchant notification and portal feed.
- Reconciliation and reporting pipeline.

11. Non-Functional Requirements
- Payout run reliability >= 99.9%.
- End-to-end processing throughput supports peak merchant volume.
- Exception queue visibility updated within 30 seconds.`,
      ),
      user_stories: withMeta(
        'User_Stories_Merchant_Auto_Settlement.xlsx',
        'xlsx',
        `User Stories - Merchant Auto Settlement
US-MER-01 | Operations
As settlement operations, I want settlement cycles to run automatically by merchant contract calendar so that payouts are timely and manual intervention is minimized.

US-MER-02 | Merchant
As a merchant, I want a componentized statement showing fees, taxes, holds, and net payout so that I can reconcile payouts without support dependency.

US-MER-03 | Finance
As finance controls, I want idempotent posting and reconciliation evidence so that payout accounting remains accurate even during retries.

US-MER-04 | Support
As merchant support, I want exception reason codes and retry status visibility so that I can provide deterministic case resolution timelines.`,
      ),
      acceptance_criteria: withMeta(
        'Acceptance_Criteria_Merchant_Auto_Settlement.docx',
        'docx',
        `Acceptance Criteria - Merchant Auto Settlement
AC-MER-01
Given a merchant with active contract and no hold
When settlement cycle executes
Then payout is initiated within configured settlement window.

AC-MER-02
Given a completed settlement computation
When statement is generated
Then gross, fee, tax, hold, reversal, and net values are itemized.

AC-MER-03
Given a posting timeout
When retry policy completes all configured attempts
Then case moves to exception queue with reason and retry history.

AC-MER-04
Given completed posting events for the cycle
When reconciliation process runs
Then report balance equals posted totals within accepted tolerance.

AC-MER-05
Given a support user opens merchant settlement case
When exception details are requested
Then deterministic reason code and next action guidance are available.`,
      ),
      test_scenarios: withMeta(
        'Test_Scenarios_Merchant_Auto_Settlement.docx',
        'docx',
        `Test Scenarios - Merchant Auto Settlement
TS-MER-01 Scheduled eligibility run
Validate only active-contract merchants without hold state are selected for payout.

TS-MER-02 Hold exclusion
Verify held merchant is excluded and statement marks payout as ON_HOLD with reference id.

TS-MER-03 Retry to exception
Force posting timeout repeatedly and validate retry schedule, then exception queue transition.

TS-MER-04 Statement integrity
Check statement totals: gross - deductions = net and values match posting payload.

TS-MER-05 Reconciliation parity
Compare settlement-cycle totals with core postings and ensure no unexplained variance.

TS-MER-06 Support traceability
Validate support portal can retrieve settlement, retry, and exception lineage by correlation id.`,
      ),
      traceability_matrix: withMeta(
        'RTM_Merchant_Auto_Settlement.xlsx',
        'xlsx',
        `Traceability Matrix - Merchant Auto Settlement
| Business Requirement | Functional Requirement | Acceptance Criteria | Test Scenario | Owner |
| REQ-MER-01 Auto schedule execution | FR-MER-001 | AC-MER-01 | TS-MER-01 | Operations |
| REQ-MER-02 Transparent payout detail | FR-MER-002, FR-MER-005 | AC-MER-02 | TS-MER-04 | Product |
| REQ-MER-03 Failure handling | FR-MER-004 | AC-MER-03 | TS-MER-03 | Engineering |
| REQ-MER-04 Reconciliation confidence | FR-MER-006 | AC-MER-04 | TS-MER-05 | Finance |
| REQ-MER-05 Support resolution | FR-MER-004, FR-MER-005 | AC-MER-05 | TS-MER-06 | Support |`,
      ),
      requirement_review: withMeta(
        'Requirement_Review_Merchant_Auto_Settlement.docx',
        'docx',
        `Requirement Review - Merchant Auto Settlement
Review Outcome: Approved for implementation planning.

Strengths
- Clear settlement lifecycle from eligibility to reconciliation.
- Adequate exception and retry control coverage.
- Strong merchant transparency requirements.

Gaps to close
1. Define exception queue SLA by severity.
2. Confirm fee/tax rule edge-case ownership.
3. Validate statement localization requirements for merchant geographies.

Readiness Score
- Product readiness: 4/5
- Engineering readiness: 4/5
- Finance controls readiness: 4/5
- Support readiness: 3/5`,
      ),
    },
  ),
  [normalizeRequirement('Plan delivery for biometric login on mobile banking')]: buildPackage(
    'Plan delivery for biometric login on mobile banking',
    'Biometric Login on Mobile Banking',
    'Enable secure, low-friction user authentication with strong privacy and audit controls.',
    'Device binding required; explicit consent capture; fallback PIN/password; regulated audit retention.',
    'Mobile App, Device Trust Service, Identity Service, Consent Store, Audit Platform.',
    'Biometric auth with enrollment, fallback flows, privacy controls, and operational observability.',
    {
      brd: withMeta(
        'BRD_Biometric_Login_Mobile_Banking.docx',
        'docx',
        `BRD - Biometric Login on Mobile Banking
1. Document Purpose
Define business requirements for secure biometric login in mobile banking with privacy, accessibility, fallback authentication, and fraud controls.

2. Business Problem / Background
Credential-only login introduces friction and abandonment while increasing support cases for forgotten passwords. A biometric journey can improve login completion if paired with robust fallback and control design.

3. Objectives
- Improve secure login conversion and reduce repeated credential entry.
- Preserve customer control through explicit consent and revocation.
- Ensure resilient fallback access when biometric auth fails or is unsupported.

4. Scope
- Device enrollment and cryptographic device binding.
- Supported biometric methods (fingerprint, face authentication based on OS capability).
- Consent capture, policy versioning, and revocation handling.
- PIN/password fallback journey with risk checks.
- Failed authentication threshold and lockout behavior.
- Accessibility and unsupported-device handling.
- Audit event coverage for all login modes.

5. Out of Scope
- Branch biometric onboarding.
- Biometric storage outside OS secure enclave/keystore.
- Password reset process redesign.

6. Stakeholders
- Mobile Banking Product
- Identity and Access Management
- Fraud Risk
- Security Engineering
- Compliance and Privacy Office
- Customer Support Operations

7. Functional Requirements
- Enroll biometric only after successful credential re-authentication.
- Bind enrolled biometric to trusted device identity.
- Perform biometric challenge with OS-provided authenticators.
- Trigger fallback PIN/password path on denial, sensor unavailability, or lockout.
- Capture and honor consent/privacy preferences.
- Generate audit events for enrollment, login, fallback, lockout, revocation.

8. Non-Functional Requirements
- Authentication decision p95 <= 250 ms.
- Fallback journey availability >= 99.95%.
- Event integrity guarantees for security audit queries.

9. Dependencies
- Device trust and attestation service.
- Mobile OS biometric provider APIs.
- Consent service and policy repository.
- Fraud scoring and anomaly detection service.

10. Assumptions
- Customer devices support secure hardware backed biometrics where available.
- Existing PIN/password authentication remains production-ready.
- Privacy notice and consent wording approved by legal.

11. Risks and Mitigations
- Risk: Device compromise.
  Mitigation: attestation checks, device risk scoring, forced rebind.
- Risk: False reject rates causing customer friction.
  Mitigation: fallback journey, retries, targeted support messaging.
- Risk: Consent/privacy non-compliance.
  Mitigation: immutable consent records and revocation controls.

12. Success Metrics
- >= 20% reduction in login friction indicators.
- >= 35% reduction in password-related support requests.
- Zero high-severity privacy/audit findings in quarterly review.

13. Approval Criteria
- Product, Security, Fraud, and Privacy sign-off.
- Fallback and lockout UAT scenarios fully passed.
- Accessibility acceptance for supported and unsupported devices.`,
      ),
      frd: withMeta(
        'FRD_Biometric_Login_Mobile_Banking.docx',
        'docx',
        `FRD - Biometric Login on Mobile Banking
1. Functional Overview
This document specifies the biometric authentication lifecycle for mobile login, including enrollment/binding, runtime authentication, fallback paths, lockout thresholds, consent, and audit integration.

2. Actors and Roles
- End User: enrolls and uses biometric login.
- Mobile App: orchestrates OS biometric prompt and backend calls.
- Identity Service: verifies credentials and session context.
- Device Trust Service: manages device binding and trust score.
- Consent Service: stores consent records and revocation.
- Fraud Service: evaluates anomalies for auth attempts.

3. User Journey / Process Flow
Enrollment:
1) User logs in with credentials.
2) App displays biometric consent with policy version.
3) On consent accept, app requests OS biometric registration.
4) Device binding token generated and persisted.

Authentication:
1) User taps "Login with biometrics".
2) App invokes OS biometric provider.
3) Success -> backend session issue with risk checks.
4) Failure/unsupported -> fallback PIN/password route.

4. Functional Requirements with IDs
- FR-BIO-001: Credential re-auth required before first biometric enrollment.
- FR-BIO-002: Device binding required with attestation and binding token.
- FR-BIO-003: Support biometric methods exposed by trusted OS provider APIs.
- FR-BIO-004: Fallback PIN/password journey available for all auth failures.
- FR-BIO-005: Lockout after configurable failed biometric attempts.
- FR-BIO-006: Consent capture, versioning, and revocation controls.
- FR-BIO-007: Accessibility path for unsupported biometric devices.
- FR-BIO-008: Complete audit event emission for auth lifecycle.

5. Business Rules
- BR-BIO-01: Enrollment denied if device trust score below threshold.
- BR-BIO-02: Lockout counter resets only after successful credential fallback.
- BR-BIO-03: Revoked consent disables biometric login immediately.

6. Data Requirements
- Device id, attestation result, binding token id.
- Auth mode (biometric/fallback), outcome, reason code.
- Consent status, policy version, consent timestamp.
- Failed-attempt counter and lockout expiry.

7. Validation Rules
- Reject enrollment when consent absent.
- Reject biometric login on unbound device.
- Reject session issuance when fraud score crosses high-risk threshold.

8. Error and Exception Handling
- ERR-BIO-01 OS provider unavailable -> route to fallback with UNSUPPORTED_BIOMETRIC.
- ERR-BIO-02 Device binding mismatch -> force credential auth and re-enrollment.
- ERR-BIO-03 Fraud service timeout -> conservative step-up using fallback.

9. Audit and Security Requirements
- Emit events: BIOMETRIC_ENROLL_START, ENROLL_SUCCESS, ENROLL_FAIL, AUTH_SUCCESS, AUTH_FAIL, LOCKOUT_TRIGGERED, FALLBACK_SUCCESS, CONSENT_REVOKED.
- Protect all tokens and identifiers with encryption at rest and in transit.
- Restrict enrollment management APIs to authenticated user context only.

10. Integration Requirements
- Android BiometricPrompt / iOS LocalAuthentication adapters.
- Device trust attestation API.
- Consent and policy service API.
- Fraud signal evaluation API.

11. Non-Functional Requirements
- p95 biometric decision time <= 250 ms.
- p99 fallback completion <= 2.5 seconds.
- Audit event delivery success >= 99.99%.
- Accessibility compliance for screen-reader and contrast requirements.`,
      ),
      user_stories: withMeta(
        'User_Stories_Biometric_Login_Mobile_Banking.xlsx',
        'xlsx',
        `User Stories - Biometric Login on Mobile Banking
US-BIO-01 | Customer enrollment
As a mobile banking customer, I want to enroll fingerprint or face authentication on a trusted device after credential verification so that future login is faster and secure.

US-BIO-02 | Customer authentication
As a customer, I want biometric login to work only on my enrolled/bound device so that unauthorized devices cannot use my biometric path.

US-BIO-03 | Fallback access
As a customer, I want PIN/password fallback when biometric fails, is locked out, or unsupported so that account access is not blocked.

US-BIO-04 | Privacy and audit
As compliance and privacy teams, we need consent records and audit events for enrollment/auth/fallback so that regulatory reviews are evidence-backed.`,
      ),
      acceptance_criteria: withMeta(
        'Acceptance_Criteria_Biometric_Login_Mobile_Banking.docx',
        'docx',
        `Acceptance Criteria - Biometric Login on Mobile Banking
AC-BIO-01
Given user has valid credential session
When user accepts consent and enrolls biometric
Then device binding token is created and enrollment event is logged.

AC-BIO-02
Given enrolled bound device
When biometric provider returns success
Then authenticated session is issued and auth event captures method and device id.

AC-BIO-03
Given biometric fails for configured threshold attempts
When threshold reached
Then biometric path is locked and fallback PIN/password is mandatory.

AC-BIO-04
Given device does not support biometric capability
When user attempts biometric setup
Then app provides accessible guidance and fallback-only path.

AC-BIO-05
Given consent is revoked
When next login attempt occurs
Then biometric option is disabled until fresh consent and re-enrollment.`,
      ),
      test_scenarios: withMeta(
        'Test_Scenarios_Biometric_Login_Mobile_Banking.docx',
        'docx',
        `Test Scenarios - Biometric Login on Mobile Banking
TS-BIO-01 Enrollment with binding
Verify enrollment succeeds only after credential re-auth, consent accept, and trusted device attestation.

TS-BIO-02 Supported methods
Validate fingerprint and face login paths across supported OS/device combinations.

TS-BIO-03 Failed-auth threshold
Simulate repeated biometric failures and verify lockout plus fallback enforcement.

TS-BIO-04 Fallback journey
Validate PIN/password flow for sensor unavailable, user cancel, and lockout conditions.

TS-BIO-05 Consent lifecycle
Revoke consent and verify biometric option suppression until re-consent and re-enroll.

TS-BIO-06 Audit and fraud controls
Verify audit events and fraud signal checks on suspicious authentication patterns.

TS-BIO-07 Accessibility and unsupported devices
Validate screen-reader flow, clear messaging, and non-biometric path continuity.`,
      ),
      traceability_matrix: withMeta(
        'RTM_Biometric_Login_Mobile_Banking.xlsx',
        'xlsx',
        `Traceability Matrix - Biometric Login on Mobile Banking
| Business Requirement | Functional Requirement | Acceptance Criteria | Test Scenario | Owner |
| REQ-BIO-01 Enrollment & binding | FR-BIO-001, FR-BIO-002 | AC-BIO-01 | TS-BIO-01 | IAM |
| REQ-BIO-02 Supported biometric methods | FR-BIO-003 | AC-BIO-02 | TS-BIO-02 | Mobile Eng |
| REQ-BIO-03 Failed auth + lockout | FR-BIO-005 | AC-BIO-03 | TS-BIO-03 | Security |
| REQ-BIO-04 Fallback continuity | FR-BIO-004, FR-BIO-007 | AC-BIO-04 | TS-BIO-04, TS-BIO-07 | Product |
| REQ-BIO-05 Consent & privacy | FR-BIO-006 | AC-BIO-05 | TS-BIO-05 | Privacy |
| REQ-BIO-06 Audit and fraud controls | FR-BIO-008 | AC-BIO-02, AC-BIO-03 | TS-BIO-06 | Fraud/Risk |`,
      ),
      requirement_review: withMeta(
        'Requirement_Review_Biometric_Login_Mobile_Banking.docx',
        'docx',
        `Requirement Review - Biometric Login on Mobile Banking
Review Outcome: Approved with mandatory security checkpoints.

Validated Areas
- Device enrollment and binding controls.
- Supported biometric method behavior by OS/provider.
- Consent and revocation lifecycle.
- Fallback journey continuity and lockout policy.
- Audit event completeness and fraud signal hooks.

Mandatory Pre-Go-Live Checks
1. Complete device-OS/provider compatibility certification matrix.
2. Validate lockout threshold tuning against false reject baseline.
3. Complete accessibility acceptance on unsupported and assistive-device paths.
4. Confirm audit query pack for compliance simulation.

Readiness Score
- Product: 4/5
- Security: 4/5
- Privacy: 4/5
- Accessibility: 3/5`,
      ),
    },
  ),
  [normalizeRequirement('Assess readiness for NEFT batch modernization')]: buildPackage(
    'Assess readiness for NEFT batch modernization',
    'NEFT Batch Modernization Readiness',
    'Evaluate operational, technical, and control readiness to modernize NEFT batch execution.',
    'No disruption to cutover windows; backwards-compatible reporting; regulator evidence continuity.',
    'NEFT Scheduler, Batch Orchestrator, Core Banking Interface, Reconciliation and Monitoring stack.',
    'Readiness package with modernization scope, migration controls, and measurable quality gates.',
    {
      brd: withMeta(
        'BRD_NEFT_Batch_Modernization.docx',
        'docx',
        `BRD - NEFT Batch Modernization Readiness
1. Document Purpose
Define business requirements and readiness criteria for modernizing NEFT batch processing with operational resilience and compliance continuity.

2. Business Problem / Background
Legacy NEFT batch orchestration has limited observability, high manual recovery effort, and fragile dependency handling across cut-off windows.

3. Objectives
- Improve batch reliability and recoverability.
- Ensure cut-off window adherence under peak volume.
- Preserve reconciliation and regulatory evidence quality through migration.

4. Scope
- Batch orchestration modernization readiness.
- Dependency and critical-path validation.
- Dual-run and rollback controls.
- Reconciliation parity and evidence continuity controls.

5. Out of Scope
- Retail channel UI changes.
- Settlement product policy redesign.
- Non-NEFT payment rail modernization.

6. Stakeholders
- Payments Operations
- Core Banking Platform
- Release Governance
- Compliance and Audit
- Site Reliability Engineering

7. Functional Requirements
- Dependency mapping and critical path visibility.
- Dual-run controls comparing legacy and modernized outcomes.
- Automated rollback trigger and execution governance.
- Evidence continuity for regulator and internal audit pulls.

8. Non-Functional Requirements
- No missed NEFT cut-off windows during migration rehearsals.
- Deterministic recovery runbook execution.
- End-to-end observability for batch stages.

9. Dependencies
- NEFT scheduler and queue infrastructure.
- Core posting and reconciliation services.
- Monitoring and alerting stack.
- Regulatory reporting interface.

10. Assumptions
- Legacy and new paths can run in controlled dual-run mode.
- Baseline operational metrics are available for comparison.
- Rollback environment parity is maintained.

11. Risks and Mitigations
- Risk: Cut-off miss during migration.
  Mitigation: staged dress rehearsals and go/no-go gates.
- Risk: Parity mismatch in posting outcomes.
  Mitigation: dual-run reconciliation and stop-ship criteria.
- Risk: Incomplete audit evidence.
  Mitigation: predefined evidence completeness checks.

12. Success Metrics
- 100% cut-off adherence in rehearsal cycles.
- >= 99.95% parity in dual-run reconciliation checks.
- Zero unresolved high-severity audit evidence gaps at go-live approval.

13. Approval Criteria
- Operations, Platform, and Compliance sign-off.
- Successful rollback drill.
- Dual-run parity acceptance for agreed sample window.`,
      ),
      frd: withMeta(
        'FRD_NEFT_Batch_Modernization.docx',
        'docx',
        `FRD - NEFT Batch Modernization Readiness
1. Functional Overview
Specifies functional behavior for readiness validation, dual-run controls, rollback execution, and reconciliation evidence in NEFT batch modernization.

2. Actors and Roles
- Batch Controller: initiates and monitors cycles.
- Modernized Orchestrator: executes new workflow stages.
- Legacy Runner: executes baseline comparison run.
- Reconciliation Service: compares outcomes and flags variances.
- Release Manager: approves promotion gates.

3. User Journey / Process Flow
Step 1: Controller starts dual-run cycle for selected batch.
Step 2: Legacy and modernized runs execute in parallel.
Step 3: Reconciliation service compares posting outcomes and evidence records.
Step 4: Variance policy determines pass/fail gate.
Step 5: On failure, rollback workflow is triggered and logged.

4. Functional Requirements with IDs
- FR-NEFT-001: Maintain dependency map for each batch stage.
- FR-NEFT-002: Enforce stage-level timeout and retry policy.
- FR-NEFT-003: Execute dual-run with deterministic correlation identifiers.
- FR-NEFT-004: Produce reconciliation variance report by stage and transaction class.
- FR-NEFT-005: Execute rollback runbook with controlled state transition.
- FR-NEFT-006: Persist regulator evidence fields for every run.

5. Business Rules
- BR-NEFT-01: Any high-severity variance blocks promotion to next gate.
- BR-NEFT-02: Rollback requires release manager acknowledgment.
- BR-NEFT-03: Missing evidence fields mark run as non-compliant.

6. Data Requirements
- Batch cycle id, stage id, timestamps.
- Throughput and latency metrics per stage.
- Reconciliation counts and variance classification.
- Evidence completeness flags and report ids.

7. Validation Rules
- Reject cycle start if dependency map version is stale.
- Reject gate promotion without reconciliation report.
- Reject completion if evidence completeness below 100%.

8. Error and Exception Handling
- ERR-NEFT-01 Stage timeout -> retry and raise operational alert.
- ERR-NEFT-02 Reconciliation service unavailable -> block gate and trigger fallback review.
- ERR-NEFT-03 Rollback execution failure -> escalate critical incident workflow.

9. Audit and Security Requirements
- Immutable gate decisions and approver identity capture.
- Tamper-evident logs for dual-run and rollback operations.
- Least-privilege access to rollout and rollback controls.

10. Integration Requirements
- Legacy batch scheduler integration.
- Modernized orchestrator control APIs.
- Reconciliation and reporting services.
- Alerting/incident management platform.

11. Non-Functional Requirements
- Controller availability >= 99.95%.
- Stage status propagation <= 10 seconds.
- Reconciliation report generation <= 5 minutes after run completion.`,
      ),
      user_stories: withMeta(
        'User_Stories_NEFT_Batch_Modernization.xlsx',
        'xlsx',
        `User Stories - NEFT Batch Modernization Readiness
US-NEFT-01 | Operations
As batch operations, I want stage-level readiness indicators so that cut-off execution risk is visible before promotion.

US-NEFT-02 | Platform engineering
As platform engineering, I want dual-run parity evidence so that modernization correctness is proven before cutover.

US-NEFT-03 | Compliance
As compliance, I want uninterrupted evidence lineage through migration so that regulatory submissions remain complete.

US-NEFT-04 | Release governance
As release governance, I want tested rollback controls so that failed migrations can be reversed safely.`,
      ),
      acceptance_criteria: withMeta(
        'Acceptance_Criteria_NEFT_Batch_Modernization.docx',
        'docx',
        `Acceptance Criteria - NEFT Batch Modernization Readiness
AC-NEFT-01
Given dependency mapping is complete
When architecture and operations review readiness
Then critical path and timeout controls are approved.

AC-NEFT-02
Given dual-run cycles execute
When reconciliation is generated
Then parity threshold is met for configured transaction classes.

AC-NEFT-03
Given rollback drill is initiated
When runbook executes
Then system returns to legacy baseline state with validated controls.

AC-NEFT-04
Given modernization rehearsal
When cut-off windows are evaluated
Then no window is missed and variance remains within agreed tolerance.

AC-NEFT-05
Given compliance evidence extraction request
When report is produced
Then all required evidence fields are complete and queryable.`,
      ),
      test_scenarios: withMeta(
        'Test_Scenarios_NEFT_Batch_Modernization.docx',
        'docx',
        `Test Scenarios - NEFT Batch Modernization Readiness
TS-NEFT-01 Peak-volume rehearsal
Execute modernization cycle at peak batch load and verify stage completion SLAs.

TS-NEFT-02 Dual-run parity
Run legacy and modernized flows in parallel and validate reconciliation parity report.

TS-NEFT-03 Rollback drill
Trigger rollback scenario mid-cycle and validate restoration to legacy baseline.

TS-NEFT-04 Stage failure recovery
Inject orchestrator stage fault and verify retry/timeout handling and alerts.

TS-NEFT-05 Evidence continuity
Extract compliance evidence and confirm completeness across migrated cycle.

TS-NEFT-06 Cut-off assurance
Simulate near-cut-off load spikes and verify no missed scheduling windows.`,
      ),
      traceability_matrix: withMeta(
        'RTM_NEFT_Batch_Modernization.xlsx',
        'xlsx',
        `Traceability Matrix - NEFT Batch Modernization Readiness
| Business Requirement | Functional Requirement | Acceptance Criteria | Test Scenario | Owner |
| REQ-NEFT-01 Dependency readiness | FR-NEFT-001 | AC-NEFT-01 | TS-NEFT-01 | Operations |
| REQ-NEFT-02 Dual-run parity | FR-NEFT-003, FR-NEFT-004 | AC-NEFT-02 | TS-NEFT-02 | Platform |
| REQ-NEFT-03 Rollback confidence | FR-NEFT-005 | AC-NEFT-03 | TS-NEFT-03 | Release Mgmt |
| REQ-NEFT-04 Cut-off adherence | FR-NEFT-002 | AC-NEFT-04 | TS-NEFT-04, TS-NEFT-06 | SRE |
| REQ-NEFT-05 Evidence continuity | FR-NEFT-006 | AC-NEFT-05 | TS-NEFT-05 | Compliance |`,
      ),
      requirement_review: withMeta(
        'Requirement_Review_NEFT_Batch_Modernization.docx',
        'docx',
        `Requirement Review - NEFT Batch Modernization Readiness
Review Outcome: Conditionally approved.

Strengths
- Strong dual-run and rollback framing.
- Clear readiness gates with measurable controls.
- Compliance evidence continuity explicitly defined.

Conditions to Close
1. Complete one additional peak-volume rehearsal with incident observers.
2. Automate rollback verification checkpoints currently manual.
3. Validate report archival and retention control for regulator evidence.

Readiness Score
- Operations: 4/5
- Engineering: 4/5
- Compliance: 4/5
- Release governance: 3/5`,
      ),
    },
  ),
};

export function getDeterministicRequirementPackage(
  requirement: string,
): RequirementArtifactPackage | null {
  const normalized = normalizeRequirement(requirement);
  const pkg = CATALOG[normalized];
  return pkg ? JSON.parse(JSON.stringify(pkg)) : null;
}

