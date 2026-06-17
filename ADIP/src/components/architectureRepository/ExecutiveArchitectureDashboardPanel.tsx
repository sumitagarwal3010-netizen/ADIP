import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useArchitectureRepository } from '../../context/ArchitectureRepositoryContext';
import { colors } from '../../theme/colors';

export function ExecutiveArchitectureDashboardPanel() {
  const { kpis, history, capabilityAreas, complianceDist } = useArchitectureRepository();

  return (
    <Box>
      {/*
       * KPI cleanup (June 2026 Executive-Semantic Rationalization):
       * 10 KPIs → 6 hero KPIs. Removed as overlapping/cross-domain:
       *   - Tech Obsolescence (overlaps with Architecture Debt)
       *   - Exceptions (governance workflow KPI, not repository health)
       *   - Reference Adoption (subset of Standards Compliance)
       *   - Modernization Progress (Transformation PMO owns this metric)
       */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Architecture Health" value={kpis.architectureHealth} suffix="%" chartId="architecture-repository.architecture-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Standards Compliance" value={kpis.standardsCompliance} suffix="%" chartId="architecture-repository.standards-compliance" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Architecture Debt" value={kpis.architectureDebt} suffix="d" chartId="architecture-repository.architecture-debt" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Architecture Risk" value={kpis.architectureRisk} suffix="/100" chartId="architecture-repository.architecture-risk" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Cloud Readiness" value={kpis.cloudReadiness} suffix="%" chartId="architecture-repository.cloud-readiness" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="AI Readiness" value={kpis.aiReadiness} suffix="%" chartId="architecture-repository.ai-readiness" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="5-Year Architecture Evolution" subtitle="Health · compliance · cloud · AI · reference adoption" />
            <MultiLineChart
              data={history.map((h) => ({ month: h.year, ...h })) as Record<string, string | number>[]}
              series={[
                { key: 'architectureHealth', name: 'Health %', color: colors.success },
                { key: 'standardsCompliance', name: 'Compliance %', color: colors.primary },
                { key: 'referenceAdoption', name: 'Reference %', color: colors.secondary },
              ]}
              height={220}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Capabilities by Banking Area" subtitle="100 business capabilities" />
            <HorizontalBarChart chartId="architecture-repository.architecture-health" data={capabilityAreas.slice(0, 10)} height={220} barColor={colors.info} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Application Compliance Distribution" />
            <HorizontalBarChart chartId="architecture-repository.standards-compliance" data={complianceDist} height={180} barColor={colors.warning} />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
