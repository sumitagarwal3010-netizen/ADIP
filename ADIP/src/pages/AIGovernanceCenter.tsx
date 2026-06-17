import { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
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
  const { aiGovernance } = useFilteredSimulation();

  const ucKpis = computeAiGovernanceKpis(aiGovernance.useCases);
  const mdlKpis = computeModelInventoryKpis(MODEL_INVENTORY);
  const prmKpis = computePromptGovernanceKpis(PROMPT_REGISTRY);
  const riskKpis = computeAIRiskKpis(AI_RISKS);
  const ctrlKpis = computeAIControlsKpis(AI_CONTROLS);

  return (
    <Box>
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
