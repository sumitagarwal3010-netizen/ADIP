import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useTransformationPmo } from '../../context/TransformationPmoContext';
import { colors } from '../../theme/colors';

export function ExecutiveTransformationDashboardPanel() {
  const { kpis, history, progByUnit, progByStatus } = useTransformationPmo();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Transformation Health" value={kpis.transformationHealth} suffix="%" chartId="transformation-pmo.transformation-health" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Program Delivery" value={kpis.programDelivery} suffix="%" chartId="transformation-pmo.program-delivery" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Objective Achievement" value={kpis.objectiveAchievement} suffix="%" chartId="transformation-pmo.objective-achievement" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Benefits Realization" value={kpis.benefitsRealization} suffix="%" chartId="transformation-pmo.benefits-realization" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Milestone Completion" value={kpis.milestoneCompletion} suffix="%" chartId="transformation-pmo.milestone-completion" compact /></Grid>
      </Grid>
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Exec Commitments" value={kpis.executiveCommitments} suffix="%" chartId="transformation-pmo.executive-commitments" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Dependency Risk" value={kpis.dependencyRisk} suffix="%" chartId="transformation-pmo.dependency-risk" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="BU Performance" value={kpis.businessUnitPerformance} suffix="%" chartId="transformation-pmo.business-unit-performance" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Transformation ROI" value={kpis.transformationRoi} suffix="%" chartId="transformation-pmo.transformation-roi" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Board Readiness" value={kpis.boardReadiness} suffix="%" chartId="transformation-pmo.board-readiness" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="5-Year Transformation History" subtitle="Health · delivery · benefits · milestones · ROI" />
            <MultiLineChart
              data={history.map((h) => ({ month: h.year, ...h })) as Record<string, string | number>[]}
              series={[
                { key: 'transformationHealth', name: 'Health %', color: colors.success },
                { key: 'benefitsRealization', name: 'Benefits %', color: colors.primary },
                { key: 'milestoneCompletion', name: 'Milestones %', color: colors.secondary },
              ]}
              height={220}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Programs by Business Unit" subtitle="50 transformation programs" />
            <HorizontalBarChart chartId="transformation-pmo.business-unit-performance" data={progByUnit} height={220} barColor={colors.info} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Program Status Distribution" />
            <HorizontalBarChart chartId="transformation-pmo.program-delivery" data={progByStatus} height={180} barColor={colors.warning} />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
