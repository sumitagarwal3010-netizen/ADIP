import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { MultiLineChart } from '../charts/MultiLineChart';
import { useKnowledgeCenter } from '../../context/KnowledgeCenterContext';
import { colors } from '../../theme/colors';

export function KnowledgeDashboardPanel() {
  const { kpis, knowledgeByCategory, topRiskThemes, mostReusedControls, adoptionTrend } = useKnowledgeCenter();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Knowledge Coverage" value={kpis.knowledgeCoverage} suffix="%" chartId="knowledge-center.coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Knowledge Reuse" value={kpis.knowledgeReuse} chartId="knowledge-center.reuse" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Risk Themes" value={kpis.topRiskThemes} chartId="knowledge-center.risk-themes" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Top Control Reuse" value={kpis.mostReusedControls} chartId="knowledge-center.controls" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Top Playbook Reuse" value={kpis.mostReusedPlaybooks} chartId="knowledge-center.playbooks" compact /></Grid>
        <Grid size={{ xs: 6, md: 2 }}><KpiCard label="Learning Adoption" value={kpis.learningAdoption} suffix="%" chartId="knowledge-center.adoption" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Lessons by Category" subtitle={`${kpis.totalLessons} lessons learned`} />
            <HorizontalBarChart chartId="knowledge-center.lessons-category" data={knowledgeByCategory} height={200} barColor={colors.secondary} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Top Risk Themes" />
            <HorizontalBarChart chartId="knowledge-center.risk-themes" data={topRiskThemes} height={200} barColor={colors.critical} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Most Reused Controls" />
            <HorizontalBarChart chartId="knowledge-center.controls" data={mostReusedControls} height={160} barColor={colors.success} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Learning Adoption Trend" />
            <MultiLineChart
              data={adoptionTrend}
              series={[
                { key: 'lessons', name: 'Lessons', color: colors.secondary },
                { key: 'playbooks', name: 'Playbooks', color: colors.primary },
                { key: 'controls', name: 'Controls', color: colors.success },
              ]}
              height={160}
            />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
