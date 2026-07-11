import type { Artifact } from '../types/artifacts';
import { createArtifact } from './artifactBuilder';

const RELEASE_PROMPTS = [
  'Assess go-live readiness for UPI Release 24.6',
  'Generate deployment plan for merchant settlement',
  'Build rollback plan for biometric login release',
  'Produce go/no-go recommendation for payments release',
] as const;

type ReleasePrompt = (typeof RELEASE_PROMPTS)[number];

interface ReleaseArtifactDef {
  name: string;
  fileType: Artifact['fileType'];
  approvalStatus: Artifact['approvalStatus'];
  riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  generatedBy: string;
  modelUsed: string;
  executiveSummary: string;
  keyFindings: string;
  recommendations: string;
  previewContent: string;
  metadata: string;
  changeSummary: string;
}

function key(prompt: string): string {
  return prompt.trim().toLowerCase();
}

const SCENARIOS: Record<ReleasePrompt, ReleaseArtifactDef[]> = {
  'Assess go-live readiness for UPI Release 24.6': [
    {
      name: 'UPI_24_6_GoLive_Readiness_Report.docx',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'Medium',
      generatedBy: 'Release Management Office',
      modelUsed: 'deterministic-release-readiness-v1',
      executiveSummary: 'Readiness review for UPI Release 24.6 indicates controlled risk posture with two operational prerequisites before go-live.',
      keyFindings: '- SIT/UAT coverage at 98.4% with all P1 defects closed.\n- NPCI callback timeout spikes observed at peak synthetic load window.\n- Rollback automation validated in staging with 11-minute recovery.',
      recommendations: '- Complete callback timeout tuning and rerun 2-hour soak test.\n- Keep CAB window extended by 30 minutes for live verification.\n- Assign on-call fraud analyst for first post-release cycle.',
      metadata: 'Release: UPI 24.6\nCAB: CAB-REL-7812\nWindow: 23:30-01:00 IST\nOwner: Payments Release Lead',
      previewContent: 'GO-LIVE READINESS REPORT\nScope: UPI Release 24.6\nReadiness Dimensions: test closure, infrastructure, monitoring, rollback, compliance\nOverall score: 92/100\nOpen risks: 2 medium\nDecision: Ready with conditions',
      changeSummary: 'Compiled readiness evidence and release gate status for UPI 24.6.',
    },
    {
      name: 'UPI_24_6_Production_Checklist.xlsx',
      fileType: 'xlsx',
      approvalStatus: 'Draft',
      riskRating: 'Low',
      generatedBy: 'Release Operations',
      modelUsed: 'deterministic-release-checklist-v1',
      executiveSummary: 'Production checklist with pre-cutover, cutover, and post-cutover validation gates for UPI 24.6.',
      keyFindings: '- 34/36 pre-cutover tasks complete.\n- Pending: NPCI synthetic probe baseline and alert route confirmation.\n- Post-cutover validation sequence finalized for 15 business transactions.',
      recommendations: '- Close remaining two pre-cutover tasks before CAB lock.\n- Freeze non-critical config changes 6 hours before deployment.',
      metadata: 'Checklist ID: CHK-UPI-24.6\nTasks: 36\nCompleted: 34\nPending: 2',
      previewContent: 'Sheet: Pre-Cutover\n1 DB backup\n2 feature-flag freeze\n...\nSheet: Cutover\n1 deploy services\n2 run smoke suite\n...\nSheet: Post-Cutover\n1 transaction probes\n2 latency baseline verify',
      changeSummary: 'Generated production checklist workbook for UPI 24.6 cutover.',
    },
    {
      name: 'UPI_24_6_Monitoring_Validation_Plan.docx',
      fileType: 'docx',
      approvalStatus: 'Draft',
      riskRating: 'Medium',
      generatedBy: 'SRE Release Validation',
      modelUsed: 'deterministic-release-monitoring-v1',
      executiveSummary: 'Monitoring validation plan for UPI 24.6 defines release-hour observability checks and escalation triggers.',
      keyFindings: '- Required dashboards mapped to rollout phases.\n- Alert thresholds adjusted for expected traffic uplift.\n- Gap identified in callback lag anomaly alert.',
      recommendations: '- Add callback lag > 2s alert with P2 escalation.\n- Run dry-run alert simulation before CAB sign-off.',
      metadata: 'Environment: PROD\nDashboards: 7\nCritical Alerts: 12\nEscalation Policy: REL-PROD-P1',
      previewContent: 'MONITORING VALIDATION PLAN\nKPIs: p95 latency, error ratio, callback lag, reconcile queue depth\nValidation timeline: T-30m to T+180m\nEscalation tree: L1 NOC -> L2 SRE -> Release Commander',
      changeSummary: 'Prepared release-hour monitoring and escalation validation plan.',
    },
    {
      name: 'UPI_24_6_CAB_Approval_Pack.docx',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'Medium',
      generatedBy: 'CAB Secretariat',
      modelUsed: 'deterministic-release-cab-v1',
      executiveSummary: 'CAB approval pack consolidating readiness evidence, risk register, and go-live controls for UPI 24.6.',
      keyFindings: '- Risk register reduced from 7 to 2 active entries.\n- Security and compliance approvals attached.\n- Rollback rehearse evidence verified.',
      recommendations: '- Approve with condition: callback lag alert enabled before traffic ramp.\n- Require T+1 business impact review submission.',
      metadata: 'CAB Ref: CAB-REL-7812\nApprovers: CTO, Head of Payments, CISO delegate\nStatus: Pending final vote',
      previewContent: 'CAB APPROVAL PACK\nSections: readiness summary, risk register, rollback evidence, dependency matrix, decision log\nProposed decision: Conditional Go',
      changeSummary: 'Assembled CAB approval evidence package for release governance.',
    },
  ],
  'Generate deployment plan for merchant settlement': [
    {
      name: 'Merchant_Settlement_Deployment_Plan.docx',
      fileType: 'docx',
      approvalStatus: 'Draft',
      riskRating: 'Medium',
      generatedBy: 'Settlement Release Engineering',
      modelUsed: 'deterministic-deployment-plan-v2',
      executiveSummary: 'Detailed phased deployment plan for merchant settlement services across ingestion, netting, payout, and reconciliation components.',
      keyFindings: '- Deployment requires ordered rollout of 5 services and 3 schema migrations.\n- Blue-green strategy feasible for API tier; stateful components require rolling partitions.\n- GL adapter dependency introduces controlled cutover window constraint.',
      recommendations: '- Execute schema migrations in maintenance phase T-45m.\n- Use canary 15% traffic for payout API before full switch.',
      metadata: 'Program: Merchant Settlement\nCutover Window: 00:00-02:00 IST\nExecution Owner: Release Engineer (Settlement)',
      previewContent: 'DEPLOYMENT PLAN\nPhase 0 Pre-checks\nPhase 1 Schema migration\nPhase 2 Service rollout\nPhase 3 Traffic shift\nPhase 4 Validation\nPhase 5 Hypercare',
      changeSummary: 'Created deployment run plan for merchant settlement production rollout.',
    },
    {
      name: 'Merchant_Settlement_Cutover_Runbook.docx',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'High',
      generatedBy: 'Production Operations',
      modelUsed: 'deterministic-cutover-runbook-v1',
      executiveSummary: 'Minute-by-minute cutover runbook for merchant settlement with command ownership and rollback checkpoints.',
      keyFindings: '- 22 cutover commands mapped with owner and verification step.\n- Two irreversible steps identified and guarded with CAB checkpoint approvals.',
      recommendations: '- Require dual confirmation for irreversible migration commands.\n- Record all runbook steps in incident timeline tool.',
      metadata: 'Runbook ID: RBK-MSET-2026-07\nCritical Steps: 22\nIrreversible Steps: 2',
      previewContent: 'CUTOVER RUNBOOK\nT-30 Freeze writes\nT-20 Execute migration set A\nT-10 Deploy settlement-api v3.2\nT+05 Start reconciliation consumer\nT+15 Verify payout queue drain',
      changeSummary: 'Generated operational cutover runbook with sequenced execution gates.',
    },
    {
      name: 'Merchant_Settlement_Validation_Report.docx',
      fileType: 'docx',
      approvalStatus: 'Draft',
      riskRating: 'Low',
      generatedBy: 'Quality Engineering Release',
      modelUsed: 'deterministic-release-validation-v1',
      executiveSummary: 'Validation report defining post-deployment functional, data, and performance verification for merchant settlement.',
      keyFindings: '- 18/18 critical business probes passed in staging.\n- Reconciliation batch close time improved by 14% vs baseline.\n- Data lineage checks passed for all settlement events.',
      recommendations: '- Repeat top 6 probes at T+15 and T+60 in production.\n- Keep reconciliation team in war-room for first full cycle.',
      metadata: 'Validation Suite: VS-MSET-PRD\nCritical Probes: 18\nBaseline Build: 3.1.7',
      previewContent: 'VALIDATION REPORT\nFunctional probes\nData integrity checks\nPerformance comparatives\nSign-off matrix',
      changeSummary: 'Prepared release validation execution and expected outcomes report.',
    },
    {
      name: 'Merchant_Settlement_Risk_Assessment.docx',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'High',
      generatedBy: 'Release Risk Office',
      modelUsed: 'deterministic-release-risk-v1',
      executiveSummary: 'Risk assessment for merchant settlement deployment with mitigation ownership and residual risk acceptance notes.',
      keyFindings: '- Highest risk: delayed GL posting after schema migration.\n- Moderate risk: reconciliation lag under burst traffic.\n- Low risk: payout API throttling due to stale cache warmup.',
      recommendations: '- Activate GL posting fallback queue for first cycle.\n- Pre-warm cache with top 500 merchant IDs before traffic cutover.',
      metadata: 'Risk Register: RR-MSET-114\nHigh: 1\nMedium: 2\nLow: 3',
      previewContent: 'RISK ASSESSMENT\nRisk categories: data, operational, integration, performance\nMitigations and owners\nResidual risk decision: medium-high until T+1 cycle close',
      changeSummary: 'Compiled deployment risk assessment for CAB decision input.',
    },
  ],
  'Build rollback plan for biometric login release': [
    {
      name: 'Biometric_Login_Rollback_Runbook.docx',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'High',
      generatedBy: 'Identity Platform Reliability',
      modelUsed: 'deterministic-rollback-runbook-v2',
      executiveSummary: 'Authoritative rollback runbook for biometric login release with trigger matrix and time-bounded recovery actions.',
      keyFindings: '- Critical rollback trigger: auth failure rate > 3% for 5 minutes.\n- Session token revocation and fallback auth switch tested end-to-end.\n- Full rollback feasible within 14 minutes.',
      recommendations: '- Keep legacy auth path warm for 24 hours post-release.\n- Pre-authorize rollback decision authority to release commander + IAM lead.',
      metadata: 'Rollback ID: RBK-BIO-2026-07\nTarget RTO: 15 min\nRollback Type: controlled fallback to legacy auth',
      previewContent: 'ROLLBACK RUNBOOK\nTrigger conditions\nImmediate containment\nTraffic reroute to legacy auth\nToken revocation batch\nPost-rollback verification',
      changeSummary: 'Prepared primary rollback runbook for biometric release.',
    },
    {
      name: 'Biometric_Release_Fallback_Authentication_Plan.docx',
      fileType: 'docx',
      approvalStatus: 'Draft',
      riskRating: 'Medium',
      generatedBy: 'IAM Release Planning',
      modelUsed: 'deterministic-fallback-plan-v1',
      executiveSummary: 'Fallback authentication plan detailing OTP/password reactivation and policy overrides during biometric rollback.',
      keyFindings: '- Fallback path can absorb 1.8x expected peak load.\n- OTP provider SLA is adequate but requires priority channel tag.',
      recommendations: '- Enable fallback feature flag in read-only mode before release window.\n- Broadcast customer advisory if fallback exceeds 20 minutes.',
      metadata: 'Fallback Plan Ref: FP-BIO-009\nFallback Modes: OTP, Device PIN\nOwner: IAM Operations',
      previewContent: 'FALLBACK AUTH PLAN\nEnable auth_fallback flag\nRoute auth requests to legacy service\nEnforce temporary risk policies\nCommunicate support playbook',
      changeSummary: 'Created fallback authentication execution plan.',
    },
    {
      name: 'Biometric_Release_Recovery_Checklist.xlsx',
      fileType: 'xlsx',
      approvalStatus: 'Draft',
      riskRating: 'Low',
      generatedBy: 'Release Command Center',
      modelUsed: 'deterministic-recovery-checklist-v1',
      executiveSummary: 'Recovery checklist for validating service health and customer auth success after rollback execution.',
      keyFindings: '- Checklist contains 29 recovery tasks across IAM, mobile, and support teams.\n- Verification points mapped to monitoring panels and ticketing evidence.',
      recommendations: '- Enforce sign-off from IAM, SRE, and Support leads before closing rollback incident.',
      metadata: 'Checklist: RC-BIO-29\nTask Count: 29\nSign-off Roles: IAM, SRE, Support',
      previewContent: 'Sheet: Immediate Actions\nSheet: Service Validation\nSheet: Customer Journey Validation\nSheet: Communications and Closure',
      changeSummary: 'Generated rollback recovery task workbook.',
    },
    {
      name: 'Biometric_Rollback_Communication_Plan.docx',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'Medium',
      generatedBy: 'Production Communications',
      modelUsed: 'deterministic-comm-plan-v1',
      executiveSummary: 'Communication plan for internal stakeholders, support channels, and customer messaging during biometric rollback.',
      keyFindings: '- Internal escalation paths are complete for P1 and P2 scenarios.\n- Customer messaging templates approved in two languages.',
      recommendations: '- Trigger executive update at T+10 and T+30 if rollback remains active.\n- Sync contact center script with latest fallback policy.',
      metadata: 'Comms Plan: CP-BIO-77\nChannels: Incident Bridge, Status Page, Contact Center\nApprovals: Product + Legal',
      previewContent: 'COMMUNICATION PLAN\nAudience matrix\nMessage templates\nEscalation timelines\nClosure communication checklist',
      changeSummary: 'Prepared rollback communication and escalation plan.',
    },
  ],
  'Produce go/no-go recommendation for payments release': [
    {
      name: 'Payments_Go_NoGo_Recommendation_Report.docx',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'Medium',
      generatedBy: 'Enterprise Release Governance',
      modelUsed: 'deterministic-go-nogo-v2',
      executiveSummary: 'Go/No-Go recommendation report combining release readiness signals, risk posture, and dependency health across payments scope.',
      keyFindings: '- Readiness score 89/100 with all critical test gates passed.\n- Two medium dependencies remain open with mitigations documented.\n- Operational staffing plan approved for release night.',
      recommendations: '- Proceed with GO under conditional monitoring of dependency D-14 and D-27.\n- Require checkpoint review at T+45 minutes.',
      metadata: 'Decision Pack: GNG-PAY-2026-07\nRecommendation: GO (Conditional)\nPrepared For: Payments CAB',
      previewContent: 'GO/NO-GO RECOMMENDATION\nDecision factors: quality, ops readiness, dependency risk, rollback confidence\nFinal recommendation: GO with controls',
      changeSummary: 'Generated formal go/no-go recommendation report.',
    },
    {
      name: 'Payments_Release_Decision_Log.xlsx',
      fileType: 'xlsx',
      approvalStatus: 'Draft',
      riskRating: 'Low',
      generatedBy: 'Release PMO',
      modelUsed: 'deterministic-decision-log-v1',
      executiveSummary: 'Structured decision log tracking gate outcomes, owners, timestamped approvals, and exception notes for payments release.',
      keyFindings: '- 17 gate decisions recorded with complete owner traceability.\n- No unresolved P1 exceptions in decision log.',
      recommendations: '- Capture final CAB vote row immediately after approval call.\n- Lock workbook for audit after T+120.',
      metadata: 'Log ID: DL-PAY-410\nEntries: 17\nAudit Lock: Enabled at release close',
      previewContent: 'Sheet: Gate Decisions\nSheet: Exception Register\nSheet: Final Approval Record',
      changeSummary: 'Prepared release decision log workbook for governance audit.',
    },
    {
      name: 'Payments_CAB_Approval_Note.docx',
      fileType: 'docx',
      approvalStatus: 'Pending Review',
      riskRating: 'Medium',
      generatedBy: 'CAB Office',
      modelUsed: 'deterministic-cab-note-v1',
      executiveSummary: 'CAB approval note summarizing conditions, accepted risks, and mandatory validation checkpoints for payments release.',
      keyFindings: '- CAB accepted medium-risk items with explicit mitigation owners.\n- Security and compliance delegates endorsed release controls.',
      recommendations: '- Enforce hard stop if callback lag exceeds agreed threshold during launch.\n- Submit post-release evidence pack within 24 hours.',
      metadata: 'CAB Note: CAB-PAY-1459\nVote: 7 approve / 1 conditional\nConditions: 3',
      previewContent: 'CAB APPROVAL NOTE\nDecision summary\nCondition list\nAccepted risk items\nApproval signatures',
      changeSummary: 'Drafted CAB decision note with conditional controls.',
    },
    {
      name: 'Payments_Release_Monitoring_and_Hypercare_Plan.docx',
      fileType: 'docx',
      approvalStatus: 'Draft',
      riskRating: 'Medium',
      generatedBy: 'SRE Hypercare Team',
      modelUsed: 'deterministic-hypercare-plan-v1',
      executiveSummary: 'Monitoring and hypercare plan for first 48 hours after payments release with operational command model and KPI thresholds.',
      keyFindings: '- Hypercare staffing roster complete across SRE, payments ops, and fraud teams.\n- Alert thresholds tuned for expected 12% traffic increase.',
      recommendations: '- Keep hourly health review cadence for first 8 hours.\n- Maintain command bridge until all critical KPIs stabilize.',
      metadata: 'Hypercare Ref: HC-PAY-2026-07\nDuration: 48h\nWar Room: Active',
      previewContent: 'MONITORING & HYPERCARE PLAN\nKPI watchlist\nAlert thresholds\nEscalation path\nShift roster\nExit criteria',
      changeSummary: 'Prepared post-go-live monitoring and hypercare execution plan.',
    },
  ],
};

export function supportedReleasePrompts(): string[] {
  return [...RELEASE_PROMPTS];
}

export function getDeterministicReleaseArtifacts(prompt: string, runId: string): Artifact[] {
  const normalized = key(prompt);
  const matchedPrompt = RELEASE_PROMPTS.find((p) => key(p) === normalized);
  if (!matchedPrompt) {
    throw new Error(
      `Unsupported Release prompt: "${prompt}". Supported prompts: ${RELEASE_PROMPTS.join(' | ')}`,
    );
  }

  return SCENARIOS[matchedPrompt].map((artifact, idx) =>
    createArtifact({
      id: `rel-${runId}-${idx + 1}`,
      name: artifact.name,
      generatedBy: artifact.generatedBy,
      modelUsed: artifact.modelUsed,
      fileType: artifact.fileType,
      approvalStatus: artifact.approvalStatus,
      riskRating: artifact.riskRating,
      executiveSummary: artifact.executiveSummary,
      previewContent: artifact.previewContent,
      sections: [
        { title: 'Key Findings', content: artifact.keyFindings },
        { title: 'Recommendations', content: artifact.recommendations },
        { title: 'Metadata', content: artifact.metadata },
      ],
      changeSummary: artifact.changeSummary,
      context: { subject: matchedPrompt, domain: 'Release' },
    }),
  );
}
