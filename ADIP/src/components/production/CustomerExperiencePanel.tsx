import { Box, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { MultiLineChart } from '../charts/MultiLineChart';
import { useProductionIntelligence } from '../../context/ProductionIntelligenceContext';
import { colors } from '../../theme/colors';

const CHANNEL_LABEL: Record<string, string> = {
  'call-center': 'Call Center',
  branch: 'Branch Feedback',
  complaint: 'Customer Complaints',
  'app-store': 'App Store Ratings',
  nps: 'NPS Trends',
};

export function CustomerExperiencePanel() {
  const { customerSignals, sentimentTrend, topPainPoints, mostImpactedApps, kpis } = useProductionIntelligence();

  const byChannel = ['call-center', 'branch', 'complaint', 'app-store', 'nps'].map((ch) => ({
    name: CHANNEL_LABEL[ch],
    value: customerSignals.filter((s) => s.channel === ch).length,
  }));

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Customer Signal Channels" subtitle={`${kpis.customerComplaints} formal complaints`} />
            <HorizontalBarChart chartId="prod-intel.customer-channels" data={byChannel} height={200} barColor={colors.info} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Sentiment Trends" />
            <MultiLineChart
              data={sentimentTrend}
              series={[
                { key: 'negative', name: 'Negative', color: colors.critical },
                { key: 'neutral', name: 'Neutral', color: colors.text.muted },
                { key: 'positive', name: 'Positive', color: colors.success },
              ]}
              height={200}
            />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Customer Pain Points" />
            <HorizontalBarChart chartId="prod-intel.pain-points" data={topPainPoints} height={180} barColor={colors.warning} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Most Impacted Applications" />
            <HorizontalBarChart chartId="prod-intel.impacted-apps" data={mostImpactedApps} height={180} barColor={colors.critical} />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Recent Customer Signals" />
        {customerSignals.slice(0, 12).map((s) => (
          <Box key={s.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{CHANNEL_LABEL[s.channel]} — {s.application}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>{s.summary} · {s.painPoint}</Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
