import { Box, Chip, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useKnowledgeCenter } from '../../context/KnowledgeCenterContext';
import { colors } from '../../theme/colors';

export function BestPracticesPanel() {
  const { bestPractices, bestPracticeByDomain } = useKnowledgeCenter();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Best Practices by Domain" subtitle="Requirements · Architecture · Development · Testing · Release · Governance · Audit · Operations · AI Governance" />
        <HorizontalBarChart chartId="knowledge-center.best-practices" data={bestPracticeByDomain} height={180} barColor={colors.info} />
      </GlassCard>
      <Grid container spacing={1.5}>
        {bestPractices.slice(0, 12).map((b) => (
          <Grid key={b.id} size={{ xs: 12, md: 6 }}>
            <GlassCard sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{b.title}</Typography>
                <Chip label={`${b.adoptionRate}%`} size="small" sx={{ fontSize: '0.58rem', height: 18 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{b.summary}</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.62rem', display: 'block', mt: 0.5 }}>{b.guidance}</Typography>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
