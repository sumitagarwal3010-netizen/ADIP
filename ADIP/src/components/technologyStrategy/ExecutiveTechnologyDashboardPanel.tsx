import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useTechnologyStrategy } from '../../context/TechnologyStrategyContext';
import { colors } from '../../theme/colors';

export function ExecutiveTechnologyDashboardPanel() {
  const { kpis, roadmap, byCategory, lifecycleDist } = useTechnologyStrategy();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Technology Health" value={kpis.technologyHealth} suffix="%" chartId="technology-strategy.technology-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Standards Adoption" value={kpis.standardsAdoption} suffix="%" chartId="technology-strategy.standards-adoption" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Strategic Platform" value={kpis.strategicPlatformAdoption} suffix="%" chartId="technology-strategy.strategic-platform-adoption" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Cloud Adoption" value={kpis.cloudAdoption} suffix="%" chartId="technology-strategy.cloud-adoption" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="AI Platform Adoption" value={kpis.aiPlatformAdoption} suffix="%" chartId="technology-strategy.ai-platform-adoption" compact /></Grid>
      </Grid>
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Technology Risk" value={kpis.technologyRisk} suffix="%" chartId="technology-strategy.technology-risk" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Modernization" value={kpis.modernizationProgress} suffix="%" chartId="technology-strategy.modernization-progress" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Technology Debt" value={kpis.technologyDebt} suffix="%" chartId="technology-strategy.technology-debt" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Vendor Concentration" value={kpis.vendorConcentration} suffix="%" chartId="technology-strategy.vendor-concentration" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Investment Efficiency" value={kpis.investmentEfficiency} suffix="%" chartId="technology-strategy.investment-efficiency" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="5-Year Technology Roadmap" subtitle="Health · standards · cloud · AI · modernization" />
            <MultiLineChart
              data={roadmap.map((h) => ({ month: h.year, ...h })) as Record<string, string | number>[]}
              series={[
                { key: 'technologyHealth', name: 'Health %', color: colors.success },
                { key: 'cloudAdoption', name: 'Cloud %', color: colors.primary },
                { key: 'aiAdoption', name: 'AI %', color: colors.secondary },
              ]}
              height={220}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Technologies by Category" subtitle="200 technologies" />
            <HorizontalBarChart chartId="technology-strategy.technology-health" data={byCategory} height={220} barColor={colors.info} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Technology Lifecycle Distribution" subtitle="emerging → strategic → retired" />
            <HorizontalBarChart chartId="technology-strategy.technology-debt" data={lifecycleDist} height={200} barColor={colors.warning} />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
