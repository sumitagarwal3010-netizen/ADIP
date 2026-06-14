import { Box, Grid, Typography } from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { SeverityChip } from '../components/common/SeverityChip';
import { AIInsightBox } from '../components/common/AIInsightBox';
import { BarChartPanel } from '../components/charts/BarChartPanel';
import { colors } from '../theme/colors';
import {
  AI_INCIDENTS,
  AI_INCIDENT_RCA_HIGHLIGHTS,
  AI_INCIDENTS_EXEC_SUMMARY,
  AI_INCIDENTS_TREND,
  computeAIIncidentsDashboardKpis,
} from '../data/aiGovernanceModulesMock';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';

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

export function AIIncidentsDashboard() {
  const kpis = computeAIIncidentsDashboardKpis(AI_INCIDENTS);

  const kpiCards = [
    { label: 'Open Incidents', value: kpis.openIncidents, suffix: '', trend: -8.3 },
    { label: 'Closed Incidents', value: kpis.closedIncidents, suffix: '', trend: 14.2 },
    { label: 'Critical Incidents', value: kpis.criticalIncidents, suffix: '', trend: -20.0 },
    { label: 'Regulatory Incidents', value: kpis.regulatoryIncidents, suffix: '', trend: 12.5 },
    { label: 'Model Failures', value: kpis.modelFailures, suffix: '', trend: -5.0 },
    { label: 'Prompt Failures', value: kpis.promptFailures, suffix: '', trend: 0 },
    { label: 'Mean Resolution Time', value: kpis.meanResolutionTime, suffix: 'h', trend: -18.4 },
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
            <ModuleHeader title="AI Incident Trend (7 days)" subtitle="Open · Closed incidents" />
            <BarChartPanel
              chartId="ai-governance.incidents-trend"
              data={AI_INCIDENTS_TREND}
              categoryKey="day"
              series={[
                { dataKey: 'open', name: 'Open', fill: colors.warning, barSize: 22, radius: [4, 4, 0, 0] },
                { dataKey: 'closed', name: 'Closed', fill: colors.success, barSize: 22, radius: [4, 4, 0, 0] },
              ]}
              height={220}
              showLegend
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }}>
            <AIInsightBox title="Executive Summary" insight={AI_INCIDENTS_EXEC_SUMMARY} />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="AI Incident Log" subtitle={`${AI_INCIDENTS.length} recorded incidents`} />
        <TableHeader
          columns={[
            { label: 'Incident ID', minWidth: 72 },
            { label: 'Incident Type', flex: 1, minWidth: 160 },
            { label: 'Application', minWidth: 120 },
            { label: 'Category', minWidth: 80 },
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
            sx={{
              display: 'flex',
              gap: 2,
              py: 1,
              borderBottom: `1px solid ${colors.border.subtle}`,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{incident.id}</Typography>
            <Typography variant="caption" sx={{ flex: 1, minWidth: 160, fontWeight: 600 }}>{incident.incidentType}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 120 }}>{incident.application}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80, textTransform: 'capitalize' }}>
              {incident.category}
            </Typography>
            <Box sx={{ minWidth: 80 }}>
              <SeverityChip severity={incident.severity} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{incident.owner}</Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: incidentStatusColor(incident.status),
                minWidth: 80,
                textAlign: 'right',
                ml: 'auto',
              }}
            >
              {incident.status}
            </Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Root Cause Analysis Highlights" subtitle="Critical and regulatory incidents under review" />
        <TableHeader
          columns={[
            { label: 'Incident', flex: 1, minWidth: 140 },
            { label: 'Root Cause', flex: 1, minWidth: 160 },
            { label: 'Impact', flex: 1, minWidth: 140 },
            { label: 'Corrective Action', flex: 1, minWidth: 140 },
            { label: 'Preventive Action', flex: 1, minWidth: 140 },
            { label: 'Owner', minWidth: 100, align: 'right' },
          ]}
        />
        {AI_INCIDENT_RCA_HIGHLIGHTS.map((rca) => (
          <DrilldownTableRow
            key={rca.incidentId}
            chartId="ai-governance.ai-incidents"
            segment={rca.incidentId}
            label={rca.incident}
            value={rca.incidentId}
            sx={{
              display: 'flex',
              gap: 2,
              py: 1.25,
              borderBottom: `1px solid ${colors.border.subtle}`,
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <Typography variant="caption" sx={{ flex: 1, minWidth: 140, fontWeight: 600 }}>{rca.incident}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 160 }}>{rca.rootCause}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 140 }}>{rca.impact}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 140 }}>{rca.correctiveAction}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 140 }}>{rca.preventiveAction}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 100, textAlign: 'right', ml: 'auto' }}>
              {rca.owner}
            </Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>

      <HubArtifactGenerator hubKey="ai-incidents" />
    </Box>
  );
}
