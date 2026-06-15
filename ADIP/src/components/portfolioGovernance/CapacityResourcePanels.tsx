import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { usePortfolioGovernance } from '../../context/PortfolioGovernanceContext';
import { colors } from '../../theme/colors';

export function CapacityPlanningPanel() {
  const { capacityTrend, capacityPlans, kpis } = usePortfolioGovernance();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Capacity Planning" subtitle={`Enterprise capacity utilization: ${kpis.capacityUtilization}%`} />
        <HorizontalBarChart
          chartId="portfolio-governance.capacity-utilization"
          data={capacityTrend.map((c) => ({ name: c.quarter, value: c.utilization }))}
          height={220}
          barColor={colors.warning}
        />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Quarterly Capacity Plans" subtitle={`${capacityPlans.length} plans across portfolios`} />
        {capacityPlans.slice(0, 12).map((c) => (
          <Box key={c.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.quarter} — {c.portfolioId}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Utilization: {c.utilization}% · Demand: {c.demandHours.toLocaleString()}h · Available: {c.availableHours.toLocaleString()}h ·
              Bottlenecks: {c.bottleneckSkills.join(', ')}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ResourceAllocationPanel() {
  const { resourceBySkill, resources, kpis } = usePortfolioGovernance();
  const bottlenecks = resources.filter((r) => r.bottleneckRisk === 'critical' || r.bottleneckRisk === 'high').slice(0, 12);

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Resource Utilization by Skill" subtitle={`500 resources · ${kpis.capacityUtilization}% avg utilization`} />
        <HorizontalBarChart chartId="portfolio-governance.capacity-utilization" data={resourceBySkill} height={200} barColor={colors.warning} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Resource Bottleneck Predictor" subtitle="High/critical utilization alerts" />
        {bottlenecks.map((r) => (
          <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.name} — {r.skill}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {r.utilization}% utilized · {r.allocatedHours}/{r.capacityHours}h · Risk: {r.bottleneckRisk} · {r.portfolioId}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
