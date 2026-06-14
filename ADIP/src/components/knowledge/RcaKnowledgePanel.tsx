import { Box, Chip, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useKnowledgeCenter } from '../../context/KnowledgeCenterContext';
import { colors } from '../../theme/colors';

export function RcaKnowledgePanel() {
  const { rcaArticles, rcaBySource } = useKnowledgeCenter();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="RCA Knowledge by Source" subtitle="Production RCA · Audit Findings · Control Failures · Release Failures · Security Incidents" />
        <HorizontalBarChart chartId="knowledge-center.rca-source" data={rcaBySource} height={180} barColor={colors.warning} />
      </GlassCard>
      <Grid container spacing={1.5}>
        {rcaArticles.slice(0, 12).map((r) => (
          <Grid key={r.id} size={{ xs: 12, md: 6 }}>
            <GlassCard sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.title}</Typography>
                <Chip label={r.source} size="small" sx={{ fontSize: '0.58rem', height: 18 }} />
              </Box>
              <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>Root: {r.rootCause}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem', display: 'block' }}>
                Corrective: {r.correctiveAction}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>
                Preventive: {r.preventiveAction}
              </Typography>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
