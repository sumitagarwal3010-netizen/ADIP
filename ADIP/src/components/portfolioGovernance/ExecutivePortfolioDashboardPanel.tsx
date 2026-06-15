import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { usePortfolioGovernance } from '../../context/PortfolioGovernanceContext';
import { colors } from '../../theme/colors';

export function ExecutivePortfolioDashboardPanel() {
  const { kpis, portfolioHistory, portfolioHealth, demandPipeline } = usePortfolioGovernance();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Portfolio Health" value={kpis.portfolioHealth} suffix="%" chartId="portfolio-governance.portfolio-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Strategic Alignment" value={kpis.strategicAlignment} suffix="%" chartId="portfolio-governance.strategic-alignment" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Funding Utilization" value={kpis.fundingUtilization} suffix="%" chartId="portfolio-governance.funding-utilization" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Capacity Utilization" value={kpis.capacityUtilization} suffix="%" chartId="portfolio-governance.capacity-utilization" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Delivery Confidence" value={kpis.deliveryConfidence} suffix="%" chartId="portfolio-governance.delivery-confidence" compact /></Grid>
      </Grid>
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Benefits Realization" value={kpis.benefitsRealization} suffix="%" chartId="portfolio-governance.benefits-realization" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Risk Exposure" value={kpis.riskExposure} suffix="%" chartId="portfolio-governance.risk-exposure" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Demand Backlog" value={kpis.demandBacklog} chartId="portfolio-governance.demand-backlog" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Investment Efficiency" value={kpis.investmentEfficiency} suffix="%" chartId="portfolio-governance.investment-efficiency" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Transformation Progress" value={kpis.transformationProgress} suffix="%" chartId="portfolio-governance.transformation-progress" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="3-Year Portfolio History" subtitle="Health · funding · capacity · alignment · benefits" />
            <MultiLineChart
              data={portfolioHistory.map((h) => ({ month: h.quarter, ...h })) as Record<string, string | number>[]}
              series={[
                { key: 'portfolioHealth', name: 'Health %', color: colors.success },
                { key: 'fundingUtilization', name: 'Funding %', color: colors.primary },
                { key: 'strategicAlignment', name: 'Alignment %', color: colors.secondary },
              ]}
              height={220}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Portfolio Health by Portfolio" />
            <HorizontalBarChart chartId="portfolio-governance.portfolio-health" data={portfolioHealth} height={220} barColor={colors.info} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Demand Pipeline Status" subtitle="200 demand requests" />
            <HorizontalBarChart chartId="portfolio-governance.demand-backlog" data={demandPipeline} height={180} barColor={colors.secondary} />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
