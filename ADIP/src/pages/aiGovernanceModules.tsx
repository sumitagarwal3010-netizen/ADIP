import { Box, Grid, Typography } from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { SeverityChip } from '../components/common/SeverityChip';
import { colors } from '../theme/colors';
import {
  AI_CONTROLS,
  AI_INCIDENTS,
  AI_RISKS,
  MODEL_INVENTORY,
  PROMPT_REGISTRY,
  computeAIControlsKpis,
  computeAIIncidentsKpis,
  computeAIRiskKpis,
  computeModelInventoryKpis,
  computePromptGovernanceKpis,
} from '../data/aiGovernanceModulesMock';

function modelStatusColor(status: string): string {
  if (status === 'Approved') return colors.success;
  if (status === 'In Review') return colors.warning;
  return colors.text.muted;
}

function riskStatusColor(status: string): string {
  if (status === 'Mitigated') return colors.success;
  if (status === 'Monitoring') return colors.info;
  return colors.warning;
}

function promptStatusColor(status: string): string {
  if (status === 'Approved') return colors.success;
  if (status === 'Under Review') return colors.warning;
  return colors.critical;
}

function controlStatusColor(status: string): string {
  if (status === 'Active') return colors.success;
  if (status === 'Under Review') return colors.warning;
  return colors.critical;
}

function incidentStatusColor(status: string): string {
  if (status === 'Resolved') return colors.success;
  if (status === 'Monitoring') return colors.info;
  return colors.warning;
}

function TableHeader({ columns }: { columns: { label: string; flex?: number; minWidth?: number; align?: 'right' }[] }) {
  return (
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        gap: 2,
        py: 0.5,
        borderBottom: `1px solid ${colors.border.subtle}`,
        mb: 0.5,
      }}
    >
      {columns.map((col) => (
        <Typography
          key={col.label}
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 700,
            fontSize: '0.65rem',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            minWidth: col.minWidth,
            flex: col.flex,
            ml: col.align === 'right' ? 'auto' : undefined,
            textAlign: col.align,
          }}
        >
          {col.label}
        </Typography>
      ))}
    </Box>
  );
}

export function ModelInventoryModule() {
  const kpis = computeModelInventoryKpis(MODEL_INVENTORY);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Total Models" value={kpis.total} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Approved Models" value={kpis.approved} suffix="" trend={2} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Models In Review" value={kpis.inReview} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="High Risk Models" value={kpis.highRisk} suffix="" compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Model Inventory" subtitle={`${MODEL_INVENTORY.length} registered models`} />
        <TableHeader
          columns={[
            { label: 'Model Name', flex: 1, minWidth: 160 },
            { label: 'Vendor', minWidth: 120 },
            { label: 'Version', minWidth: 100 },
            { label: 'Owner', minWidth: 100 },
            { label: 'Risk Rating', minWidth: 80 },
            { label: 'Status', minWidth: 72, align: 'right' },
          ]}
        />
        {MODEL_INVENTORY.map((model) => (
          <DrilldownTableRow
            key={model.id}
            chartId="ai-governance.model-inventory"
            segment={model.id}
            label={model.name}
            value={model.version}
            sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography variant="caption" sx={{ flex: 1, minWidth: 160, fontWeight: 600 }}>{model.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>{model.vendor}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{model.version}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{model.owner}</Typography>
            <SeverityChip severity={model.riskRating} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: modelStatusColor(model.status), minWidth: 72, textAlign: 'right', ml: 'auto' }}>
              {model.status}
            </Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>
    </Box>
  );
}

export function AIRiskModule() {
  const kpis = computeAIRiskKpis(AI_RISKS);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Open AI Risks" value={kpis.open} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Critical Risks" value={kpis.critical} suffix="" trend={-1} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Mitigated Risks" value={kpis.mitigated} suffix="" trend={3} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Average Risk Score" value={kpis.avgScore} suffix="" compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="AI Risk Register" subtitle={`${AI_RISKS.length} tracked risks`} />
        <TableHeader
          columns={[
            { label: 'Risk ID', minWidth: 72 },
            { label: 'Use Case', flex: 1, minWidth: 140 },
            { label: 'Risk Type', minWidth: 120 },
            { label: 'Severity', minWidth: 80 },
            { label: 'Owner', minWidth: 100 },
            { label: 'Status', minWidth: 80, align: 'right' },
          ]}
        />
        {AI_RISKS.map((risk) => (
          <DrilldownTableRow
            key={risk.id}
            chartId="ai-governance.ai-risk"
            segment={risk.id}
            label={risk.useCase}
            value={risk.riskScore}
            sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{risk.id}</Typography>
            <Typography variant="caption" sx={{ flex: 1, minWidth: 140 }}>{risk.useCase}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>{risk.riskType}</Typography>
            <SeverityChip severity={risk.severity} />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{risk.owner}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: riskStatusColor(risk.status), minWidth: 80, textAlign: 'right', ml: 'auto' }}>
              {risk.status}
            </Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>
    </Box>
  );
}

export function PromptGovernanceModule() {
  const kpis = computePromptGovernanceKpis(PROMPT_REGISTRY);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Approved Prompts" value={kpis.approved} suffix="" trend={2} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Prompts Under Review" value={kpis.underReview} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Rejected Prompts" value={kpis.rejected} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Prompt Compliance Score" value={kpis.complianceScore} suffix="%" compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Prompt Registry" subtitle={`${PROMPT_REGISTRY.length} governed prompts`} />
        <TableHeader
          columns={[
            { label: 'Prompt Name', flex: 1, minWidth: 160 },
            { label: 'Application', minWidth: 120 },
            { label: 'Owner', minWidth: 100 },
            { label: 'Last Reviewed', minWidth: 100 },
            { label: 'Status', minWidth: 80, align: 'right' },
          ]}
        />
        {PROMPT_REGISTRY.map((prompt) => (
          <DrilldownTableRow
            key={prompt.id}
            chartId="ai-governance.prompt-governance"
            segment={prompt.id}
            label={prompt.name}
            value={prompt.application}
            sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography variant="caption" sx={{ flex: 1, minWidth: 160, fontWeight: 600 }}>{prompt.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>{prompt.application}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{prompt.owner}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{prompt.lastReviewed}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: promptStatusColor(prompt.status), minWidth: 80, textAlign: 'right', ml: 'auto' }}>
              {prompt.status}
            </Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>
    </Box>
  );
}

export function AIControlsModule() {
  const kpis = computeAIControlsKpis(AI_CONTROLS);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Active Controls" value={kpis.active} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Control Gaps" value={kpis.gaps} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Human Reviews Required" value={kpis.humanReviews} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Guardrail Coverage" value={kpis.guardrailCoverage} suffix="%" compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="AI Controls Register" subtitle={`${AI_CONTROLS.length} deployed controls`} />
        <TableHeader
          columns={[
            { label: 'Control ID', minWidth: 72 },
            { label: 'Control Name', flex: 1, minWidth: 180 },
            { label: 'Control Type', minWidth: 100 },
            { label: 'Owner', minWidth: 100 },
            { label: 'Coverage', minWidth: 72 },
            { label: 'Status', minWidth: 80, align: 'right' },
          ]}
        />
        {AI_CONTROLS.map((control) => (
          <DrilldownTableRow
            key={control.id}
            chartId="ai-governance.ai-controls"
            segment={control.id}
            label={control.name}
            value={control.coverage}
            suffix="%"
            sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{control.id}</Typography>
            <Typography variant="caption" sx={{ flex: 1, minWidth: 180, fontWeight: 600 }}>{control.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{control.controlType}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{control.owner}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{control.coverage}%</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: controlStatusColor(control.status), minWidth: 80, textAlign: 'right', ml: 'auto' }}>
              {control.status}
            </Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>
    </Box>
  );
}

export function AIIncidentsModule() {
  const kpis = computeAIIncidentsKpis(AI_INCIDENTS);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Open AI Incidents" value={kpis.open} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Resolved This Month" value={kpis.resolvedThisMonth} suffix="" trend={2} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Critical Incidents" value={kpis.critical} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Average MTTR" value={kpis.avgMttr} suffix="h" compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="AI Incident Log" subtitle={`${AI_INCIDENTS.length} recorded incidents`} />
        <TableHeader
          columns={[
            { label: 'Incident ID', minWidth: 72 },
            { label: 'Incident Type', flex: 1, minWidth: 160 },
            { label: 'Application', minWidth: 120 },
            { label: 'Severity', minWidth: 80 },
            { label: 'Owner', minWidth: 100 },
            { label: 'Status', minWidth: 80, align: 'right' },
          ]}
        />
        {AI_INCIDENTS.map((incident) => (
          <DrilldownTableRow
            key={incident.id}
            chartId="ai-governance.ai-incidents"
            segment={incident.id}
            label={incident.incidentType}
            value={incident.mttrHours}
            suffix="h"
            sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{incident.id}</Typography>
            <Typography variant="caption" sx={{ flex: 1, minWidth: 160, fontWeight: 600 }}>{incident.incidentType}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>{incident.application}</Typography>
            <SeverityChip severity={incident.severity} />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{incident.owner}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: incidentStatusColor(incident.status), minWidth: 80, textAlign: 'right', ml: 'auto' }}>
              {incident.status}
            </Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>
    </Box>
  );
}
