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

  const scenario = scenarioByCombo[comboKey] || 'upi';

  const mk = (
    suffix: string,
    name: string,
    fileType: Artifact['fileType'],
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
      mk('hld', 'UPI_HLD.docx', 'docx', 'UPI HLD\nBusiness Context: Raise UPI limits for KYC L2 customers.\nArchitecture Overview: Channel -> API Gateway -> Limit Decision Service -> CBS/Fraud.\nLogical Components: Policy Engine, Risk Adapter, Audit Ledger.\nTechnology Stack: Java, Kafka, Redis, PostgreSQL.\nNFR: p95 <= 120ms, 99.95% availability.\nDeployment View: Active-active dual region.\nRisks: cache drift, profile sync lag.', 'Generated UPI HLD', 'Pending Review'),
      mk('lld', 'UPI_LLD.docx', 'docx', 'UPI LLD\nComponent Design: DecisionController, EligibilityService, CoreBankingPublisher.\nInterfaces: /v1/limits/evaluate, /v1/limits/confirm.\nDatabase Design: limit_request, limit_decision, limit_audit_event.\nSequence Flow: evaluate -> fraud/compliance -> confirm.\nError Handling: LIM-401, LIM-409, LIM-504.\nConfiguration: segment threshold profiles.', 'Generated UPI LLD'),
      mk('api', 'UPI_API_Specification.yaml', 'yaml', 'openapi: 3.0.3\ninfo:\n  title: UPI Limit API\npaths:\n  /v1/upi/limits/evaluate:\n    post:\n      summary: Evaluate customer limit raise\n  /v1/upi/limits/confirm:\n    post:\n      summary: Confirm approved limit update', 'Generated UPI API spec'),
      mk('integration', 'UPI_Integration_Design.docx', 'docx', 'UPI Integration Design\nSource Systems: Mobile Banking, Net Banking.\nTarget Systems: CBS, NPCI adapter, Fraud, Notification Hub.\nIntegration Pattern: synchronous decision + asynchronous decision events.\nMessage Flow: ingress -> policy -> downstream publish.\nEvent Topics: payments.limit.decisioned.v1.\nException Handling: reconcile_pending for partial updates.', 'Generated UPI integration design'),
      mk('data-model', 'UPI_Data_Model.docx', 'docx', 'UPI Data Model\nEntity Model: customer_limit_profile, limit_request, limit_decision, audit_event.\nRelationships: customer->requests->decisions.\nData Dictionary: approved_limit, reason_code, actor_id.\nRetention: 7 years audit retention.\nLineage: decision_id links request to CBS update event.', 'Generated UPI data model'),
      mk('deploy-arch', 'UPI_Deployment_Architecture.docx', 'docx', 'UPI Deployment Architecture\nDeployment: Kubernetes active-active Mumbai/Hyderabad.\nNetwork: zero-trust east-west TLS.\nScalability: autoscale at 65% CPU.\nResilience: circuit breaker for Fraud/CBS adapters.\nOperational Controls: SLO alerts and replay queue.', 'Generated UPI deployment architecture'),
    ],
    merchant: [
      mk('hld', 'Merchant_Settlement_HLD.docx', 'docx', 'Merchant Settlement HLD\nBusiness Context: automate merchant payout lifecycle.\nArchitecture Overview: Ingestion -> Settlement Engine -> Payout Processor.\nComponents: fee calculator, reconciliation service, payout publisher.\nNFR: 99.7% settlement success.', 'Generated merchant settlement HLD', 'Pending Review'),
      mk('data-model', 'Merchant_Settlement_Data_Model.xlsx', 'xlsx', 'Sheet: Entity Model\nmerchant_account, settlement_batch, payout_instruction, reconciliation_break\nSheet: Data Dictionary\nbatch_id, net_amount, status, break_reason\nSheet: Retention\noperational 13 months, archive 10 years', 'Generated merchant settlement data model'),
      mk('api', 'Merchant_Settlement_API.yaml', 'yaml', 'openapi: 3.0.3\ninfo:\n  title: Merchant Settlement API\npaths:\n  /v1/settlement/batches:\n    get:\n      summary: Fetch settlement batches\n  /v1/settlement/payouts/{payoutId}:\n    get:\n      summary: Fetch payout detail', 'Generated merchant settlement API'),
      mk('integration', 'Merchant_Integration_Design.docx', 'docx', 'Merchant Integration Design\nSource Systems: transaction ingest, disputes, fees.\nTarget Systems: settlement engine, payout rails, GL.\nPattern: event-sourced netting windows.\nTopics: settlement.ingested.v1, settlement.netted.v1.\nException Handling: late-event adjustment queue.', 'Generated merchant integration design'),
      mk('diagram', 'Merchant_Architecture_Diagram.png', 'png', '[Merchant Architecture Diagram]\nIngest -> Settlement -> Reconciliation -> Payout -> GL\nSide flows: Compliance archive, Ops dashboard', 'Generated merchant architecture diagram'),
      mk('workflow', 'Settlement_Workflow.docx', 'docx', 'Settlement Workflow\nStep 1: Ingest transactions\nStep 2: Aggregate by merchant/batch window\nStep 3: Apply fees/tax\nStep 4: Net payout and publish instruction\nStep 5: Reconcile breaks and close exceptions', 'Generated settlement workflow document'),
    ],
    biometric: [
      mk('hld', 'Biometric_Authentication_HLD.docx', 'docx', 'Biometric Authentication HLD\nBusiness Context: secure low-friction login.\nOverview: App biometric assertion -> Identity Gateway -> Risk Engine.\nComponents: Attestation service, Session manager, SIEM audit stream.\nRisks: rooted devices, fallback abuse.', 'Generated biometric HLD', 'Pending Review'),
      mk('identity-flow', 'Identity_Flow.docx', 'docx', 'Identity Flow\n1. Biometric assertion capture\n2. Device attestation verification\n3. Adaptive risk scoring\n4. Session token issuance or step-up MFA\n5. Audit write to SIEM', 'Generated biometric identity flow'),
      mk('iam-arch', 'IAM_Architecture.docx', 'docx', 'IAM Architecture\nTrust boundaries: channel, gateway, auth orchestrator.\nPolicies: token TTL, device binding, privilege constraints.\nStandards: OAuth2, JWT/JWE, key rotation via HSM.', 'Generated IAM architecture'),
      mk('threat-model', 'Threat_Model.docx', 'docx', 'Threat Model\nThreats: replay attack, device compromise, OTP interception.\nMitigations: nonce validation, hardware attestation, risk-based lockout.\nResidual risk: medium after controls.', 'Generated threat model'),
      mk('security-controls', 'Security_Controls.docx', 'docx', 'Security Controls\nPreventive: attestation gating, mTLS, rate limits.\nDetective: anomaly alerts, impossible-travel checks.\nCorrective: session revocation and step-up challenge.', 'Generated security controls'),
      mk('auth-api', 'Authentication_API.yaml', 'yaml', 'openapi: 3.0.3\ninfo:\n  title: Authentication API\npaths:\n  /v1/auth/biometric/verify:\n    post:\n      summary: Verify biometric assertion\n  /v1/auth/session/issue:\n    post:\n      summary: Issue bound session token', 'Generated authentication API'),
    ],
    mandate: [
      mk('hld', 'Mandate_HLD.docx', 'docx', 'Recurring Mandate Upgrade HLD\nBusiness Context: resilient autopay mandate lifecycle.\nOverview: Consent -> schedule -> debit retries -> notifications.\nComponents: Mandate service, Scheduler, Retry orchestrator, Audit trail.', 'Generated mandate HLD', 'Pending Review'),
      mk('api', 'Mandate_API.yaml', 'yaml', 'openapi: 3.0.3\ninfo:\n  title: Recurring Mandate API\npaths:\n  /v1/mandates:\n    post:\n      summary: Create mandate\n  /v1/mandates/{id}/retry:\n    post:\n      summary: Trigger retry policy', 'Generated mandate API'),
      mk('scheduler', 'Scheduler_Design.docx', 'docx', 'Scheduler Design\nWindows: T-1 reminder, T execution, T+1 retry.\nRetry policy: 3 attempts with configurable backoff.\nSLA: job completion <= 4 min per cycle.', 'Generated scheduler design'),
      mk('data-model', 'Mandate_Data_Model.docx', 'docx', 'Mandate Data Model\nEntities: mandate, consent, debit_attempt, retry_plan, notification_event.\nRelationships: mandate 1..N debit_attempt.\nRetention: 8 years for regulatory evidence.', 'Generated mandate data model'),
      mk('sequence', 'Sequence_Diagram.png', 'png', '[Mandate Sequence Diagram]\nCreate mandate -> verify consent -> schedule debit -> retry on failure -> notify customer -> archive audit', 'Generated mandate sequence diagram'),
      mk('exception', 'Exception_Handling.docx', 'docx', 'Exception Handling\nCases: insufficient funds, blocked account, switch timeout.\nActions: retry, suspend mandate, notify user, raise ops ticket.\nEscalation SLA: P1 within 15 minutes.', 'Generated mandate exception handling'),
    ],
  };

  const artifacts = artifactsByScenario[scenario];

  return enrichArtifacts(artifacts, { feature: scenario.toUpperCase() });
}

export function getDemoDesignArtifacts(): Artifact[] {
  return buildDesignArtifacts('brd-upi', 'frd-upi', 'DEMO-ARCH');
}
