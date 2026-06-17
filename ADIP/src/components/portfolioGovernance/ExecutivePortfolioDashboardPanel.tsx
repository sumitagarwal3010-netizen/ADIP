import { Box, Grid, Typography } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { usePortfolioGovernance } from '../../context/PortfolioGovernanceContext';
import { colors } from '../../theme/colors';

/**
 * AI-First redesign: the Portfolio Dashboard now leads with **4 hero KPIs**
 * (Health, Delivery Confidence, Benefits Realization, Risk Exposure) — the
 * questions executives actually ask. Remaining KPIs are demoted to a small
 * "Other indicators" strip rendered at small size, exactly per the AI-First
 * "no KPI wall" rule.
 */
export function ExecutivePortfolioDashboardPanel() {
  const { kpis, portfolioHistory, portfolioHealth, demandPipeline } = usePortfolioGovernance();

  return (
    <Box>
      {/* Hero KPIs — capped at 4, executive-grade questions only. */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Portfolio Health" value={kpis.portfolioHealth} suffix="%" chartId="portfolio-governance.portfolio-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Delivery Confidence" value={kpis.deliveryConfidence} suffix="%" chartId="portfolio-governance.delivery-confidence" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Benefits Realization" value={kpis.benefitsRealization} suffix="%" chartId="portfolio-governance.benefits-realization" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Risk Exposure" value={kpis.riskExposure} suffix="%" chartId="portfolio-governance.risk-exposure" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="3-Year Portfolio History" subtitle="Health · funding · alignment trend" />
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

      {/* Other indicators — demoted to small inline metrics, never a KPI wall. */}
      <GlassCard sx={{ p: 1.5, mt: 1.5 }} hover={false}>
        <Typography
          sx={{
            fontSize: '0.62rem',
            color: colors.text.muted,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            mb: 0.75,
          }}
        >
          Other indicators
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.25 }}>
          {[
            { label: 'Strategic Alignment', value: kpis.strategicAlignment, suffix: '%' },
            { label: 'Funding Utilization', value: kpis.fundingUtilization, suffix: '%' },
            { label: 'Capacity Utilization', value: kpis.capacityUtilization, suffix: '%' },
            { label: 'Demand Backlog', value: kpis.demandBacklog },
            { label: 'Investment Efficiency', value: kpis.investmentEfficiency, suffix: '%' },
            { label: 'Transformation Progress', value: kpis.transformationProgress, suffix: '%' },
          ].map((k) => (
            <Box key={k.label} sx={{ minWidth: 130 }}>
              <Typography sx={{ fontSize: '0.6rem', color: colors.text.muted, textTransform: 'uppercase' }}>
                {k.label}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25 }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{k.value}</Typography>
                {k.suffix && <Typography sx={{ fontSize: '0.65rem', color: colors.text.muted }}>{k.suffix}</Typography>}
              </Box>
            </Box>
          ))}
        </Box>
      </GlassCard>
    </Box>
  );
}
