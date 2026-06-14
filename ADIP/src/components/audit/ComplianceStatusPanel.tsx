import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { AIInsightBox } from '../common/AIInsightBox';
import { GaugeChart } from '../charts/GaugeChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { MultiLineChart } from '../charts/MultiLineChart';
import { DonutChart } from '../charts/DonutChart';
import { colors } from '../../theme/colors';
import { computeAuditKpis, findingsSeverityChartData } from '../../data/auditCenterEngine';
import { AUDIT_EXEC_SUMMARY } from '../../data/auditCenterMock';

export function ComplianceStatusPanel() {
  const kpis = computeAuditKpis();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Compliance Coverage" value={kpis.complianceCoverage} suffix="%" chartId="audit-center.compliance-coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Control Coverage" value={kpis.controlCoverage} suffix="%" chartId="audit-center.control-coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Evidence Coverage" value={kpis.evidenceCoverage} suffix="%" chartId="audit-center.evidence-coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Open Findings" value={kpis.openFindings} chartId="audit-center.open-findings" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Overdue" value={kpis.overdueFindings} chartId="audit-center.overdue-findings" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, textAlign: 'center' }}>
            <ModuleHeader title="Compliance Posture" />
            <GaugeChart chartId="audit-center.compliance-coverage" value={kpis.complianceCoverage} label="Compliance" size={180} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Domain Risk Analysis" />
            <HorizontalBarChart chartId="audit-center.findings-by-domain" data={kpis.findingsByDomain} height={180} barColor={colors.critical} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Finding Severity Distribution" />
            <DonutChart chartId="audit-center.findings-by-severity" data={findingsSeverityChartData()} centerLabel="Risk" height={180} />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Compliance Trend" subtitle="6-month compliance score trajectory" />
        <MultiLineChart
          data={kpis.complianceTrend.map((c) => ({ month: c.month, compliance: c.score }))}
          series={[{ key: 'compliance', color: colors.success, name: 'Compliance Score' }]}
          height={200}
        />
      </GlassCard>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Compliance Risk Assessment" insight={AUDIT_EXEC_SUMMARY} />
      </Box>
    </Box>
  );
}
