import { Box, Chip, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useKnowledgeCenter } from '../../context/KnowledgeCenterContext';
import { colors } from '../../theme/colors';

export function LessonsLearnedPanel() {
  const { lessons } = useKnowledgeCenter();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Lessons Learned Library" subtitle={`${lessons.length} institutional lessons — never solve the same problem twice`} />
      {lessons.slice(0, 20).map((l) => (
        <Box key={l.id} sx={{ p: 1, mb: 0.75, borderRadius: 1, border: `1px solid ${colors.border.subtle}` }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{l.id} — {l.title}</Typography>
            <Chip label={l.category} size="small" sx={{ fontSize: '0.58rem', height: 18 }} />
            <Chip label={`${l.reuseCount}× reused`} size="small" color="success" sx={{ fontSize: '0.58rem', height: 18 }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {l.domain} · {l.application} · {l.owner} · {l.date}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
            Root cause: {l.rootCause} → Resolution: {l.resolution}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
            Links: {l.relatedRequirement} · {l.relatedRelease}
            {l.relatedIncident ? ` · ${l.relatedIncident}` : ''}
            {l.relatedAuditFinding ? ` · ${l.relatedAuditFinding}` : ''}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
