import type { Artifact } from '../types/artifacts';
import { createArtifact } from './artifactBuilder';
import { createRunId, formatTimestamp } from './requirementArtifactFactory';

export { createRunId, formatTimestamp };

export interface ApprovedTestOption {
  id: string;
  label: string;
  feature: string;
}

export interface ReleaseIntake {
  releaseVersion: string;
  targetEnvironment: string;
  regressionSuiteId: string;
}

export const approvedRegressionOptions: ApprovedTestOption[] = [
  { id: 'reg-upi', label: 'Regression_Suite.xlsx — UPI Limit Enhancement', feature: 'UPI Limit Enhancement' },
  { id: 'reg-settlement', label: 'Regression_Suite.xlsx — Merchant Auto Settlement', feature: 'Merchant Auto Settlement' },
  { id: 'reg-mandate', label: 'Regression_Suite.xlsx — Recurring Mandate Upgrade', feature: 'Recurring Mandate Upgrade' },
];

export const targetEnvironmentOptions = [
  { value: 'sit', label: 'SIT' },
  { value: 'uat', label: 'UAT' },
  { value: 'preprod', label: 'Pre-Production' },
  { value: 'prod', label: 'Production' },
];

type ComboKey =
  | 'reg-upi|sit' | 'reg-upi|uat' | 'reg-upi|preprod' | 'reg-upi|prod'
  | 'reg-settlement|sit' | 'reg-settlement|uat' | 'reg-settlement|preprod' | 'reg-settlement|prod'
  | 'reg-mandate|sit' | 'reg-mandate|uat' | 'reg-mandate|preprod' | 'reg-mandate|prod';

interface ArtifactTemplate {
  name: (version: string) => string;
  fileType: Artifact['fileType'];
  approvalStatus: Artifact['approvalStatus'];
  generatedBy: string;
  modelUsed: string;
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  executiveSummary: (version: string, env: string) => string;
  keyFindings: (version: string, env: string, suite: string) => string;
  recommendations: (version: string, env: string) => string;
  metadata: (version: string, env: string, suite: string) => string;
  previewContent: (version: string, env: string) => string;
  changeSummary: (version: string) => string;
}

const TEMPLATES: Record<ComboKey, ArtifactTemplate[]> = {
  'reg-upi|sit': [
    { name: (v) => `UPI_${v}_SIT_Deployment_Plan.docx`, fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'Payments SIT Engineering', modelUsed: 'deterministic-release-intake-v3', riskRating: 'Medium',
      executiveSummary: (v, e) => `SIT deployment plan for UPI ${v} in ${e} with ordered rollout and synthetic validation.`,
      keyFindings: () => '- Service dependency order validated.\n- Fraud/NPCI simulator checks passed.\n- No P1 blockers.',
      recommendations: () => '- Deploy gateway before limit service.\n- Run 20 synthetic probes before sign-off.',
      metadata: (v, e, s) => `Release=${v}\nEnvironment=${e}\nSuite=${s}\nOwner=Payments SIT Engineering`,
      previewContent: (v) => `SIT DEPLOYMENT PLAN\nRelease ${v}\nT-30 prechecks\nT deploy\nT+15 smoke validation`,
      changeSummary: (v) => `Built deterministic SIT deployment plan for UPI ${v}.` },
    { name: (v) => `UPI_${v}_SIT_Readiness_Report.docx`, fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'Release QA Governance', modelUsed: 'deterministic-release-intake-v3', riskRating: 'Low',
      executiveSummary: (v) => `Readiness assessment for UPI ${v} SIT exit.`,
      keyFindings: () => '- Critical tests 100% complete.\n- Defect backlog clear for release gates.',
      recommendations: () => '- Approve UAT handoff.\n- Archive evidence pack.',
      metadata: (v, e, s) => `Gate=SIT Exit\nRelease=${v}\nEnv=${e}\nSuite=${s}`,
      previewContent: () => 'READINESS REPORT\nTest closure\nDefect summary\nGate decision: PASS',
      changeSummary: (v) => `Generated SIT readiness report for UPI ${v}.` },
    { name: (v) => `UPI_${v}_SIT_Checklist.xlsx`, fileType: 'xlsx', approvalStatus: 'Draft', generatedBy: 'Release Coordinator', modelUsed: 'deterministic-release-intake-v3', riskRating: 'Low',
      executiveSummary: (v) => `Execution checklist for UPI ${v} SIT release cycle.`,
      keyFindings: () => '- 26 checklist rows mapped to owners.\n- Remaining actions are documentation-only.',
      recommendations: () => '- Close pending docs before UAT promotion.',
      metadata: (v, e, s) => `Checklist=UPI-SIT-${v}\nEnv=${e}\nSuite=${s}\nRows=26`,
      previewContent: () => 'Sheet: SIT_Gates\n1 Backup\n2 Deploy\n...\n26 Evidence archive',
      changeSummary: (v) => `Prepared SIT checklist for UPI ${v}.` },
  ],
  'reg-upi|uat': [
    { name: (v) => `UPI_${v}_UAT_Cutover_Plan.docx`, fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'Release Manager', modelUsed: 'deterministic-release-intake-v3', riskRating: 'Medium',
      executiveSummary: (v, e) => `UAT cutover plan for UPI ${v} in ${e} with business acceptance gating.`,
      keyFindings: () => '- UAT parity checks complete.\n- Business scenario suite mapped by owner.',
      recommendations: () => '- Freeze changes 2h pre-cutover.\n- Execute business checks at T+20.',
      metadata: (v, e, s) => `Release=${v}\nEnv=${e}\nSuite=${s}\nDecision Body=UAT CAB`,
      previewContent: () => 'UAT CUTOVER PLAN\nFreeze\nDeploy\nBusiness validation\nSign-off',
      changeSummary: (v) => `Created UAT cutover plan for UPI ${v}.` },
    { name: (v) => `UPI_${v}_UAT_GoNoGo_Brief.docx`, fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'CAB Delegate', modelUsed: 'deterministic-release-intake-v3', riskRating: 'Medium',
      executiveSummary: (v) => `Go/No-Go brief for UPI ${v} UAT promotion.`,
      keyFindings: () => '- Rollback rehearsal passed.\n- Medium risk on notification lag.',
      recommendations: () => '- GO with lag-monitoring condition.',
      metadata: (v, e, s) => `Brief=UPI-UAT-GNG-${v}\nEnv=${e}\nSuite=${s}`,
      previewContent: () => 'GO/NO-GO BRIEF\nDecision\nConditions\nApprovals',
      changeSummary: (v) => `Prepared UAT go/no-go brief for UPI ${v}.` },
    { name: (v) => `UPI_${v}_UAT_Risk_Register.xlsx`, fileType: 'xlsx', approvalStatus: 'Draft', generatedBy: 'Release Risk Analyst', modelUsed: 'deterministic-release-intake-v3', riskRating: 'Medium',
      executiveSummary: (v) => `Risk register for UPI ${v} UAT cycle.`,
      keyFindings: () => '- 5 active risks tracked.\n- No unresolved high risks.',
      recommendations: () => '- Review register every 2h during cutover.',
      metadata: (v, e, s) => `Register=UPI-UAT-RISK-${v}\nEnv=${e}\nSuite=${s}`,
      previewContent: () => 'Sheet: UAT_Risks\nR1 callback lag\nR2 synthetic alert flaps\n...',
      changeSummary: (v) => `Compiled UAT risk register for UPI ${v}.` },
  ],
  'reg-upi|preprod': [
    { name: (v) => `UPI_${v}_PreProd_Runbook.docx`, fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'PreProd Operations', modelUsed: 'deterministic-release-intake-v3', riskRating: 'High',
      executiveSummary: (v) => `Production-parity preprod runbook for UPI ${v}.`,
      keyFindings: () => '- Irreversible DB steps gated.\n- End-to-end probes include CBS/NPCI/fraud chain.',
      recommendations: () => '- Require dual-operator confirmation on irreversible steps.',
      metadata: (v, e, s) => `Runbook=UPI-PREPROD-${v}\nEnv=${e}\nSuite=${s}`,
      previewContent: () => 'PREPROD RUNBOOK\nPrecheck\nMigrate\nDeploy\nValidate\nRollback checkpoint',
      changeSummary: (v) => `Generated preprod runbook for UPI ${v}.` },
    { name: (v) => `UPI_${v}_PreProd_Monitoring_Plan.docx`, fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'SRE Validation', modelUsed: 'deterministic-release-intake-v3', riskRating: 'Medium',
      executiveSummary: (v) => `Monitoring and alerting plan for UPI ${v} preprod.`,
      keyFindings: () => '- KPI dashboards complete.\n- One queue-depth threshold missing.',
      recommendations: () => '- Add queue-depth alert at 250 events.',
      metadata: (v, e, s) => `Plan=MON-UPI-${v}\nEnv=${e}\nSuite=${s}`,
      previewContent: () => 'MONITORING PLAN\nKPI list\nThresholds\nEscalation map',
      changeSummary: (v) => `Prepared preprod monitoring plan for UPI ${v}.` },
    { name: (v) => `UPI_${v}_PreProd_Approval_Pack.docx`, fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'Release Governance PMO', modelUsed: 'deterministic-release-intake-v3', riskRating: 'Medium',
      executiveSummary: (v) => `Preprod approval pack for UPI ${v} production gate.`,
      keyFindings: () => '- Security/QA/Ops evidence attached.\n- One open tuning action.',
      recommendations: () => '- Close tuning evidence before production vote.',
      metadata: (v, e, s) => `Pack=APP-UPI-${v}\nEnv=${e}\nSuite=${s}`,
      previewContent: () => 'APPROVAL PACK\nEvidence index\nOpen actions\nSign-off table',
      changeSummary: (v) => `Compiled preprod approval pack for UPI ${v}.` },
  ],
  'reg-upi|prod': [
    { name: (v) => `UPI_${v}_Production_Command_Plan.docx`, fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'Release Command Center', modelUsed: 'deterministic-release-intake-v3', riskRating: 'High',
      executiveSummary: (v) => `Production command plan for UPI ${v} with staged traffic ramp.`,
      keyFindings: () => '- Readiness gates complete except CAB final vote.\n- Rollback RTO validated at 15 minutes.',
      recommendations: () => '- Ramp 10% -> 50% -> 100% with stop criteria.',
      metadata: (v, e, s) => `CommandPlan=PROD-UPI-${v}\nEnv=${e}\nSuite=${s}`,
      previewContent: () => 'PRODUCTION COMMAND PLAN\n00:00 deploy\n00:20 10%\n00:40 50%\n01:00 100%',
      changeSummary: (v) => `Prepared production command plan for UPI ${v}.` },
    { name: (v) => `UPI_${v}_Production_Rollback_Runbook.docx`, fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'DevOps SRE', modelUsed: 'deterministic-release-intake-v3', riskRating: 'High',
      executiveSummary: (v) => `Production rollback runbook for UPI ${v} with trigger matrix.`,
      keyFindings: () => '- Triggers mapped to p95, error rate, callback lag.\n- Data consistency checks included.',
      recommendations: () => '- Rehearse rollback decision at T-30.',
      metadata: (v, e, s) => `Rollback=RBK-UPI-${v}\nEnv=${e}\nSuite=${s}`,
      previewContent: () => 'ROLLBACK RUNBOOK\nTrigger matrix\nExecution steps\nPost checks',
      changeSummary: (v) => `Generated production rollback runbook for UPI ${v}.` },
    { name: (v) => `UPI_${v}_Production_Validation_Report.docx`, fileType: 'docx', approvalStatus: 'Draft', generatedBy: 'Release QA', modelUsed: 'deterministic-release-intake-v3', riskRating: 'Medium',
      executiveSummary: (v) => `Production validation report for UPI ${v} first-hour checks.`,
      keyFindings: () => '- Probe set covers transaction, notification, reconciliation.\n- KPI baseline captured.',
      recommendations: () => '- Validate at T+10, T+30, T+60 checkpoints.',
      metadata: (v, e, s) => `Validation=VAL-UPI-${v}\nEnv=${e}\nSuite=${s}`,
      previewContent: () => 'VALIDATION REPORT\nCheckpoint outcomes\nKPI deltas\nFinal health',
      changeSummary: (v) => `Prepared production validation report for UPI ${v}.` },
  ],
  'reg-settlement|sit': [],
  'reg-settlement|uat': [],
  'reg-settlement|preprod': [],
  'reg-settlement|prod': [],
  'reg-mandate|sit': [],
  'reg-mandate|uat': [],
  'reg-mandate|preprod': [],
  'reg-mandate|prod': [],
};

// Populate non-UPI combinations with deterministic suite-specific sets.
(['reg-settlement', 'reg-mandate'] as const).forEach((suiteId) => {
  const feature = suiteId === 'reg-settlement' ? 'Merchant Settlement' : 'Mandate Upgrade';
  (['sit', 'uat', 'preprod', 'prod'] as const).forEach((env) => {
    const k = `${suiteId}|${env}` as ComboKey;
    TEMPLATES[k] = [
      { name: (v) => `${feature.replace(/\s+/g, '_')}_${v}_${env.toUpperCase()}_Deployment_Plan.docx`, fileType: 'docx', approvalStatus: env === 'prod' ? 'Pending Review' : 'Draft', generatedBy: `${feature} Release Engineering`, modelUsed: 'deterministic-release-intake-v3', riskRating: env === 'prod' || env === 'preprod' ? 'High' : 'Medium',
        executiveSummary: (v, e) => `${feature} ${v} deployment plan for ${e}.`,
        keyFindings: () => '- Ordered rollout sequence validated.\n- Integration checkpoints defined.\n- Regression suite coverage complete.',
        recommendations: () => '- Execute staged deployment with live KPI monitoring.\n- Enforce stop-go checkpoints at each phase.',
        metadata: (v, e, s) => `Release=${v}\nEnv=${e}\nSuite=${s}\nOwner=${feature} Release Engineering`,
        previewContent: (v, e) => `${e.toUpperCase()} DEPLOYMENT PLAN\nFeature=${feature}\nRelease=${v}\nPhases: Precheck, Deploy, Validate`,
        changeSummary: (v) => `Created ${env.toUpperCase()} deployment plan for ${feature} ${v}.` },
      { name: (v) => `${feature.replace(/\s+/g, '_')}_${v}_${env.toUpperCase()}_Readiness_or_Gate_Report.docx`, fileType: 'docx', approvalStatus: 'Pending Review', generatedBy: 'Release Governance', modelUsed: 'deterministic-release-intake-v3', riskRating: env === 'prod' ? 'High' : 'Medium',
        executiveSummary: (v, e) => `${feature} ${v} gate report for ${e} release decision.`,
        keyFindings: () => '- Gate criteria scored and documented.\n- Open actions captured with owners.',
        recommendations: () => '- Proceed on condition of open action closure.\n- Keep release bridge active for first cycle.',
        metadata: (v, e, s) => `GateReport=${feature}-${e}-${v}\nSuite=${s}\nDecisionBody=CAB`,
        previewContent: () => 'GATE REPORT\nReadiness score\nOpen actions\nDecision recommendation',
        changeSummary: (v) => `Generated gate report for ${feature} ${v}.` },
      { name: (v) => `${feature.replace(/\s+/g, '_')}_${v}_${env.toUpperCase()}_Execution_Checklist.xlsx`, fileType: 'xlsx', approvalStatus: 'Draft', generatedBy: 'Release Coordinator', modelUsed: 'deterministic-release-intake-v3', riskRating: 'Low',
        executiveSummary: (v, e) => `${feature} ${v} ${e} execution checklist with owner-tracked tasks.`,
        keyFindings: () => '- 20+ action rows with accountability.\n- Remaining tasks non-critical.',
        recommendations: () => '- Close all pending rows before handoff.',
        metadata: (v, e, s) => `Checklist=${feature}-${e}-${v}\nSuite=${s}\nRows=22`,
        previewContent: () => 'Sheet: Execution_Gates\n1 Backup\n2 Deploy\n...\n22 Evidence close',
        changeSummary: (v) => `Prepared execution checklist for ${feature} ${v}.` },
    ];
  });
});

export function buildReleaseArtifacts(intake: ReleaseIntake, runId: string): Artifact[] {
  const version = intake.releaseVersion.trim();
  const regression = approvedRegressionOptions.find((o) => o.id === intake.regressionSuiteId);
  const env = targetEnvironmentOptions.find((o) => o.value === intake.targetEnvironment);
  if (!version || !regression || !env) {
    throw new Error(`Unsupported Release Intake combination: version="${intake.releaseVersion}", environment="${intake.targetEnvironment}", regressionSuite="${intake.regressionSuiteId}".`);
  }

  const combo = `${regression.id}|${env.value}` as ComboKey;
  const defs = TEMPLATES[combo];
  if (!defs || defs.length === 0) {
    throw new Error(`Unsupported Release Intake combination: ${combo}`);
  }

  return defs.map((d, i) =>
    createArtifact({
      id: `${runId}-${i + 1}`,
      name: d.name(version),
      generatedBy: d.generatedBy,
      modelUsed: d.modelUsed,
      fileType: d.fileType,
      approvalStatus: d.approvalStatus,
      riskRating: d.riskRating,
      executiveSummary: d.executiveSummary(version, env.label),
      previewContent: d.previewContent(version, env.label),
      sections: [
        { title: 'Key Findings', content: d.keyFindings(version, env.label, regression.label) },
        { title: 'Recommendations', content: d.recommendations(version, env.label) },
        { title: 'Metadata', content: d.metadata(version, env.label, regression.label) },
      ],
      changeSummary: d.changeSummary(version),
      context: { feature: regression.feature, domain: env.label },
    }),
  );
}

export function getDemoReleaseArtifacts(): Artifact[] {
  return buildReleaseArtifacts(
    { releaseVersion: '24.6', targetEnvironment: 'prod', regressionSuiteId: 'reg-upi' },
    'DEMO-REL',
  );
}
