import { Box, Chip, Typography } from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import GavelIcon from '@mui/icons-material/Gavel';
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import RuleIcon from '@mui/icons-material/Rule';
import PolicyIcon from '@mui/icons-material/Policy';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import { GlassCard } from '../common/GlassCard';
import { GaugeChart } from '../charts/GaugeChart';
import { colors } from '../../theme/colors';
import {
  CopilotSection,
  type CopilotFinding,
  type CopilotRecommendation,
  type CopilotSuggestedAction,
} from './CopilotSection';
import { useCopilot } from '../../context/CopilotContext';

type GoVerdict = 'Go' | 'Conditional Go' | 'No-Go';
const GO_COLOR: Record<GoVerdict, string> = {
  Go: colors.success,
  'Conditional Go': colors.warning,
  'No-Go': colors.critical,
};
const VERDICTS: GoVerdict[] = ['Go', 'Conditional Go', 'No-Go'];

// ---------------------------------------------------------------------------
// Release Copilot — Go / Conditional Go / No-Go recommendation
// ---------------------------------------------------------------------------
function ReleaseDecisionCard({
  score,
  recommendation,
  rationale,
  reasons,
  riskFactors,
  breakdown,
}: {
  score: number;
  recommendation: GoVerdict;
  rationale: string;
  reasons: string[];
  riskFactors: string[];
  breakdown: [string, number][];
}) {
  return (
    <GlassCard sx={{ p: 2 }} glow="purple">
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, mb: 1 }}>AI Release Recommendation</Typography>
      <Box sx={{ textAlign: 'center' }}>
        <GaugeChart value={score} label="Readiness" size={150} />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
        {VERDICTS.map((v) => {
          const active = v === recommendation;
          return (
            <Box
              key={v}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.75, px: 1, py: 0.6, borderRadius: 1.5,
                border: `1px solid ${active ? GO_COLOR[v] : colors.border.subtle}`,
                bgcolor: active ? `${GO_COLOR[v]}1f` : 'transparent',
              }}
            >
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: GO_COLOR[v] }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: active ? 800 : 500, color: active ? GO_COLOR[v] : colors.text.secondary }}>
                {v.toUpperCase()}
              </Typography>
              {active && (
                <Chip label="AI Recommended" size="small" sx={{ height: 16, fontSize: '0.55rem', ml: 'auto', bgcolor: `${GO_COLOR[v]}26`, color: GO_COLOR[v] }} />
              )}
            </Box>
          );
        })}
      </Box>
      <Typography sx={{ fontSize: '0.64rem', color: colors.text.secondary, mt: 1, lineHeight: 1.45 }}>{rationale}</Typography>

      <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.success, mt: 1 }}>Reasons</Typography>
      {reasons.map((r) => (
        <Typography key={r} sx={{ fontSize: '0.62rem', color: colors.text.secondary, lineHeight: 1.4, ml: 0.75 }}>
          • {r}
        </Typography>
      ))}

      <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: colors.critical, mt: 1 }}>Risk Factors</Typography>
      {riskFactors.map((r) => (
        <Typography key={r} sx={{ fontSize: '0.62rem', color: colors.text.secondary, lineHeight: 1.4, ml: 0.75 }}>
          • {r}
        </Typography>
      ))}

      <Box sx={{ mt: 1 }}>
        {breakdown.map(([label, value]) => (
          <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.35, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography sx={{ fontSize: '0.64rem', color: colors.text.secondary }}>{label}</Typography>
            <Typography sx={{ fontSize: '0.64rem', fontWeight: 700 }}>{value}%</Typography>
          </Box>
        ))}
      </Box>
    </GlassCard>
  );
}

export function ReleaseCopilotPanel() {
  const { releaseReadiness } = useCopilot();
  const r = releaseReadiness;
  const recommendation = (['Go', 'Conditional Go', 'No-Go'] as GoVerdict[]).includes(r.recommendation as GoVerdict)
    ? (r.recommendation as GoVerdict)
    : 'Conditional Go';

  const findings: CopilotFinding[] = [
    { id: 'rel-1', badge: 'Cards · Defect', severity: 'high', title: 'One open Sev2 defect in the 3DS challenge flow', detail: 'Card-on-file authorizations can stall on abandoned 3DS; fix is in test but not yet verified.' },
    { id: 'rel-2', badge: 'Payments · Performance', severity: 'high', title: 'Load test peaked at 3,800 TPS vs 5,000 TPS target', detail: 'NEFT/RTGS gateway has not demonstrated peak-day headroom.' },
    { id: 'rel-3', badge: 'Net Banking · Rollback', severity: 'medium', title: 'Rollback playbook not rehearsed for this release', detail: 'DB migration is forward-only; no verified down-path for funds-transfer schema changes.' },
    { id: 'rel-4', badge: 'Loans · Sign-off', severity: 'medium', title: 'Rate-change config pending business sign-off', detail: 'Floating-rate parameters require Treasury approval before go-live.' },
    { id: 'rel-5', badge: 'UPI · Gates', severity: 'info', title: 'All UPI quality and security gates are green', detail: 'Coverage, SAST, DAST and performance gates passed for the UPI scope.' },
  ];

  const recommendations: CopilotRecommendation[] = [
    { id: 'rel-r1', badge: 'Cards', title: 'Gate the Cards scope behind the Sev2 3DS fix verification', rationale: 'Release UPI/Mobile now; hold Cards until the defect is confirmed fixed.', impact: 'Avoids a known auth-failure in production' },
    { id: 'rel-r2', badge: 'Payments', title: 'Re-run the 5,000 TPS soak test before enabling RTGS at peak', rationale: 'Confirm headroom or enable a throttle for day-one.', impact: 'Protects peak-day settlement SLA' },
    { id: 'rel-r3', badge: 'Net Banking', title: 'Rehearse rollback in staging and attach evidence', rationale: 'A verified down-path is a release gate for schema changes.', impact: 'Recovery time de-risked' },
  ];

  const suggestedActions: CopilotSuggestedAction[] = [
    { id: 'rel-a1', priority: 'P1', owner: 'Release Manager', label: `Record AI verdict "${recommendation}" in the change record`, detail: 'Attach the generated Go/No-Go memo to the CAB ticket.' },
    { id: 'rel-a2', priority: 'P1', owner: 'Cards Release Lead', label: 'Split the Cards scope out of this release train', detail: 'Ship once the Sev2 3DS fix is verified.' },
    { id: 'rel-a3', priority: 'P2', owner: 'Performance Lead', label: 'Schedule the 5,000 TPS Payments soak test', detail: 'Pre-condition for enabling RTGS at peak volume.' },
    { id: 'rel-a4', priority: 'P2', owner: 'SRE', label: 'Rehearse and evidence the Net Banking rollback', detail: 'Required before approving the forward-only migration.' },
  ];

  const reasons: string[] = [
    'UPI and Mobile Banking gates are fully green (coverage, SAST, DAST, performance).',
    `Release readiness ${r.releaseReadinessScore}% — above the AI conditional-go threshold (60%).`,
    `Rollback readiness ${r.rollbackReadinessScore}% — recovery path documented.`,
  ];
  const riskFactors: string[] = [
    'Cards: Sev2 defect open in the 3DS challenge flow.',
    'Payments: 5,000 TPS soak test not re-run; RTGS peak headroom unverified.',
    'Net Banking: rollback playbook not rehearsed for the forward-only schema migration.',
    `Production risk ${r.productionRiskScore}% · Defect risk ${r.defectRiskScore}% · Audit risk ${r.auditRiskScore}%.`,
  ];

  const cabPack = `# CAB Pack — ${r.projectName}

CHANGE SUMMARY
  • Scope: UPI auto-refund, Cards 3DS, NEFT idempotency, Mobile biometric fallback.
  • AI Verdict: ${recommendation.toUpperCase()} (Readiness ${r.releaseReadinessScore}%)

REASONS FOR VERDICT
${reasons.map((x) => `  • ${x}`).join('\n')}

RISK FACTORS
${riskFactors.map((x) => `  • ${x}`).join('\n')}

GATES
  Quality .......... ${r.releaseReadinessScore}%
  Production Risk .. ${r.productionRiskScore}%
  Defect Risk ...... ${r.defectRiskScore}%
  Audit Risk ....... ${r.auditRiskScore}%
  Rollback ......... ${r.rollbackReadinessScore}%

CAB DECISION REQUIRED
  Approve ${recommendation.toUpperCase()} per AI recommendation, or override with rationale.`;

  const goLiveChecklist = `# Go-Live Checklist — ${r.projectName}

T-24h
  □ Final regression pack green
  □ DR + rollback rehearsed and signed off
  □ On-call schedule confirmed (Payments, Cards, Mobile, Net Banking)
  □ Customer comms drafted (UPI auto-refund, biometric fallback)

T-2h
  □ Feature flags staged (UPI, Cards held)
  □ Canary cohort selected
  □ Synthetic monitoring pre-warmed

GO-LIVE
  □ Canary 5% UPI → health gate green → 25% → 100%
  □ Cards held until Sev2 3DS verification clears
  □ Watch error budget for 60 min post-promotion

T+24h
  □ Stakeholder readout
  □ Defect intelligence pass
  □ Update Production Intelligence runbook`;

  const rollbackPlan = `# Rollback Plan — ${r.projectName}

1. Disable feature flags (UPI auto-refund, Mobile biometric fallback).
2. Re-point gateway to N-1 deployment for Cards and Payments.
3. Restore Net Banking schema snapshot (forward-only migration captured pre-deploy).
4. Verify smoke pack: funds-transfer, balance, UPI P2P, card auth.
5. Communicate status (CAB, Operations, Customer Care).

RTO target: 30 minutes · RPO: zero customer-data loss (snapshot + journaled).`;

  const readinessReport = `# Release Readiness Report — ${r.projectName}

AI Verdict: ${recommendation.toUpperCase()}
Readiness Score: ${r.releaseReadinessScore}%

Per-scope decision
  • UPI / Mobile Banking ....... GO (all gates green)
  • Cards ...................... HOLD (open Sev2 in 3DS flow)
  • Payments (RTGS peak) ....... CONDITIONAL (re-run 5,000 TPS soak)
  • Net Banking ................ CONDITIONAL (rehearse rollback)
  • Loans ...................... CONDITIONAL (Treasury sign-off)

Quality gates : pass
Performance   : 3,800 / 5,000 TPS — re-run pending
Security      : pass · DAST clean
Audit         : 1 evidence gap (Cards ASV scan)
Rollback      : ${r.rollbackReadinessScore}% — Net Banking rehearsal pending

Recommendation: ship UPI/Mobile in this train; split Cards out; gate Payments RTGS peak on the soak test.`;

  const rolloutChecklist = `# Rollout Checklist — ${r.projectName}

Pre-rollout
  □ Build promoted to staging-pre-prod
  □ Database migrations rehearsed (forward + rollback)
  □ Feature flags configured per cohort
  □ DR site warmed
  □ Customer comms scheduled

Rollout
  □ Canary 5% — health gate green
  □ Canary 25% — error budget intact
  □ Full rollout — watch for 60 minutes
  □ Synthetic monitoring assertions green
  □ NPCI / network partner notifications sent

Post-rollout
  □ Defect intelligence pass at T+1h, T+24h, T+7d
  □ Knowledge base updated
  □ Runbook updated for Operations

Owner: Release Manager · Approver: Head of Operations`;

  const releaseGovernancePack = `# Release Governance Pack — ${r.projectName}

Section 1 — CAB approval record
  Verdict: ${recommendation.toUpperCase()}
  Approvers: CAB Chair · Head of Engineering · Head of Operations
  Conditions: Cards split-out · RTGS peak re-run · NB rollback rehearsal

Section 2 — Quality gates
  Coverage 78% · DAST clean · SAST clean · License scan clean

Section 3 — Audit evidence trail
  Build SBOM, signed artefacts, scan reports, change ticket numbers.

Section 4 — Rollback rehearsal
  RTO target 30 min · RPO 0 · Last rehearsal: 24h ago

Section 5 — Risk Acceptances
  Cards Sev2 3DS issue accepted as known-issue post split-out.

Section 6 — Distribution list
  CIO Office · Risk · Compliance · Internal Audit · Operations`;

  const executiveReleaseSummary = `# Executive Release Summary — ${r.projectName}

Verdict: ${recommendation.toUpperCase()}
Readiness Score: ${r.releaseReadinessScore}%
Production Risk: ${r.productionRiskScore}%

Customer-impact summary:
  · UPI auto-refund flow goes live → improved customer recovery time
  · Mobile biometric fallback hardened → lower auth failure for elderly cohort
  · Cards held this train → tokenization fix re-runs next CAB

Operational impact:
  · Operations on-call augmented for 48h post-rollout
  · Synthetic monitoring expanded for UPI auto-refund

Risks & mitigations:
  · Cards 3DS Sev2 — split out, no customer impact
  · RTGS peak — re-run 5k TPS soak before promotion

Owner: Release Manager · Sponsor: CIO`;

  return (
    <CopilotSection
      title="Release Copilot"
      sourceHub="ai-copilot"
      sourceLabel="Release Copilot"
      analyzedSubtitle={`AI evaluated quality gates, defects, performance and rollback readiness across UPI, Cards, Payments, Net Banking and Loans for ${r.projectName} and produced a GO / CONDITIONAL GO / NO GO recommendation with reasons and risk factors.`}
      analyzedScope={[r.projectName, `Readiness ${r.releaseReadinessScore}%`, `AI Verdict: ${recommendation.toUpperCase()}`]}
      primarySlot={
        <ReleaseDecisionCard
          score={r.releaseReadinessScore}
          recommendation={recommendation}
          rationale={r.rationale}
          reasons={reasons}
          riskFactors={riskFactors}
          breakdown={[
            ['Release Readiness', r.releaseReadinessScore],
            ['Production Risk', r.productionRiskScore],
            ['Rollback Readiness', r.rollbackReadinessScore],
            ['Defect Risk', r.defectRiskScore],
            ['Audit Risk', r.auditRiskScore],
            ['Operational Risk', r.operationalRiskScore],
          ]}
        />
      }
      findingsTitle="Release Findings · Risk Factors"
      findings={findings}
      recommendations={recommendations}
      generationActions={[
        { id: 'rollout-checklist', label: 'Generate Rollout Checklist', artifactName: 'Rollout_Checklist.docx', icon: ChecklistRtlIcon, generatedBy: 'Release AI', preview: rolloutChecklist },
        { id: 'rollback', label: 'Generate Rollback Plan', artifactName: 'Rollback_Plan.docx', icon: RestartAltIcon, generatedBy: 'Release AI', preview: rollbackPlan },
        { id: 'readiness', label: 'Generate Release Readiness Report', artifactName: 'Release_Readiness_Report.docx', icon: AssessmentIcon, generatedBy: 'Release AI', preview: readinessReport },
        { id: 'release-governance', label: 'Generate Release Governance Pack', artifactName: 'Release_Governance_Pack.docx', icon: GavelIcon, generatedBy: 'Release AI', preview: releaseGovernancePack },
        { id: 'exec-release-summary', label: 'Generate Executive Release Summary', artifactName: 'Executive_Release_Summary.docx', icon: AssessmentIcon, generatedBy: 'Release AI', preview: executiveReleaseSummary },
        { id: 'cab-pack', label: 'Generate CAB Pack', artifactName: 'CAB_Pack.docx', icon: GavelIcon, generatedBy: 'Release AI', preview: cabPack },
        { id: 'go-live', label: 'Generate Go-Live Checklist', artifactName: 'Go_Live_Checklist.docx', icon: ChecklistRtlIcon, generatedBy: 'Release AI', preview: goLiveChecklist },
      ]}
      suggestedActions={suggestedActions}
      initialArtifacts={[
        { actionId: 'cab-pack', artifactName: 'CAB_Pack.md', generatedAt: '09:50', generatedBy: 'Release AI', preview: cabPack },
        { actionId: 'readiness', artifactName: 'Release_Readiness_Report.md', generatedAt: '09:51', generatedBy: 'Release AI', preview: readinessReport },
      ]}
      secondaryKpis={[
        { label: 'Readiness', value: r.releaseReadinessScore, suffix: '%' },
        { label: 'Production Risk', value: r.productionRiskScore, suffix: '%' },
        { label: 'Rollback', value: r.rollbackReadinessScore, suffix: '%' },
        { label: 'Defect Risk', value: r.defectRiskScore, suffix: '%' },
      ]}
    />
  );
}

// ---------------------------------------------------------------------------
// Audit Copilot — generated audit findings + evidence gaps
// ---------------------------------------------------------------------------
export function AuditCopilotPanel() {
  const { selectedProject } = useCopilot();

  const findings: CopilotFinding[] = [
    { id: 'aud-1', badge: 'Evidence Gap · UPI', severity: 'high', title: 'Dispute-resolution SLA evidence not retained', detail: 'RBI requires proof of UPI complaint closure within timelines; sampled cases have no stored closure artifact.' },
    { id: 'aud-2', badge: 'Evidence Gap · Cards', severity: 'critical', title: 'PCI-DSS quarterly ASV scan evidence missing', detail: 'No attached ASV scan report for the last quarter — a PCI-DSS Req 11.3 evidence gap.' },
    { id: 'aud-3', badge: 'Control Finding · Loans', severity: 'high', title: 'KYC re-verification overdue on 312 loan accounts', detail: 'Periodic KYC refresh has lapsed beyond the regulatory window for high-value loans.' },
    { id: 'aud-4', badge: 'Control Finding · Net Banking', severity: 'high', title: 'Privileged access recertification incomplete', detail: '38 admin entitlements to the funds-transfer service were not recertified this cycle.' },
    { id: 'aud-5', badge: 'Control Finding · Payments', severity: 'medium', title: 'Maker-checker SoD exception in NEFT config', detail: 'Two operators can both initiate and approve above-threshold NEFT batches.' },
    { id: 'aud-6', badge: 'Evidence Gap · Mobile', severity: 'medium', title: 'Pen-test remediation evidence pending', detail: 'Two medium findings from the mobile app pen-test lack closure evidence.' },
    { id: 'aud-7', badge: 'Compliance Observation · Cards', severity: 'medium', title: 'PCI-DSS network segmentation testing cadence drifting', detail: 'Quarterly segmentation test scheduled twice in last 12 months — should be 4×.' },
    { id: 'aud-8', badge: 'Compliance Observation · Payments', severity: 'low', title: 'AML threshold tuning evidence not centralized', detail: 'Threshold change rationale exists in tickets but is not landed in the audit evidence vault.' },
  ];

  const recommendations: CopilotRecommendation[] = [
    { id: 'aud-r1', badge: 'Cards', title: 'Attach the latest ASV scan and automate quarterly capture', rationale: 'Wire the scan pipeline output into the evidence vault automatically.', impact: 'Closes a PCI-blocking evidence gap' },
    { id: 'aud-r2', badge: 'UPI', title: 'Auto-capture dispute closure artifacts to the audit store', rationale: 'Persist closure proof at the moment a complaint is resolved.', impact: 'Zero-touch RBI dispute evidence' },
    { id: 'aud-r3', badge: 'Loans', title: 'Trigger KYC re-verification workflow for the 312 accounts', rationale: 'Batch-initiate refresh and track to closure.', impact: 'Regulatory KYC lapse remediated' },
    { id: 'aud-r4', badge: 'Payments', title: 'Enforce maker-checker SoD in NEFT approval config', rationale: 'Block self-approval above threshold with a policy guardrail.', impact: 'Removes an SoD control gap' },
  ];

  const suggestedActions: CopilotSuggestedAction[] = [
    { id: 'aud-a1', priority: 'P1', owner: 'Cards Compliance', label: 'Upload Q-latest ASV scan to the evidence vault', detail: 'PCI-blocking; needed before the next assessment window.' },
    { id: 'aud-a2', priority: 'P1', owner: 'Loans Ops', label: 'Initiate KYC refresh for 312 overdue accounts', detail: 'Regulatory lapse on high-value loans.' },
    { id: 'aud-a3', priority: 'P2', owner: 'IAM Lead', label: 'Complete privileged access recertification (Net Banking)', detail: 'Recertify the 38 outstanding admin entitlements.' },
    { id: 'aud-a4', priority: 'P2', owner: 'Payments Governance', label: 'Apply the SoD guardrail to NEFT approvals', detail: 'Adopt the generated remediation plan.' },
  ];

  const controlFindingsCount = findings.filter((f) => (f.badge ?? '').includes('Control Finding')).length;
  const evidenceGapCount = findings.filter((f) => (f.badge ?? '').includes('Evidence Gap')).length;
  const complianceObsCount = findings.filter((f) => (f.badge ?? '').includes('Compliance Observation')).length;

  const auditReport = `# Audit Report — ${selectedProject.name}

Scope        : UPI, Cards, Loans, Net Banking, Payments, Mobile
Frameworks   : RBI, PCI-DSS, SOX, AML
AI Verdict   : AMBER — 1 Critical evidence gap, ${controlFindingsCount} control findings, ${complianceObsCount} compliance observations.

CONTROL FINDINGS (${controlFindingsCount})
  • Loans   KYC refresh overdue ............ 312 high-value accounts (High)
  • NetBank Privileged access recert ........ 38 entitlements (High)
  • Payments SoD exception ................... NEFT config (Medium)

EVIDENCE GAPS (${evidenceGapCount})
  • Cards  PCI-DSS 11.3 ...................... ASV scan report missing (Critical)
  • UPI    RBI dispute closure artifacts ...... missing (High)
  • Mobile Pen-test remediation evidence ...... pending (Medium)

COMPLIANCE OBSERVATIONS (${complianceObsCount})
  • Cards   PCI-DSS segmentation testing cadence drifting (Medium)
  • Payments AML threshold tuning evidence not centralized (Low)

Disposition  : Remediation plan generated for all open items.
Readiness    : ${Math.max(0, 100 - findings.length * 6)}% (target 95% before next assessment).`;

  const evidenceChecklist = `# Evidence Checklist — ${selectedProject.name}

REQUIRED FOR ASSESSMENT
  □ Cards   — PCI-DSS 11.3 quarterly ASV scan (Critical) ........... MISSING
  □ UPI     — Dispute closure artifacts for last 90 days (High) .... MISSING
  □ Mobile  — Pen-test remediation evidence (Medium) ............... PENDING
  □ Loans   — KYC refresh evidence for 312 accounts (High) ......... PENDING
  □ NetBank — Privileged access recert reports (High) .............. PENDING
  □ Payments — Maker-checker SoD attestation for NEFT config ....... TO PRODUCE

ALREADY ON FILE
  ✓ Cards   — SAQ-D self-assessment
  ✓ UPI     — NPCI quarterly compliance certificate
  ✓ All     — Information security policy attestations
  ✓ All     — DR drill report (last cycle)
  ✓ All     — Incident management runbook & log

Owner-by-row attached. Vault upload links included.`;

  const complianceMapping = `# Compliance Mapping — ${selectedProject.name}

Finding ID  Module     Framework        Control Reference         Status
----------  --------   ---------------  ------------------------  ----------
aud-2       Cards      PCI-DSS          Req 11.3 (ASV scans)      Open · Critical
aud-7       Cards      PCI-DSS          Req 11.3.4 (segmentation) Open · Medium
aud-1       UPI        RBI Master Dir   Customer Grievance §6.4   Open · High
aud-3       Loans      RBI KYC Master   Periodic Updation         Open · High
aud-4       NetBank    SOX / RBI ITGC   Privileged Access §IT-04  Open · High
aud-5       Payments   RBI / AML        SoD §3.2                  Open · Medium
aud-6       Mobile     OWASP MASVS L1   Pen-test Closure          Pending · Medium
aud-8       Payments   AML / RBI        Threshold Governance      Open · Low

Frameworks covered: RBI · PCI-DSS · SOX · AML · OWASP MASVS.`;

  const remediationPlan = `# Remediation Plan — ${selectedProject.name}

P1 (this week)
  • Cards   Upload Q-latest ASV scan to evidence vault — Cards Compliance.
  • Loans   Initiate KYC refresh for 312 overdue accounts — Loans Ops.
  • UPI     Auto-capture dispute closure artifacts to audit store — UPI Eng + Compliance.

P2 (this sprint)
  • NetBank Complete privileged access recertification (38 entitlements) — IAM Lead.
  • Payments Enforce maker-checker SoD guardrail in NEFT approvals — Payments Governance.
  • Cards   Restore quarterly segmentation testing cadence — Cards Security.

P3 (next sprint)
  • Mobile  Land pen-test remediation evidence in vault — Mobile Security.
  • Payments Centralize AML threshold tuning evidence — Payments Compliance.

Predicted impact: Audit readiness ${Math.max(0, 100 - findings.length * 6)}% → 96% after P1+P2 close-out.`;

  return (
    <CopilotSection
      title="Audit Copilot"
      sourceHub="ai-copilot"
      sourceLabel="Audit Copilot"
      analyzedSubtitle={`AI tested controls and sampled evidence across UPI, Cards, Loans, Net Banking, Payments and Mobile Banking against RBI, PCI-DSS, SOX and AML, surfacing control findings, evidence gaps and compliance observations on ${selectedProject.name}.`}
      analyzedScope={[
        '4 frameworks',
        `${controlFindingsCount} control findings`,
        `${evidenceGapCount} evidence gaps · ${complianceObsCount} compliance observations`,
      ]}
      findingsTitle="Control Findings · Evidence Gaps · Compliance Observations"
      findings={findings}
      recommendations={recommendations}
      generationActions={[
        { id: 'audit-report', label: 'Generate Audit Report', artifactName: 'Audit_Report.md', icon: FactCheckIcon, generatedBy: 'Audit AI', preview: auditReport },
        { id: 'evidence-checklist', label: 'Generate Evidence Checklist', artifactName: 'Evidence_Checklist.md', icon: RuleIcon, generatedBy: 'Audit AI', preview: evidenceChecklist },
        { id: 'compliance-mapping', label: 'Generate Compliance Mapping', artifactName: 'Compliance_Mapping.md', icon: PolicyIcon, generatedBy: 'Audit AI', preview: complianceMapping },
        { id: 'remediation', label: 'Generate Remediation Plan', artifactName: 'Remediation_Plan.md', icon: BuildCircleIcon, generatedBy: 'Audit AI', preview: remediationPlan },
      ]}
      suggestedActions={suggestedActions}
      initialArtifacts={[
        { actionId: 'audit-report', artifactName: 'Audit_Report.md', generatedAt: '10:02', generatedBy: 'Audit AI', preview: auditReport },
        { actionId: 'evidence-checklist', artifactName: 'Evidence_Checklist.md', generatedAt: '10:03', generatedBy: 'Audit AI', preview: evidenceChecklist },
      ]}
      secondaryKpis={[
        { label: 'Control Findings', value: controlFindingsCount },
        { label: 'Evidence Gaps', value: evidenceGapCount },
        { label: 'Compliance Obs', value: complianceObsCount },
        { label: 'Frameworks', value: 4 },
      ]}
    />
  );
}
