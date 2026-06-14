import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useCopilot } from '../../context/CopilotContext';
import { colors } from '../../theme/colors';

export function ArchitectureCopilotPanel() {
  const { architectureInsights } = useCopilot();
  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Architecture Copilot" subtitle="Risk observations & resiliency patterns" />
      {architectureInsights.map((a, i) => (
        <Box key={i} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem' }}>{a.module}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem' }}>{a.observation}</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.info }}>Pattern: {a.pattern}</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.primary }}>→ {a.recommendation}</Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function DevelopmentCopilotPanel() {
  const { developmentInsights } = useCopilot();
  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Development Copilot" subtitle="Quality insights & refactoring candidates" />
      {developmentInsights.map((d, i) => (
        <Box key={i} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem' }}>{d.module} — Tech Debt: {d.techDebt}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem' }}>{d.insight}</Typography>
          {d.refactorCandidate && (
            <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.warning }}>Refactoring candidate</Typography>
          )}
        </Box>
      ))}
    </GlassCard>
  );
}

export function TestingCopilotPanel() {
  const { testingInsights } = useCopilot();
  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Testing Copilot" subtitle="Test gaps, regression & automation" />
      {testingInsights.map((t, i) => (
        <Box key={i} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem' }}>{t.scenario}</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.info }}>{t.type}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem' }}>{t.prediction}</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.primary }}>→ {t.action}</Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
