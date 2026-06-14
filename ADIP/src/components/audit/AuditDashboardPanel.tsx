import { Box, Grid, Typography } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { AIInsightBox } from '../common/AIInsightBox';
import { DonutChart } from '../charts/DonutChart';
import { GaugeChart } from '../charts/GaugeChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { MultiLineChart } from '../charts/MultiLineChart';
import { DrilldownTableRow } from '../common/DrilldownTableRow';
import { SeverityChip } from '../common/SeverityChip';
import { colors } from '../../theme/colors';
import { computeAuditKpis, findingsSeverityChartData } from '../../data/auditCenterEngine';
import { AUDIT_EXEC_SUMMARY, AUDIT_FINDINGS } from '../../data/auditCenterMock';

export function AuditDashboardPanel() {
  const kpis = computeAuditKpis();
  const topFindings = AUDIT_FINDINGS.filter((f) => f.status === 'Open' || f.status === 'In Progress').slice(0, 6);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Open Findings" value={kpis.openFindings} chartId="audit-center.open-findings" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Critical Findings" value={kpis.criticalFindings} chartId="audit-center.findings-by-severity" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Overdue Findings" value={kpis.overdueFindings} chartId="audit-center.overdue-findings" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Evidence Coverage" value={kpis.evidenceCoverage} suffix="%" chartId="audit-center.evidence-coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Audit Readiness" value={kpis.auditReadinessScore} suffix="%" chartId="audit-center.audit-readiness" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Findings by Severity" />
            <DonutChart chartId="audit-center.findings-by-severity" data={findingsSeverityChartData()} centerLabel="Findings" height={160} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, textAlign: 'center' }}>
            <ModuleHeader title="Audit Readiness Score" />
            <GaugeChart chartId="audit-center.audit-readiness" value={kpis.auditReadinessScore} label="Readiness" size={180} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, textAlign: 'center' }}>
            <ModuleHeader title="Control Coverage" />
            <GaugeChart chartId="audit-center.control-coverage" value={kpis.controlCoverage} label="Controls" size={180} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Findings by Domain" />
            <HorizontalBarChart chartId="audit-center.findings-by-domain" data={kpis.findingsByDomain} height={160} barColor={colors.warning} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Compliance & Risk Trend" />
            <MultiLineChart
              data={kpis.complianceTrend.map((c, i) => ({
                month: c.month,
                compliance: c.score,
                critical: kpis.riskTrend[i]?.critical ?? 0,
                high: kpis.riskTrend[i]?.high ?? 0,
              }))}
              series={[
                { key: 'compliance', color: colors.success, name: 'Compliance' },
                { key: 'critical', color: colors.critical, name: 'Critical' },
                { key: 'high', color: colors.warning, name: 'High' },
              ]}
              height={160}
            />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Priority Open Findings" subtitle="Drill down for linked evidence and workflows" />
        {topFindings.map((f) => (
          <DrilldownTableRow
            key={f.id}
            chartId="audit-center.findings-by-severity"
            segment={f.severity}
            label={f.id}
            value={f.severity}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}
          >
            <Box sx={{ flex: 1, mr: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{f.description.slice(0, 70)}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{f.domain} · {f.controlArea} · Due {f.dueDate}</Typography>
            </Box>
            <SeverityChip severity={f.severity} />
          </DrilldownTableRow>
        ))}
      </GlassCard>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Executive Audit Summary" insight={AUDIT_EXEC_SUMMARY} />
      </Box>
    </Box>
  );
}
