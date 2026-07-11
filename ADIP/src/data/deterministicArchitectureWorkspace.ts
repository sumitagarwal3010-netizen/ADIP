import type { Artifact, ArtifactSection } from '../types/artifacts';
import { createArtifact } from './artifactBuilder';
import type { AnalysisResult } from './aiAnalysisMockData';

type ScenarioKey =
  | 'upi-limit-enhancement'
  | 'npci-switch-integration'
  | 'biometric-login-security'
  | 'merchant-settlement-data-model';

interface ScenarioArtifact {
  name: string;
  fileType: 'docx' | 'xlsx' | 'yaml' | 'png';
  approvalStatus: 'Approved' | 'Pending Review' | 'Draft' | 'Rejected';
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  executiveSummary: string;
  previewContent: string;
  sections: ArtifactSection[];
  generatedBy: string;
  modelUsed: string;
  changeSummary: string;
}

interface ArchitectureScenario {
  key: ScenarioKey;
  prompt: string;
  analysis: AnalysisResult;
  artifacts: ScenarioArtifact[];
}

const PROMPTS = [
  'Design architecture for UPI limit enhancement',
  'Recommend integration pattern for NPCI switch',
  'Assess security design for biometric login',
  'Model data entities for merchant settlement',
] as const;

function buildArtifact(runId: string, idx: number, s: ScenarioArtifact): Artifact {
  return createArtifact({
    id: `arch-${runId}-${idx + 1}`,
    name: s.name,
    generatedBy: s.generatedBy,
    modelUsed: s.modelUsed,
    approvalStatus: s.approvalStatus,
    fileType: s.fileType,
    previewContent: s.previewContent,
    executiveSummary: s.executiveSummary,
    riskRating: s.riskRating,
    sections: s.sections,
    changeSummary: s.changeSummary,
    context: { subject: s.name, domain: 'Architecture' },
  });
}

const SCENARIOS: Record<ScenarioKey, ArchitectureScenario> = {
  'upi-limit-enhancement': {
    key: 'upi-limit-enhancement',
    prompt: PROMPTS[0],
    analysis: {
      'Scenario': 'UPI Limit Enhancement',
      'Executive Summary':
        'Architecture blueprint upgrades daily UPI limits for KYC L2 customers with real-time risk controls, limit orchestration, and regulator-grade audit trails across mobile and internet banking channels.',
      'Architecture Insights': [
        'Introduce a dedicated Limit Decision Service with policy evaluation under 120ms.',
        'Use event-driven limit update propagation to CBS, Fraud Engine, and Notification Hub.',
        'Persist immutable limit-change events in audit ledger with maker-checker lineage.',
      ],
      'KPIs': [
        'Target limit decision latency: <= 120ms p95',
        'Projected support ticket reduction: 32%',
        'Expected straight-through approval rate: 78%',
      ],
      'Dependency Map Data': [
        'Mobile Banking -> API Gateway -> Limit Decision Service -> Customer Profile (Read)',
        'Limit Decision Service -> Fraud Scoring -> Compliance Rules Engine',
        'Limit Decision Service -> CBS Adapter -> UPI Switch Adapter -> Notification Hub',
      ],
      'Risks': [
        'High concurrency during salary-day windows can throttle policy evaluation.',
        'Inconsistent customer KYC profile sync can cause false rejections.',
      ],
      'Recommendations': [
        'Deploy Redis-backed policy cache with 60-second invalidation.',
        'Add profile consistency check before limit-raise confirmation.',
      ],
      'Workflow Information': [
        'Architecture Review Board: scheduled with Payments and Risk Engineering.',
        'Release dependency: Fraud rule package FRD-UPI-24 must be approved.',
      ],
      'Confidence Score': 96,
    },
    artifacts: [
      {
        name: 'UPI_Limit_Enhancement_HLD.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'HLD prepared for UPI limit enhancement target state.',
        executiveSummary:
          'High Level Design defines a resilient policy-driven architecture to manage dynamic UPI limit upgrades with risk and compliance control points.',
        previewContent:
          'UPI LIMIT ENHANCEMENT - HIGH LEVEL DESIGN\nVersion 1.0\n\nBusiness Context\nRetail customers request higher UPI limits with instant approval expectation.\n\nArchitecture Overview\nChannel -> API Gateway -> Limit Decision Service -> Fraud + Compliance + CBS.\n\nLogical Components\nLimit Decision Service, Policy Engine, Audit Ledger, Notification Hub.\n\nTechnology Stack\nSpring Boot, Kafka, Redis, PostgreSQL, OpenTelemetry.\n\nNon Functional Requirements\n120ms decision latency, 99.95% availability, immutable audit retention 7 years.\n\nDeployment View\n3 AZ active-active deployment with regional failover.\n\nRisks\nProfile sync drift, policy cache staleness, fraud model timeout.',
        sections: [
          { title: 'Business Context', content: 'KYC L2 customers demand higher transfer ceilings while RBI/NPCI controls mandate explainable limit decisions and traceable approvals.' },
          { title: 'Architecture Overview', content: 'The design introduces a Limit Decision Service between channels and core banking adapters. All decisions are policy-evaluated, fraud-scored, and logged to the audit ledger before confirmation.' },
          { title: 'Logical Components', content: '1) API Gateway\n2) Limit Decision Service\n3) Fraud Risk Scoring Adapter\n4) Compliance Rules Engine Adapter\n5) CBS Update Adapter\n6) Audit Event Ledger\n7) Notification Hub' },
          { title: 'Technology Stack', content: 'Runtime: Java 21 + Spring Boot\nMessaging: Kafka (payments.limit.events.v1)\nCache: Redis Cluster\nStorage: PostgreSQL + WORM-backed audit archive\nObservability: Prometheus + Grafana + OpenTelemetry' },
          { title: 'Non Functional Requirements', content: 'p95 decision latency <= 120ms\nThroughput >= 1,800 req/sec peak\nRTO <= 15 min, RPO <= 2 min\nAudit retention: 7 years with tamper-evident hash chain' },
          { title: 'Deployment View', content: 'Kubernetes active-active across Mumbai and Hyderabad regions. Stateful components use synchronous replication for decision trail integrity.' },
          { title: 'Risks', content: 'Risk-01: Fraud adapter timeout during peak traffic.\nRisk-02: Policy mismatch across environments.\nRisk-03: Customer master latency impacts eligibility checks.' },
        ],
      },
      {
        name: 'UPI_Limit_Enhancement_LLD.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'LLD completed for limit decision and orchestration flows.',
        executiveSummary:
          'Low Level Design specifies service contracts, synchronous and asynchronous flows, persistence schema, and operational controls for UPI limit upgrades.',
        previewContent:
          'UPI LIMIT ENHANCEMENT - LLD\n\nComponent Design\nLimitDecisionController, EligibilityEvaluator, PolicyResolver.\n\nInterfaces\nPOST /v1/upi/limits/evaluate, POST /v1/upi/limits/confirm.\n\nDatabase Design\nlimit_request, limit_decision, limit_audit_event.\n\nSequence Flow\nRequest -> evaluate -> score -> compliance -> confirm -> notify.\n\nError Handling\nDeterministic error codes for KYC mismatch, risk breach, CBS timeout.\n\nConfiguration\nThreshold profile by customer segment and risk tier.',
        sections: [
          { title: 'Component Design', content: 'Components: LimitDecisionController, EligibilityService, RiskOrchestrator, ComplianceOrchestrator, CoreBankingPublisher, AuditTrailWriter.' },
          { title: 'Interfaces', content: 'Interface-A: POST /v1/limits/evaluate\nInterface-B: POST /v1/limits/confirm\nInterface-C: GET /v1/limits/{customerId}/history' },
          { title: 'Database Design', content: 'Tables:\n- limit_request (request_id, customer_id, requested_limit, channel)\n- limit_decision (decision_id, request_id, approved_limit, reason_code)\n- limit_audit_event (event_id, decision_id, actor, timestamp, signature)' },
          { title: 'Sequence Flow', content: '1. Channel submits evaluate.\n2. Eligibility and profile checks execute.\n3. Fraud score + compliance checks complete.\n4. Decision persisted and event published.\n5. Confirmation call updates CBS and sends notification.' },
          { title: 'Error Handling', content: 'LIM-401: KYC not eligible\nLIM-409: policy violation\nLIM-504: core banking timeout\nLIM-429: throttled request window exceeded' },
          { title: 'Configuration', content: 'Config sets per segment: retail_standard, retail_premium, msmes. Each profile configures max daily limit, cooling period, and risk override policy.' },
        ],
      },
      {
        name: 'UPI_Limit_API_Specification.yaml',
        fileType: 'yaml',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'API contract documented for UPI limit workflow.',
        executiveSummary:
          'API specification defines deterministic contracts for evaluate/confirm journeys with banking-grade auth, idempotency, and retry boundaries.',
        previewContent:
          'openapi: 3.0.3\ninfo:\n  title: UPI Limit Enhancement API\npaths:\n  /v1/limits/evaluate:\n    post:\n      security:\n        - mTLS: []\n      responses:\n        "200":\n          description: Eligibility decision',
        sections: [
          { title: 'Endpoint Catalog', content: 'POST /v1/limits/evaluate\nPOST /v1/limits/confirm\nGET /v1/limits/{customerId}/history' },
          { title: 'Authentication', content: 'mTLS between channel and API gateway; OAuth2 client credentials for service-to-service calls; HMAC signature for request integrity.' },
          { title: 'Request Payload', content: '{ customerId, channelId, requestedLimit, kycLevel, consentId, requestTimestamp }' },
          { title: 'Response Payload', content: '{ decisionId, status, approvedLimit, reasonCode, effectiveFrom, advisoryMessages[] }' },
          { title: 'Error Codes', content: '400 INVALID_PAYLOAD\n401 AUTH_FAILURE\n409 POLICY_BREACH\n422 FRAUD_REVIEW_REQUIRED\n504 DOWNSTREAM_TIMEOUT' },
          { title: 'Retry Strategy', content: 'Idempotency-Key required for evaluate/confirm endpoints. Client retries: max 2 attempts with exponential backoff (200ms, 600ms).' },
          { title: 'Performance Targets', content: 'Evaluate endpoint p95 <= 120ms, confirm endpoint p95 <= 220ms, error budget 0.05% monthly.' },
        ],
      },
      {
        name: 'UPI_Limit_Integration_Design.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Integration design prepared for payment ecosystem adapters.',
        executiveSummary:
          'Integration design defines channel-to-core orchestration and event choreography for near-real-time UPI limit synchronization.',
        previewContent:
          'INTEGRATION DESIGN\nSource: Mobile App, Net Banking\nTarget: CBS, Fraud, NPCI Adapter\nPattern: Synchronous decision + async event distribution\nTopics: payments.limit.events.v1',
        sections: [
          { title: 'Source Systems', content: 'Mobile Banking Channel, Net Banking Portal, Branch Assisted Service Console.' },
          { title: 'Target Systems', content: 'Core Banking System, Fraud Monitoring Platform, NPCI UPI Adapter, Notification Hub, Audit Vault.' },
          { title: 'Integration Pattern', content: 'Request/Response for decisioning + Event-driven fan-out for post-decision synchronization.' },
          { title: 'Message Flow', content: 'Channel -> API Gateway -> Limit Decision Service -> CBS/Fraud checks -> decision -> Kafka event -> downstream subscribers.' },
          { title: 'Event Topics', content: 'payments.limit.decisioned.v1\npayments.limit.confirmed.v1\npayments.limit.rejected.v1' },
          { title: 'Exception Handling', content: 'Compensation for partial update: if CBS update fails after decision, event status=RECONCILE_PENDING and operations alert generated.' },
        ],
      },
      {
        name: 'UPI_Limit_Architecture_Review_Report.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Enterprise Architecture Board',
        modelUsed: 'architecture-review-template-v3',
        changeSummary: 'Architecture board review report generated.',
        executiveSummary:
          'Review confirms target design is aligned to digital payments modernization standards with two risk actions before production cutover.',
        previewContent:
          'ARCHITECTURE REVIEW REPORT\nBoard: EA + Risk + Security\nFindings: 7\nDecisions: Proceed with conditions\nActions: 2 high-priority closures',
        sections: [
          { title: 'Review Board', content: 'Participants: Head of EA, Payments Architect, Security Architect, Risk Engineering Lead, Production SRE Lead.' },
          { title: 'Findings', content: 'F-01 Event replay policy required.\nF-02 Cache invalidation control acceptable.\nF-03 Audit signature rotation to be automated.' },
          { title: 'Decisions', content: 'Decision-1: Approved for SIT.\nDecision-2: Production gated on event replay drill and signature rotation automation.' },
          { title: 'Risks', content: 'R-High-01 Fraud adapter latency spikes.\nR-Med-02 Cross-region replication lag.' },
          { title: 'Action Items', content: 'A1: Complete replay drill evidence by 22-Jul.\nA2: Implement key rotation automation by 25-Jul.' },
          { title: 'Approval Status', content: 'Conditional Approval - Pre-production controls pending closure.' },
        ],
      },
    ],
  },
  'npci-switch-integration': {
    key: 'npci-switch-integration',
    prompt: PROMPTS[1],
    analysis: {
      'Scenario': 'NPCI Switch Integration',
      'Executive Summary':
        'Integration architecture recommends a canonical payment gateway with resilient routing, deterministic retries, and transaction observability for NPCI switch interactions.',
      'Architecture Insights': [
        'Adopt canonical command model to isolate bank channels from NPCI schema shifts.',
        'Introduce circuit breaker and bulkhead controls around switch adapter.',
        'Track end-to-end correlation ID from ingress to settlement callback.',
      ],
      'KPIs': [
        'Switch timeout rate target: < 0.3%',
        'Auto-retry success uplift: +18%',
        'Payment trace completeness: 100%',
      ],
      'Dependency Map Data': [
        'Payment Gateway -> Switch Adapter -> NPCI Router',
        'Switch Adapter -> AML/Fraud Engine -> Exception Queue',
        'Settlement Service <- callback events <- NPCI Router',
      ],
      'Risks': [
        'Duplicate debits due to callback race condition under retry storms.',
        'Schema drift in NPCI message revisions impacting adapter parsing.',
      ],
      'Recommendations': [
        'Implement idempotency token with 48-hour replay window.',
        'Version gateway canonical model independent of NPCI minor revisions.',
      ],
      'Workflow Information': [
        'Joint design walkthrough with Payments Platform and Settlement Ops.',
        'CAB dry run required for switch failover scenario.',
      ],
      'Confidence Score': 95,
    },
    artifacts: [
      {
        name: 'NPCI_Switch_Solution_Architecture.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'High',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Solution architecture drafted for NPCI switch integration.',
        executiveSummary:
          'Solution architecture establishes a decoupled payment orchestration layer with canonical payloads and callback-safe reconciliation.',
        previewContent:
          'SOLUTION ARCHITECTURE - NPCI SWITCH INTEGRATION\nCanonical command layer, adapter isolation, callback reconciliation, failover routing.',
        sections: [
          { title: 'Business Context', content: 'UPI transaction growth requires resilient switch integration while preserving transaction integrity and customer trust.' },
          { title: 'Architecture Overview', content: 'Channel traffic converges at Payment Gateway, then routed through canonical orchestration to Switch Adapter and Settlement Callback Processor.' },
          { title: 'Logical Components', content: 'Payment Gateway, Canonical Mapper, NPCI Adapter, Retry Coordinator, Callback Processor, Reconciliation Ledger.' },
          { title: 'Technology Stack', content: 'Java/Kotlin microservices, Kafka streams, PostgreSQL ledger, Redis idempotency cache, gRPC internal contracts.' },
          { title: 'Non Functional Requirements', content: '99.99% switch integration availability, callback processing < 300ms p95, duplicate debit tolerance = zero.' },
          { title: 'Deployment View', content: 'Blue-green deployment with canary routing for adapter releases; dual-region hot standby.' },
          { title: 'Risks', content: 'Callback race conditions, schema drift risk, dependency on external switch SLA.' },
        ],
      },
      {
        name: 'NPCI_Switch_Integration_Design.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'High',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Detailed integration design defined for switch traffic.',
        executiveSummary:
          'Integration design details source-target topology, topic taxonomy, error contracts, and switch outage handling procedures.',
        previewContent:
          'INTEGRATION DESIGN\nPattern: Canonical request-response + event callbacks\nTopics: payments.switch.requested.v1, payments.switch.callback.v1',
        sections: [
          { title: 'Source Systems', content: 'Mobile Banking, Merchant Acquirer API, Net Banking, Branch Payment Console.' },
          { title: 'Target Systems', content: 'NPCI Switch, Settlement Engine, Fraud Engine, Customer Notification Service.' },
          { title: 'Integration Pattern', content: 'Canonical synchronous invocation for authorization + asynchronous callback ingestion for final settlement state.' },
          { title: 'Message Flow', content: 'Ingress -> canonical map -> switch adapter -> NPCI ack -> callback event -> reconciliation -> customer status update.' },
          { title: 'Event Topics', content: 'payments.switch.requested.v1\npayments.switch.acknowledged.v1\npayments.switch.callback.v1\npayments.switch.reconciled.v1' },
          { title: 'Exception Handling', content: 'Out-of-order callbacks are buffered by transaction key; unreconciled states route to exception queue after 90 seconds.' },
        ],
      },
      {
        name: 'NPCI_Switch_API_Specification.yaml',
        fileType: 'yaml',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'API contract finalized for switch orchestration endpoints.',
        executiveSummary:
          'API contract enforces deterministic request lifecycle, strict idempotency, and callback verification for switch transactions.',
        previewContent:
          'openapi: 3.0.3\ninfo:\n  title: NPCI Switch Orchestration API\npaths:\n  /v1/switch/payments\n  /v1/switch/callbacks',
        sections: [
          { title: 'Endpoint Catalog', content: 'POST /v1/switch/payments\nPOST /v1/switch/callbacks\nGET /v1/switch/transactions/{txnId}' },
          { title: 'Authentication', content: 'mTLS for partner banks, JWT for internal services, signed callback payload verification.' },
          { title: 'Request Payload', content: '{ txnId, payerVpa, payeeVpa, amount, txnType, timestamp, channelRef }' },
          { title: 'Response Payload', content: '{ gatewayRef, switchRef, status, settlementStatus, lastUpdatedAt }' },
          { title: 'Error Codes', content: '422 SWITCH_SCHEMA_INVALID\n425 CALLBACK_NOT_YET_AVAILABLE\n504 SWITCH_TIMEOUT\n409 DUPLICATE_TXN_ID' },
          { title: 'Retry Strategy', content: 'Gateway retries only for timeout and network exceptions; max 3 attempts with jittered backoff, always idempotent by txnId.' },
          { title: 'Performance Targets', content: 'Authorization path <= 180ms p95, callback ingestion <= 120ms p95, reconciliation completion <= 2 minutes.' },
        ],
      },
      {
        name: 'NPCI_Switch_Risk_Assessment.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'High',
        generatedBy: 'Risk Architecture Office',
        modelUsed: 'risk-assessment-matrix-v2',
        changeSummary: 'Risk matrix generated for switch integration design.',
        executiveSummary:
          'Risk assessment highlights duplicate transaction and delayed callback exposure, with controls mapped for production readiness.',
        previewContent:
          'RISK ASSESSMENT\nRisk Category: Operational + Transaction Integrity\nTop risk: duplicate debit under callback delay.',
        sections: [
          { title: 'Risk Register', content: 'RA-01 Duplicate debit\nRA-02 Callback delay > SLA\nRA-03 Adapter schema mismatch\nRA-04 Monitoring blind spots' },
          { title: 'Likelihood and Impact', content: 'RA-01: Medium/High\nRA-02: High/Medium\nRA-03: Medium/High\nRA-04: Medium/Medium' },
          { title: 'Controls', content: 'Idempotency ledger, callback TTL policy, contract tests against NPCI schemas, end-to-end trace IDs.' },
          { title: 'Residual Risk', content: 'Residual portfolio risk: Medium-High until full callback replay drill is certified.' },
          { title: 'Control Owners', content: 'Payments Platform Lead, Settlement SRE Lead, Fraud Integration Owner.' },
          { title: 'Approval Status', content: 'Risk acceptance pending on CAB rehearsal evidence.' },
        ],
      },
      {
        name: 'NPCI_Switch_Architecture_Review_Report.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Enterprise Architecture Board',
        modelUsed: 'architecture-review-template-v3',
        changeSummary: 'Review report prepared for NPCI switch architecture.',
        executiveSummary:
          'Review board accepted architecture direction and requested strict callback reconciliation controls before cutover.',
        previewContent:
          'REVIEW REPORT\nDecision: Proceed with controlled pilot\nAction: Complete callback replay certification.',
        sections: [
          { title: 'Review Board', content: 'EA Chair, Payment Switch Architect, Risk Ops, Security Engineering, Production Reliability.' },
          { title: 'Findings', content: 'Canonical abstraction rated strong.\nRetry policy approved with idempotency guarantees.\nCallback ordering edge case needs production simulation.' },
          { title: 'Decisions', content: 'Approved for pilot traffic up to 10%.\nFull rollout contingent on reconciliation metrics >= 99.98%.' },
          { title: 'Risks', content: 'Unreconciled callback backlog in peak windows.' },
          { title: 'Action Items', content: 'Run chaos test for callback delays.\nPublish settlement reconciliation dashboard for CAB.' },
          { title: 'Approval Status', content: 'Conditional Approval - Pilot allowed.' },
        ],
      },
    ],
  },
  'biometric-login-security': {
    key: 'biometric-login-security',
    prompt: PROMPTS[2],
    analysis: {
      'Scenario': 'Biometric Login Security',
      'Executive Summary':
        'Security architecture introduces biometric assurance with device binding, risk-adaptive MFA fallback, and cryptographic attestation for mobile banking login.',
      'Architecture Insights': [
        'Enforce device attestation before biometric token acceptance.',
        'Store only signed biometric assertions; never persist biometric templates.',
        'Use risk score to trigger step-up authentication for anomalous sessions.',
      ],
      'KPIs': [
        'Login success rate target: 97.5%',
        'Fraudulent login reduction target: 41%',
        'Median authentication time: <= 1.6s',
      ],
      'Dependency Map Data': [
        'Mobile App -> Identity Gateway -> Auth Orchestrator',
        'Auth Orchestrator -> Device Attestation Service -> Risk Engine',
        'Auth Orchestrator -> Session Manager -> Audit SIEM',
      ],
      'Risks': [
        'Compromised devices bypassing weak attestation checks.',
        'Fallback OTP abuse if risk thresholds are not tuned.',
      ],
      'Recommendations': [
        'Integrate hardware-backed keystore attestation verification.',
        'Tune adaptive risk model with geo-velocity and behavior signals.',
      ],
      'Workflow Information': [
        'Security design review jointly owned by IAM and Cyber Defense.',
        'Regulatory evidence package to include privacy and consent controls.',
      ],
      'Confidence Score': 97,
    },
    artifacts: [
      {
        name: 'Biometric_Login_Security_Architecture.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Security Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Security architecture baseline created for biometric login.',
        executiveSummary:
          'Architecture defines secure biometric login flow with cryptographic proofing, session hardening, and adaptive risk response.',
        previewContent:
          'SECURITY ARCHITECTURE\nBiometric assertion -> attestation check -> risk score -> session issue / step-up.',
        sections: [
          { title: 'Business Context', content: 'Bank requires lower login friction while reducing account takeover incidents in mobile channels.' },
          { title: 'Architecture Overview', content: 'Mobile app captures platform biometric assertion; Identity Gateway verifies attestation and risk before issuing short-lived session token.' },
          { title: 'Logical Components', content: 'Identity Gateway, Biometric Assertion Validator, Device Attestation Service, Adaptive Risk Engine, Session Manager, SIEM Audit Pipeline.' },
          { title: 'Technology Stack', content: 'FIDO2/WebAuthn, JWT + JWE tokens, HSM-backed key management, Redis session state, SIEM forwarding via Kafka.' },
          { title: 'Non Functional Requirements', content: 'Auth p95 <= 1.6s, 99.99% auth service availability, zero biometric template storage, audit event SLA <= 5s.' },
          { title: 'Deployment View', content: 'IAM cluster in dual region; attestation verification service isolated in security subnet; centralized policy service.' },
          { title: 'Risks', content: 'Rooted device spoofing, false positives from aggressive risk score, fallback OTP interception attempts.' },
        ],
      },
      {
        name: 'Biometric_Login_LLD.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Security Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'LLD documented for biometric auth implementation.',
        executiveSummary:
          'LLD defines biometric verification components, trust boundaries, token lifecycle, and security telemetry mappings.',
        previewContent:
          'LLD\nComponents: AssertionValidator, RiskScorer, SessionIssuer\nFlows: biometric success, fallback MFA, risk-block.',
        sections: [
          { title: 'Component Design', content: 'AssertionValidator verifies signed biometric assertions.\nRiskScorer computes auth risk using device, geo, and behavioral attributes.\nSessionIssuer creates bound access tokens.' },
          { title: 'Interfaces', content: 'POST /v1/auth/biometric/verify\nPOST /v1/auth/mfa/challenge\nPOST /v1/auth/session/issue' },
          { title: 'Database Design', content: 'auth_event_log, device_binding_registry, session_token_ledger (hashed token refs only).' },
          { title: 'Sequence Flow', content: 'Biometric verify -> attestation check -> risk score -> allow/step-up/block -> session token issue -> SIEM log.' },
          { title: 'Error Handling', content: 'BIO-403 attestation failed\nBIO-409 risk threshold exceeded\nBIO-429 challenge throttled\nBIO-498 fallback exhausted' },
          { title: 'Configuration', content: 'Risk policy versioned by segment; threshold profiles: retail, premium, high-net-worth.' },
        ],
      },
      {
        name: 'Biometric_Login_API_Specification.yaml',
        fileType: 'yaml',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Security Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'API specification authored for biometric auth services.',
        executiveSummary:
          'API specification formalizes biometric verification and MFA fallback contracts with strict security controls.',
        previewContent:
          'openapi: 3.0.3\ninfo:\n  title: Biometric Authentication API\npaths:\n  /v1/auth/biometric/verify\n  /v1/auth/mfa/challenge',
        sections: [
          { title: 'Endpoint Catalog', content: 'POST /v1/auth/biometric/verify\nPOST /v1/auth/mfa/challenge\nPOST /v1/auth/session/issue' },
          { title: 'Authentication', content: 'Mutual TLS + signed device assertion, nonce validation, and per-device token binding.' },
          { title: 'Request Payload', content: '{ deviceId, assertionBlob, attestationToken, appVersion, nonce, channel }' },
          { title: 'Response Payload', content: '{ authDecision, riskScore, challengeRequired, sessionToken, expiresAt }' },
          { title: 'Error Codes', content: '401 INVALID_ASSERTION\n403 ATTESTATION_FAILED\n409 RISK_BLOCKED\n429 CHALLENGE_RATE_LIMIT' },
          { title: 'Retry Strategy', content: 'No automatic retry for verification failure; challenge endpoint allows controlled retries with progressive cool-off.' },
          { title: 'Performance Targets', content: 'Verify endpoint <= 1.6s p95, challenge endpoint <= 700ms p95.' },
        ],
      },
      {
        name: 'Biometric_Login_Risk_Assessment.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'High',
        generatedBy: 'Cyber Security Office',
        modelUsed: 'security-risk-matrix-v4',
        changeSummary: 'Security risk assessment completed for biometric login.',
        executiveSummary:
          'Risk assessment identifies residual exposure around compromised device posture and recommends compensating controls before go-live.',
        previewContent:
          'RISK ASSESSMENT\nThreats: device compromise, replay attack, credential stuffing fallback.\nResidual Risk: Medium.',
        sections: [
          { title: 'Threat Model', content: 'Attack vectors: rooted/jailbroken device, replay of signed assertion, SIM swap before OTP fallback.' },
          { title: 'Controls Evaluation', content: 'Current controls: attestation, nonce validation, token binding, adaptive risk.\nGaps: fallback monitoring granularity, device health revocation window.' },
          { title: 'Risk Scoring', content: 'Likelihood/Impact:\nCompromised device spoof: M/H\nReplay assertion: L/H\nFallback abuse: M/M' },
          { title: 'Mitigations', content: 'Add jailbreak intelligence feed, enforce stricter OTP fallback window, integrate behavioral anomaly scoring.' },
          { title: 'Residual Risk', content: 'Residual risk classified Medium, acceptable with control closure in Sprint 28.' },
          { title: 'Approval Status', content: 'Pending CISO and IAM governance sign-off.' },
        ],
      },
      {
        name: 'Biometric_Login_Architecture_Review_Report.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Architecture Review Board',
        modelUsed: 'architecture-review-template-v3',
        changeSummary: 'Review board report captured for security architecture.',
        executiveSummary:
          'Review board validated design principles and mandated production telemetry baselines for fraud analytics.',
        previewContent:
          'REVIEW REPORT\nDecision: Approved for controlled rollout.\nCondition: telemetry dashboards and fallback controls live before launch.',
        sections: [
          { title: 'Review Board', content: 'CISO delegate, IAM Lead, Mobile Platform Architect, Fraud Engineering Manager.' },
          { title: 'Findings', content: 'Strong zero-template storage posture.\nAttestation pipeline robust.\nFallback OTP policy needs stricter abuse thresholds.' },
          { title: 'Decisions', content: 'Approve phased launch (5%, 25%, 100%) with fraud watchpoints.' },
          { title: 'Risks', content: 'Risk of user friction increase if fallback triggers exceed 8%.' },
          { title: 'Action Items', content: 'Deploy fallback abuse dashboard.\nFinalize privacy notice update.\nRun red-team replay simulation.' },
          { title: 'Approval Status', content: 'Conditional approval granted.' },
        ],
      },
    ],
  },
  'merchant-settlement-data-model': {
    key: 'merchant-settlement-data-model',
    prompt: PROMPTS[3],
    analysis: {
      'Scenario': 'Merchant Settlement Data Model',
      'Executive Summary':
        'Data architecture models settlement lifecycle entities, reconciliation lineage, and regulatory retention controls for merchant payout operations.',
      'Architecture Insights': [
        'Adopt canonical ledger entities: settlement_batch, payout_instruction, reconciliation_break.',
        'Capture immutable lineage from transaction ingestion to final payout posting.',
        'Separate hot operational store from compliance archive for retention economics.',
      ],
      'KPIs': [
        'Reconciliation break closure SLA: <= 24 hours',
        'Settlement processing success: >= 99.7%',
        'Data lineage completeness: 100%',
      ],
      'Dependency Map Data': [
        'Transaction Ingest -> Settlement Engine -> Ledger Store',
        'Ledger Store -> Reconciliation Service -> Ops Dashboard',
        'Ledger Store -> Compliance Archive -> Audit Query Service',
      ],
      'Risks': [
        'Schema drift between ingest stream and settlement model.',
        'Late-arriving events impacting payout netting accuracy.',
      ],
      'Recommendations': [
        'Enforce schema registry contracts on ingestion topics.',
        'Introduce late-event correction workflow with versioned netting snapshots.',
      ],
      'Workflow Information': [
        'Data governance review aligned with finance operations architecture.',
        'Retention policy review with legal and compliance before production archival.',
      ],
      'Confidence Score': 94,
    },
    artifacts: [
      {
        name: 'Merchant_Settlement_Data_Model.xlsx',
        fileType: 'xlsx',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Data Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Entity model and dictionary prepared for settlement domain.',
        executiveSummary:
          'Data model defines settlement entities, cardinality, retention classes, and lineage attributes required for payout control and audit.',
        previewContent:
          'DATA MODEL\nEntities: settlement_batch, payout_instruction, reconciliation_break, merchant_account, fee_component, settlement_event.',
        sections: [
          { title: 'Entity Model', content: 'Core entities: merchant_account, settlement_batch, payout_instruction, payout_line_item, reconciliation_break, fee_component, settlement_event.' },
          { title: 'Relationships', content: 'merchant_account 1..N settlement_batch\nsettlement_batch 1..N payout_instruction\npayout_instruction 1..N payout_line_item\nsettlement_batch 1..N reconciliation_break' },
          { title: 'Data Dictionary', content: 'settlement_batch.batch_id (PK)\nsettlement_batch.net_amount_inr\npayout_instruction.status\nreconciliation_break.reason_code\nsettlement_event.event_ts_utc' },
          { title: 'Retention', content: 'Operational store: 13 months\nReconciliation evidence: 7 years\nAudit archive (WORM): 10 years' },
          { title: 'Lineage', content: 'Each payout_line_item references source transaction_id and ingest_event_id to ensure full backward traceability.' },
        ],
      },
      {
        name: 'Merchant_Settlement_Integration_Design.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Data Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Integration blueprint completed for settlement data flows.',
        executiveSummary:
          'Integration design aligns ingestion, reconciliation, and payout publication with event contracts and operational controls.',
        previewContent:
          'INTEGRATION DESIGN\nPattern: event sourcing + periodic netting windows\nTopics: settlement.ingested.v1, settlement.netted.v1, settlement.payout.ready.v1',
        sections: [
          { title: 'Source Systems', content: 'Merchant transaction ingest, fee calculator, dispute management, tax computation service.' },
          { title: 'Target Systems', content: 'Settlement engine, payout processor, finance GL posting, compliance archive.' },
          { title: 'Integration Pattern', content: 'Event-sourced settlement stream with deterministic netting windows and reconciliation checkpoints.' },
          { title: 'Message Flow', content: 'Ingest event -> settlement aggregation -> fee/tax enrichment -> net payout event -> payout processor -> GL posting.' },
          { title: 'Event Topics', content: 'settlement.ingested.v1\nsettlement.enriched.v1\nsettlement.netted.v1\nsettlement.payout.ready.v1' },
          { title: 'Exception Handling', content: 'Late events route to adjustment queue; reconciliation break tickets auto-created with impacted merchant and batch IDs.' },
        ],
      },
      {
        name: 'Merchant_Settlement_API_Specification.yaml',
        fileType: 'yaml',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Data Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Settlement API contract defined for merchant and operations consumers.',
        executiveSummary:
          'API specification provides operational and merchant-facing contracts for settlement status, payout details, and reconciliation visibility.',
        previewContent:
          'openapi: 3.0.3\ninfo:\n  title: Merchant Settlement API\npaths:\n  /v1/settlement/batches\n  /v1/settlement/payouts/{payoutId}',
        sections: [
          { title: 'Endpoint Catalog', content: 'GET /v1/settlement/batches\nGET /v1/settlement/payouts/{payoutId}\nGET /v1/settlement/reconciliation/breaks' },
          { title: 'Authentication', content: 'OAuth2 for internal ops users, signed JWT for merchant portal integrations, scope-based authorization.' },
          { title: 'Request Payload', content: 'Filter fields: merchantId, batchDate, payoutStatus, settlementMode.' },
          { title: 'Response Payload', content: 'Batch summary, payout breakdown, fee/tax components, reconciliation status, lineage reference IDs.' },
          { title: 'Error Codes', content: '404 BATCH_NOT_FOUND\n409 BATCH_STILL_PROCESSING\n422 INVALID_MERCHANT_SCOPE\n503 SETTLEMENT_READ_MODEL_STALE' },
          { title: 'Retry Strategy', content: 'Read APIs support safe retries with ETag validation; stale read responses include retry-after headers.' },
          { title: 'Performance Targets', content: 'Batch list <= 220ms p95, payout detail <= 180ms p95, reconciliation list <= 300ms p95.' },
        ],
      },
      {
        name: 'Merchant_Settlement_Technology_Standards.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Low',
        generatedBy: 'Enterprise Standards Office',
        modelUsed: 'standards-catalog-v2',
        changeSummary: 'Technology standards mapping created for settlement platform.',
        executiveSummary:
          'Standards mapping aligns settlement data platform with enterprise approved patterns for storage, messaging, and governance.',
        previewContent:
          'TECHNOLOGY STANDARDS\nStorage: PostgreSQL 15 + object archive\nMessaging: Kafka with schema registry\nGovernance: data classification level C2.',
        sections: [
          { title: 'Approved Platforms', content: 'Kafka 3.x, PostgreSQL 15, Debezium CDC, object storage with immutable lock policies.' },
          { title: 'Data Governance Standards', content: 'PII masking in analytics copies, tokenized merchant identifiers for support tooling, C2 classification policy compliance.' },
          { title: 'Reliability Standards', content: 'Dual-region recovery, CDC lag alarms <= 30 seconds, data quality checks before payout finalization.' },
          { title: 'Security Standards', content: 'At-rest encryption via KMS, in-transit TLS 1.3, row-level access controls for financial operations users.' },
          { title: 'Observability Standards', content: 'Lineage events exported to enterprise catalog, settlement run metrics to unified monitoring dashboards.' },
          { title: 'Approval Status', content: 'Standards conformant; minor waiver requested for temporary legacy GL adapter.' },
        ],
      },
      {
        name: 'Merchant_Settlement_Modernization_Roadmap.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Data Transformation Office',
        modelUsed: 'roadmap-template-v3',
        changeSummary: 'Modernization roadmap produced for settlement domain.',
        executiveSummary:
          'Roadmap phases migration from batch-heavy settlement processing to event-native architecture with full lineage and compliance observability.',
        previewContent:
          'MODERNIZATION ROADMAP\nPhase 1 canonical model\nPhase 2 event-native reconciliation\nPhase 3 real-time payout insights',
        sections: [
          { title: 'Phase Plan', content: 'Phase 1 (Q3): Canonical entity rollout.\nPhase 2 (Q4): Event-native reconciliation.\nPhase 3 (Q1): Real-time merchant payout analytics.' },
          { title: 'Capability Milestones', content: 'Milestone-1 Batch-to-event adapter complete.\nMilestone-2 Reconciliation break automation >= 85%.\nMilestone-3 Self-service merchant settlement dashboard live.' },
          { title: 'Investment and Outcomes', content: 'Estimated program spend: INR 6.8 Cr.\nExpected annual savings: INR 2.4 Cr via manual reconciliation reduction.' },
          { title: 'Risk and Mitigation', content: 'Risk: legacy GL integration delay.\nMitigation: phased adapter parallel run for two cycle windows.' },
          { title: 'Governance Gates', content: 'Gate A: Data governance clearance.\nGate B: Operations readiness.\nGate C: Finance and compliance sign-off.' },
          { title: 'Approval Status', content: 'Draft for steering committee review.' },
        ],
      },
    ],
  },
};

export function architectureScenarioPrompts(): string[] {
  return [...PROMPTS];
}

function normalizePrompt(prompt: string): string {
  return prompt.trim().toLowerCase();
}

export function matchArchitectureScenario(prompt: string): ArchitectureScenario {
  const n = normalizePrompt(prompt);
  if (n === normalizePrompt(PROMPTS[0]) || (n.includes('upi') && n.includes('limit'))) {
    return SCENARIOS['upi-limit-enhancement'];
  }
  if (n === normalizePrompt(PROMPTS[1]) || (n.includes('npci') && n.includes('switch'))) {
    return SCENARIOS['npci-switch-integration'];
  }
  if (n === normalizePrompt(PROMPTS[2]) || (n.includes('biometric') && n.includes('login'))) {
    return SCENARIOS['biometric-login-security'];
  }
  if (n === normalizePrompt(PROMPTS[3]) || (n.includes('merchant') && n.includes('settlement'))) {
    return SCENARIOS['merchant-settlement-data-model'];
  }
  return SCENARIOS['upi-limit-enhancement'];
}

export function getArchitectureScenarioAnalysis(prompt: string): AnalysisResult {
  return matchArchitectureScenario(prompt).analysis;
}

export function getArchitectureScenarioArtifacts(prompt: string, runId: string): Artifact[] {
  const scenario = matchArchitectureScenario(prompt);
  return scenario.artifacts.map((artifact, idx) => buildArtifact(runId, idx, artifact));
}
