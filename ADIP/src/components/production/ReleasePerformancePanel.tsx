import { Box, Chip, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useProductionIntelligence } from '../../context/ProductionIntelligenceContext';
import { colors } from '../../theme/colors';

export function ReleasePerformancePanel() {
  const { bestReleases, worstReleases, releaseEvents } = useProductionIntelligence();

  const renderRelease = (rel: typeof releaseEvents[0], rank?: string) => (
    <Box key={rel.id} sx={{ p: 1, mb: 0.75, borderRadius: 1, border: `1px solid ${colors.border.subtle}` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>{rank ? `${rank}. ` : ''}{rel.name}</Typography>
        <Chip label={rel.goNoGo} size="small" color={rel.goNoGo === 'Go' ? 'success' : rel.goNoGo === 'No-Go' ? 'error' : 'warning'} sx={{ fontSize: '0.6rem', height: 20 }} />
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
        {rel.application} · Success {rel.successRate}% · Rollback {rel.rollbackRate}% · Incidents {rel.incidentCreationRate}%
      </Typography>
      <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
        Defect leakage {rel.defectLeakageRate}% · Customer impact {rel.customerImpact}% · Business {rel.businessImpact}%
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Best Releases" subtitle="Highest success rate · lowest rollback" />
            {bestReleases.map((r, i) => renderRelease(r, String(i + 1)))}
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Worst Releases" subtitle="Elevated incident and leakage rates" />
            {worstReleases.map((r, i) => renderRelease(r, String(i + 1)))}
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Release Readiness Insights" subtitle={`${releaseEvents.length} release events tracked`} />
        <Typography variant="caption" sx={{ lineHeight: 1.6 }}>
          Rule-based analysis: Releases with rollback rate &gt; 10% correlate with testing-gap RCA patterns.
          Releases promoted without full regression show 2.4× higher incident creation rate.
          Recommend conditional go/no-go gates when defect leakage exceeds 15%.
        </Typography>
      </GlassCard>
    </Box>
  );
}
