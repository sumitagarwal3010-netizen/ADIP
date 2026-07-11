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
        name: 'UPI_HLD.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Payments Enterprise Architecture',
        modelUsed: 'deterministic-architecture-scenario-v2',
        changeSummary: 'UPI HLD expanded with infrastructure and control viewpoints.',
        executiveSummary: 'Enterprise high-level architecture for UPI limit enhancement covering channel integration, policy decisions, NPCI dependencies, and production operating controls.',
        previewContent: 'UPI LIMIT ENHANCEMENT HLD\nScope: KYC L2 customers, mobile + net banking channels.\nArchitecture spine: API Gateway -> Limit Decision Service -> Fraud + Compliance + CBS + NPCI adapters.\nCore stores: Redis policy cache, Postgres decision ledger, Kafka event bus.\nDeployment: dual-region active-active with regional failover.\nSequence: request -> eligibility -> fraud -> compliance -> approve/reject -> notify.\nRisk posture: medium with mitigation plan for profile-drift and downstream timeout.',
        sections: [
          { title: 'Document Scope', content: 'Defines target-state architecture for raising daily UPI limits from configurable baseline to approved upper thresholds for eligible KYC L2 accounts.' },
          { title: 'Business Context', content: 'Program objective is to increase transaction success for high-trust customers while preserving fraud and regulatory controls.' },
          { title: 'Assumptions', content: 'Customer profile service remains source of truth; NPCI participant health feed available with 30s freshness; fraud model v4.3 is production-certified.' },
          { title: 'Out of Scope', content: 'No changes to onboarding KYC workflows, merchant MDR calculations, or non-UPI payment rails.' },
          { title: 'Logical Architecture', content: 'Ingress via API Gateway; orchestration in Limit Decision Service; external checks via Fraud Adapter, Compliance Rule Adapter, and CBS Adapter; notification fan-out via Event Bus.' },
          { title: 'Technology Architecture', content: 'Java 21 microservices, Redis cluster for policy profile lookup, Kafka for domain events, PostgreSQL for immutable decisions, OpenTelemetry for traces.' },
          { title: 'Integration Dependencies', content: 'Dependencies: NPCI switch adapter, Core Banking update API, Fraud scoring API, Compliance policy engine, Notification service.' },
          { title: 'Security and Compliance', content: 'mTLS for service-to-service, signed payload verification for channel calls, tamper-evident audit chain retained for 7 years.' },
          { title: 'Deployment and DR', content: 'Mumbai + Hyderabad regions in active-active. RTO 15 minutes, RPO 2 minutes, weighted routing for controlled rollout.' },
          { title: 'Risks and Mitigations', content: 'Risk: customer profile lag. Mitigation: pre-commit profile freshness check.\nRisk: CBS timeout. Mitigation: compensation queue + replay job.' },
          { title: 'Implementation Notes', content: 'Phase rollout at 10%, 35%, 100% customer cohorts with SRE watchpoints for decision latency and reject ratio drift.' },
        ],
      },
      {
        name: 'UPI_LLD.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Payments Solution Design',
        modelUsed: 'deterministic-architecture-scenario-v2',
        changeSummary: 'UPI LLD enriched with module and sequence detail.',
        executiveSummary: 'Low-level design defining modules, contract boundaries, persistence schema, runtime policies, and operational exception handling for limit enhancement.',
        previewContent: 'UPI LLD\nModules: DecisionController, EligibilityEvaluator, LimitPolicyResolver, FraudOrchestrator, ComplianceOrchestrator, CbsUpdatePublisher.\nPersistence: limit_request, limit_decision, decision_event, audit_signature.\nRuntime controls: idempotency token, cache TTL 60s, retry strategy per adapter.\nPrimary sequence: evaluate -> score -> compliance -> persist -> publish -> notify.',
        sections: [
          { title: 'Design Intent', content: 'Translate HLD components into executable modules with deterministic decision semantics.' },
          { title: 'Module Decomposition', content: 'Controller layer for request validation; service layer for decision orchestration; adapter layer for downstream integrations.' },
          { title: 'Interface Contracts', content: 'POST /v1/upi/limits/evaluate, POST /v1/upi/limits/confirm, GET /v1/upi/limits/{customerId}/history.' },
          { title: 'Data Model', content: 'limit_request(request_id, customer_id, requested_limit, channel, consent_ref);\nlimit_decision(decision_id, status, reason_code, approved_limit);\naudit_signature(event_id, signature_hash).' },
          { title: 'Cache Strategy', content: 'Redis key: limitPolicy:{segment}:{kycLevel}. TTL 60s. Cache stampede protected via single-flight lock.' },
          { title: 'Sequence Flow - Success Path', content: 'Validate request -> check profile freshness -> resolve policy -> call fraud engine -> run compliance checks -> persist decision -> publish domain event.' },
          { title: 'Sequence Flow - Failure Paths', content: 'Fraud hold -> status=PENDING_REVIEW; CBS timeout -> status=RECONCILE_PENDING; policy violation -> status=REJECTED with reason code.' },
          { title: 'Error Taxonomy', content: 'LIM-401 ineligible KYC; LIM-409 policy threshold breach; LIM-422 fraud escalation; LIM-504 downstream timeout.' },
          { title: 'Configuration Baseline', content: 'Segment-specific max limits, cooling period, retry budgets, and risk override flags managed through versioned config repo.' },
          { title: 'Observability', content: 'Trace IDs propagated end-to-end; RED metrics per endpoint; alert thresholds on p95 latency, timeout ratio, and reconcile queue depth.' },
          { title: 'Implementation Notes', content: 'Contract test suite required for CBS and Fraud adapters before deployment to staging.' },
        ],
      },
      {
        name: 'UPI_API_Specification.yaml',
        fileType: 'yaml',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'API Governance Office',
        modelUsed: 'deterministic-architecture-scenario-v2',
        changeSummary: 'UPI API specification expanded with schemas and examples.',
        executiveSummary: 'Complete OpenAPI contract for UPI limit enhancement evaluate/confirm/query APIs with security, error models, and rate limits.',
        previewContent: `openapi: 3.0.3
info:
  title: UPI Limit Enhancement API
  version: 1.2.0
  description: APIs for evaluating and confirming customer UPI limit upgrades.
servers:
  - url: https://api.bank.example/payments
security:
  - oauth2ClientCredentials: [upi.limit.write, upi.limit.read]
  - mtls: []
paths:
  /v1/upi/limits/evaluate:
    post:
      summary: Evaluate UPI limit enhancement eligibility
      x-rate-limit: 200 requests/min per channelId
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/EvaluateLimitRequest'
            example:
              customerId: CUST348901
              channelId: MOBILE_APP
              requestedLimit: 200000
              consentRef: CONS-7721
      responses:
        '200':
          description: Decision generated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/EvaluateLimitResponse'
        '409':
          description: Policy breach
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
  /v1/upi/limits/confirm:
    post:
      summary: Confirm approved decision and trigger CBS update
      x-rate-limit: 120 requests/min per channelId
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ConfirmLimitRequest'
      responses:
        '202':
          description: Confirmation accepted
        '504':
          description: Downstream timeout
  /v1/upi/limits/{customerId}/history:
    get:
      summary: Fetch recent limit decisions for customer
      parameters:
        - in: path
          name: customerId
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Decision history
components:
  securitySchemes:
    oauth2ClientCredentials:
      type: oauth2
      flows:
        clientCredentials:
          tokenUrl: https://auth.bank.example/oauth/token
          scopes:
            upi.limit.write: write access
            upi.limit.read: read access
    mtls:
      type: mutualTLS
  schemas:
    EvaluateLimitRequest:
      type: object
      required: [customerId, channelId, requestedLimit]
      properties:
        customerId: { type: string }
        channelId: { type: string }
        requestedLimit: { type: number, format: double }
        consentRef: { type: string }
    EvaluateLimitResponse:
      type: object
      properties:
        decisionId: { type: string }
        status: { type: string, enum: [APPROVED, REJECTED, PENDING_REVIEW] }
        approvedLimit: { type: number }
        reasonCode: { type: string }
    ConfirmLimitRequest:
      type: object
      required: [decisionId]
      properties:
        decisionId: { type: string }
        confirmationActor: { type: string }
    ErrorResponse:
      type: object
      properties:
        code: { type: string }
        message: { type: string }
        correlationId: { type: string }`,
        sections: [
          { title: 'Auth and Trust Model', content: 'OAuth2 client credentials for channel authorization; mutual TLS for network trust; signed payload header required on write endpoints.' },
          { title: 'Error Codes', content: 'LIM-401 ineligible account\nLIM-409 policy threshold breached\nLIM-422 fraud escalation\nLIM-504 downstream timeout' },
          { title: 'Rate Limits', content: 'Evaluate: 200 rpm/channel; Confirm: 120 rpm/channel; History: 300 rpm/channel with burst=50.' },
          { title: 'Implementation Notes', content: 'Idempotency-Key header mandatory for POST endpoints; keys retained 48h to prevent duplicate processing.' },
        ],
      },
      {
        name: 'UPI_Integration_Design.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Integration Architecture Guild',
        modelUsed: 'deterministic-architecture-scenario-v2',
        changeSummary: 'UPI integration blueprint deepened with runtime behavior.',
        executiveSummary: 'Integration design for synchronous decisioning and asynchronous propagation across NPCI, Core Banking, fraud, and notification services.',
        previewContent: 'UPI Integration Design\nEntry protocol: REST/JSON over TLS 1.3.\nDownstream protocols: gRPC (fraud), REST (CBS), ISO/UPI adapter (NPCI), Kafka events (notifications/audit).\nRecovery: reconcile_pending queue and replay scheduler.',
        sections: [
          { title: 'Scope', content: 'Covers runtime integration behavior for limit enhancement decision, confirmation, and post-decision synchronization.' },
          { title: 'Source and Target Systems', content: 'Sources: Mobile Banking, Net Banking.\nTargets: Fraud Engine, Compliance Service, NPCI Adapter, CBS, Notification Hub.' },
          { title: 'Protocol Mapping', content: 'Ingress REST -> internal gRPC for low-latency checks -> event publication through Kafka for downstream consumers.' },
          { title: 'Message Contracts', content: 'Domain events: payments.limit.decisioned.v1, payments.limit.confirmed.v1, payments.limit.reconciled.v1.' },
          { title: 'Retry and Timeout Strategy', content: 'Fraud: timeout 400ms, retry 1.\nCBS: timeout 2s, retry 2.\nNPCI adapter: timeout 3s, retry 2 with jitter.' },
          { title: 'Idempotency', content: 'Decision and confirmation flows enforce idempotency with request hash + channelId + 24h key retention.' },
          { title: 'Circuit Breaker Configuration', content: 'Open after 5 consecutive failures in 30s; half-open probes every 20s; fallback path writes reconcile_pending.' },
          { title: 'Reconciliation', content: 'Scheduler reconciles decision ledger against CBS and NPCI state every hour; unresolved mismatches escalate to operations queue.' },
          { title: 'Dependencies', content: 'Requires Fraud model v4.3 latency SLA and CBS /limit-update endpoint availability >= 99.9%.' },
          { title: 'Implementation Notes', content: 'Integration test harness includes synthetic timeout, out-of-order callback, and duplicate message scenarios.' },
        ],
      },
      {
        name: 'UPI_Architecture_Diagram.png',
        fileType: 'png',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Platform Design Visualization',
        modelUsed: 'deterministic-architecture-scenario-v2',
        changeSummary: 'UPI system diagram enriched with deployment and protocol context.',
        executiveSummary: 'Detailed topology diagram describing components, trust zones, protocol paths, and event data flow.',
        previewContent: '[UPI Architecture Diagram Description]\nZone A (Channel DMZ): Mobile App, Net Banking, API Gateway (HTTPS/TLS).\nZone B (Service Mesh): Limit Decision Service, Redis Policy Cache, Fraud Adapter, Compliance Adapter.\nZone C (Core Integrations): NPCI UPI Adapter (ISO/UPI), CBS Adapter (REST), Notification Hub.\nZone D (Data/Observability): PostgreSQL Decision Ledger, Kafka Event Bus, Audit Vault, Metrics/Tracing stack.\nData Flow: request enters Zone A -> decision orchestration in Zone B -> synchronous checks in Zone C -> decision persisted in Zone D -> notifications/events fan-out.\nResilience Paths: timeout branches routed to reconcile_pending queue; replay processor runs in Zone D.',
        sections: [
          { title: 'Diagram Legend', content: 'Solid lines = synchronous calls, dashed lines = asynchronous event streams, red edges = failure/retry routes.' },
          { title: 'Deployment Zones', content: 'Each zone deployed across Mumbai and Hyderabad with independent load balancers and service-mesh policies.' },
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
        name: 'NPCI_Integration_Design.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'High',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'NPCI integration pattern finalized.',
        executiveSummary: 'Integration design for NPCI switch connectivity with resilient orchestration and deterministic reconciliation.',
        previewContent: 'NPCI Integration Design\nPattern: REST ingress + ISO8583/UPI switch messaging.\nResilience: idempotency, retries, circuit breaker, timeout policy.',
        sections: [
          { title: 'Document Scope', content: 'Defines bank-side integration pattern for NPCI switch transactions and callback handling.' },
          { title: 'Architecture Pattern', content: 'REST ingress service with canonical message model translated to ISO8583/UPI switch envelopes.' },
          { title: 'Ingress API Controls', content: 'Request signing, schema validation, and request-id normalization before switch transmission.' },
          { title: 'Switch Messaging Strategy', content: 'Message routing by transaction type; ISO8583 mandatory fields plus UPI metadata extension fields.' },
          { title: 'Retry Policy', content: 'Retry only for transient network/switch timeout responses using 2s, 5s, 10s backoff.' },
          { title: 'Timeout and Circuit Breakers', content: 'Downstream timeout 2500ms; circuit opens after 5 failures in 30s; half-open probes every 20s.' },
          { title: 'Idempotency Design', content: 'Bank transaction key + channel + amount hash retained 48h to block duplicate postings.' },
          { title: 'Reconciliation and Settlement', content: 'Callback event stream reconciled against ingress ledger at 15-minute intervals with mismatch categorization.' },
          { title: 'Dependencies', content: 'NPCI SLA, settlement service availability, fraud control service for high-value traffic.' },
          { title: 'Risk Register', content: 'Top risks: callback race conditions, schema drift, deferred settlement callback spikes.' },
          { title: 'Implementation Notes', content: 'Mandatory chaos tests for callback delay and duplicate callback delivery before production certification.' },
        ],
      },
      {
        name: 'NPCI_API_Contract.yaml',
        fileType: 'yaml',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'NPCI-facing API contract documented.',
        executiveSummary: 'REST-to-switch API contract covering payment initiation, callback intake, and status queries.',
        previewContent: `openapi: 3.0.3
info:
  title: NPCI Switch Integration Contract
  version: 2.0.0
  description: Bank gateway APIs for NPCI request routing and callback processing.
servers:
  - url: https://api.bank.example/npci
paths:
  /v1/npci/payments:
    post:
      summary: Submit payment request to NPCI switch
      x-rate-limit: 300 requests/min per client
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NpciPaymentRequest'
            example:
              txnId: TXN-889102
              payerVpa: user@bank
              payeeVpa: merchant@upi
              amount: 1540.25
              purposeCode: P2M
      responses:
        '202':
          description: Accepted for switch processing
        '409':
          description: Duplicate transaction detected
  /v1/npci/callbacks:
    post:
      summary: Receive NPCI callback and update status
      x-rate-limit: 500 requests/min per sourceIp
      responses:
        '200': { description: Callback acknowledged }
        '422': { description: Invalid callback payload }
  /v1/npci/status/{txnId}:
    get:
      summary: Get consolidated transaction status
      parameters:
        - in: path
          name: txnId
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Consolidated status
components:
  schemas:
    NpciPaymentRequest:
      type: object
      required: [txnId, payerVpa, payeeVpa, amount]
      properties:
        txnId: { type: string }
        payerVpa: { type: string }
        payeeVpa: { type: string }
        amount: { type: number, format: double }
        purposeCode: { type: string }
        channel: { type: string, enum: [MOBILE, NETBANKING, API] }
    NpciStatusResponse:
      type: object
      properties:
        gatewayStatus: { type: string }
        switchStatus: { type: string }
        settlementStatus: { type: string }
        reasonCode: { type: string }
    ErrorResponse:
      type: object
      properties:
        code: { type: string }
        message: { type: string }
        correlationId: { type: string }`,
        sections: [
          { title: 'Auth and Access', content: 'mTLS required for all endpoints; JWT service token with npci.write/npci.read scopes for authorized clients.' },
          { title: 'Error Codes', content: 'NPCI-409 duplicate request\nNPCI-422 callback schema violation\nNPCI-504 switch timeout\nNPCI-507 reconciliation pending' },
          { title: 'Request/Response Mapping', content: 'REST fields mapped to switch protocol by canonical mapper. Status API normalizes switch + settlement response.' },
          { title: 'Rate Limits', content: 'Ingress 300 rpm/client; callbacks 500 rpm/source; status queries 900 rpm/client with burst 80.' },
        ],
      },
      {
        name: 'NPCI_Sequence_Diagram.png',
        fileType: 'png',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'End-to-end NPCI transaction sequence documented.',
        executiveSummary: 'Sequence diagram for request, switch processing, callback, and reconciliation.',
        previewContent: '[NPCI Sequence Diagram]\nApp -> Gateway -> Mapper -> Switch Adapter -> NPCI\nNPCI callback -> Callback API -> Reconciliation -> Status update',
        sections: [
          { title: 'Component Interaction', content: 'Actors: Channel App, API Gateway, Canonical Mapper, Switch Adapter, NPCI Switch, Callback Processor, Reconciliation Engine.' },
          { title: 'Protocol Path', content: 'HTTPS for ingress, ISO8583/UPI over secure tunnel for switch hop, Kafka event stream for reconciliation updates.' },
          { title: 'Deployment Context', content: 'Gateway and mapper in DMZ app zone; switch adapter in integration zone; reconciliation in data processing zone.' },
          { title: 'Flow Notes', content: 'Diagram contains success path, timeout retry path, duplicate callback path, and manual exception route.' },
        ],
      },
      {
        name: 'NPCI_Interface_Mapping.xlsx',
        fileType: 'xlsx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Field-level interface mapping completed.',
        executiveSummary: 'Interface mapping workbook aligns REST payload fields to switch protocol message positions and validations.',
        previewContent: `Sheet: RequestMapping (24 rows)
1 rest.txnId -> iso.field11
2 rest.amount -> iso.field4
3 rest.txnTimestamp -> iso.field7
4 rest.payerVpa -> upi.payerVPA
5 rest.payeeVpa -> upi.payeeVPA
6 rest.channel -> iso.field41
7 rest.deviceId -> upi.deviceFingerprint
8 rest.customerId -> upi.customerRef
9 rest.purposeCode -> upi.purpose
10 rest.note -> upi.remarks
11 rest.mcc -> iso.field18
12 rest.bankRef -> iso.field37
13 rest.geoLat -> upi.geo.lat
14 rest.geoLon -> upi.geo.lon
15 rest.ipAddress -> upi.network.ip
16 rest.appVersion -> upi.client.version
17 rest.retryCount -> upi.meta.retryCount
18 rest.idempotencyKey -> upi.meta.idempotencyKey
19 rest.signature -> upi.security.signature
20 rest.traceId -> upi.meta.traceId
21 rest.sessionId -> upi.meta.sessionId
22 rest.riskScore -> upi.risk.preScore
23 rest.routingCode -> iso.field32
24 rest.instrumentType -> upi.instrument
Sheet: ResponseMapping (20 rows)
1 iso.responseCode -> api.reasonCode
2 iso.approvalCode -> api.switchRef
3 iso.stan -> api.networkStan
4 iso.rrn -> api.rrn
5 upi.status -> api.switchStatus
6 upi.finality -> api.settlementStatus
7 upi.errorContext -> api.detailMessage
8 upi.updatedAt -> api.lastUpdatedAt
9 upi.callbackRef -> api.callbackReference
10 upi.reconcileFlag -> api.reconcileRequired
11 upi.fraudFlag -> api.fraudFlag
12 upi.ruleId -> api.ruleReference
13 upi.retryAfter -> api.retryAfterMs
14 upi.routeNode -> api.routeNode
15 upi.partnerCode -> api.partnerCode
16 upi.mode -> api.mode
17 upi.currency -> api.currency
18 upi.amount -> api.amount
19 upi.payerRef -> api.payerReference
20 upi.payeeRef -> api.payeeReference`,
        sections: [
          { title: 'Validation Rules', content: 'Field-level constraints include mandatory, type, max length, regex, and checksum validators for payment identity fields.' },
          { title: 'Mapping Governance', content: 'Mapping sheet versioned with backward compatibility status and effective-from date per row.' },
        ],
      },
      {
        name: 'NPCI_Error_Handling.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'High',
        generatedBy: 'Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Error and exception playbook defined for NPCI traffic.',
        executiveSummary: 'Error handling playbook for switch errors, callback failures, and reconciliation exceptions.',
        previewContent: 'NPCI Error Handling\nClasses: network_timeout, switch_reject, callback_mismatch, duplicate_txn.\nActions: retry, quarantine, escalate, reconcile.',
        sections: [
          { title: 'Purpose', content: 'Defines deterministic error classification, response actions, and operator playbooks for NPCI transaction failures.' },
          { title: 'Error Domains', content: 'Transport, switch-business, callback-validation, reconciliation, and dependency-failure domains.' },
          { title: 'Error Taxonomy', content: 'E-NET-01 timeout\nE-NET-02 connection reset\nE-SW-04 business reject\nE-CB-02 callback mismatch\nE-RCN-07 reconciliation gap' },
          { title: 'Automated Recovery Rules', content: 'Transient transport errors retry with bounded backoff; duplicate requests return cached outcome without reprocessing.' },
          { title: 'Manual Recovery Procedures', content: 'Unresolved reconciliation gaps > 30 minutes routed to L2 operations with transaction replay checklist.' },
          { title: 'Escalation Matrix', content: 'P1: payment stuck > 10 min\nP2: callback mismatch cluster > 50 txns\nP3: non-critical mapping anomalies.' },
          { title: 'Monitoring Signals', content: 'Timeout rate, duplicate suppression rate, callback mismatch ratio, reconciliation backlog depth.' },
          { title: 'Dependencies', content: 'Requires SIEM integration, incident ticketing API, and replay tooling for affected transaction windows.' },
          { title: 'Implementation Notes', content: 'Error response contract is immutable for v2; new error classes require governance approval.' },
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
        name: 'Biometric_Security_Architecture.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Security Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Security architecture authored for biometric login.',
        executiveSummary: 'Biometric security architecture with FIDO2/WebAuthn, device binding, MFA fallback, and token hardening.',
        previewContent: 'Biometric Security Architecture\nFlow: WebAuthn assertion -> attestation -> risk decision -> token issue.\nSecurity: hardware-backed keys, JWE sessions, SIEM telemetry.',
        sections: [
          { title: 'Scope', content: 'Covers biometric login for mobile banking and high-risk fallback controls.' },
          { title: 'Security Assumptions', content: 'Platform authenticators are hardware-backed; device attestation evidence is available at login time.' },
          { title: 'Authentication Architecture', content: 'FIDO2/WebAuthn assertion validated by Identity Gateway, then risk-scored before token issuance.' },
          { title: 'Device Binding Model', content: 'Device public key fingerprint linked to customer identity; mismatch triggers step-up MFA and security event.' },
          { title: 'MFA and Challenge Policy', content: 'Adaptive MFA invoked for anomalous geolocation, unusual device posture, or high-value account profiles.' },
          { title: 'Token Lifecycle', content: 'Short-lived access tokens, rotating refresh tokens, and emergency revocation propagation to edge caches.' },
          { title: 'Encryption and Key Management', content: 'JWE for token payloads; HSM-managed key hierarchy; quarterly key rotation with dual-control approvals.' },
          { title: 'Audit and Forensics', content: 'Every auth decision logged with correlation ID, risk signal vector, and policy decision reference.' },
          { title: 'Compliance Alignment', content: 'Mapped to RBI cyber framework, internal IAM baseline, and privacy consent controls.' },
          { title: 'Risks and Mitigations', content: 'Rooted-device spoofing mitigated by attestation hard-fail; fallback abuse mitigated by velocity controls and SOC monitoring.' },
        ],
      },
      {
        name: 'Threat_Model.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'High',
        generatedBy: 'Security Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'STRIDE threat model completed.',
        executiveSummary: 'Threat model for biometric login using STRIDE with mitigation ownership and residual risk classification.',
        previewContent: 'Threat Model (STRIDE)\nSpoofing: device cloning\nTampering: assertion replay\nRepudiation: missing event trace\nInfo Disclosure: token theft\nDoS: auth flood\nElevation: fallback abuse',
        sections: [
          { title: 'Methodology', content: 'Threat analysis executed using STRIDE with attack tree overlays for credential abuse paths.' },
          { title: 'Assets in Scope', content: 'Authentication assertions, token service, risk engine, IAM policies, audit telemetry pipeline.' },
          { title: 'Spoofing Threats', content: 'Device clone and synthetic assertion attempts; mitigated by attestation verification and nonce checks.' },
          { title: 'Tampering Threats', content: 'Request payload manipulation mitigated by signed request envelopes and schema strict mode.' },
          { title: 'Repudiation Threats', content: 'Non-repudiation ensured through immutable audit signatures and synchronized timestamps.' },
          { title: 'Information Disclosure', content: 'Token leakage risks reduced via JWE encryption, short token TTL, and secure enclave storage.' },
          { title: 'Denial of Service', content: 'Bot-driven auth flooding countered by adaptive rate limiting and progressive challenge response.' },
          { title: 'Elevation of Privilege', content: 'Fallback path abuse constrained through RBAC policy checks and anomaly-triggered hard blocks.' },
          { title: 'Residual Risk Summary', content: 'Residual risks: medium for social-engineering fallback; low for replay after nonce enforcement.' },
        ],
      },
      {
        name: 'Authentication_Flow.png',
        fileType: 'png',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Security Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Authentication flow diagram rendered.',
        executiveSummary: 'Sequence diagram for biometric login, risk evaluation, MFA branch, and session issue path.',
        previewContent: '[Authentication Flow]\nApp -> Identity Gateway -> Attestation Service -> Risk Engine -> Token Service\nFallback branch -> MFA Service -> Token Service',
        sections: [
          { title: 'Flow Description', content: 'Step 1 biometric assertion capture; Step 2 device attestation validation; Step 3 risk score computation; Step 4 allow/challenge/deny decision; Step 5 token issuance and audit log write.' },
          { title: 'Protocols and Trust', content: 'HTTPS/TLS for channel ingress, mTLS for internal IAM calls, signed challenge tokens for MFA continuation.' },
          { title: 'Deployment Zones', content: 'Client zone, IAM ingress zone, security control zone, and audit/analytics zone with unidirectional event ingestion.' },
          { title: 'Failure Branches', content: 'Diagram includes attestation failure, risk-block branch, challenge timeout branch, and SOC escalation path.' },
        ],
      },
      {
        name: 'IAM_Policy.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Security Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'IAM policy set aligned for biometric rollout.',
        executiveSummary: 'IAM policy baseline including RBAC, privileged session constraints, and emergency break-glass governance.',
        previewContent: 'IAM Policy\nRoles: customer, support-agent, fraud-analyst, IAM-admin.\nRBAC + ABAC constraints with region and channel context.',
        sections: [
          { title: 'Policy Scope', content: 'IAM policy controls for biometric login, fallback authentication, support access, and privileged administration.' },
          { title: 'Role Catalog', content: 'Roles: retail_customer, assisted_banking_agent, fraud_analyst, iam_policy_admin, security_auditor.' },
          { title: 'Permission Matrix', content: 'Each role mapped to explicit actions on auth sessions, challenge flows, and customer lock/unlock operations.' },
          { title: 'ABAC Conditions', content: 'Conditional checks on channel, geolocation risk tier, and device posture for privileged operations.' },
          { title: 'Privileged Access Governance', content: 'Break-glass access requires dual approval and automatic expiry within 60 minutes.' },
          { title: 'Session Governance', content: 'High-risk policy edits require step-up auth and immutable change history capture.' },
          { title: 'Audit Controls', content: 'Policy mutation events streamed to SIEM; monthly attestation report generated for IAM governance board.' },
          { title: 'Compliance Notes', content: 'Aligned to internal IAM standard 5.2 and enterprise segregation-of-duties controls.' },
        ],
      },
      {
        name: 'Security_Control_Matrix.xlsx',
        fileType: 'xlsx',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Security Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Control matrix mapped to implementation checkpoints.',
        executiveSummary: 'Security control matrix linking biometric threats, technical controls, test cases, and compliance checkpoints.',
        previewContent: `Sheet: ControlMatrix (24 rows)
1 CTRL-01 Preventive WebAuthn attestation
2 CTRL-02 Preventive Device binding
3 CTRL-03 Preventive Signed nonce validation
4 CTRL-04 Preventive Token encryption at rest
5 CTRL-05 Preventive Token rotation policy
6 CTRL-06 Preventive mTLS internal auth calls
7 CTRL-07 Detective Impossible travel detection
8 CTRL-08 Detective Login velocity anomaly
9 CTRL-09 Detective Device fingerprint drift
10 CTRL-10 Detective MFA challenge abuse monitor
11 CTRL-11 Detective IAM policy mutation alert
12 CTRL-12 Detective Session hijack heuristic
13 CTRL-13 Corrective Session revocation API
14 CTRL-14 Corrective Forced credential reset
15 CTRL-15 Corrective Device quarantine
16 CTRL-16 Corrective Account lock with escalation
17 CTRL-17 Governance Monthly entitlement review
18 CTRL-18 Governance Policy dual-approval
19 CTRL-19 Governance Break-glass logging
20 CTRL-20 Compliance RBI control mapping
21 CTRL-21 Compliance Privacy consent evidence
22 CTRL-22 Compliance Audit signature retention
23 CTRL-23 Resilience IAM failover drill
24 CTRL-24 Resilience SIEM pipeline health
Sheet: EvidenceRefs (20 rows)
1 TEST-AUTH-001 ... 20 TEST-AUTH-020`,
        sections: [
          { title: 'Coverage Summary', content: 'Matrix links each control to STRIDE threat category, owner team, test evidence ID, and residual risk score.' },
          { title: 'Control Governance', content: 'Control status reviewed every release; high-risk controls require explicit security board sign-off.' },
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
        changeSummary: 'Merchant settlement entity model finalized.',
        executiveSummary: 'Entity model for settlement processing with lineage and retention attributes.',
        previewContent: `Sheet: EntityDictionary (32 rows)
1 settlement_batch.batch_id PK uuid
2 settlement_batch.merchant_id FK uuid
3 settlement_batch.batch_date date
4 settlement_batch.gross_amount decimal(18,2)
5 settlement_batch.net_amount decimal(18,2)
6 settlement_batch.currency char(3)
7 settlement_batch.status varchar(20)
8 settlement_batch.created_at timestamp
9 settlement_batch.closed_at timestamp
10 merchant_account.id PK uuid
11 merchant_account.merchant_code varchar(30)
12 merchant_account.legal_name varchar(150)
13 merchant_account.settlement_cycle varchar(20)
14 merchant_account.bank_account_masked varchar(30)
15 merchant_account.risk_tier varchar(10)
16 payout_instruction.id PK uuid
17 payout_instruction.batch_id FK uuid
18 payout_instruction.amount decimal(18,2)
19 payout_instruction.payout_mode varchar(20)
20 payout_instruction.payout_status varchar(20)
21 payout_instruction.settlement_ref varchar(40)
22 reconciliation_break.id PK uuid
23 reconciliation_break.batch_id FK uuid
24 reconciliation_break.break_reason varchar(80)
25 reconciliation_break.break_amount decimal(18,2)
26 reconciliation_break.status varchar(20)
27 fee_component.id PK uuid
28 fee_component.batch_id FK uuid
29 fee_component.fee_code varchar(20)
30 fee_component.fee_amount decimal(18,2)
31 fee_component.tax_amount decimal(18,2)
32 lineage_event.source_event_id varchar(64)
Sheet: RelationshipMap
merchant_account 1..N settlement_batch
settlement_batch 1..N payout_instruction
settlement_batch 1..N reconciliation_break
settlement_batch 1..N fee_component`,
        sections: [
          { title: 'Normalization Approach', content: 'Core operational schema modeled in 3NF; denormalized read projections built separately for reporting use cases.' },
          { title: 'Retention Policy', content: 'Operational partitions retained 13 months; compliance archive retained 10 years with immutable lock.' },
          { title: 'Lineage Controls', content: 'Every payout row stores source_event_id and ingest_offset for backward traceability into ingest stream.' },
        ],
      },
      {
        name: 'Merchant_ER_Diagram.png',
        fileType: 'png',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Data Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'ER diagram generated for settlement schema.',
        executiveSummary: 'ER diagram visualizing settlement entities, cardinalities, and dependency edges.',
        previewContent: '[Merchant ER Diagram]\nmerchant_account 1..N settlement_batch 1..N payout_instruction\nsettlement_batch 1..N reconciliation_break\nsettlement_batch 1..N fee_component',
        sections: [
          { title: 'Diagram Description', content: 'Entities: merchant_account, settlement_batch, payout_instruction, reconciliation_break, fee_component, settlement_event.\nEdges show PK/FK cardinality and lifecycle dependencies.' },
          { title: 'Deployment Context', content: 'Operational DB in primary data zone; read replicas in analytics zone; archive service in compliance zone.' },
          { title: 'Data Flow Notes', content: 'Ingested transactions aggregate into settlement_batch, then fan-out into payout and reconciliation entities.' },
        ],
      },
      {
        name: 'Merchant_Data_Dictionary.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Data Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Data dictionary completed for settlement schema.',
        executiveSummary: 'Column-level dictionary for settlement entities, data types, and business semantics.',
        previewContent: 'Data Dictionary\nsettlement_batch.batch_status (varchar20)\npayout_instruction.payout_mode (varchar20)\nreconciliation_break.break_reason (varchar50)\nfee_component.fee_amount (decimal18,2)',
        sections: [
          { title: 'Document Scope', content: 'Defines semantic meaning, data type, constraints, ownership, and quality rules for settlement schema attributes.' },
          { title: 'Domain Glossary', content: 'Settlement batch, payout instruction, reconciliation break, fee component, finality state, posting reference.' },
          { title: 'Attribute Standards', content: 'Naming conventions, nullable policy, timezone standard (UTC), currency precision standards.' },
          { title: 'Key Fields', content: 'batch_id, merchant_id, payout_status, break_reason, settlement_ref, source_event_id, lineage_version.' },
          { title: 'Validation Rules', content: 'Monetary fields > 0, status enumerations constrained, timestamp monotonicity checks per lifecycle stage.' },
          { title: 'Ownership Matrix', content: 'Data owner by field family: Operations, Finance, Risk, Reconciliation Engineering.' },
          { title: 'Data Quality Checks', content: 'Completeness > 99.8%, referential integrity = 100%, duplicate payout instruction tolerance = 0.' },
          { title: 'Retention and Purge', content: 'Operational table TTL policy plus controlled archive compaction with legal hold exceptions.' },
          { title: 'Implementation Notes', content: 'Dictionary version increment required for any new regulatory reporting field additions.' },
        ],
      },
      {
        name: 'Merchant_Database_Design.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Data Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Physical database design authored.',
        executiveSummary: 'Database design for settlement workloads with index, partition, and maintenance strategy.',
        previewContent: 'Database Design\nIndexes: idx_batch_date, idx_merchant_status, idx_break_open.\nPartitions: settlement_batch by settlement_date monthly.\nStorage: hot PG cluster + archive object store.',
        sections: [
          { title: 'Physical Schema Scope', content: 'Covers DDL design, index strategy, partitioning, and storage lifecycle for settlement write-heavy workloads.' },
          { title: 'Table Design', content: 'Primary tables optimized for append-heavy ingest and bounded update paths during reconciliation closures.' },
          { title: 'Primary and Foreign Keys', content: 'Strict PK/FK constraints enforce lineage integrity from merchant_account through payout and reconciliation artifacts.' },
          { title: 'Index Strategy', content: 'Composite indexes for merchant/date and batch/status; selective partial index for open reconciliation breaks.' },
          { title: 'Partitioning Plan', content: 'Monthly range partitions on settlement_date; subpartition by merchant hash for high-volume merchants.' },
          { title: 'Storage and Archival', content: 'Hot OLTP storage for active partitions; archived partitions offloaded to immutable object storage.' },
          { title: 'Performance Baselines', content: 'Target: payout lookup p95 < 150ms, reconciliation query p95 < 280ms under peak cycle load.' },
          { title: 'Dependencies', content: 'Requires CDC pipeline, schema registry governance, and archival lifecycle orchestration service.' },
          { title: 'Risk Notes', content: 'Risk: skewed merchant partitions. Mitigation: adaptive partition balancing and query plan telemetry.' },
          { title: 'Implementation Notes', content: 'DDL migration order strictly sequenced: base tables -> constraints -> indexes -> partition automation jobs.' },
        ],
      },
      {
        name: 'Merchant_Data_Flow.png',
        fileType: 'png',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Data Architecture Agent',
        modelUsed: 'deterministic-architecture-scenario',
        changeSummary: 'Data flow diagram published for settlement lifecycle.',
        executiveSummary: 'Data flow from transaction ingestion to settlement posting, reconciliation, and compliance archive.',
        previewContent: '[Merchant Data Flow]\nIngest Stream -> Settlement Aggregator -> Fee Engine -> Payout Builder -> GL Posting\n                             \\-> Reconciliation -> Break Queue -> Ops Dashboard',
        sections: [
          { title: 'Data Flow Description', content: 'Transaction ingest stream enters aggregation service, enriched by fee/tax calculators, emitted to payout builder, then posted to GL and archive.' },
          { title: 'Component Connectivity', content: 'Kafka topics link ingest, settlement aggregation, reconciliation processor, and reporting readers.' },
          { title: 'Protocol and Format', content: 'Avro messages with schema registry compatibility; internal REST for control operations; JDBC for OLTP writes.' },
          { title: 'Zones and Boundaries', content: 'Ingest zone, processing zone, storage zone, analytics zone, and compliance archive zone shown in layered topology.' },
          { title: 'Flow Guarantees', content: 'Exactly-once for payout command stream; at-least-once for observability streams with dedupe at consumer edge.' },
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
  if (n === normalizePrompt(PROMPTS[0])) {
    return SCENARIOS['upi-limit-enhancement'];
  }
  if (n === normalizePrompt(PROMPTS[1])) {
    return SCENARIOS['npci-switch-integration'];
  }
  if (n === normalizePrompt(PROMPTS[2])) {
    return SCENARIOS['biometric-login-security'];
  }
  if (n === normalizePrompt(PROMPTS[3])) {
    return SCENARIOS['merchant-settlement-data-model'];
  }
  throw new Error(`Unsupported Architecture prompt: ${prompt}`);
}

export function getArchitectureScenarioAnalysis(prompt: string): AnalysisResult {
  return matchArchitectureScenario(prompt).analysis;
}

export function getArchitectureScenarioArtifacts(prompt: string, runId: string): Artifact[] {
  const scenario = matchArchitectureScenario(prompt);
  return scenario.artifacts.map((artifact, idx) => buildArtifact(runId, idx, artifact));
}
