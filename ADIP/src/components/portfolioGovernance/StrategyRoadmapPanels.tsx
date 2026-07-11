import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { RadarChart } from '../charts/RadarChart';
import { usePortfolioGovernance } from '../../context/PortfolioGovernanceContext';
import { colors } from '../../theme/colors';

export function StrategicAlignmentPanel() {
  const { alignmentByObjective, objectives, kpis } = usePortfolioGovernance();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Strategic Alignment Scoring" subtitle={`Enterprise alignment: ${kpis.strategicAlignment}%`} />
        <RadarChart
          chartId="portfolio-governance.strategic-alignment"
          data={alignmentByObjective}
          height={280}
          barColor={colors.success}
          target={80}
        />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Strategic Objectives" />
        {objectives.map((o) => (
          <Box key={o.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{o.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Weight: {o.weight}% · Alignment: {o.alignmentScore}% · Programs aligned: {o.programsAligned}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function RoadmapPlanningPanel() {
  const { roadmap, programs } = usePortfolioGovernance();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Strategic Roadmap" subtitle={`${programs.length} strategic programs`} />
      {roadmap.map((r) => (
        <Box key={r.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.quarter} — {r.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            Health: {r.health}% · Benefits forecast: ₹{(r.benefits / 1_000_000).toFixed(2)}M
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
