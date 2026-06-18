import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useApplicationPortfolio } from '../../context/ApplicationPortfolioContext';
import { colors } from '../../theme/colors';

export function ExecutiveApmDashboardPanel() {
  const { kpis, lifecycleHistory, byDomain, criticalityDist } = useApplicationPortfolio();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Application Health" value={kpis.applicationHealth} suffix="%" chartId="application-portfolio.application-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Critical Apps" value={kpis.criticalApplications} chartId="application-portfolio.critical-applications" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Technical Debt" value={kpis.technicalDebt} suffix="/100" chartId="application-portfolio.technical-debt" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Modernization Ready" value={kpis.modernizationReadiness} suffix="%" chartId="application-portfolio.modernization-readiness" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Cloud Readiness" value={kpis.cloudReadiness} suffix="%" chartId="application-portfolio.cloud-readiness" compact /></Grid>
      </Grid>
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="AI Readiness" value={kpis.aiReadiness} suffix="%" chartId="application-portfolio.ai-readiness" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Risk Exposure" value={kpis.riskExposure} suffix="/100" chartId="application-portfolio.risk-exposure" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Annual Cost" value={`₹${(kpis.annualCost / 1_000_000).toFixed(0)}M`} suffix="" chartId="application-portfolio.annual-cost" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Rationalization Savings" value={`₹${(kpis.rationalizationSavings / 1_000_000).toFixed(1)}M`} suffix="" chartId="application-portfolio.rationalization-savings" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Tech Obsolescence" value={kpis.technologyObsolescence} suffix="%" chartId="application-portfolio.technology-obsolescence" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="5-Year Portfolio Lifecycle" subtitle="Health · debt · cloud · AI · cost" />
            <MultiLineChart
              data={lifecycleHistory.map((h) => ({ month: h.year, ...h })) as Record<string, string | number>[]}
              series={[
                { key: 'avgHealth', name: 'Health %', color: colors.success },
                { key: 'cloudReadiness', name: 'Cloud %', color: colors.primary },
                { key: 'aiReadiness', name: 'AI %', color: colors.secondary },
              ]}
              height={220}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Applications by Domain" subtitle="300 applications · 20 domains" />
            <HorizontalBarChart chartId="application-portfolio.application-health" data={byDomain.slice(0, 10)} height={220} barColor={colors.info} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Business Criticality Distribution" />
            <HorizontalBarChart chartId="application-portfolio.critical-applications" data={criticalityDist} height={180} barColor={colors.critical} />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
