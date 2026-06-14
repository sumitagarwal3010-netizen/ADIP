import { Box, Chip, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useCopilot } from '../../context/CopilotContext';
import { colors } from '../../theme/colors';

const ISSUE_LABEL = {
  ambiguous: 'Ambiguous',
  'missing-ac': 'Missing AC',
  'missing-nfr': 'Missing NFR',
  'missing-control': 'Missing Control',
  'frequently-changing': 'Frequently Changing',
};

export function RequirementCopilotPanel() {
  const { requirementInsights } = useCopilot();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Requirement Copilot" subtitle="Rule-based requirement quality analysis" />
      {requirementInsights.map((r) => (
        <Box key={r.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.25 }}>
            <Chip label={r.requirementId} size="small" sx={{ height: 16, fontSize: '0.5rem' }} />
            <Chip label={ISSUE_LABEL[r.issue]} size="small" sx={{ height: 16, fontSize: '0.5rem', color: colors.warning }} />
          </Box>
          <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.68rem' }}>{r.title}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>{r.detail}</Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.25, fontSize: '0.62rem', color: colors.primary }}>
            → {r.suggestion}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
