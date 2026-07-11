import type { Artifact } from '../types/artifacts';
import { createArtifact } from './artifactBuilder';
import { createRunId, formatTimestamp } from './requirementArtifactFactory';

export { createRunId, formatTimestamp };

export interface ApprovedDesignOption {
  id: string;
  label: string;
  feature: string;
}

export const approvedHldOptions: ApprovedDesignOption[] = [
  { id: 'hld-upi', label: 'HLD.docx — UPI Limit Enhancement', feature: 'UPI Limit Enhancement' },
  { id: 'hld-settlement', label: 'HLD.docx — Merchant Auto Settlement', feature: 'Merchant Auto Settlement' },
  { id: 'hld-biometric', label: 'HLD.docx — Biometric Login', feature: 'Biometric Login' },
];

export const approvedLldOptions: ApprovedDesignOption[] = [
  { id: 'lld-upi', label: 'LLD.docx — UPI Limit Enhancement', feature: 'UPI Limit Enhancement' },
  { id: 'lld-settlement', label: 'LLD.docx — Merchant Auto Settlement', feature: 'Merchant Auto Settlement' },
  { id: 'lld-mandate', label: 'LLD.docx — Recurring Mandate Upgrade', feature: 'Recurring Mandate Upgrade' },
];

export const targetTechnologyStackOptions = [
  { value: 'java-spring', label: 'Java 21 + Spring Boot + PostgreSQL' },
  { value: 'node-nest', label: 'Node.js + NestJS + PostgreSQL' },
  { value: 'dotnet', label: '.NET 8 + ASP.NET Core + SQL Server' },
];

type ComboKey =
  | 'hld-upi|lld-upi'
  | 'hld-settlement|lld-settlement'
  | 'hld-biometric|lld-mandate';

interface ArtifactTemplate {
  name: string;
  fileType: Artifact['fileType'];
  approvalStatus: Artifact['approvalStatus'];
  generatedBy: string;
  modelUsed: string;
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  executiveSummary: string;
  keyFindings: string;
  recommendations: string;
  previewContent: (stack: string) => string;
  changeSummary: string;
}

const byCombo: Record<ComboKey, ArtifactTemplate[]> = {
  'hld-upi|lld-upi': [
    { name: 'UPI_Technical_Design.docx', fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'Payments Dev Architecture', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Medium', executiveSummary: 'Technical design for UPI development implementation from approved HLD/LLD and target stack.', keyFindings: '- Module boundaries align with limit decision and compliance services.\n- Integration contracts defined for NPCI and CBS adapters.', recommendations: '- Enforce contract tests at build stage.\n- Keep event schema compatibility checks mandatory.', previewContent: (s) => `TECHNICAL DESIGN\nStack: ${s}\nServices: limit-api, decision-engine, audit-publisher`, changeSummary: 'Generated UPI technical design artifact.' },
    { name: 'UPI_Service_Skeleton.docx', fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'Platform Development', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Service skeleton blueprint for UPI modules and repository layout.', keyFindings: '- Layered package structure for controller/service/repository.\n- Shared middleware for audit and trace IDs.', recommendations: '- Add module-level ownership and linting checks.', previewContent: (s) => `SERVICE SKELETON\nStack: ${s}\nFolders: api/, domain/, infra/, tests/`, changeSummary: 'Generated UPI service skeleton artifact.' },
    { name: 'UPI_API_Contract.yaml', fileType: 'yaml', approvalStatus: 'Draft', generatedBy: 'API Governance', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Medium', executiveSummary: 'API contract for UPI implementation endpoints and response models.', keyFindings: '- Evaluate/confirm flows include deterministic reason codes.\n- Auth and idempotency headers defined.', recommendations: '- Include backward-compatible version checks in CI.', previewContent: () => 'openapi: 3.0.3\npaths:\n  /v1/upi/limits/evaluate\n  /v1/upi/limits/confirm', changeSummary: 'Generated UPI API contract artifact.' },
    { name: 'UPI_Database_Migration.sql', fileType: 'yaml', approvalStatus: 'Draft', generatedBy: 'Database Engineering', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Database migration script plan for UPI decision and audit entities.', keyFindings: '- New indexes improve decision lookup performance.\n- Migration split for zero-downtime rollout.', recommendations: '- Run migration dry-run in preprod with production-sized data.', previewContent: () => '-- migration_upi.sql\nALTER TABLE limit_decision ADD COLUMN policy_version VARCHAR(16);', changeSummary: 'Generated UPI database migration artifact.' },
    { name: 'UPI_Build_Configuration.docx', fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'DevOps Engineering', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Build configuration for UPI services including quality and security gates.', keyFindings: '- Build pipeline enforces unit test + SAST + dependency checks.\n- Artifact versioning tied to release branch.', recommendations: '- Block merges on contract-test failure.', previewContent: (s) => `BUILD CONFIGURATION\nStack: ${s}\nStages: lint -> test -> scan -> package`, changeSummary: 'Generated UPI build configuration artifact.' },
    { name: 'UPI_CI_CD_Pipeline.docx', fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'Release Automation', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Medium', executiveSummary: 'CI/CD pipeline definition for UPI development artifacts and promotion controls.', keyFindings: '- Promotion requires passing functional and security gates.\n- Canary policy integrated for deployment.', recommendations: '- Add automated rollback hooks for failed canary checks.', previewContent: () => 'CI/CD PIPELINE\nBuild -> Test -> Scan -> Deploy SIT -> Deploy UAT -> Deploy PROD', changeSummary: 'Generated UPI CI/CD pipeline artifact.' },
    { name: 'UPI_Unit_Test_Skeleton.docx', fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'Quality Engineering', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Unit test skeleton for UPI service modules and contract behavior.', keyFindings: '- Core decision and adapter tests identified.\n- Error-path coverage scenarios defined.', recommendations: '- Target >= 85% coverage for decision module.', previewContent: () => 'UNIT TEST SKELETON\nDecisionServiceTest\nPolicyResolverTest\nFraudAdapterContractTest', changeSummary: 'Generated UPI unit test skeleton artifact.' },
    { name: 'UPI_Code_Review_Checklist.xlsx', fileType: 'xlsx', approvalStatus: 'Pending Review', generatedBy: 'Engineering Governance', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Code review checklist for UPI implementation quality and security compliance.', keyFindings: '- Checklist includes security, performance, and contract conformance controls.\n- 24 review controls mapped to owners.', recommendations: '- Require two approvers for integration adapters.', previewContent: () => 'Sheet: Code_Review\n1 security validation\n2 contract conformance\n...\n24 release readiness checks', changeSummary: 'Generated UPI code review checklist artifact.' },
  ],
  'hld-settlement|lld-settlement': [
    { name: 'Merchant_Technical_Design.docx', fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'Settlement Development Architecture', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Medium', executiveSummary: 'Technical design for merchant settlement implementation from approved design inputs.', keyFindings: '- Service boundaries cover ingestion, netting, payout, reconciliation.\n- Event-driven integration contracts required.', recommendations: '- Adopt schema registry controls for settlement events.', previewContent: (s) => `TECHNICAL DESIGN\nStack: ${s}\nDomains: ingest, netting, payout, reconcile`, changeSummary: 'Generated merchant technical design artifact.' },
    { name: 'Merchant_Service_Skeleton.docx', fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'Platform Team', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Service skeleton for merchant settlement module decomposition.', keyFindings: '- Modular package strategy supports parallel teams.\n- Shared domain utilities isolated.', recommendations: '- Enforce ownership metadata per module.', previewContent: (s) => `SERVICE SKELETON\nStack: ${s}\nModules: settlement-api, payout-engine, reconcile-worker`, changeSummary: 'Generated merchant service skeleton artifact.' },
    { name: 'Merchant_API_Contract.yaml', fileType: 'yaml', approvalStatus: 'Draft', generatedBy: 'API Platform', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Medium', executiveSummary: 'API contract for merchant settlement operations.', keyFindings: '- Endpoints cover batch status, payout detail, reconciliation break handling.\n- Auth scopes and pagination model defined.', recommendations: '- Add idempotency constraints for payout retry endpoints.', previewContent: () => 'openapi: 3.0.3\npaths:\n  /v1/settlement/batches\n  /v1/settlement/payouts/{id}', changeSummary: 'Generated merchant API contract artifact.' },
    { name: 'Merchant_Database_Migration.sql', fileType: 'yaml', approvalStatus: 'Draft', generatedBy: 'Database Reliability', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Medium', executiveSummary: 'Migration script plan for merchant settlement schema rollout.', keyFindings: '- Partition strategy aligned to settlement_date.\n- New indexes for payout/reconciliation queries.', recommendations: '- Validate migration performance against 90-day data sample.', previewContent: () => '-- migration_settlement.sql\nCREATE INDEX idx_batch_date ON settlement_batch(settlement_date);', changeSummary: 'Generated merchant database migration artifact.' },
    { name: 'Merchant_Build_Configuration.docx', fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'DevOps Automation', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Build configuration for merchant settlement codebase.', keyFindings: '- Multi-module build orchestrated for service and worker binaries.\n- Quality gates integrated.', recommendations: '- Gate package publication on integration tests.', previewContent: (s) => `BUILD CONFIG\nStack: ${s}\nModules build order and artifact strategy`, changeSummary: 'Generated merchant build configuration artifact.' },
    { name: 'Merchant_CI_CD_Pipeline.docx', fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'Release Engineering', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Medium', executiveSummary: 'CI/CD pipeline for merchant settlement with promotion controls.', keyFindings: '- Pipeline includes schema compatibility and replay tests.\n- Promotion requires risk checklist completion.', recommendations: '- Keep canary verification for payout services.', previewContent: () => 'CI/CD PIPELINE\nBuild -> Test -> Contract -> Security -> Deploy', changeSummary: 'Generated merchant CI/CD pipeline artifact.' },
    { name: 'Merchant_Unit_Test_Skeleton.docx', fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'Quality Engineering', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Unit test skeleton for merchant settlement modules.', keyFindings: '- Core service and mapper tests identified.\n- Failure-path tests for reconciliation required.', recommendations: '- Add mutation testing on payout calculator.', previewContent: () => 'UNIT TEST SKELETON\nSettlementServiceTest\nPayoutEngineTest\nReconcileWorkerTest', changeSummary: 'Generated merchant unit test skeleton artifact.' },
    { name: 'Merchant_Code_Review_Checklist.xlsx', fileType: 'xlsx', approvalStatus: 'Pending Review', generatedBy: 'Engineering Governance', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Code review checklist for merchant settlement implementation.', keyFindings: '- 26 controls mapped to design, security, and operational readiness.', recommendations: '- Require reviewer from ops domain for payout workflow changes.', previewContent: () => 'Sheet: Code_Review\n1 idempotency handling\n2 schema compatibility\n...\n26 control checks', changeSummary: 'Generated merchant code review checklist artifact.' },
  ],
  'hld-biometric|lld-mandate': [
    { name: 'Biometric_Technical_Design.docx', fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'Security Development Architecture', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'High', executiveSummary: 'Technical design for biometric authentication service implementation aligned to approved architecture inputs.', keyFindings: '- Trust boundary and token policy are first-class design controls.\n- MFA fallback and audit stream modeled as core modules.', recommendations: '- Validate security threat model before coding start.', previewContent: (s) => `TECHNICAL DESIGN\nStack: ${s}\nModules: assertion-validator, policy-engine, token-issuer`, changeSummary: 'Generated biometric technical design artifact.' },
    { name: 'Biometric_Service_Skeleton.docx', fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'Security Platform Team', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Medium', executiveSummary: 'Service skeleton for biometric authentication implementation.', keyFindings: '- Skeleton includes security middleware and audit hooks.\n- Package boundaries isolate crypto utilities.', recommendations: '- Keep policy evaluation module independently testable.', previewContent: (s) => `SERVICE SKELETON\nStack: ${s}\nModules: auth-api, challenge-engine, audit-emitter`, changeSummary: 'Generated biometric service skeleton artifact.' },
    { name: 'Biometric_API_Contract.yaml', fileType: 'yaml', approvalStatus: 'Draft', generatedBy: 'API Security Governance', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Medium', executiveSummary: 'API contract for biometric verification and session issuance.', keyFindings: '- Contract includes allow/challenge/deny outcomes.\n- Auth scopes and nonce requirements defined.', recommendations: '- Add strict schema checks at gateway level.', previewContent: () => 'openapi: 3.0.3\npaths:\n  /v1/auth/biometric/verify\n  /v1/auth/session/issue', changeSummary: 'Generated biometric API contract artifact.' },
    { name: 'Biometric_Database_Migration.sql', fileType: 'yaml', approvalStatus: 'Draft', generatedBy: 'Database Security Engineering', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Migration script for biometric auth metadata and audit tables.', keyFindings: '- New session binding table and audit indexes introduced.\n- Encryption-at-rest tags required for sensitive columns.', recommendations: '- Run migration with restricted DBA role only.', previewContent: () => '-- migration_biometric.sql\nCREATE TABLE auth_event_log (...);\nCREATE INDEX idx_auth_event_ts ON auth_event_log(created_at);', changeSummary: 'Generated biometric migration artifact.' },
    { name: 'Biometric_Build_Configuration.docx', fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'DevSecOps Engineering', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Build configuration for biometric auth service with secure build gates.', keyFindings: '- Build enforces secret scan and SAST baseline.\n- Artifact signing required before promotion.', recommendations: '- Fail build on policy exception not approved.', previewContent: (s) => `BUILD CONFIG\nStack: ${s}\nSecurity gates: SAST, secret scan, dependency policy`, changeSummary: 'Generated biometric build configuration artifact.' },
    { name: 'Biometric_CI_CD_Pipeline.docx', fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'Release Automation', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Medium', executiveSummary: 'CI/CD pipeline for biometric service with controlled environment promotions.', keyFindings: '- Promotions require integration + security regression pass.\n- Rollback hooks embedded for failed canary.', recommendations: '- Keep policy-as-code controls versioned with pipeline.', previewContent: () => 'CI/CD PIPELINE\nBuild -> Security -> Integration -> Canary -> Promote', changeSummary: 'Generated biometric CI/CD pipeline artifact.' },
    { name: 'Biometric_Unit_Test_Skeleton.docx', fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'Quality Engineering', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Unit test skeleton for biometric auth components.', keyFindings: '- Tests include nonce, token, and challenge policy paths.\n- Edge-case negative tests identified.', recommendations: '- Add fuzz tests for assertion payload parser.', previewContent: () => 'UNIT TEST SKELETON\nAssertionValidatorTest\nTokenIssuerTest\nChallengePolicyTest', changeSummary: 'Generated biometric unit test skeleton artifact.' },
    { name: 'Biometric_Code_Review_Checklist.xlsx', fileType: 'xlsx', approvalStatus: 'Pending Review', generatedBy: 'Secure Coding Council', modelUsed: 'deterministic-dev-intake-v2', riskRating: 'Low', executiveSummary: 'Code review checklist for biometric implementation security and quality gates.', keyFindings: '- 25 review controls include cryptography and audit integrity checks.', recommendations: '- Require dual approval for auth core module changes.', previewContent: () => 'Sheet: Secure_Code_Review\n1 nonce handling\n2 token lifecycle\n...\n25 controls', changeSummary: 'Generated biometric code review checklist artifact.' },
  ],
};

export function buildDevelopmentArtifacts(hldId: string, lldId: string, techStack: string, runId: string): Artifact[] {
  const hld = approvedHldOptions.find((o) => o.id === hldId);
  const lld = approvedLldOptions.find((o) => o.id === lldId);
  const stack = targetTechnologyStackOptions.find((o) => o.value === techStack);
  if (!hld || !lld || !stack) {
    throw new Error(`Unsupported Development Intake combination: hld="${hldId}", lld="${lldId}", stack="${techStack}"`);
  }
  const combo = `${hldId}|${lldId}` as ComboKey;
  const defs = byCombo[combo];
  if (!defs) {
    throw new Error(`Unsupported Development Intake combination: hld="${hldId}", lld="${lldId}", stack="${techStack}"`);
  }

  return defs.map((d, i) =>
    createArtifact({
      id: `${runId}-${i + 1}`,
      name: d.name,
      generatedBy: d.generatedBy,
      modelUsed: d.modelUsed,
      fileType: d.fileType,
      approvalStatus: d.approvalStatus,
      riskRating: d.riskRating,
      executiveSummary: d.executiveSummary,
      previewContent: d.previewContent(stack.label),
      sections: [
        { title: 'Key Findings', content: d.keyFindings },
        { title: 'Recommendations', content: d.recommendations },
        { title: 'Metadata', content: `Approved HLD: ${hld.label}\nApproved LLD: ${lld.label}\nTarget Stack: ${stack.label}` },
      ],
      changeSummary: d.changeSummary,
      context: { feature: hld.feature, domain: stack.label },
    }),
  );
}

export function getDemoDevelopmentArtifacts(): Artifact[] {
  return buildDevelopmentArtifacts('hld-upi', 'lld-upi', 'java-spring', 'DEMO-DEV');
}
