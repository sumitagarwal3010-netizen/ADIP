import { Box, Chip, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { AIInsightBox } from '../common/AIInsightBox';
import { useCopilot } from '../../context/CopilotContext';
import { colors } from '../../theme/colors';

export function ExecutiveCopilotPanel() {
  const { executive } = useCopilot();

  return (
    <Box>
      <AIInsightBox title="Weekly CIO Summary" insight={executive.weeklyCioSummary} />
      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Portfolio Health Summary" insight={executive.portfolioHealthSummary} />
      </Box>

      <GridLike title="Delivery Bottlenecks" items={executive.deliveryBottlenecks} color={colors.warning} />
      <GridLike title="Governance Hotspots" items={executive.governanceHotspots} color={colors.secondary} />
      <GridLike title="Risk Hotspots" items={executive.riskHotspots} color={colors.critical} />
    </Box>
  );
}

function GridLike({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <GlassCard sx={{ p: 2, mt: 1.5 }}>
      <ModuleHeader title={title} />
      {items.map((item) => (
        <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, py: 0.35 }}>
          <Chip size="small" sx={{ width: 6, height: 6, minWidth: 6, bgcolor: color, '& .MuiChip-label': { display: 'none' } }} />
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{item}</Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function ImprovementAdvisorPanel() {
  const { improvementActions, kpis } = useCopilot();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader
        title="Continuous Improvement Advisor"
        subtitle={`${kpis.improvementActions} open actions · +${kpis.predictedQualityImprovement}% predicted quality gain`}
      />
      {improvementActions.slice(0, 15).map((a) => (
        <Box key={a.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.25 }}>
            <Chip label={a.status} size="small" sx={{ height: 16, fontSize: '0.5rem' }} />
            <Chip label={a.source} size="small" sx={{ height: 16, fontSize: '0.5rem' }} />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem' }}>{a.title}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>{a.description}</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
            +{a.predictedQualityGain}% quality · -{a.predictedRiskReduction}% risk · {a.owner}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
