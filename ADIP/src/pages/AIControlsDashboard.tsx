import { Box, Grid, Typography } from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { MultiLineChart } from '../components/charts/MultiLineChart';
import { colors } from '../theme/colors';
import {
  AI_CONTROLS,
  AI_CONTROLS_EXEC_SUMMARY,
  AI_CONTROLS_TREND,
  computeAIControlsDashboardKpis,
} from '../data/aiGovernanceModulesMock';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';

function controlStatusColor(status: string): string {
  if (status === 'Active') return colors.success;
  if (status === 'Under Review') return colors.warning;
  return colors.critical;
}

function testResultColor(result: string): string {
  if (result === 'Effective') return colors.success;
  if (result === 'Exception') return colors.warning;
  return colors.critical;
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

export function AIControlsDashboard() {
  const kpis = computeAIControlsDashboardKpis(AI_CONTROLS);

  const kpiCards = [
    { label: 'Control Coverage', value: kpis.controlCoverage, suffix: '%', trend: 4.2 },
    { label: 'Effective Controls', value: kpis.effectiveControls, suffix: '', trend: 8.1 },
    { label: 'Failed Controls', value: kpis.failedControls, suffix: '', trend: -12.5 },
    { label: 'Control Exceptions', value: kpis.controlExceptions, suffix: '', trend: -5.0 },
    { label: 'Human Review Controls', value: kpis.humanReviewControls, suffix: '', trend: 2.0 },
    { label: 'Model Monitoring Controls', value: kpis.modelMonitoringControls, suffix: '', trend: 0 },
    { label: 'Prompt Safety Controls', value: kpis.promptSafetyControls, suffix: '', trend: -3.2 },
    { label: 'Regulatory Controls', value: kpis.regulatoryControls, suffix: '', trend: 6.7 },
  ];

  return (
    <Box>
      <Grid container spacing={1.5}>
        {kpiCards.map((kpi, index) => (
          <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
            <KpiCard
              label={kpi.label}
              value={kpi.value}
              suffix={kpi.suffix}
              trend={kpi.trend}
              delay={index * 0.05}
              compact
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader
              title="AI Controls Trend"
              subtitle="Coverage % · Effective Controls · Exceptions"
            />
            <MultiLineChart
              data={AI_CONTROLS_TREND}
              series={[
                { key: 'coverage', color: colors.primary, name: 'Control Coverage' },
                { key: 'effective', color: colors.success, name: 'Effective Controls' },
                { key: 'exceptions', color: colors.warning, name: 'Control Exceptions' },
              ]}
              height={240}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }}>
            <AIInsightBox title="Executive Summary" insight={AI_CONTROLS_EXEC_SUMMARY} />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="AI Controls Register" subtitle={`${AI_CONTROLS.length} deployed controls across domains`} />
        <TableHeader
          columns={[
            { label: 'Control ID', minWidth: 72 },
            { label: 'Control Name', flex: 1, minWidth: 180 },
            { label: 'Domain', minWidth: 110 },
            { label: 'Owner', minWidth: 100 },
            { label: 'Coverage', minWidth: 72 },
            { label: 'Test Result', minWidth: 88 },
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
            sx={{
              display: 'flex',
              gap: 2,
              py: 1,
              borderBottom: `1px solid ${colors.border.subtle}`,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{control.id}</Typography>
            <Typography variant="caption" sx={{ flex: 1, minWidth: 180, fontWeight: 600 }}>{control.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 110 }}>{control.controlDomain}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{control.owner}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{control.coverage}%</Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: testResultColor(control.testResult), minWidth: 88 }}
            >
              {control.testResult}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: controlStatusColor(control.status),
                minWidth: 80,
                textAlign: 'right',
                ml: 'auto',
              }}
            >
              {control.status}
            </Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>

      <HubArtifactGenerator hubKey="ai-controls" />
    </Box>
  );
}
