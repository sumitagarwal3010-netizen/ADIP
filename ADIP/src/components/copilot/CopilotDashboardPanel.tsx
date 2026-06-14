import { Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { DonutChart } from '../charts/DonutChart';
import { useCopilot } from '../../context/CopilotContext';
import { colors } from '../../theme/colors';

export function CopilotDashboardPanel() {
  const { kpis, topIssues, domainRiskChart, recommendationTrend } = useCopilot();

  const issueChart = topIssues.map((i) => ({ name: i.issue.slice(0, 20), value: i.count }));
  const trendChart = recommendationTrend.map((r) => ({ name: r.name, value: r.value, color: colors.primary }));

  return (
    <>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="AI Recommendations" value={kpis.aiRecommendations} chartId="copilot.recommendations" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Delivery Health" value={kpis.deliveryHealth} suffix="%" chartId="copilot.delivery-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Portfolio Risk" value={kpis.portfolioRisk} suffix="%" chartId="copilot.portfolio-risk" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Quality Improvement" value={kpis.predictedQualityImprovement} suffix="%" chartId="copilot.quality-improvement" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Projects at Risk" value={kpis.projectsAtRisk} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Top Recurring Issues" />
            <HorizontalBarChart chartId="copilot.recurring-issues" data={issueChart} height={180} barColor={colors.warning} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Recommendations by SDLC Domain" />
            <DonutChart chartId="copilot.recommendations-by-domain" data={trendChart} height={180} />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Domain Risk Distribution" />
        <HorizontalBarChart chartId="copilot.domain-risk" data={domainRiskChart} height={140} barColor={colors.critical} />
      </GlassCard>
    </>
  );
}
