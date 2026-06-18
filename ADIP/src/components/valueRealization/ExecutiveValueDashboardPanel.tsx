import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useValueRealization } from '../../context/ValueRealizationContext';
import { colors } from '../../theme/colors';

export function ExecutiveValueDashboardPanel() {
  const { kpis, trendHistory, productivityGains } = useValueRealization();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Hours Saved" value={kpis.hoursSaved.toLocaleString()} chartId="value-realization.hours-saved" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="FTE Savings" value={kpis.fteSavings} chartId="value-realization.fte-savings" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Productivity Gain" value={kpis.productivityGain} suffix="%" chartId="value-realization.productivity" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Defects Prevented" value={kpis.defectsPrevented} chartId="value-realization.defects-prevented" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Risk Reduction" value={kpis.riskReduction} suffix="%" chartId="value-realization.risk-reduction" compact /></Grid>
      </Grid>
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Cycle Time ↓" value={kpis.cycleTimeReduction} suffix="%" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Release Velocity" value={kpis.releaseVelocityImprovement} suffix="%" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Approval Time ↓" value={kpis.approvalTimeReduction} suffix="%" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Evidence Collection ↓" value={kpis.evidenceCollectionReduction} suffix="%" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Audit Findings Prevented" value={kpis.auditFindingsPrevented} compact /></Grid>
      </Grid>
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Annual Value" value={`₹${(kpis.annualValueRealized / 1_000_000).toFixed(1)}M`} suffix="" chartId="value-realization.annual-value" compact /></Grid>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="3-Year Projected" value={`₹${(kpis.threeYearProjectedValue / 1_000_000).toFixed(1)}M`} suffix="" chartId="value-realization.projected-value" compact /></Grid>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Cost Avoidance" value={`₹${(kpis.costAvoidance / 1_000_000).toFixed(1)}M`} suffix="" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="5-Year Value Trend" subtitle="Hours saved · value realized · productivity · ROI" />
            <MultiLineChart
              data={trendHistory.map((t) => ({ ...t })) as Record<string, string | number>[]}
              series={[
                { key: 'productivityGain', name: 'Productivity %', color: colors.success },
                { key: 'roi', name: 'ROI %', color: colors.primary },
                { key: 'riskReduction', name: 'Risk Reduction %', color: colors.secondary },
              ]}
              height={220}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Productivity by Domain" />
            <HorizontalBarChart
              chartId="value-realization.productivity"
              data={productivityGains.map((p) => ({ name: p.domain, value: p.productivityPercent }))}
              height={220}
              barColor={colors.info}
            />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
