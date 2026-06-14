import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { BarChartPanel } from '../charts/BarChartPanel';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useProductionIntelligence } from '../../context/ProductionIntelligenceContext';
import { colors } from '../../theme/colors';

export function ProductionDashboardPanel() {
  const { kpis, incidentTrend, topLeakageApps, rcaPatterns } = useProductionIntelligence();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Production Risk" value={kpis.productionRisk} suffix="%" chartId="prod-intel.production-risk" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Customer Impact" value={kpis.customerImpact} suffix="%" chartId="prod-intel.customer-impact" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Defect Leakage" value={kpis.defectLeakage} suffix="%" chartId="prod-intel.defect-leakage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Open Incidents" value={kpis.openIncidents} chartId="prod-intel.incident-trends" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Feedback Recs" value={kpis.feedbackRecommendations} chartId="prod-intel.feedback-recommendations" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Incident Trend (7 days)" subtitle="Production incidents and critical events" />
            <BarChartPanel
              chartId="prod-intel.incident-trends"
              data={incidentTrend}
              categoryKey="day"
              series={[
                { dataKey: 'count', name: 'Incidents', fill: colors.critical, barSize: 28, radius: [4, 4, 0, 0] },
                { dataKey: 'critical', name: 'Critical', fill: colors.warning, barSize: 28, radius: [4, 4, 0, 0] },
              ]}
              height={200}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Root Cause Distribution" />
            <HorizontalBarChart chartId="prod-intel.rca-patterns" data={rcaPatterns} height={200} barColor={colors.secondary} />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Top Leakage Applications" subtitle="Applications with highest production defect escapes" />
        <HorizontalBarChart chartId="prod-intel.top-leakage-apps" data={topLeakageApps} height={140} barColor={colors.critical} />
      </GlassCard>
    </Box>
  );
}
