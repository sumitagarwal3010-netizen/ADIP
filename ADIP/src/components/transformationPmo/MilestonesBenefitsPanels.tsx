import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useTransformationPmo } from '../../context/TransformationPmoContext';
import { colors } from '../../theme/colors';

export function MilestonesPanel() {
  const { msByStatus, criticalMilestones, kpis } = useTransformationPmo();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Milestones" subtitle={`500 milestones · completion ${kpis.milestoneCompletion}%`} />
        <HorizontalBarChart chartId="transformation-pmo.milestone-completion" data={msByStatus} height={180} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Upcoming Critical Milestones" />
        {criticalMilestones.map((m) => (
          <Box key={m.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{m.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {m.progName} · {m.status} · Due: {m.dueDate} · Completion: {m.completion}%
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function BenefitsTrackingPanel() {
  const { benByCategory, topBens, kpis } = useTransformationPmo();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Benefits Tracking" subtitle={`Benefits realization ${kpis.benefitsRealization}% · realized vs target by category`} />
        <HorizontalBarChart chartId="transformation-pmo.benefits-realization" data={benByCategory} height={180} barColor={colors.success} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Benefit Register" subtitle="100 benefits" />
        {topBens.map((b) => (
          <Box key={b.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{b.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {b.progName} · {b.category} · ₹{Math.round(b.realizedValue / 1_000_000)}M/{Math.round(b.targetValue / 1_000_000)}M · {b.status}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ExecutiveCommitmentsPanel() {
  const { commitByStatus, commitsAtRisk, kpis } = useTransformationPmo();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Executive Commitments" subtitle={`Commitments met ${kpis.executiveCommitments}% · 100 board/exec commitments`} />
        <HorizontalBarChart chartId="transformation-pmo.executive-commitments" data={commitByStatus} height={180} barColor={colors.info} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Commitments At Risk" />
        {commitsAtRisk.map((c) => (
          <Box key={c.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.id} — {c.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {c.progName} · Stakeholder: {c.stakeholder} · {c.status} · Confidence: {c.confidence}% · Due: {c.dueDate} · Owner: {c.owner}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
