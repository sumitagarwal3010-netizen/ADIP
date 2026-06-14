import { Box, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useProductionIntelligence } from '../../context/ProductionIntelligenceContext';
import { colors } from '../../theme/colors';

export function RootCauseIntelligencePanel() {
  const { rcaPatterns, recurringCauses, futureRisks, rcaRecords } = useProductionIntelligence();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="RCA Pattern Distribution" subtitle="Requirement quality · architecture · coding · testing · release · ops · third party" />
            <HorizontalBarChart chartId="prod-intel.rca-patterns" data={rcaPatterns} height={240} barColor={colors.secondary} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Predicted Future Risks" />
            {futureRisks.map((r) => (
              <Box key={r.risk} sx={{ mb: 1, py: 0.5, borderBottom: `1px solid ${colors.border.subtle}` }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{r.risk}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                  {r.domain} · {r.probability}% probability
                </Typography>
              </Box>
            ))}
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Top Recurring Causes" subtitle={`${rcaRecords.length} RCA records analyzed`} />
        {recurringCauses.map((c) => (
          <Box key={c.cause} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption">{c.cause}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.count}×</Typography>
          </Box>
        ))}
      </GlassCard>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Recent RCA Records" />
        {rcaRecords.slice(0, 10).map((r) => (
          <Box key={r.id} sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.incidentId}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Corrective: {r.correctiveAction}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              Preventive: {r.preventiveAction}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
