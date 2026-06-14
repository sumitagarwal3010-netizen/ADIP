import { Box, Chip, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useKnowledgeCenter } from '../../context/KnowledgeCenterContext';
import { colors } from '../../theme/colors';

export function ArchitecturePatternsPanel() {
  const { patterns, patternByCategory } = useKnowledgeCenter();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Pattern Categories" subtitle="Microservices · Event Driven · API Security · Resilience · Payments · UPI · KYC · AML" />
        <HorizontalBarChart chartId="knowledge-center.patterns" data={patternByCategory} height={180} barColor={colors.secondary} />
      </GlassCard>
      <Grid container spacing={1.5}>
        {patterns.slice(0, 12).map((p) => (
          <Grid key={p.id} size={{ xs: 12, md: 6 }}>
            <GlassCard sx={{ p: 1.5 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                <Chip label={p.category} size="small" sx={{ fontSize: '0.58rem', height: 18 }} />
                <Chip label={`${p.adoptionCount}×`} size="small" color="success" sx={{ fontSize: '0.58rem', height: 18 }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{p.description}</Typography>
              <Typography variant="caption" sx={{ fontSize: '0.62rem', display: 'block', mt: 0.5 }}>When: {p.whenToUse}</Typography>
              <Typography variant="caption" color="error" sx={{ fontSize: '0.62rem' }}>Avoid: {p.antiPatterns}</Typography>
            </GlassCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
