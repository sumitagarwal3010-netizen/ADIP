import type { Artifact } from '../types/artifacts';
import { createArtifact } from './artifactBuilder';
import type { AnalysisResult } from './aiAnalysisMockData';

const PROMPTS = [
  'Generate microservice implementation plan',
  'Design API implementation for merchant settlement',
  'Build authentication service for biometric login',
  'Create event processing flow for NPCI switch',
] as const;

type Prompt = (typeof PROMPTS)[number];

interface ScenarioArtifact {
  name: string;
  fileType: Artifact['fileType'];
  approvalStatus: Artifact['approvalStatus'];
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  generatedBy: string;
  modelUsed: string;
  executiveSummary: string;
  keyFindings: string;
  recommendations: string;
  metadata: string;
  previewContent: string;
  changeSummary: string;
}

interface Scenario {
  analysis: AnalysisResult;
  artifacts: ScenarioArtifact[];
}

const SCENARIOS: Record<Prompt, Scenario> = {
  'Generate microservice implementation plan': {
    analysis: {
      Scenario: 'Microservice Implementation Plan',
      'Executive Summary':
        'Implementation plan defines service boundaries, contract-first development order, migration sequencing, and release checkpoints for a production-grade microservice program.',
      'Architecture Insights': [
        'Service decomposition uses bounded contexts and independent deployability.',
        'Contract-first API and schema governance prevents integration drift.',
        'Build pipeline enforces test and security gates before merge.',
      ],
      KPIs: ['Lead Time <= 2 days', 'Change Failure Rate < 8%', 'Unit Coverage >= 85%'],
      'Risk Flags': ['Service coupling risk in shared domain models', 'Migration ordering dependency across event consumers'],
      Recommendations: [
        'Adopt anti-corruption adapters for legacy dependencies.',
        'Implement trunk-based development with feature flags.',
      ],
      'Confidence Score': 95,
    },
    artifacts: [
      {
        name: 'Microservice_Technical_Design.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Development Architecture',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Technical design for microservice architecture covering modular boundaries, runtime contracts, and non-functional controls.',
        keyFindings: '- Domain split into onboarding, orchestration, and settlement contexts.\n- Shared data access removed via event contracts.\n- Error budget policy mapped to service tiers.',
        recommendations: '- Enforce domain ownership per service repo.\n- Define backward-compatible event schema strategy.',
        metadata: 'Document: Technical Design\nOwner: Development Architecture\nStatus: Pending Review\nVersion: 1.0',
        previewContent: 'TECHNICAL DESIGN\nService boundaries\nRuntime topology\nNFR controls\nOperational assumptions',
        changeSummary: 'Generated technical design for microservice implementation.',
      },
      {
        name: 'Microservice_Source_Code_Structure.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Platform Engineering',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Source code structure blueprint with package conventions, layering, and ownership for scalable team development.',
        keyFindings: '- Standardized module structure reduces onboarding time.\n- Domain-service-adapter layering enforces separation.\n- Test directories mirror production package hierarchy.',
        recommendations: '- Use lint rules for folder boundaries.\n- Add ownership file per module.',
        metadata: 'Document: Source Code Structure\nOwner: Platform Engineering\nStatus: Draft\nVersion: 1.0',
        previewContent: 'SOURCE CODE STRUCTURE\nsrc/main/domain\nsrc/main/application\nsrc/main/infrastructure\nsrc/test/unit\nsrc/test/integration',
        changeSummary: 'Generated source code structure blueprint.',
      },
      {
        name: 'Microservice_Build_Pipeline.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'DevOps Automation',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Build pipeline specification defining compile, test, security, artifact, and promotion stages.',
        keyFindings: '- CI pipeline includes SAST, dependency scan, and contract tests.\n- Promotion is gated by quality and coverage thresholds.',
        recommendations: '- Block merge for failed contract compatibility checks.\n- Add ephemeral environment stage for PR validation.',
        metadata: 'Document: Build Pipeline\nOwner: DevOps Automation\nStatus: Draft\nVersion: 1.1',
        previewContent: 'BUILD PIPELINE\nStage 1 lint+compile\nStage 2 unit+integration tests\nStage 3 security scan\nStage 4 package and publish',
        changeSummary: 'Generated build pipeline specification.',
      },
      {
        name: 'Microservice_Deployment_Manifest.yaml',
        fileType: 'yaml',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'SRE Deployment Team',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Deployment manifest for service runtime, autoscaling, health probes, and config management.',
        keyFindings: '- Health/readiness probes aligned to startup profile.\n- HPA targets set for CPU and queue depth.',
        recommendations: '- Apply canary rollout policy with 10%-50%-100% progression.',
        metadata: 'Document: Deployment Manifest\nOwner: SRE Deployment Team\nStatus: Draft\nVersion: 1.0',
        previewContent: 'apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: microservice-core\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n        - name: service\n          image: registry/microservice:1.0.0',
        changeSummary: 'Generated deployment manifest.',
      },
      {
        name: 'Microservice_Implementation_Checklist.xlsx',
        fileType: 'xlsx',
        approvalStatus: 'Pending Review',
        riskRating: 'Low',
        generatedBy: 'Engineering PMO',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Implementation checklist tracks delivery milestones, quality gates, and owner accountability.',
        keyFindings: '- 30 implementation controls mapped across design, build, test, and release.\n- Dependencies tracked at sprint-level granularity.',
        recommendations: '- Review checklist in daily stand-up until code freeze.',
        metadata: 'Document: Implementation Checklist\nOwner: Engineering PMO\nStatus: Pending Review\nVersion: 1.0',
        previewContent: 'Sheet: Implementation_Gates\n1 Design sign-off\n2 API contract approved\n...\n30 Release notes completed',
        changeSummary: 'Generated implementation checklist.',
      },
    ],
  },
  'Design API implementation for merchant settlement': {
    analysis: {
      Scenario: 'Merchant Settlement API Implementation',
      'Executive Summary':
        'API implementation plan for merchant settlement defines endpoint model, service contracts, persistence strategy, and release validation controls.',
      'Architecture Insights': [
        'Contract-first API model aligns settlement, payout, and reconciliation services.',
        'Idempotent write operations required for payout execution endpoints.',
        'API versioning and schema compatibility are mandatory for partner channels.',
      ],
      KPIs: ['API p95 <= 180ms', 'Error Rate < 0.5%', 'Contract Test Pass 100%'],
      'Risk Flags': ['Idempotency key misuse', 'Out-of-order callback handling'],
      Recommendations: [
        'Use request hash + merchant scope for idempotency ledger.',
        'Implement strict response code normalization across gateways.',
      ],
      'Confidence Score': 94,
    },
    artifacts: [
      {
        name: 'Merchant_Settlement_API_Implementation_Guide.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'API Engineering Guild',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Implementation guide for merchant settlement APIs with endpoint behavior, validation rules, and operational contracts.',
        keyFindings: '- Settlement and payout endpoints require strict state transition rules.\n- Reconciliation endpoints need paginated deterministic ordering.',
        recommendations: '- Enforce API invariants with middleware validation.\n- Add endpoint-level synthetic probes in production.',
        metadata: 'Document: API Implementation Guide\nOwner: API Engineering Guild\nStatus: Pending Review\nVersion: 2.0',
        previewContent: 'API IMPLEMENTATION GUIDE\nEndpoint behavior\nValidation rules\nState transitions\nOperational constraints',
        changeSummary: 'Generated merchant settlement API implementation guide.',
      },
      {
        name: 'Merchant_Settlement_Service_Contract.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Service Contract Office',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Service contract for internal settlement modules and external partner interfaces.',
        keyFindings: '- Contract includes deterministic error model and timeout semantics.\n- Event callback contract includes replay protection fields.',
        recommendations: '- Make contract tests mandatory at merge stage.',
        metadata: 'Document: Service Contract\nOwner: Service Contract Office\nStatus: Draft\nVersion: 1.3',
        previewContent: 'SERVICE CONTRACT\nRequest/response models\nError taxonomy\nTimeout contracts\nCallback envelope',
        changeSummary: 'Generated service contract document.',
      },
      {
        name: 'Merchant_Settlement_Database_Migration.sql',
        fileType: 'yaml',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Database Reliability Team',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Migration script blueprint for settlement tables, indexes, and backward-compatible schema rollout.',
        keyFindings: '- New payout status index improves query latency by projected 28%.\n- Migration split into pre-deploy and post-deploy phases.',
        recommendations: '- Execute migration in transaction-safe batches.\n- Add rollback migration companion script.',
        metadata: 'Document: Database Migration\nOwner: Database Reliability Team\nStatus: Draft\nVersion: 1.0',
        previewContent: '-- migration_merchant_settlement.sql\nALTER TABLE payout_instruction ADD COLUMN processing_version VARCHAR(12);\nCREATE INDEX idx_payout_status_date ON payout_instruction (status, created_at);',
        changeSummary: 'Generated settlement migration script.',
      },
      {
        name: 'Merchant_Settlement_Sequence_Flow.png',
        fileType: 'png',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Solution Visualization Team',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Sequence flow diagram for settlement request lifecycle from API ingress to payout confirmation.',
        keyFindings: '- Includes success, retry, and compensation branches.\n- Captures reconciliation trigger after payout completion.',
        recommendations: '- Align operation IDs with sequence step IDs for debugging.',
        metadata: 'Document: Sequence Flow\nOwner: Solution Visualization Team\nStatus: Draft\nVersion: 1.0',
        previewContent: '[Sequence Flow]\nClient -> API Gateway -> Settlement Service -> Payout Engine -> Reconciliation Service -> Notification',
        changeSummary: 'Generated settlement sequence flow diagram.',
      },
      {
        name: 'Merchant_Settlement_Implementation_Checklist.xlsx',
        fileType: 'xlsx',
        approvalStatus: 'Pending Review',
        riskRating: 'Low',
        generatedBy: 'Delivery Control Office',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Implementation checklist for merchant settlement API rollout across code, data, test, and release tracks.',
        keyFindings: '- 28 controls defined with owner + due date.\n- Partner UAT and contract validation checkpoints are critical gates.',
        recommendations: '- Track checklist status daily until production sign-off.',
        metadata: 'Document: Implementation Checklist\nOwner: Delivery Control Office\nStatus: Pending Review\nVersion: 1.0',
        previewContent: 'Sheet: Delivery_Checkpoints\n1 API contract sign-off\n2 migration dry-run\n...\n28 release notes and handover',
        changeSummary: 'Generated settlement implementation checklist.',
      },
    ],
  },
  'Build authentication service for biometric login': {
    analysis: {
      Scenario: 'Biometric Authentication Service Build',
      'Executive Summary':
        'Authentication service build plan defines secure service contracts, token lifecycle implementation, and compliance-aligned controls for biometric login.',
      'Architecture Insights': [
        'FIDO2/WebAuthn assertion processing isolated in dedicated auth boundary.',
        'Device binding and adaptive MFA are core service responsibilities.',
        'Audit event stream required for forensics and compliance reporting.',
      ],
      KPIs: ['Auth Success >= 97%', 'Token Issuance <= 200ms', 'Security Event Coverage 100%'],
      'Risk Flags': ['Fallback MFA abuse', 'Token replay without nonce controls'],
      Recommendations: [
        'Implement nonce and token binding in all auth flows.',
        'Include policy-engine hooks for dynamic challenge thresholds.',
      ],
      'Confidence Score': 96,
    },
    artifacts: [
      {
        name: 'Biometric_Authentication_Technical_Design.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'High',
        generatedBy: 'Security Service Engineering',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Technical design for biometric authentication service with trust boundaries, validation pipelines, and security controls.',
        keyFindings: '- Auth boundary separates assertion validation from token issuance.\n- Policy-driven challenge engine supports adaptive MFA.',
        recommendations: '- Enforce strict attestation and nonce checks.\n- Add hardened audit stream for all auth decisions.',
        metadata: 'Document: Technical Design\nOwner: Security Service Engineering\nStatus: Pending Review\nVersion: 1.0',
        previewContent: 'TECHNICAL DESIGN\nTrust boundaries\nAssertion validator\nChallenge policy engine\nToken issuer\nAudit stream',
        changeSummary: 'Generated biometric auth service technical design.',
      },
      {
        name: 'Biometric_Service_Skeleton.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Platform Development',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Service skeleton blueprint with module layout, interfaces, and baseline security middleware.',
        keyFindings: '- Clear separation of controller, domain, crypto, and policy modules.\n- Security middleware chain defined for auth endpoints.',
        recommendations: '- Keep crypto utilities isolated and unit-tested.\n- Enforce package-boundary linting.',
        metadata: 'Document: Service Skeleton\nOwner: Platform Development\nStatus: Draft\nVersion: 1.0',
        previewContent: 'SERVICE SKELETON\n/auth/controller\n/auth/domain\n/auth/crypto\n/auth/policy\n/auth/audit',
        changeSummary: 'Generated biometric service skeleton blueprint.',
      },
      {
        name: 'Biometric_API_Contract.yaml',
        fileType: 'yaml',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'API Security Governance',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'API contract for biometric verification, MFA challenge, and token lifecycle operations.',
        keyFindings: '- Contract includes explicit challenge and deny states.\n- Error taxonomy supports SOC triage workflows.',
        recommendations: '- Add contract tests for all challenge transitions.',
        metadata: 'Document: API Contract\nOwner: API Security Governance\nStatus: Draft\nVersion: 1.2',
        previewContent: 'openapi: 3.0.3\npaths:\n  /v1/auth/biometric/verify\n  /v1/auth/challenge\n  /v1/auth/token/refresh',
        changeSummary: 'Generated biometric API contract.',
      },
      {
        name: 'Biometric_CI_CD_Pipeline.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'DevSecOps Engineering',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'CI/CD pipeline for biometric auth service with secure build gates and release promotion controls.',
        keyFindings: '- Pipeline enforces SAST, secret scan, and dependency policy checks.\n- Promotion requires passing integration and security regression suites.',
        recommendations: '- Add policy-as-code for environment promotion rules.',
        metadata: 'Document: CI/CD Pipeline\nOwner: DevSecOps Engineering\nStatus: Draft\nVersion: 1.0',
        previewContent: 'CI/CD PIPELINE\nLint -> Unit Test -> SAST -> Build -> Integration -> Security Regression -> Deploy',
        changeSummary: 'Generated biometric CI/CD pipeline specification.',
      },
      {
        name: 'Biometric_Code_Review_Checklist.xlsx',
        fileType: 'xlsx',
        approvalStatus: 'Pending Review',
        riskRating: 'Low',
        generatedBy: 'Secure Coding Council',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Code review checklist for biometric auth service emphasizing secure coding and policy compliance.',
        keyFindings: '- Checklist includes cryptography, auth logic, and audit integrity checks.\n- Mandatory review gates defined for high-risk modules.',
        recommendations: '- Require dual reviewer sign-off for crypto and policy modules.',
        metadata: 'Document: Code Review Checklist\nOwner: Secure Coding Council\nStatus: Pending Review\nVersion: 1.0',
        previewContent: 'Sheet: Secure_Code_Review\n1 nonce handling\n2 token binding\n3 error sanitization\n...\n25 audit integrity checks',
        changeSummary: 'Generated biometric code review checklist.',
      },
    ],
  },
  'Create event processing flow for NPCI switch': {
    analysis: {
      Scenario: 'NPCI Event Processing Implementation',
      'Executive Summary':
        'Event processing implementation plan for NPCI switch transactions defines stream contracts, consumer topology, and resilient processing controls.',
      'Architecture Insights': [
        'Event schemas must remain version-compatible across producers/consumers.',
        'Out-of-order callback handling requires deterministic reconciliation logic.',
        'Processing flow requires partition and keying strategy for scale.',
      ],
      KPIs: ['Event Processing Lag < 5s', 'Consumer Error Rate < 0.3%', 'Reconciliation Completion < 2m'],
      'Risk Flags': ['Callback ordering mismatch', 'Schema evolution breakage'],
      Recommendations: [
        'Use schema registry compatibility checks at build and deploy.',
        'Implement dead-letter and replay strategy by correlation ID.',
      ],
      'Confidence Score': 93,
    },
    artifacts: [
      {
        name: 'NPCI_Event_Flow_Technical_Design.docx',
        fileType: 'docx',
        approvalStatus: 'Pending Review',
        riskRating: 'Medium',
        generatedBy: 'Payments Event Architecture',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Technical design for NPCI event processing flow, including producer/consumer contracts and reconciliation stages.',
        keyFindings: '- Correlation ID must propagate through all event stages.\n- Reconciliation consumer requires dedupe window and ordering buffer.',
        recommendations: '- Define canonical event envelope and strict contract tests.',
        metadata: 'Document: Technical Design\nOwner: Payments Event Architecture\nStatus: Pending Review\nVersion: 1.0',
        previewContent: 'TECHNICALL DESIGN\nProducer contracts\nConsumer groups\nDLQ strategy\nReplay flow',
        changeSummary: 'Generated NPCI event flow technical design.',
      },
      {
        name: 'NPCI_Service_Contract.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Medium',
        generatedBy: 'Integration Contract Team',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Service contract for event ingress, callback processing, and reconciliation update services.',
        keyFindings: '- Contract formalizes event statuses and transition rules.\n- Timeout/retry semantics defined per stage.',
        recommendations: '- Enforce compatibility checks for event schema updates.',
        metadata: 'Document: Service Contract\nOwner: Integration Contract Team\nStatus: Draft\nVersion: 1.1',
        previewContent: 'SERVICE CONTRACT\nEvent ingress\nCallback processor\nReconciliation updater\nStatus transitions',
        changeSummary: 'Generated NPCI service contract.',
      },
      {
        name: 'NPCI_Sequence_Flow.png',
        fileType: 'png',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'Architecture Visualization',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Sequence flow diagram for NPCI request, callback, and reconciliation event lifecycle.',
        keyFindings: '- Includes duplicate callback and timeout branches.\n- Shows replay path from DLQ back to processing stream.',
        recommendations: '- Align sequence IDs with monitoring trace IDs.',
        metadata: 'Document: Sequence Flow\nOwner: Architecture Visualization\nStatus: Draft\nVersion: 1.0',
        previewContent: '[Sequence]\nIngress API -> Event Producer -> Callback Consumer -> Reconciliation Consumer -> Status API',
        changeSummary: 'Generated NPCI sequence flow diagram.',
      },
      {
        name: 'NPCI_Build_Pipeline.docx',
        fileType: 'docx',
        approvalStatus: 'Draft',
        riskRating: 'Low',
        generatedBy: 'DevOps Stream Engineering',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Build pipeline for NPCI event services including contract validation and replay scenario tests.',
        keyFindings: '- Pipeline includes schema compatibility check stage.\n- Replay regression tests integrated before deploy.',
        recommendations: '- Fail build on backward-incompatible schema changes.',
        metadata: 'Document: Build Pipeline\nOwner: DevOps Stream Engineering\nStatus: Draft\nVersion: 1.0',
        previewContent: 'BUILD PIPELINE\nCompile\nContract tests\nSchema compatibility\nReplay tests\nPackage and deploy',
        changeSummary: 'Generated NPCI build pipeline.',
      },
      {
        name: 'NPCI_Implementation_Checklist.xlsx',
        fileType: 'xlsx',
        approvalStatus: 'Pending Review',
        riskRating: 'Low',
        generatedBy: 'Engineering Program Control',
        modelUsed: 'deterministic-development-v1',
        executiveSummary: 'Implementation checklist for NPCI event processing with stream, contract, and operations controls.',
        keyFindings: '- 27 controls span development, integration, and readiness tasks.\n- Replay and DLQ validation are mandatory gates.',
        recommendations: '- Track checklist completion in daily release huddles.',
        metadata: 'Document: Implementation Checklist\nOwner: Engineering Program Control\nStatus: Pending Review\nVersion: 1.0',
        previewContent: 'Sheet: Event_Processing_Checklist\n1 schema registry setup\n2 producer keying rules\n...\n27 readiness handoff complete',
        changeSummary: 'Generated NPCI implementation checklist.',
      },
    ],
  },
};

function normalizePrompt(prompt: string): string {
  return prompt.trim().toLowerCase();
}

export function getDeterministicDevelopmentAnalysis(prompt: string): AnalysisResult {
  const match = PROMPTS.find((p) => normalizePrompt(p) === normalizePrompt(prompt));
  if (!match) {
    throw new Error(`Unsupported Development prompt: ${prompt}`);
  }
  return SCENARIOS[match].analysis;
}

export function getDeterministicDevelopmentArtifacts(prompt: string, runId: string): Artifact[] {
  const match = PROMPTS.find((p) => normalizePrompt(p) === normalizePrompt(prompt));
  if (!match) {
    throw new Error(`Unsupported Development prompt: ${prompt}`);
  }
  return SCENARIOS[match].artifacts.map((a, i) =>
    createArtifact({
      id: `dev-${runId}-${i + 1}`,
      name: a.name,
      generatedBy: a.generatedBy,
      modelUsed: a.modelUsed,
      fileType: a.fileType,
      approvalStatus: a.approvalStatus,
      riskRating: a.riskRating,
      executiveSummary: a.executiveSummary,
      previewContent: a.previewContent,
      sections: [
        { title: 'Key Findings', content: a.keyFindings },
        { title: 'Recommendations', content: a.recommendations },
        { title: 'Metadata', content: a.metadata },
      ],
      changeSummary: a.changeSummary,
      context: { subject: match, domain: 'Development' },
    }),
  );
}
