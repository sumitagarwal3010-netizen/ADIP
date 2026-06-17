import { Box, Chip, Typography } from '@mui/material';
import MapIcon from '@mui/icons-material/AltRoute';
import ShieldIcon from '@mui/icons-material/Shield';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LockIcon from '@mui/icons-material/Lock';
import StackedBarChartIcon from '@mui/icons-material/StackedBarChart';
import CodeIcon from '@mui/icons-material/Code';
import ScienceIcon from '@mui/icons-material/Science';
import ChecklistIcon from '@mui/icons-material/Checklist';
import BlockIcon from '@mui/icons-material/Block';
import GroupIcon from '@mui/icons-material/Group';
import SpeedIcon from '@mui/icons-material/Speed';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BugReportIcon from '@mui/icons-material/BugReport';
import { GlassCard } from '../common/GlassCard';
import { colors } from '../../theme/colors';
import {
  CopilotSection,
  type CopilotFinding,
  type CopilotRecommendation,
  type CopilotSuggestedAction,
} from './CopilotSection';
import { useCopilot } from '../../context/CopilotContext';

// ---------------------------------------------------------------------------
// Architecture Copilot — architecture risks + modernization recommendations
// ---------------------------------------------------------------------------
export function ArchitectureCopilotPanel() {
  const { selectedProject } = useCopilot();

  const findings: CopilotFinding[] = [
    { id: 'arc-1', badge: 'Architecture · UPI Switch', severity: 'critical', title: 'UPI switch deployed in a single availability zone', detail: 'No cell-based isolation. An AZ failure during peak NPCI traffic risks a full UPI outage and breaches the RBI uptime directive.' },
    { id: 'arc-2', badge: 'Architecture · Cards Tokenization', severity: 'critical', title: 'Card tokenization vault is a single point of failure', detail: 'The HSM-backed token vault runs active-passive; failover is manual (~25 min), stalling all card-on-file and tap-to-pay authorizations.' },
    { id: 'arc-3', badge: 'Architecture · Net Banking', severity: 'high', title: 'Net Banking remains a Java 8 monolith', detail: 'Funds transfer, bill-pay and profile share one deployable; every change forces a full regression and a risky big-bang release.' },
    { id: 'arc-4', badge: 'Risk Observation · Payments', severity: 'high', title: 'NEFT/RTGS orchestration is a synchronous 6-hop chain', detail: 'Latency compounds and one slow downstream (sanctions screening) cascades timeouts across the payment journey.' },
    { id: 'arc-5', badge: 'Resiliency · Mobile BFF', severity: 'high', title: 'Mobile BFF has no circuit breakers or bulkheads', detail: 'A degraded statements API saturates BFF threads, browning out login and balance checks for all mobile users.' },
    { id: 'arc-6', badge: 'Modernization · Loans', severity: 'medium', title: 'Loans disbursement is tightly coupled to the nightly core batch', detail: 'Same-day disbursement is impossible; a batch overrun delays the entire loans book update.' },
  ];

  const recommendations: CopilotRecommendation[] = [
    { id: 'arc-r1', badge: 'UPI', title: 'Move the UPI switch to cell-based, multi-AZ active-active', rationale: 'Isolated cells contain blast radius and remove the single-AZ dependency.', impact: '99.95% → 99.99% UPI availability · ~₹3.2M/yr outage cost avoided' },
    { id: 'arc-r2', badge: 'Cards', title: 'Run the tokenization vault active-active across two HSM clusters', rationale: 'Automated failover under 30s keeps authorizations flowing during an outage.', impact: 'Failover 25 min → <30s' },
    { id: 'arc-r3', badge: 'Net Banking', title: 'Apply strangler-fig decomposition to the Net Banking monolith', rationale: 'Carve funds-transfer and bill-pay into independently deployable services first.', impact: 'Release lead time -40% · regression scope -55%' },
    { id: 'arc-r4', badge: 'Payments', title: 'Re-platform NEFT/RTGS to event-driven choreography on Kafka', rationale: 'Asynchronous steps decouple sanctions screening from the customer path.', impact: 'p95 latency 4.1s → 1.6s' },
    { id: 'arc-r5', badge: 'Mobile', title: 'Add resilience4j circuit breakers and bulkheads to the BFF', rationale: 'Fail fast on degraded dependencies and protect the login path.', impact: 'Brown-out incidents -70%' },
  ];

  const suggestedActions: CopilotSuggestedAction[] = [
    { id: 'arc-a1', priority: 'P1', owner: 'Chief Architect', label: 'Raise an ARB exception & funding ask for UPI multi-AZ cells', detail: 'Single-AZ UPI switch is the top resiliency risk this quarter.' },
    { id: 'arc-a2', priority: 'P1', owner: 'Cards Platform Lead', label: 'Schedule active-active cutover for the tokenization vault', detail: 'Target the next change window; rehearse automated failover.' },
    { id: 'arc-a3', priority: 'P2', owner: 'Net Banking Eng Lead', label: 'Approve strangler-fig slice 1 (funds transfer extraction)', detail: 'Adopt the generated modernization roadmap wave 1.' },
    { id: 'arc-a4', priority: 'P3', owner: 'Payments Architect', label: 'Spike Kafka-based payment choreography in non-prod', detail: 'Validate sanctions-screening decoupling against RTGS SLAs.' },
  ];

  const modernizationPlan = `# Modernization Plan — ${selectedProject.name}

WAVE 1 (0-3 mo) — Resiliency
  • UPI switch → cell-based multi-AZ active-active
  • Cards tokenization vault → active-active HSM failover (<30s)

WAVE 2 (3-6 mo) — Decoupling
  • Net Banking monolith → strangler-fig (funds transfer, bill-pay)
  • Mobile BFF → circuit breakers + bulkheads

WAVE 3 (6-12 mo) — Event-driven
  • NEFT/RTGS → Kafka choreography
  • Loans disbursement → CDC streaming off the core batch

Risk burndown: 2 Critical + 3 High architecture risks retired.
Investment ask: ₹14.5 Cr · Payback in 14 months from outage avoidance and release lead-time.`;

  const archReview = `# Architecture Review — ${selectedProject.name}

Scope: 6 banking platforms (UPI, Mobile, Net Banking, Cards, Loans, Payments)
Verdict: AMBER — 2 Critical resiliency gaps, 3 High decoupling debts.

Resiliency Analysis
  • UPI switch ......... single-AZ (Critical) — multi-AZ cells required
  • Cards vault ........ active-passive (Critical) — active-active required
  • Mobile BFF ......... no circuit breakers (High) — resilience4j required

Coupling Analysis
  • Net Banking monolith — high blast radius
  • Payments orchestration — synchronous 6-hop chain

Modernization Opportunities
  • Strangler-fig Net Banking ............ -55% regression scope
  • Event-driven Payments ................ -2.5s p95 latency
  • CDC-streamed Loans disbursement ...... same-day capability

ARB recommendation: approve Wave 1 funding, conditional Wave 2 review at month 3.`;

  const riskAssessment = `# Architecture Risk Assessment — ${selectedProject.name}

Risk Observations & Likelihood × Impact:
  R-01  UPI single-AZ outage ........... High × Critical → ₹3.2M/yr exposure
  R-02  Cards vault failover stall ..... Med  × Critical → 25 min auth blackout
  R-03  Net Banking big-bang release ... High × High     → release-day defect spike
  R-04  Sanctions sync cascade ......... High × High     → RTGS SLA breach
  R-05  Mobile BFF brown-out ........... High × Medium   → login degradation

Mitigations are mapped to the modernization waves; residual risk after Wave 1 = LOW.`;

  const archScorecard = `# Architecture Scorecard — ${selectedProject.name}

Dimension              Score (0-100)   Trend
--------------------   -------------   -----
Resiliency                       62      ↑
Modularity                       58      →
Observability                    71      ↑
Standards Adoption               74      ↑
Cloud Maturity                   68      ↑
Security-by-Design               66      →
Modernization Velocity           54      ↑

Composite Architecture Health: 65/100 (AMBER)
Top 3 levers: Resiliency, Modularity, Modernization Velocity.`;

  const targetState = `# Target State Architecture — ${selectedProject.name}

Target topology (FY+18 months):
  · UPI            : event-driven, multi-AZ, dual NPCI gateway, 14k TPS
  · Cards          : tokenized vault, active-active, sub-200ms auth p95
  · Loans          : CDC-streamed disbursement, same-day capability
  · Net Banking    : strangler-fig microfrontend on the channels platform
  · Payments       : NEFT/RTGS on the orchestration bus, idempotent retries
  · Mobile         : single-trip BFF, hardened token validation

Architecture principles enforced:
  · Every channel idempotent at the gateway
  · One JWT validation library, audience-aware
  · Vault-only PAN, masked logging
  · Event-first integration with replay-safe consumers

This target inherits the modernization-plan waves and resolves R-01..R-05.`;

  const gapAnalysis = `# Architecture Gap Analysis — ${selectedProject.name}

Gap                                                Wave    Effort   Closes
-----------------------------------------------    ----    ------   ------------------
Multi-AZ UPI failover                              1       4w       R-01 + R-04
Tokenized PAN vault                                1       3w       PCI-DSS · R-02
Cards active-active failover                       1       6w       R-02
Net Banking strangler microfrontend baseline       1       8w       R-03
NEFT/RTGS idempotency keys                         1       2w       Settlement risk
Mobile BFF single-trip aggregation                 2       3w       R-05
CDC-streamed Loans disbursement                    2       6w       Same-day SLA

Closing all Wave-1 gaps moves residual risk LOW and unlocks the Wave-2
modernization plan.`;

  return (
    <CopilotSection
      title="Architecture Copilot"
      sourceHub="ai-copilot"
      sourceLabel="Architecture Copilot"
      analyzedSubtitle={`AI reviewed solution and platform architecture across UPI, Mobile Banking, Net Banking, Cards, Loans and Payments for architecture findings, risk observations, resiliency analysis and modernization opportunities on ${selectedProject.name}.`}
      analyzedScope={[
        '6 banking platforms',
        `${findings.length} findings`,
        `${findings.filter((f) => (f.badge ?? '').includes('Resiliency')).length} resiliency · ${findings.filter((f) => (f.badge ?? '').includes('Modernization')).length} modernization`,
      ]}
      findingsTitle="Architecture Findings · Risk Observations · Resiliency · Modernization"
      findings={findings}
      recommendations={recommendations}
      generationActions={[
        { id: 'arch-review', label: 'Generate Architecture Review', artifactName: 'Architecture_Review_Report.docx', icon: RateReviewIcon, generatedBy: 'Architecture AI', preview: archReview },
        { id: 'scorecard', label: 'Generate Architecture Scorecard', artifactName: 'Architecture_Scorecard.docx', icon: AssessmentIcon, generatedBy: 'Architecture AI', preview: archScorecard },
        { id: 'risk-assessment', label: 'Generate Risk Assessment', artifactName: 'Architecture_Risk_Assessment.docx', icon: ShieldIcon, generatedBy: 'Architecture AI', preview: riskAssessment },
        { id: 'modernization-plan', label: 'Generate Modernization Plan', artifactName: 'Modernization_Plan.docx', icon: MapIcon, generatedBy: 'Architecture AI', preview: modernizationPlan },
        { id: 'target-state', label: 'Generate Target State Architecture', artifactName: 'Target_State_Architecture.docx', icon: AccountTreeIcon, generatedBy: 'Architecture AI', preview: targetState },
        { id: 'gap-analysis', label: 'Generate Gap Analysis', artifactName: 'Architecture_Gap_Analysis.xlsx', icon: CompareArrowsIcon, generatedBy: 'Architecture AI', preview: gapAnalysis },
      ]}
      suggestedActions={suggestedActions}
      initialArtifacts={[
        { actionId: 'arch-review', artifactName: 'Architecture_Review.md', generatedAt: '09:18', generatedBy: 'Architecture AI', preview: archReview },
        { actionId: 'modernization-plan', artifactName: 'Modernization_Plan.md', generatedAt: '09:19', generatedBy: 'Architecture AI', preview: modernizationPlan },
      ]}
      secondaryKpis={[
        { label: 'Architecture Findings', value: findings.length },
        { label: 'Critical', value: findings.filter((f) => f.severity === 'critical').length },
        { label: 'Modernization Items', value: recommendations.length },
        { label: 'Resiliency Score', value: 62, suffix: '/100' },
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Development Copilot — code quality findings + remediation recommendations
// ---------------------------------------------------------------------------
export function DevelopmentCopilotPanel() {
  const { selectedProject } = useCopilot();

  const findings: CopilotFinding[] = [
    { id: 'dev-1', badge: 'Security · Cards', severity: 'critical', title: 'PAN logged in plaintext in card authorization service', detail: 'CardAuthService.log() writes the full primary account number — a direct PCI-DSS Req 3.4 violation flagged in 14 log statements.' },
    { id: 'dev-2', badge: 'Code Quality · Payments', severity: 'high', title: 'Payment retry handler has no idempotency key', detail: 'NEFT retry on timeout can double-debit; the handler replays the request without a dedupe token.' },
    { id: 'dev-3', badge: 'Code Quality · UPI', severity: 'high', title: 'UPI reconciliation service cyclomatic complexity = 42', detail: 'A single 600-line method handles settlement, reversal and dispute paths, making change error-prone.' },
    { id: 'dev-4', badge: 'Code Quality · Loans', severity: 'high', title: 'Loan interest engine unit-test coverage is 38%', detail: 'EMI and floating-rate recalculation branches are largely untested ahead of a rate-change release.' },
    { id: 'dev-5', badge: 'Security · Mobile', severity: 'medium', title: 'Token validation duplicated across 7 mobile modules', detail: 'Copy-pasted JWT validation drifts between modules; one copy skips audience checks — a JWT spoof risk.' },
    { id: 'dev-6', badge: 'Performance · Net Banking', severity: 'medium', title: 'Funds-transfer endpoint p95 = 2,400ms (target 800ms)', detail: 'A nested DB join on the customer-account table dominates the call; shows up under steady load on the production telemetry.' },
    { id: 'dev-7', badge: 'Performance · Mobile', severity: 'medium', title: 'Mobile balance refresh fans out 11 backend calls', detail: 'The balance screen makes 11 sequential calls; a single response aggregator would cut latency by ~600ms.' },
    { id: 'dev-8', badge: 'Code Quality · Net Banking', severity: 'low', title: '1,240 SonarQube code smells in Net Banking', detail: 'Largely long methods and empty catch blocks that swallow funds-transfer errors.' },
  ];

  const recommendations: CopilotRecommendation[] = [
    { id: 'dev-r1', badge: 'Security · Cards', title: 'Mask PAN and route to tokenized secure logging', rationale: 'Replace PAN with a token reference and a structured masked logger.', impact: 'Closes PCI-DSS 3.4 gap · audit-blocking issue removed' },
    { id: 'dev-r2', badge: 'Code Quality · Payments', title: 'Introduce idempotency keys on all payment mutations', rationale: 'Persist a client-supplied key and dedupe retries at the gateway.', impact: 'Double-debit risk eliminated' },
    { id: 'dev-r3', badge: 'Code Quality · UPI', title: 'Extract reconciliation into settlement/reversal/dispute strategies', rationale: 'Apply the strategy pattern to drop complexity below the gate of 15.', impact: 'Complexity 42 → 9 · change-fail rate -30%' },
    { id: 'dev-r4', badge: 'Performance · Net Banking', title: 'Add a covering index and project-only-fields on funds-transfer query', rationale: 'The nested join is overscanning the customer-account table.', impact: 'p95 2,400ms → ~700ms (target 800ms)' },
    { id: 'dev-r5', badge: 'Performance · Mobile', title: 'Aggregate the 11 balance-screen calls behind a BFF response composer', rationale: 'Single round-trip with parallel internal fan-out.', impact: 'Mobile balance latency -600ms · battery savings' },
    { id: 'dev-r6', badge: 'Security · Mobile', title: 'Centralize token validation into a shared auth library', rationale: 'Single hardened implementation with audience and expiry checks.', impact: 'Removes 7 duplicate copies · closes JWT spoof vector' },
  ];

  const suggestedActions: CopilotSuggestedAction[] = [
    { id: 'dev-a1', priority: 'P1', owner: 'Cards Dev Lead', label: 'Hotfix plaintext PAN logging before next release', detail: 'PCI-blocking; cannot ship the Cards build with this open.' },
    { id: 'dev-a2', priority: 'P1', owner: 'Payments Dev Lead', label: 'Add idempotency keys to NEFT/RTGS retry path', detail: 'Prevents customer-impacting double debits.' },
    { id: 'dev-a3', priority: 'P2', owner: 'UPI Squad', label: 'Refactor reconciliation using generated refactoring plan', detail: 'Adopt the Copilot-authored plan to cut complexity.' },
    { id: 'dev-a4', priority: 'P2', owner: 'Loans QA', label: 'Merge generated unit tests for the interest engine', detail: 'Lift coverage above the 80% quality gate.' },
  ];

  const refactorPlan = `# Refactoring Plan — UPI Reconciliation (${selectedProject.name})

1. Extract SettlementStrategy, ReversalStrategy, DisputeStrategy
2. Replace 600-line switch with a strategy registry
3. Add guard clauses; remove nested conditionals (depth 6 → 2)
4. Cyclomatic complexity target: 42 → ≤ 9

Estimated effort: 3 dev-days · risk: low (behavior-preserving).`;

  const codeReviewSummary = `# Code Review Summary — ${selectedProject.name}

Reviewed: 6 codebases · ${findings.length} findings · 1 PCI-blocking issue

Top blockers (must fix before merge):
  • Cards: plaintext PAN in 14 log statements (PCI-DSS 3.4)
  • Payments: missing idempotency key on retry path

Top recurring smells:
  • Empty catch blocks .................. Net Banking funds-transfer
  • Long methods (>150 lines) ........... 96 occurrences
  • Duplicate JWT validation ............ 7 copies in Mobile

Verdict: 2 PRs are not safe to merge as-is. The remaining 11 PRs are mergeable
with minor comments. Full file-by-file annotations attached.`;

  const secureCoding = `# Secure Coding Recommendations — ${selectedProject.name}

Critical
  • Mask PAN/CVV/CCV — route to tokenized secure logger.
  • Centralize JWT validation; enforce audience + expiry.

High
  • Add idempotency keys to all payment mutations.
  • Apply rate limiting + replay protection on webhook endpoints.
  • Pin dependency versions; remove vulnerable transitive jars (3 Highs in BOM).

Medium
  • Adopt strict CSP on Net Banking; block inline scripts.
  • Rotate signing keys quarterly; move to HSM-backed key store.

Frameworks: PCI-DSS · OWASP ASVS L2 · RBI Cyber Security Framework.`;

  const techDebtReport = `# Technical Debt Report — ${selectedProject.name}

Total debt (estimated remediation effort): 184 dev-days · ~₹2.1 Cr

By type
  • Code complexity .......... 62 dev-days
  • Test coverage gaps ....... 38 dev-days
  • Performance debt ......... 24 dev-days
  • Security debt ............ 22 dev-days
  • Architecture coupling .... 38 dev-days

By module
  • Net Banking .............. 64 dev-days  (highest)
  • UPI ...................... 32 dev-days
  • Payments ................. 28 dev-days
  • Cards .................... 24 dev-days
  • Loans .................... 18 dev-days
  • Mobile ................... 18 dev-days

Top 3 paydown candidates by ROI:
  1. UPI reconciliation refactor (3 days, complexity 42 → 9)
  2. Cards PAN masking (1 day, removes PCI block)
  3. Loans interest-engine tests (4 days, coverage 38% → 82%)`;

  const defectImpact = `# Defect Impact Assessment — ${selectedProject.name}

Defect tracking window: last 30 days
Total open defects: 184 · S1: 4 · S2: 21 · S3: 78 · S4: 81

Top 5 defects by customer-impact score:
  1. UPI auto-refund 60s window misses by ~9% (customer-visible)
  2. NEFT retry double-debit (rare, but high-severity if it happens)
  3. Cards token expiry not propagated → declined-at-merchant
  4. Mobile balance refresh slow path (battery + churn)
  5. Net Banking funds-transfer 2.4s p95 (perceived sluggishness)

Estimated $-impact if shipped:
  · Refund delays   ≈ ₹2.1Cr/yr in dispute handling cost
  · Double-debits   ≈ ₹0.8Cr exposure (rare but compliance-sensitive)
  · Token expiry    ≈ 0.3% auth-decline rate ≈ ₹3.4Cr top-line risk

Recommended hold list before next release: defects #1, #2, #3.`;

  return (
    <CopilotSection
      title="Development Copilot"
      sourceHub="ai-copilot"
      sourceLabel="Development Copilot"
      analyzedSubtitle={`AI scanned source, tests, dependencies and runtime telemetry across UPI, Cards, Payments, Loans, Mobile and Net Banking for code quality, security and performance findings on ${selectedProject.name}.`}
      analyzedScope={[
        '6 codebases',
        `${findings.filter((f) => (f.badge ?? '').includes('Code Quality')).length} code quality · ${findings.filter((f) => (f.badge ?? '').includes('Security')).length} security · ${findings.filter((f) => (f.badge ?? '').includes('Performance')).length} performance`,
        '1 PCI-blocking issue',
      ]}
      findingsTitle="Code Quality · Security · Performance Findings"
      findings={findings}
      recommendations={recommendations}
      generationActions={[
        { id: 'code-review-summary', label: 'Generate Code Review Report', artifactName: 'Code_Review_Report.docx', icon: ChecklistIcon, generatedBy: 'Development AI', preview: codeReviewSummary },
        { id: 'secure-coding', label: 'Generate Secure Coding Assessment', artifactName: 'Secure_Coding_Assessment.docx', icon: LockIcon, generatedBy: 'Development AI', preview: secureCoding },
        { id: 'tech-debt-report', label: 'Generate Technical Debt Report', artifactName: 'Technical_Debt_Report.docx', icon: StackedBarChartIcon, generatedBy: 'Development AI', preview: techDebtReport },
        { id: 'defect-impact', label: 'Generate Defect Impact Assessment', artifactName: 'Defect_Impact_Assessment.docx', icon: BugReportIcon, generatedBy: 'Development AI', preview: defectImpact },
        { id: 'refactor', label: 'Generate Refactoring Recommendation', artifactName: 'Refactoring_Recommendation_Report.docx', icon: CodeIcon, generatedBy: 'Development AI', preview: refactorPlan },
      ]}
      suggestedActions={suggestedActions}
      initialArtifacts={[
        { actionId: 'code-review-summary', artifactName: 'Code_Review_Summary.md', generatedAt: '09:31', generatedBy: 'Development AI', preview: codeReviewSummary },
        { actionId: 'tech-debt-report', artifactName: 'Technical_Debt_Report.md', generatedAt: '09:33', generatedBy: 'Development AI', preview: techDebtReport },
      ]}
      secondaryKpis={[
        { label: 'Code Quality', value: findings.filter((f) => (f.badge ?? '').includes('Code Quality')).length },
        { label: 'Security', value: findings.filter((f) => (f.badge ?? '').includes('Security')).length },
        { label: 'Performance', value: findings.filter((f) => (f.badge ?? '').includes('Performance')).length },
        { label: 'Coverage', value: 61, suffix: '%' },
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Testing Copilot — generated test cases (primary), gaps + automation
// ---------------------------------------------------------------------------
interface GeneratedTestCase {
  id: string;
  title: string;
  type: 'Positive' | 'Negative' | 'Edge';
  expected: string;
}

const TEST_CASES: GeneratedTestCase[] = [
  { id: 'TC-UPI-001', title: 'UPI P2P transfer success within SLA', type: 'Positive', expected: 'Debit + credit confirmed < 3s; ledger balanced' },
  { id: 'TC-UPI-002', title: 'NPCI timeout on UPI debit', type: 'Negative', expected: 'Retry-with-backoff; no double debit; auto-reversal < 5 min' },
  { id: 'TC-CARD-014', title: 'Card-on-file 3DS challenge flow', type: 'Positive', expected: 'OTP challenge issued; auth approved on valid OTP' },
  { id: 'TC-CARD-015', title: '3DS challenge abandoned by user', type: 'Edge', expected: 'Auth declined gracefully; no partial settlement' },
  { id: 'TC-PAY-022', title: 'NEFT retry idempotency', type: 'Negative', expected: 'Duplicate request with same key → single debit' },
  { id: 'TC-LOAN-031', title: 'EMI rounding at paisa boundary', type: 'Edge', expected: 'Half-even rounding; schedule sums to principal+interest' },
  { id: 'TC-MOB-040', title: 'Biometric login fallback to MPIN', type: 'Positive', expected: 'On biometric fail, MPIN path succeeds; session issued' },
  { id: 'TC-NET-048', title: 'Concurrent Net Banking session limit', type: 'Negative', expected: 'Second session blocked per policy; audit event raised' },
];

const TYPE_COLOR: Record<GeneratedTestCase['type'], string> = {
  Positive: colors.success,
  Negative: colors.critical,
  Edge: colors.warning,
};

interface RegressionRow {
  module: string;
  coverage: number;
  target: number;
}
const REGRESSION_COVERAGE: RegressionRow[] = [
  { module: 'UPI', coverage: 78, target: 90 },
  { module: 'Cards', coverage: 64, target: 90 },
  { module: 'Payments', coverage: 71, target: 90 },
  { module: 'Loans', coverage: 58, target: 85 },
  { module: 'Mobile Banking', coverage: 82, target: 90 },
  { module: 'Net Banking', coverage: 69, target: 90 },
];

interface MissingScenario {
  id: string;
  module: string;
  scenario: string;
  reason: string;
}
const MISSING_SCENARIOS: MissingScenario[] = [
  { id: 'MS-1', module: 'UPI', scenario: 'NPCI timeout → auto-reversal within 5 min', reason: 'No negative path covers this; #1 customer-impacting failure mode.' },
  { id: 'MS-2', module: 'Cards', scenario: '3DS challenge abandoned by user', reason: 'Edge case missing; risks partial settlements going un-asserted.' },
  { id: 'MS-3', module: 'Cards', scenario: '3DS challenge times out at issuer', reason: 'No timeout assertion; auth must decline gracefully.' },
  { id: 'MS-4', module: 'Payments', scenario: 'Idempotency under retry (NEFT)', reason: 'No test verifies single debit on duplicate request key.' },
  { id: 'MS-5', module: 'Loans', scenario: 'EMI rounding boundary (paisa)', reason: 'Rounding mode unverified at the schedule boundary.' },
  { id: 'MS-6', module: 'Mobile', scenario: 'Biometric → MPIN fallback', reason: 'Fallback path uncovered on the login journey.' },
  { id: 'MS-7', module: 'Net Banking', scenario: 'Concurrent session limit', reason: 'Policy not asserted; second session should be blocked.' },
];

function GeneratedTestCasesCard() {
  return (
    <GlassCard sx={{ p: 2 }} glow="blue">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
        <ScienceIcon sx={{ fontSize: 18, color: colors.info }} />
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700 }}>Generated Test Cases</Typography>
        <Chip label={`${TEST_CASES.length}`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: `${colors.info}1f`, color: colors.info }} />
      </Box>
      {TEST_CASES.map((tc) => (
        <Box key={tc.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
            <Chip label={tc.id} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: 'rgba(255,255,255,0.05)' }} />
            <Chip label={tc.type} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: `${TYPE_COLOR[tc.type]}26`, color: TYPE_COLOR[tc.type] }} />
          </Box>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700 }}>{tc.title}</Typography>
          <Typography sx={{ fontSize: '0.62rem', color: colors.text.secondary, lineHeight: 1.4 }}>Expected: {tc.expected}</Typography>
        </Box>
      ))}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5, mb: 0.75 }}>
        <ChecklistIcon sx={{ fontSize: 16, color: colors.success }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>Regression Coverage</Typography>
      </Box>
      {REGRESSION_COVERAGE.map((r) => {
        const pct = Math.round((r.coverage / r.target) * 100);
        const color = r.coverage >= r.target ? colors.success : r.coverage >= r.target - 15 ? colors.warning : colors.critical;
        return (
          <Box key={r.module} sx={{ py: 0.4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
              <Typography sx={{ fontSize: '0.62rem', color: colors.text.secondary }}>{r.module}</Typography>
              <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color }}>{r.coverage}% / {r.target}%</Typography>
            </Box>
            <Box sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <Box sx={{ width: `${Math.min(100, pct)}%`, height: '100%', bgcolor: color }} />
            </Box>
          </Box>
        );
      })}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5, mb: 0.5 }}>
        <BlockIcon sx={{ fontSize: 16, color: colors.critical }} />
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 700 }}>Missing Scenarios</Typography>
        <Chip label={`${MISSING_SCENARIOS.length}`} size="small" sx={{ height: 16, fontSize: '0.55rem', bgcolor: `${colors.critical}1f`, color: colors.critical }} />
      </Box>
      {MISSING_SCENARIOS.map((m) => (
        <Box key={m.id} sx={{ py: 0.45, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.2 }}>
            <Chip label={m.id} size="small" sx={{ height: 14, fontSize: '0.5rem', bgcolor: 'rgba(255,255,255,0.05)' }} />
            <Chip label={m.module} size="small" sx={{ height: 14, fontSize: '0.5rem', bgcolor: `${colors.warning}26`, color: colors.warning }} />
          </Box>
          <Typography sx={{ fontSize: '0.66rem', fontWeight: 700 }}>{m.scenario}</Typography>
          <Typography sx={{ fontSize: '0.6rem', color: colors.text.secondary, lineHeight: 1.4 }}>{m.reason}</Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function TestingCopilotPanel() {
  const { selectedProject } = useCopilot();

  const findings: CopilotFinding[] = [
    { id: 'tst-1', badge: 'UPI · Gap', severity: 'high', title: 'No negative test for NPCI timeout double-debit', detail: 'The most common UPI failure mode is unverified; a regression here is customer-impacting.' },
    { id: 'tst-2', badge: 'Cards · Gap', severity: 'high', title: '3DS challenge edge cases missing', detail: 'Abandoned and timed-out 3DS challenges are not covered for card-on-file payments.' },
    { id: 'tst-3', badge: 'Payments · Gap', severity: 'high', title: 'Idempotency under retry untested', detail: 'No test asserts a single debit when a NEFT request is retried with the same key.' },
    { id: 'tst-4', badge: 'Loans · Gap', severity: 'medium', title: 'EMI rounding boundary untested', detail: 'Paisa-level rounding on the interest schedule has no boundary test.' },
    { id: 'tst-5', badge: 'Mobile · Gap', severity: 'medium', title: 'Biometric fallback path uncovered', detail: 'Fallback from biometric to MPIN is unverified on the login journey.' },
    { id: 'tst-6', badge: 'Net Banking · Flaky', severity: 'low', title: '12 flaky tests in funds-transfer suite', detail: 'Timing-dependent assertions cause intermittent pipeline failures.' },
  ];

  const recommendations: CopilotRecommendation[] = [
    { id: 'tst-r1', badge: 'UPI', title: 'Adopt the 8 generated test cases into the regression suite', rationale: 'Covers the highest-risk UPI, Cards and Payments failure modes immediately.', impact: 'Critical-path coverage +14%' },
    { id: 'tst-r2', badge: 'Payments', title: 'Add a dedicated idempotency contract test', rationale: 'Guards against double-debit regressions at the gateway boundary.', impact: 'Blocks a Sev1 class of defects' },
    { id: 'tst-r3', badge: 'Cards', title: 'Automate 3DS edge cases in the nightly run', rationale: 'Abandon/timeout paths should fail the build, not production.', impact: 'Escaped-defect risk -22%' },
    { id: 'tst-r4', badge: 'Net Banking', title: 'Quarantine and de-flake the 12 unstable tests', rationale: 'Replace timing waits with deterministic test hooks.', impact: 'Pipeline reliability 88% → 99%' },
  ];

  const suggestedActions: CopilotSuggestedAction[] = [
    { id: 'tst-a1', priority: 'P1', owner: 'QA Lead — Payments', label: 'Merge generated TC-PAY-022 idempotency test before release', detail: 'Release-gating for the Payments build.' },
    { id: 'tst-a2', priority: 'P1', owner: 'QA Lead — UPI', label: 'Add TC-UPI-002 timeout/auto-reversal to regression', detail: 'Highest customer-impact UPI scenario.' },
    { id: 'tst-a3', priority: 'P2', owner: 'Automation Guild', label: 'Automate the 8 generated cases in CI', detail: 'Promote from manual to nightly automated suite.' },
    { id: 'tst-a4', priority: 'P3', owner: 'Net Banking QA', label: 'De-flake the funds-transfer suite', detail: 'Stabilize the 12 intermittently failing tests.' },
  ];

  const testCasesArtifact = `# Generated Test Cases — ${selectedProject.name}
${TEST_CASES.map((t) => `${t.id} [${t.type}] ${t.title}\n   Expected: ${t.expected}`).join('\n')}

Generated ${TEST_CASES.length} cases across UPI, Cards, Payments, Loans, Mobile, Net Banking.`;

  const regressionPack = `# Regression Pack — ${selectedProject.name}

Pack composition (165 cases across 6 modules):
  • UPI .................... 42 cases   (coverage 78% → 92%)
  • Cards .................. 31 cases   (coverage 64% → 88%)
  • Payments ............... 28 cases   (coverage 71% → 90%)
  • Mobile Banking ......... 24 cases   (coverage 82% → 94%)
  • Net Banking ............ 22 cases   (coverage 69% → 88%)
  • Loans .................. 18 cases   (coverage 58% → 84%)

Tagged for nightly automated execution + change-impact selection.`;

  const uatScenarios = `# UAT Scenarios — ${selectedProject.name}

Persona-led scenarios (executive-readable, business-signed-off):
  1. Retail customer sends UPI to a new VPA — expects success in <3s.
  2. Customer disputes a UPI debit; expects auto-refund within 5 min.
  3. Card-on-file 3DS prompt; customer abandons; expects clean decline.
  4. Treasury operator submits an above-threshold NEFT batch; expects maker-checker enforcement.
  5. Mobile user with biometric failure; expects MPIN fallback.
  6. Net Banking concurrent login attempt; expects second session blocked.
  7. Loan customer sees revised EMI schedule after rate change; rounding intact.

UAT sign-off matrix attached (Product Owner · Compliance · Operations).`;

  const performanceTests = `# Performance Tests — ${selectedProject.name}

UPI ........... 5,000 TPS sustained, 0 errors, p95 < 1.0s
Cards Auth .... 1,200 TPS sustained, p95 < 300ms
NEFT Batch .... 1M txns < 20 min, settlement window respected
Mobile BFF .... 4,000 RPS soak (60 min), zero brown-outs
Net Banking ... funds-transfer p95 < 800ms (current 2,400ms — must regress on covering index fix)

Includes ramp profile, error budget, and break-point harness.`;

  const negativeTests = `# Negative Test Cases — ${selectedProject.name}

UPI
  NTC-UPI-001  NPCI timeout → retry-with-backoff, no double debit
  NTC-UPI-002  Beneficiary VPA invalid → graceful decline
  NTC-UPI-003  Velocity limit breached → block + customer message

Cards
  NTC-CARD-010 3DS abandoned by user → clean decline
  NTC-CARD-011 3DS timeout at issuer → auth declined gracefully
  NTC-CARD-012 Tokenization vault failover → no auth loss

Payments
  NTC-PAY-020  Duplicate NEFT request key → single debit (idempotency)
  NTC-PAY-021  Sanctions screening down → conservative hold
  NTC-PAY-022  Beneficiary IFSC invalid → reject before debit

Net Banking
  NTC-NB-030   Concurrent session attempt → blocked + audit
  NTC-NB-031   Funds-transfer to closed account → reject + reason

Loans
  NTC-LN-040   Zero tenure → validation error
  NTC-LN-041   Repo rate change mid-month → recalculation correct

Mobile
  NTC-MB-050   Biometric fail → MPIN fallback succeeds
  NTC-MB-051   Token spoofed audience → rejected at gateway`;

  const sanitySuite = `# Sanity Test Suite — ${selectedProject.name}

Pre-deploy smoke pack (executes in < 6 minutes):
  S-1   UPI: send ₹10 → success in <2s
  S-2   Cards: ₹100 auth via test card → approved
  S-3   NEFT: small batch (10 txns) → settled within window
  S-4   RTGS: single transaction settles in active window
  S-5   Mobile: login → balance refresh → logout
  S-6   Net Banking: funds transfer ₹50 own-account → success
  S-7   Loans: EMI calculator returns expected amount
  S-8   Audit: control evidence pull returns rows for last 24h

If any step fails, the rollout is paused automatically.`;

  const e2ePack = `# End-to-End Test Pack — ${selectedProject.name}

Customer journeys validated end-to-end:

E-1  UPI customer journey
     Login → choose payee → confirm → debit → credit → notification
     (covers gateway, NPCI hop, ledger, notifications)

E-2  Cards journey
     Card-on-file tokenization → 3DS → auth → settlement → reconciliation

E-3  NEFT/RTGS journey
     Beneficiary management → submit → screen → batch → settle → notify

E-4  Loans journey
     Eligibility → offer → accept → disburse → first EMI

E-5  Mobile journey
     Onboarding → KYC → first txn → biometric login → push notification

E-6  Net Banking journey
     Login → funds transfer → bill payment → statement download

Each journey emits trace IDs that are picked up by the Audit Copilot
evidence pull.`;

  return (
    <CopilotSection
      title="Testing Copilot"
      sourceHub="ai-copilot"
      sourceLabel="Testing Copilot"
      analyzedSubtitle={`AI analyzed test coverage and failure history across UPI, Cards, Payments, Loans, Mobile and Net Banking, then generated executable test cases, surfaced regression coverage and listed missing scenarios on ${selectedProject.name}.`}
      analyzedScope={[
        '6 test suites',
        `${TEST_CASES.length} test cases generated`,
        `${MISSING_SCENARIOS.length} missing scenarios`,
      ]}
      findingsTitle="Testing Findings · Coverage Gaps"
      primarySlot={<GeneratedTestCasesCard />}
      findings={findings}
      recommendations={recommendations}
      generationActions={[
        { id: 'test-cases', label: 'Generate Test Cases', artifactName: 'Test_Cases.xlsx', icon: ScienceIcon, generatedBy: 'Testing AI', preview: testCasesArtifact },
        { id: 'regression-pack', label: 'Generate Regression Plan', artifactName: 'Regression_Plan.docx', icon: ChecklistIcon, generatedBy: 'Testing AI', preview: regressionPack },
        { id: 'sanity-suite', label: 'Generate Sanity Suite', artifactName: 'Sanity_Test_Suite.docx', icon: BlockIcon, generatedBy: 'Testing AI', preview: sanitySuite },
        { id: 'performance-tests', label: 'Generate Performance Test Plan', artifactName: 'Performance_Test_Plan.docx', icon: SpeedIcon, generatedBy: 'Testing AI', preview: performanceTests },
        { id: 'e2e-pack', label: 'Generate End-to-End Test Pack', artifactName: 'E2E_Test_Pack.docx', icon: AccountTreeIcon, generatedBy: 'Testing AI', preview: e2ePack },
        { id: 'uat-scenarios', label: 'Generate UAT Scenarios', artifactName: 'UAT_Scenarios.docx', icon: GroupIcon, generatedBy: 'Testing AI', preview: uatScenarios },
        { id: 'negative-tests', label: 'Generate Negative Test Cases', artifactName: 'Negative_Test_Cases.docx', icon: BlockIcon, generatedBy: 'Testing AI', preview: negativeTests },
      ]}
      suggestedActions={suggestedActions}
      initialArtifacts={[
        { actionId: 'test-cases', artifactName: 'Test_Cases.md', generatedAt: '09:40', generatedBy: 'Testing AI', preview: testCasesArtifact },
        { actionId: 'regression-pack', artifactName: 'Regression_Pack.md', generatedAt: '09:42', generatedBy: 'Testing AI', preview: regressionPack },
      ]}
      secondaryKpis={[
        { label: 'Test Cases', value: TEST_CASES.length },
        { label: 'Missing', value: MISSING_SCENARIOS.length },
        { label: 'Coverage', value: Math.round(REGRESSION_COVERAGE.reduce((s, r) => s + r.coverage, 0) / REGRESSION_COVERAGE.length), suffix: '%' },
        { label: 'Automation', value: 76, suffix: '%' },
      ]}
    />
  );
}
