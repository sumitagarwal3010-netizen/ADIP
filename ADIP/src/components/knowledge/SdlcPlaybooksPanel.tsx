import { Box, Chip, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useKnowledgeCenter } from '../../context/KnowledgeCenterContext';
import { colors } from '../../theme/colors';

export function SdlcPlaybooksPanel() {
  const { playbooks, mostReusedPlaybooks } = useKnowledgeCenter();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Most Reused Playbooks" />
        <HorizontalBarChart chartId="knowledge-center.playbooks" data={mostReusedPlaybooks} height={160} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="SDLC Playbooks" subtitle="Requirement · Architecture · Secure Coding · Test Planning · Release · Audit · Production · AI Model Governance" />
        {playbooks.slice(0, 15).map((p) => (
          <Box key={p.id} sx={{ p: 1, mb: 0.75, borderRadius: 1, border: `1px solid ${colors.border.subtle}` }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.title}</Typography>
              <Chip label={p.type} size="small" sx={{ fontSize: '0.58rem', height: 18 }} />
              <Chip label={`${p.reuseCount}×`} size="small" color="success" sx={{ fontSize: '0.58rem', height: 18 }} />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{p.description}</Typography>
            <Typography variant="caption" sx={{ fontSize: '0.62rem' }}>
              Steps: {p.steps.join(' → ')}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
