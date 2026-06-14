import { Box, Chip, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useKnowledgeCenter } from '../../context/KnowledgeCenterContext';
import { colors } from '../../theme/colors';

export function ReusableControlsPanel() {
  const { controls } = useKnowledgeCenter();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Reusable Controls Library" subtitle={`${controls.length} preventive · detective · corrective · compensating controls`} />
      {controls.slice(0, 20).map((c) => (
        <Box key={c.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}`, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 70 }}>{c.id}</Typography>
          <Typography variant="caption" sx={{ flex: 1 }}>{c.name}</Typography>
          <Chip label={c.type} size="small" sx={{ fontSize: '0.58rem', height: 18 }} />
          <Chip label={c.framework} size="small" sx={{ fontSize: '0.58rem', height: 18 }} />
          <Typography variant="caption" color="success.main">{c.reuseCount}× · {c.effectiveness}%</Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
