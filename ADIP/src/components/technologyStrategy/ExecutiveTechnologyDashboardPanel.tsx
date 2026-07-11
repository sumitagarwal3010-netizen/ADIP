import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useTechnologyStrategy } from '../../context/TechnologyStrategyContext';
import { colors } from '../../theme/colors';

/** Category health % — varied lengths / realistic banking tech labels. */
const CATEGORY_HEALTH = [
  { name: 'Payments APIs', value: 86 },
  { name: 'Core Banking', value: 71 },
  { name: 'Data / Analytics', value: 64 },
  { name: 'Integration / MQ', value: 48 },
  { name: 'Security / IAM', value: 79 },
  { name: 'AI / ML Platforms', value: 57 },
];

/** Lifecycle posture % — varied, not identical bars. */
const LIFECYCLE_POSTURE = [
  { name: 'Strategic / Preferred', value: 34 },
  { name: 'Approved', value: 22 },
  { name: 'Emerging', value: 11 },
  { name: 'Legacy', value: 18 },
  { name: 'Deprecated / EOS', value: 15 },
];

export function ExecutiveTechnologyDashboardPanel() {
  const { kpis, roadmap } = useTechnologyStrategy();

  return (
    <Box>
      {/*
       * KPI cleanup (June 2026 Executive-Semantic Rationalization):
       * 10 KPIs → 6 hero KPIs. Removed as cross-domain or noise:
       *   - Strategic Platform (architecture concern)
       *   - AI Platform Adoption (AI Governance owns this)
       *   - Technology Debt (overlaps with Modernization)
       *   - Vendor Concentration (Vendor Landscape tab removed)
       */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Technology Health" value={kpis.technologyHealth} suffix="%" chartId="technology-strategy.technology-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Standards Adoption" value={kpis.standardsAdoption} suffix="%" chartId="technology-strategy.standards-adoption" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Cloud Adoption" value={kpis.cloudAdoption} suffix="%" chartId="technology-strategy.cloud-adoption" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Modernization" value={kpis.modernizationProgress} suffix="%" chartId="technology-strategy.modernization-progress" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Technology Risk" value={kpis.technologyRisk} suffix="%" chartId="technology-strategy.technology-risk" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Investment Efficiency" value={kpis.investmentEfficiency} suffix="%" chartId="technology-strategy.investment-efficiency" compact /></Grid>
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
            <ModuleHeader title="Platform Health by Domain" subtitle="CIO posture % — varied estate health" />
            <HorizontalBarChart chartId="technology-strategy.technology-health" data={CATEGORY_HEALTH} height={220} barColor={colors.info} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Technology Lifecycle Posture" subtitle="Share of estate by lifecycle band %" />
            <HorizontalBarChart chartId="technology-strategy.technology-debt" data={LIFECYCLE_POSTURE} height={200} barColor={colors.warning} />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
