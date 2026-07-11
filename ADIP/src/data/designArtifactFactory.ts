import type { Artifact } from '../types/artifacts';
import { enrichArtifacts } from './artifactBuilder';
import { createRunId, formatTimestamp } from './requirementArtifactFactory';

export { createRunId, formatTimestamp };

export interface ApprovedArtifactOption {
  id: string;
  label: string;
  feature: string;
}

export const approvedBrdOptions: ApprovedArtifactOption[] = [
  { id: 'brd-upi', label: 'BRD.docx — UPI Limit Enhancement', feature: 'UPI Limit Enhancement' },
  { id: 'brd-settlement', label: 'BRD.docx — Merchant Auto Settlement', feature: 'Merchant Auto Settlement' },
  { id: 'brd-biometric', label: 'BRD.docx — Biometric Login', feature: 'Biometric Login' },
];

export const approvedFrdOptions: ApprovedArtifactOption[] = [
  { id: 'frd-upi', label: 'FRD.docx — UPI Limit Enhancement', feature: 'UPI Limit Enhancement' },
  { id: 'frd-settlement', label: 'FRD.docx — Merchant Auto Settlement', feature: 'Merchant Auto Settlement' },
  { id: 'frd-mandate', label: 'FRD.docx — Recurring Mandate Upgrade', feature: 'Recurring Mandate Upgrade' },
];

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildDesignArtifacts(brdId: string, frdId: string, runId: string): Artifact[] {
  const comboKey = `${brdId}|${frdId}`;
  const date = today();

  const scenarioByCombo: Record<string, 'upi' | 'merchant' | 'biometric' | 'mandate'> = {
    'brd-upi|frd-upi': 'upi',
    'brd-upi|frd-settlement': 'upi',
    'brd-upi|frd-mandate': 'mandate',
    'brd-settlement|frd-upi': 'merchant',
    'brd-settlement|frd-settlement': 'merchant',
    'brd-settlement|frd-mandate': 'mandate',
    'brd-biometric|frd-upi': 'biometric',
    'brd-biometric|frd-settlement': 'biometric',
    'brd-biometric|frd-mandate': 'mandate',
  };

  const scenario = scenarioByCombo[comboKey];
  if (!scenario) {
    throw new Error(`Unsupported BRD/FRD combination: ${comboKey}`);
  }

  const mk = (
    suffix: string,
    name: string,
    fileType: Artifact['fileType'],
    executiveSummary: string,
    keyFindings: string,
    recommendations: string,
    metadata: string,
    previewContent: string,
    changeSummary: string,
    status: Artifact['approvalStatus'] = 'Draft',
  ): Artifact => ({
    id: `${runId}-${suffix}`,
    name,
    generatedBy: 'Design AI',
    modelUsed: 'deterministic-architecture-intake',
    version: '1.0',
    generatedDate: date,
    approvalStatus: status,
    fileType,
    executiveSummary,
    sections: [
      { title: 'Key Findings', content: keyFindings },
      { title: 'Recommendations', content: recommendations },
      { title: 'Metadata', content: metadata },
    ],
    previewContent,
    generationHistory: [
      {
        version: '1.0',
        generatedDate: date,
        generatedBy: 'Design AI',
        modelUsed: 'deterministic-architecture-intake',
        changeSummary,
      },
    ],
  });

  const artifactsByScenario: Record<'upi' | 'merchant' | 'biometric' | 'mandate', Artifact[]> = {
    upi: [
      mk(
        'hld',
        'UPI_HLD.docx',
        'docx',
        'UPI Limit Enhancement HLD defines policy-based limit decisioning with fraud and compliance controls.',
        '1) Target p95 decision latency is 120ms.\n2) KYC L2 profile validation is mandatory before approval.\n3) All limit changes are audit-signed.',
        'Adopt dual-region active-active deployment and enforce contract tests on CBS adapters before release.',
        'Scenario: UPI Limit Enhancement\nBRD/FRD Input: brd-upi + frd-upi|frd-settlement\nOwner: Payments Architecture\nStatus: Pending Review',
        'UPI HLD\nBusiness Context: Raise UPI limits for KYC L2 customers.\nArchitecture Overview: Channel -> API Gateway -> Limit Decision Service -> CBS/Fraud.\nLogical Components: Policy Engine, Risk Adapter, Audit Ledger.\nTechnology Stack: Java, Kafka, Redis, PostgreSQL.\nNFR: p95 <= 120ms, 99.95% availability.\nDeployment View: Active-active dual region.\nRisks: cache drift, profile sync lag.',
        'Generated UPI HLD',
        'Pending Review',
      ),
      mk(
        'lld',
        'UPI_LLD.docx',
        'docx',
        'UPI LLD details component-level design and deterministic failure handling for limit workflows.',
        '1) DecisionController is stateless with idempotency key.\n2) Eligibility rules are cache-backed with TTL control.\n3) Audit events are persisted before confirmation.',
        'Implement schema validation and reconciliation queue for CBS timeout edge cases.',
        'Scenario: UPI Limit Enhancement\nDocument: LLD\nVersion: 1.0\nDependencies: CBS, Fraud Adapter',
        'UPI LLD\nComponent Design: DecisionController, EligibilityService, CoreBankingPublisher.\nInterfaces: /v1/limits/evaluate, /v1/limits/confirm.\nDatabase Design: limit_request, limit_decision, limit_audit_event.\nSequence Flow: evaluate -> fraud/compliance -> confirm.\nError Handling: LIM-401, LIM-409, LIM-504.\nConfiguration: segment threshold profiles.',
        'Generated UPI LLD',
      ),
      mk(
        'api',
        'UPI_API_Specification.yaml',
        'yaml',
        'UPI API contract defines evaluate and confirm operations for limit enhancement.',
        '1) Idempotency-Key required for POST endpoints.\n2) OAuth2 + mTLS enforced.\n3) Reason codes standardized for policy decisions.',
        'Include backward-compatible versioning strategy and strict payload schema checks.',
        'Scenario: UPI Limit Enhancement\nDocument: API Specification\nProtocol: REST/JSON\nSLO: p95 <= 180ms',
        'openapi: 3.0.3\ninfo:\n  title: UPI Limit API\npaths:\n  /v1/upi/limits/evaluate:\n    post:\n      summary: Evaluate customer limit raise\n  /v1/upi/limits/confirm:\n    post:\n      summary: Confirm approved limit update',
        'Generated UPI API spec',
      ),
      mk(
        'integration',
        'UPI_Integration_Design.docx',
        'docx',
        'UPI integration design captures deterministic orchestration across channel, core and risk systems.',
        '1) Synchronous decision path with asynchronous event fan-out.\n2) NPCI and CBS adapters isolated behind integration facade.\n3) Partial failures move to reconcile_pending workflow.',
        'Add replay-safe event keying and publish integration runbook for ops.',
        'Scenario: UPI Limit Enhancement\nDocument: Integration Design\nEvent Topic: payments.limit.decisioned.v1',
        'UPI Integration Design\nSource Systems: Mobile Banking, Net Banking.\nTarget Systems: CBS, NPCI adapter, Fraud, Notification Hub.\nIntegration Pattern: synchronous decision + asynchronous decision events.\nMessage Flow: ingress -> policy -> downstream publish.\nEvent Topics: payments.limit.decisioned.v1.\nException Handling: reconcile_pending for partial updates.',
        'Generated UPI integration design',
      ),
      mk(
        'data-model',
        'UPI_Data_Model.docx',
        'docx',
        'UPI data model defines entities and lineage for limit decision lifecycle.',
        '1) customer_limit_profile anchors eligibility state.\n2) limit_decision stores final action and reason codes.\n3) audit_event provides immutable trace.',
        'Add data retention policy checks in nightly governance job.',
        'Scenario: UPI Limit Enhancement\nDocument: Data Model\nRetention: 7 years',
        'UPI Data Model\nEntity Model: customer_limit_profile, limit_request, limit_decision, audit_event.\nRelationships: customer->requests->decisions.\nData Dictionary: approved_limit, reason_code, actor_id.\nRetention: 7 years audit retention.\nLineage: decision_id links request to CBS update event.',
        'Generated UPI data model',
      ),
      mk(
        'deploy-arch',
        'UPI_Deployment_Architecture.docx',
        'docx',
        'UPI deployment architecture provides high availability and regulated operational controls.',
        '1) Active-active dual region with health-based routing.\n2) Zero-trust mTLS for east-west traffic.\n3) Autoscaling thresholds tuned for salary-day peaks.',
        'Run quarterly resilience drills and validate failover RTO under load.',
        'Scenario: UPI Limit Enhancement\nDocument: Deployment Architecture\nTopology: Dual region Kubernetes',
        'UPI Deployment Architecture\nDeployment: Kubernetes active-active Mumbai/Hyderabad.\nNetwork: zero-trust east-west TLS.\nScalability: autoscale at 65% CPU.\nResilience: circuit breaker for Fraud/CBS adapters.\nOperational Controls: SLO alerts and replay queue.',
        'Generated UPI deployment architecture',
      ),
    ],
    merchant: [
      mk('hld', 'Merchant_Settlement_HLD.docx', 'docx', 'Merchant settlement HLD covers event-native payout orchestration and reconciliation control points.', '1) Netting windows are deterministic by merchant/batch.\n2) Reconciliation service closes breaks within 24h SLA.\n3) Fee/tax enrichment is a mandatory pre-payout step.', 'Deploy schema registry and enforce producer compatibility before rollout.', 'Scenario: Merchant Auto Settlement\nBRD/FRD Input: brd-settlement + frd-upi|frd-settlement\nOwner: Settlement Architecture', 'Merchant Settlement HLD\nBusiness Context: automate merchant payout lifecycle.\nArchitecture Overview: Ingestion -> Settlement Engine -> Payout Processor.\nComponents: fee calculator, reconciliation service, payout publisher.\nNFR: 99.7% settlement success.', 'Generated merchant settlement HLD', 'Pending Review'),
      mk('data-model', 'Merchant_Settlement_Data_Model.xlsx', 'xlsx', 'Merchant settlement data model defines payout and reconciliation entities with retention controls.', '1) settlement_batch is the payout anchor entity.\n2) reconciliation_break tracks exception lifecycle.\n3) payout_instruction captures final payable state.', 'Add lineage export to governance catalog for audit trace.', 'Scenario: Merchant Auto Settlement\nDocument: Data Model\nFormat: XLSX dictionary + relationship sheets', 'Sheet: Entity Model\nmerchant_account, settlement_batch, payout_instruction, reconciliation_break\nSheet: Data Dictionary\nbatch_id, net_amount, status, break_reason\nSheet: Retention\noperational 13 months, archive 10 years', 'Generated merchant settlement data model'),
      mk('api', 'Merchant_Settlement_API.yaml', 'yaml', 'Settlement API exposes batch and payout views for merchant and operations use cases.', '1) Batch and payout endpoints are read-optimized.\n2) Authorization scoped by merchantId.\n3) Reconciliation states surfaced for operations dashboards.', 'Define ETag strategy for high-volume polling clients.', 'Scenario: Merchant Auto Settlement\nDocument: API Specification\nProtocol: REST', 'openapi: 3.0.3\ninfo:\n  title: Merchant Settlement API\npaths:\n  /v1/settlement/batches:\n    get:\n      summary: Fetch settlement batches\n  /v1/settlement/payouts/{payoutId}:\n    get:\n      summary: Fetch payout detail', 'Generated merchant settlement API'),
      mk('integration', 'Merchant_Integration_Design.docx', 'docx', 'Integration design defines event sourcing pattern for settlement and payout publication.', '1) Ingestion stream normalized before netting.\n2) GL posting occurs after payout readiness event.\n3) Late events route through adjustment queue.', 'Introduce replay simulation tests for quarter-end load.', 'Scenario: Merchant Auto Settlement\nDocument: Integration Design\nTopics: settlement.ingested.v1, settlement.netted.v1', 'Merchant Integration Design\nSource Systems: transaction ingest, disputes, fees.\nTarget Systems: settlement engine, payout rails, GL.\nPattern: event-sourced netting windows.\nTopics: settlement.ingested.v1, settlement.netted.v1.\nException Handling: late-event adjustment queue.', 'Generated merchant integration design'),
      mk('diagram', 'Merchant_Architecture_Diagram.png', 'png', 'Architecture diagram shows full merchant settlement flow from ingestion to payout and GL.', '1) Side-channel compliance archive writes are asynchronous.\n2) Ops dashboard consumes reconciliation status events.\n3) GL integration is post-netting and idempotent.', 'Maintain canonical naming for all event channels in the diagram legend.', 'Scenario: Merchant Auto Settlement\nDocument: Architecture Diagram\nFormat: PNG', '[Merchant Architecture Diagram]\nIngest -> Settlement -> Reconciliation -> Payout -> GL\nSide flows: Compliance archive, Ops dashboard', 'Generated merchant architecture diagram'),
      mk('workflow', 'Settlement_Workflow.docx', 'docx', 'Workflow document details deterministic lifecycle for settlement operations teams.', '1) Five-step workflow with explicit handoff gates.\n2) Exception closure required before cycle completion.\n3) Status transitions are audit-logged.', 'Automate step-4 to step-5 transition with break-threshold controls.', 'Scenario: Merchant Auto Settlement\nDocument: Workflow\nAudience: Ops + Product', 'Settlement Workflow\nStep 1: Ingest transactions\nStep 2: Aggregate by merchant/batch window\nStep 3: Apply fees/tax\nStep 4: Net payout and publish instruction\nStep 5: Reconcile breaks and close exceptions', 'Generated settlement workflow document'),
    ],
    biometric: [
      mk('hld', 'Biometric_Authentication_HLD.docx', 'docx', 'Biometric authentication HLD secures login with attestation and adaptive risk gates.', '1) Device attestation is mandatory for biometric assertion acceptance.\n2) Risk-based step-up MFA handles anomalous sessions.\n3) No biometric templates are persisted server-side.', 'Implement strict telemetry baselines for fallback OTP risk monitoring.', 'Scenario: Biometric Login\nBRD/FRD Input: brd-biometric + frd-upi|frd-settlement\nOwner: Security Architecture', 'Biometric Authentication HLD\nBusiness Context: secure low-friction login.\nOverview: App biometric assertion -> Identity Gateway -> Risk Engine.\nComponents: Attestation service, Session manager, SIEM audit stream.\nRisks: rooted devices, fallback abuse.', 'Generated biometric HLD', 'Pending Review'),
      mk('identity-flow', 'Identity_Flow.docx', 'docx', 'Identity flow defines deterministic auth states from biometric assertion to token issuance.', '1) Auth decisions are explicit: allow, challenge, block.\n2) Nonce validation prevents replay attempts.\n3) Every transition writes an audit event.', 'Introduce policy simulation mode for new risk thresholds before activation.', 'Scenario: Biometric Login\nDocument: Identity Flow\nState Machine: verify -> score -> issue/challenge/block', 'Identity Flow\n1. Biometric assertion capture\n2. Device attestation verification\n3. Adaptive risk scoring\n4. Session token issuance or step-up MFA\n5. Audit write to SIEM', 'Generated biometric identity flow'),
      mk('iam-arch', 'IAM_Architecture.docx', 'docx', 'IAM architecture formalizes trust boundaries, token policies, and privileged path controls.', '1) Identity gateway is single ingress for authentication.\n2) Token TTL policy differs by customer risk segment.\n3) Key management centralized via HSM-backed rotation.', 'Add break-glass audit hooks for emergency access operations.', 'Scenario: Biometric Login\nDocument: IAM Architecture\nStandards: OAuth2, JWT/JWE', 'IAM Architecture\nTrust boundaries: channel, gateway, auth orchestrator.\nPolicies: token TTL, device binding, privilege constraints.\nStandards: OAuth2, JWT/JWE, key rotation via HSM.', 'Generated IAM architecture'),
      mk('threat-model', 'Threat_Model.docx', 'docx', 'Threat model documents primary attack vectors and mapped controls for biometric auth.', '1) Replay attack risk mitigated by nonce+timestamp checks.\n2) Device compromise risk mitigated by attestation.\n3) OTP fallback interception mitigated by rate and velocity controls.', 'Run quarterly red-team scenarios targeting fallback channels.', 'Scenario: Biometric Login\nDocument: Threat Model\nMethod: STRIDE adapted for IAM', 'Threat Model\nThreats: replay attack, device compromise, OTP interception.\nMitigations: nonce validation, hardware attestation, risk-based lockout.\nResidual risk: medium after controls.', 'Generated threat model'),
      mk('security-controls', 'Security_Controls.docx', 'docx', 'Security controls register details preventive, detective and corrective controls.', '1) Preventive controls gate high-risk sessions.\n2) Detective controls detect unusual auth behavior.\n3) Corrective controls allow rapid containment.', 'Link controls to SOC runbook IDs for audit traceability.', 'Scenario: Biometric Login\nDocument: Security Controls\nControl Catalog: IAM-SC-01..IAM-SC-18', 'Security Controls\nPreventive: attestation gating, mTLS, rate limits.\nDetective: anomaly alerts, impossible-travel checks.\nCorrective: session revocation and step-up challenge.', 'Generated security controls'),
      mk('auth-api', 'Authentication_API.yaml', 'yaml', 'Authentication API contracts biometric verification and secure session issuance.', '1) Verify endpoint requires attestation token.\n2) Session issue endpoint binds token to device fingerprint.\n3) Error taxonomy supports SOC triage.', 'Publish API error mapping guide for mobile client teams.', 'Scenario: Biometric Login\nDocument: Authentication API\nSLO: auth p95 <= 1.6s', 'openapi: 3.0.3\ninfo:\n  title: Authentication API\npaths:\n  /v1/auth/biometric/verify:\n    post:\n      summary: Verify biometric assertion\n  /v1/auth/session/issue:\n    post:\n      summary: Issue bound session token', 'Generated authentication API'),
    ],
    mandate: [
      mk('hld', 'Mandate_HLD.docx', 'docx', 'Recurring mandate HLD covers consent, scheduling, retry and notification architecture.', '1) Consent lifecycle is versioned and auditable.\n2) Scheduler handles deterministic debit windows.\n3) Retry orchestration aligns to regulatory timing constraints.', 'Add fail-safe suspension trigger after retry exhaustion.', 'Scenario: Recurring Mandate Upgrade\nBRD/FRD Input: brd-upi|brd-settlement|brd-biometric + frd-mandate\nOwner: Payments Core Architecture', 'Recurring Mandate Upgrade HLD\nBusiness Context: resilient autopay mandate lifecycle.\nOverview: Consent -> schedule -> debit retries -> notifications.\nComponents: Mandate service, Scheduler, Retry orchestrator, Audit trail.', 'Generated mandate HLD', 'Pending Review'),
      mk('api', 'Mandate_API.yaml', 'yaml', 'Mandate API specification defines create/update/retry operations for mandate lifecycle.', '1) Create mandate validates consent profile.\n2) Retry endpoint enforces bounded retry policy.\n3) API responses include status reason codes.', 'Add webhook callback contract for merchant notification integration.', 'Scenario: Recurring Mandate Upgrade\nDocument: Mandate API\nProtocol: REST/JSON', 'openapi: 3.0.3\ninfo:\n  title: Recurring Mandate API\npaths:\n  /v1/mandates:\n    post:\n      summary: Create mandate\n  /v1/mandates/{id}/retry:\n    post:\n      summary: Trigger retry policy', 'Generated mandate API'),
      mk('scheduler', 'Scheduler_Design.docx', 'docx', 'Scheduler design captures run windows, retries and throttling controls for recurring debits.', '1) Debit windows configured by merchant category.\n2) Retry backoff policy is configurable but bounded.\n3) Overlapping cycles prevented by lock strategy.', 'Introduce scheduler observability panel for missed-window alerting.', 'Scenario: Recurring Mandate Upgrade\nDocument: Scheduler Design\nSLA: cycle completion <= 4 min', 'Scheduler Design\nWindows: T-1 reminder, T execution, T+1 retry.\nRetry policy: 3 attempts with configurable backoff.\nSLA: job completion <= 4 min per cycle.', 'Generated scheduler design'),
      mk('data-model', 'Mandate_Data_Model.docx', 'docx', 'Mandate data model defines lifecycle entities from consent through debit attempts.', '1) mandate entity is the root aggregate.\n2) debit_attempt captures every execution and retry.\n3) notification_event links to customer communications.', 'Add archival policy checks for long-lived dormant mandates.', 'Scenario: Recurring Mandate Upgrade\nDocument: Data Model\nRetention: 8 years', 'Mandate Data Model\nEntities: mandate, consent, debit_attempt, retry_plan, notification_event.\nRelationships: mandate 1..N debit_attempt.\nRetention: 8 years for regulatory evidence.', 'Generated mandate data model'),
      mk('sequence', 'Sequence_Diagram.png', 'png', 'Sequence diagram visualizes end-to-end mandate execution and exception branches.', '1) Consent verification precedes schedule creation.\n2) Retry loop exits on success or policy exhaustion.\n3) Every branch emits audit event.', 'Keep sequence IDs aligned with API operation IDs for traceability.', 'Scenario: Recurring Mandate Upgrade\nDocument: Sequence Diagram\nFormat: PNG', '[Mandate Sequence Diagram]\nCreate mandate -> verify consent -> schedule debit -> retry on failure -> notify customer -> archive audit', 'Generated mandate sequence diagram'),
      mk('exception', 'Exception_Handling.docx', 'docx', 'Exception handling guide defines deterministic responses for debit and switch failures.', '1) Insufficient funds triggers retry path.\n2) Blocked account suspends mandate.\n3) Switch timeout escalates to ops with correlation ID.', 'Automate priority assignment based on failure class and customer impact.', 'Scenario: Recurring Mandate Upgrade\nDocument: Exception Handling\nEscalation SLA: P1 <= 15 minutes', 'Exception Handling\nCases: insufficient funds, blocked account, switch timeout.\nActions: retry, suspend mandate, notify user, raise ops ticket.\nEscalation SLA: P1 within 15 minutes.', 'Generated mandate exception handling'),
    ],
  };

  const artifacts = artifactsByScenario[scenario];

  return enrichArtifacts(artifacts, { feature: scenario.toUpperCase() });
}

export function getDemoDesignArtifacts(): Artifact[] {
  return buildDesignArtifacts('brd-upi', 'frd-upi', 'DEMO-ARCH');
}
