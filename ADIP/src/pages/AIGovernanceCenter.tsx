import { useMemo, useState } from 'react';
import { Box, Chip, Grid, Typography } from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import InventoryIcon from '@mui/icons-material/Inventory';
import EditNoteIcon from '@mui/icons-material/EditNote';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ShieldIcon from '@mui/icons-material/Shield';
import InsightsIcon from '@mui/icons-material/Insights';
import { AIEvaluationCenter } from './AIEvaluationCenter';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { SeverityChip } from '../components/common/SeverityChip';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';
import { AIWorkspacePanel } from '../components/workflow/AIWorkspacePanel';
import { colors } from '../theme/colors';
import { useFilteredSimulation } from '../hooks/useFilteredSimulation';
import { computeAiGovernanceKpis } from '../data/aiUseCaseRegistryMock';
import {
  MODEL_INVENTORY,
  PROMPT_REGISTRY,
  AI_RISKS,
  AI_CONTROLS,
  computeModelInventoryKpis,
  computePromptGovernanceKpis,
  computeAIRiskKpis,
  computeAIControlsKpis,
} from '../data/aiGovernanceModulesMock';

type SectionKey = 'use-cases' | 'models' | 'prompts' | 'risks' | 'controls' | 'evaluation';

const SECTIONS: { key: SectionKey; label: string; icon: typeof PsychologyIcon }[] = [
  { key: 'use-cases', label: 'Use Case Registry', icon: PsychologyIcon },
  { key: 'models', label: 'Model Registry', icon: InventoryIcon },
  { key: 'prompts', label: 'Prompt Registry', icon: EditNoteIcon },
  { key: 'risks', label: 'Risk Registry', icon: WarningAmberIcon },
  { key: 'controls', label: 'Control Library', icon: ShieldIcon },
  { key: 'evaluation', label: 'AI Evaluation', icon: InsightsIcon },
];

interface AIGovernanceCenterProps {
  initialSection?: SectionKey;
}

type GovernancePrompt =
  | 'AI Use Case Approval'
  | 'Model Risk Review'
  | 'Prompt Risk Assessment'
  | 'Bias Assessment'
  | 'Human Oversight'
  | 'AI Control Mapping';

interface GovernancePack {
  useCaseRegister: string;
  modelCard: string;
  riskAssessment: string;
  controlMapping: string;
  approvalMatrix: string;
  monitoringPlan: string;
}

const GOVERNANCE_PROMPTS: GovernancePrompt[] = [
  'AI Use Case Approval',
  'Model Risk Review',
  'Prompt Risk Assessment',
  'Bias Assessment',
  'Human Oversight',
  'AI Control Mapping',
];

const GOVERNANCE_OUTPUTS: Record<GovernancePrompt, GovernancePack> = {
  'AI Use Case Approval': {
    useCaseRegister: 'AI Use Case Register\n- UC-401: Retail Lending Eligibility Assist\n- Domain: Lending\n- Business Owner: Head of Retail Credit\n- Status: Conditional Approval\n- Data Classification: Confidential',
    modelCard: 'Model Card\n- Model: Credit Eligibility Classifier v3.2\n- Intended Use: pre-approval recommendation\n- Not Intended: automated final rejection\n- Explainability: SHAP summary enabled',
    riskAssessment: 'Risk Assessment\n- Regulatory Risk: Medium\n- Fairness Risk: Medium\n- Data Drift Risk: High\n- Key Mitigation: monthly drift threshold checks',
    controlMapping: 'Control Mapping\n- GOV-AI-01 Human-in-loop decision gate\n- GOV-AI-04 Feature lineage retention\n- GOV-AI-09 Quarterly bias validation',
    approvalMatrix: 'Approval Matrix\n- Product: Approved\n- Risk: Approved with conditions\n- Compliance: Approved\n- Model Governance: Pending remediation closure',
    monitoringPlan: 'Monitoring Plan\n- Daily: inference latency and failure rate\n- Weekly: approval override ratio\n- Monthly: drift and fairness audit pack',
  },
  'Model Risk Review': {
    useCaseRegister: 'AI Use Case Register\n- UC-417: Transaction anomaly triage\n- Domain: Payments Risk\n- Stage: Production',
    modelCard: 'Model Card\n- Model: Fraud Signal Prioritizer v2.8\n- Training Data Window: last 180 days\n- Retrain Cadence: bi-weekly\n- Primary KPI: precision@top-50',
    riskAssessment: 'Risk Assessment\n- Model Stability: Medium\n- Concept Drift: High (festival periods)\n- Operational Risk: Medium\n- Action: add seasonal feature controls',
    controlMapping: 'Control Mapping\n- MR-02 Champion/challenger monthly run\n- MR-06 Incident rollback playbook\n- MR-11 Explainability score threshold',
    approvalMatrix: 'Approval Matrix\n- Model Owner: Approved\n- Risk Office: Conditional approval\n- CISO: Approved\n- Compliance: Approved',
    monitoringPlan: 'Monitoring Plan\n- Real-time: score distribution watch\n- Daily: false-positive trend by segment\n- Monthly: model risk committee review',
  },
  'Prompt Risk Assessment': {
    useCaseRegister: 'AI Use Case Register\n- UC-433: Customer Service Response Drafting\n- Prompt Family: assisted-response-v5',
    modelCard: 'Model Card\n- Runtime: governed model endpoint\n- Prompt Safeguards: policy classifier + PII redaction\n- Human Review: mandatory before send',
    riskAssessment: 'Risk Assessment\n- Prompt Injection Risk: High\n- Leakage Risk: Medium\n- Misleading Content Risk: Medium\n- Mitigation: strict tool allowlist and output filters',
    controlMapping: 'Control Mapping\n- PR-01 Input sanitization pipeline\n- PR-03 Retrieval source allowlist\n- PR-07 Sensitive topic escalation gate',
    approvalMatrix: 'Approval Matrix\n- Product: Approved\n- Security: Approved with hardening backlog\n- Compliance: Approved',
    monitoringPlan: 'Monitoring Plan\n- Daily: blocked prompt count\n- Weekly: policy violation ratio\n- Monthly: red-team replay scenarios',
  },
  'Bias Assessment': {
    useCaseRegister: 'AI Use Case Register\n- UC-446: SME Offer Prioritization\n- Protected Attributes: excluded from inference',
    modelCard: 'Model Card\n- Model: Offer Ranking Ensemble v1.9\n- Fairness Metric: demographic parity difference\n- Current Score: 0.07',
    riskAssessment: 'Risk Assessment\n- Bias Exposure: Medium\n- Data Representation Gaps: High in rural cohort\n- Mitigation: targeted dataset augmentation',
    controlMapping: 'Control Mapping\n- BI-02 Fairness pre-release checkpoint\n- BI-05 Protected-feature leakage scan\n- BI-08 Quarterly fairness attestation',
    approvalMatrix: 'Approval Matrix\n- Risk Analytics: Approved with remediation\n- Compliance: Approved\n- Product: Approved',
    monitoringPlan: 'Monitoring Plan\n- Weekly: fairness metric by cohort\n- Monthly: parity trend report\n- Quarterly: external audit sample',
  },
  'Human Oversight': {
    useCaseRegister: 'AI Use Case Register\n- UC-459: Branch Support Recommendation Assistant\n- Oversight Model: maker-checker with supervisor escalation',
    modelCard: 'Model Card\n- Model: Service Recommendation Copilot v4.1\n- Confidence banding: low/medium/high\n- Auto-action: disabled',
    riskAssessment: 'Risk Assessment\n- Incorrect Recommendation Risk: Medium\n- Over-reliance Risk: High\n- Mitigation: confidence-based review rules',
    controlMapping: 'Control Mapping\n- HO-01 Mandatory review for high-impact outputs\n- HO-04 Dual-approval for policy-sensitive responses\n- HO-09 Reviewer competency refresh',
    approvalMatrix: 'Approval Matrix\n- Operations: Approved\n- Risk: Approved\n- Compliance: Approved\n- Governance: Approved',
    monitoringPlan: 'Monitoring Plan\n- Daily: reviewer override rate\n- Weekly: unresolved escalation queue\n- Monthly: oversight effectiveness scorecard',
  },
  'AI Control Mapping': {
    useCaseRegister: 'AI Use Case Register\n- UC-472: Internal Policy Q&A Assistant\n- Environment: enterprise intranet',
    modelCard: 'Model Card\n- Model: Policy QA Retriever v2.3\n- Retrieval Scope: curated policy corpus only\n- Logging: immutable event stream enabled',
    riskAssessment: 'Risk Assessment\n- Control Coverage Risk: Medium\n- Auditability Risk: Low\n- Integrity Risk: Medium\n- Mitigation: evidence chain validation',
    controlMapping: 'Control Mapping\n- CM-01 Control-to-use-case trace matrix\n- CM-05 Evidence retention policy linkage\n- CM-10 Annual control test calendar',
    approvalMatrix: 'Approval Matrix\n- Governance: Approved\n- Audit: Approved\n- Compliance: Approved\n- Architecture: Approved',
    monitoringPlan: 'Monitoring Plan\n- Weekly: control execution completeness\n- Monthly: control exception report\n- Quarterly: evidence quality audit',
  },
};

function chipColor(status: string): string {
  switch (status) {
    case 'Approved':
    case 'Active':
    case 'Mitigated':
      return colors.success;
    case 'Pilot':
      return colors.info;
    case 'In Review':
    case 'Under Review':
    case 'Review':
    case 'Monitoring':
    case 'Draft':
      return colors.warning;
    case 'Open':
    case 'Rejected':
    case 'Gap Identified':
      return colors.critical;
    default:
      return colors.text.muted;
  }
}

function HeaderRow({ columns }: { columns: { label: string; minWidth?: number; flex?: boolean; right?: boolean }[] }) {
  return (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, py: 0.5, borderBottom: `1px solid ${colors.border.subtle}`, mb: 0.5 }}>
      {columns.map((c) => (
        <Typography
          key={c.label}
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            minWidth: c.minWidth,
            flex: c.flex ? 1 : undefined,
            ml: c.right ? 'auto' : undefined,
            textAlign: c.right ? 'right' : undefined,
          }}
        >
          {c.label}
        </Typography>
      ))}
    </Box>
  );
}

export function AIGovernanceCenter({ initialSection = 'use-cases' }: AIGovernanceCenterProps) {
  const [section, setSection] = useState<SectionKey>(initialSection);
  const [selectedPrompt, setSelectedPrompt] = useState<GovernancePrompt>('AI Use Case Approval');
  const { aiGovernance } = useFilteredSimulation();
  const activePack = useMemo(() => GOVERNANCE_OUTPUTS[selectedPrompt], [selectedPrompt]);

  const ucKpis = computeAiGovernanceKpis(aiGovernance.useCases);
  const mdlKpis = computeModelInventoryKpis(MODEL_INVENTORY);
  const prmKpis = computePromptGovernanceKpis(PROMPT_REGISTRY);
  const riskKpis = computeAIRiskKpis(AI_RISKS);
  const ctrlKpis = computeAIControlsKpis(AI_CONTROLS);

  return (
    <Box>
      <AIWorkspacePanel module="ai-governance" number={1} />

      <GlassCard sx={{ p: 2, mb: 1.5 }} glow="purple" hover={false}>
        <ModuleHeader
          title="Governance AI Automation Prompts"
          subtitle="Deterministic governance packs for CIO demo walkthrough"
        />
        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.25 }}>
          {GOVERNANCE_PROMPTS.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              size="small"
              onClick={() => setSelectedPrompt(chip)}
              sx={{
                fontSize: '0.68rem',
                bgcolor: selectedPrompt === chip ? `${colors.secondary}26` : colors.bg.glass,
                color: selectedPrompt === chip ? colors.secondary : colors.text.secondary,
                border: `1px solid ${selectedPrompt === chip ? colors.secondary : colors.border.subtle}`,
              }}
            />
          ))}
        </Box>
        <Grid container spacing={1}>
          {[
            ['AI Use Case Register', activePack.useCaseRegister],
            ['Model Card', activePack.modelCard],
            ['Risk Assessment', activePack.riskAssessment],
            ['Control Mapping', activePack.controlMapping],
            ['Approval Matrix', activePack.approvalMatrix],
            ['Monitoring Plan', activePack.monitoringPlan],
          ].map(([title, content]) => (
            <Grid key={title} size={{ xs: 12, md: 6 }}>
              <Box sx={{ p: 1.25, borderRadius: 1.25, bgcolor: colors.bg.glass, border: `1px solid ${colors.border.subtle}` }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: colors.secondary }}>{title}</Typography>
                <Typography component="pre" sx={{ m: 0, mt: 0.5, whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '0.7rem', color: colors.text.secondary }}>
                  {content}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </GlassCard>

      {/* Tab bar */}
      <GlassCard sx={{ p: 1, mb: 1.5 }} hover={false}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {SECTIONS.map((s) => {
            const active = s.key === section;
            const Icon = s.icon;
            return (
              <Box
                key={s.key}
                role="button"
                tabIndex={0}
                onClick={() => setSection(s.key)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSection(s.key); } }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.7,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? colors.text.primary : colors.text.secondary,
                  bgcolor: active ? `${colors.secondary}1f` : 'transparent',
                  border: `1px solid ${active ? colors.secondary : 'transparent'}`,
                  '&:hover': { bgcolor: `${colors.secondary}12` },
                  '&:focus-visible': { outline: `2px solid ${colors.secondary}`, outlineOffset: 1 },
                }}
              >
                <Icon sx={{ fontSize: 16, color: active ? colors.secondary : colors.text.muted }} />
                {s.label}
              </Box>
            );
          })}
        </Box>
      </GlassCard>

      {/* Use Case Registry */}
      {section === 'use-cases' && (
        <Box>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Total Use Cases" value={ucKpis.total} suffix="" compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Approved" value={ucKpis.approved} suffix="" trend={4} compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="High Risk" value={ucKpis.highRisk} suffix="" compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Pending Review" value={ucKpis.pendingReview} suffix="" trend={-1} compact /></Grid>
          </Grid>
          <GlassCard sx={{ p: 2, mt: 1.5 }}>
            <ModuleHeader title="AI Use Case Registry" subtitle={`${aiGovernance.useCases.length} registered use cases · click any row for detail`} />
            <HeaderRow columns={[{ label: 'ID', minWidth: 72 }, { label: 'Use Case', flex: true }, { label: 'Domain', minWidth: 100 }, { label: 'Risk', minWidth: 72 }, { label: 'Status', minWidth: 72, right: true }]} />
            {aiGovernance.useCases.map((uc) => (
              <DrilldownTableRow
                key={uc.id}
                chartId="ai-governance.use-case-registry"
                segment={uc.id}
                label={uc.name}
                value={uc.id}
                sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{uc.id}</Typography>
                <Typography variant="caption" sx={{ flex: 1, minWidth: 160 }}>{uc.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{uc.domain}</Typography>
                <SeverityChip severity={uc.riskTier} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: chipColor(uc.status), minWidth: 72, textAlign: 'right', ml: 'auto' }}>{uc.status}</Typography>
              </DrilldownTableRow>
            ))}
          </GlassCard>
          <HubArtifactGenerator hubKey="ai-use-case" />
        </Box>
      )}

      {/* Model Registry */}
      {section === 'models' && (
        <Box>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Total Models" value={mdlKpis.total} suffix="" compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Approved" value={mdlKpis.approved} suffix="" trend={2} compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="In Review" value={mdlKpis.inReview} suffix="" compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="High Risk" value={mdlKpis.highRisk} suffix="" compact /></Grid>
          </Grid>
          <GlassCard sx={{ p: 2, mt: 1.5 }}>
            <ModuleHeader title="AI Model Registry" subtitle={`${MODEL_INVENTORY.length} registered models · click any row for detail`} />
            <HeaderRow columns={[{ label: 'ID', minWidth: 72 }, { label: 'Model', flex: true }, { label: 'Vendor', minWidth: 130 }, { label: 'Risk', minWidth: 72 }, { label: 'Status', minWidth: 72, right: true }]} />
            {MODEL_INVENTORY.map((m) => (
              <DrilldownTableRow
                key={m.id}
                chartId="ai-governance.model-registry"
                segment={m.id}
                label={m.name}
                value={m.id}
                sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{m.id}</Typography>
                <Typography variant="caption" sx={{ flex: 1, minWidth: 160 }}>{m.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 130 }}>{m.vendor}</Typography>
                <SeverityChip severity={m.riskRating} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: chipColor(m.status), minWidth: 72, textAlign: 'right', ml: 'auto' }}>{m.status}</Typography>
              </DrilldownTableRow>
            ))}
          </GlassCard>
          <HubArtifactGenerator hubKey="ai-model-inventory" />
        </Box>
      )}

      {/* Prompt Registry */}
      {section === 'prompts' && (
        <Box>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Approved Prompts" value={prmKpis.approved} suffix="" trend={2} compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Under Review" value={prmKpis.underReview} suffix="" compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Rejected" value={prmKpis.rejected} suffix="" compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Compliance Score" value={prmKpis.complianceScore} suffix="%" compact /></Grid>
          </Grid>
          <GlassCard sx={{ p: 2, mt: 1.5 }}>
            <ModuleHeader title="AI Prompt Registry" subtitle={`${PROMPT_REGISTRY.length} governed prompts · click any row for detail`} />
            <HeaderRow columns={[{ label: 'ID', minWidth: 72 }, { label: 'Prompt', flex: true }, { label: 'Application', minWidth: 130 }, { label: 'Reviewed', minWidth: 100 }, { label: 'Status', minWidth: 90, right: true }]} />
            {PROMPT_REGISTRY.map((p) => (
              <DrilldownTableRow
                key={p.id}
                chartId="ai-governance.prompt-registry"
                segment={p.id}
                label={p.name}
                value={p.id}
                sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{p.id}</Typography>
                <Typography variant="caption" sx={{ flex: 1, minWidth: 160 }}>{p.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 130 }}>{p.application}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{p.lastReviewed}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: chipColor(p.status), minWidth: 90, textAlign: 'right', ml: 'auto' }}>{p.status}</Typography>
              </DrilldownTableRow>
            ))}
          </GlassCard>
          <HubArtifactGenerator hubKey="ai-prompt" />
        </Box>
      )}

      {/* Risk Registry */}
      {section === 'risks' && (
        <Box>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Open Risks" value={riskKpis.open} suffix="" compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Critical" value={riskKpis.critical} suffix="" trend={-1} compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Mitigated" value={riskKpis.mitigated} suffix="" trend={3} compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Avg Risk Score" value={riskKpis.avgScore} suffix="" compact /></Grid>
          </Grid>
          <GlassCard sx={{ p: 2, mt: 1.5 }}>
            <ModuleHeader title="AI Risk Registry" subtitle={`${AI_RISKS.length} tracked risks · click any row for detail`} />
            <HeaderRow columns={[{ label: 'ID', minWidth: 72 }, { label: 'Use Case', flex: true }, { label: 'Risk Type', minWidth: 130 }, { label: 'Severity', minWidth: 80 }, { label: 'Status', minWidth: 90, right: true }]} />
            {AI_RISKS.map((r) => (
              <DrilldownTableRow
                key={r.id}
                chartId="ai-governance.risk-registry"
                segment={r.id}
                label={r.useCase}
                value={r.riskScore}
                sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{r.id}</Typography>
                <Typography variant="caption" sx={{ flex: 1, minWidth: 160 }}>{r.useCase}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 130 }}>{r.riskType}</Typography>
                <SeverityChip severity={r.severity} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: chipColor(r.status), minWidth: 90, textAlign: 'right', ml: 'auto' }}>{r.status}</Typography>
              </DrilldownTableRow>
            ))}
          </GlassCard>
          <HubArtifactGenerator hubKey="ai-risk" />
        </Box>
      )}

      {/* Control Library */}
      {section === 'controls' && (
        <Box>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Active Controls" value={ctrlKpis.active} suffix="" compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Control Gaps" value={ctrlKpis.gaps} suffix="" compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Human Reviews" value={ctrlKpis.humanReviews} suffix="" compact /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Guardrail Coverage" value={ctrlKpis.guardrailCoverage} suffix="%" compact /></Grid>
          </Grid>
          <GlassCard sx={{ p: 2, mt: 1.5 }}>
            <ModuleHeader title="AI Control Library" subtitle={`${AI_CONTROLS.length} deployed controls · click any row for detail`} />
            <HeaderRow columns={[{ label: 'ID', minWidth: 72 }, { label: 'Control', flex: true }, { label: 'Domain', minWidth: 120 }, { label: 'Coverage', minWidth: 80 }, { label: 'Status', minWidth: 100, right: true }]} />
            {AI_CONTROLS.map((c) => (
              <DrilldownTableRow
                key={c.id}
                chartId="ai-governance.control-library"
                segment={c.id}
                label={c.name}
                value={`${c.coverage}%`}
                sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{c.id}</Typography>
                <Typography variant="caption" sx={{ flex: 1, minWidth: 160 }}>{c.name}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>{c.controlDomain}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 80 }}>{c.coverage}%</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: chipColor(c.status), minWidth: 100, textAlign: 'right', ml: 'auto' }}>{c.status}</Typography>
              </DrilldownTableRow>
            ))}
          </GlassCard>
          <HubArtifactGenerator hubKey="ai-controls" />
        </Box>
      )}

      {/* AI Evaluation */}
      {section === 'evaluation' && <AIEvaluationCenter />}
    </Box>
  );
}
