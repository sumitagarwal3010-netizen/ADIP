import { Grid } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { DonutChart } from '../charts/DonutChart';
import { useEventBus } from '../../context/EventContext';
import { colors } from '../../theme/colors';

export function EventAnalyticsPanel() {
  const { events, eventsByType, eventsBySource, volumeTrend, kpis } = useEventBus();

  const severityData = [
    { name: 'Critical', value: events.filter((e) => e.severity === 'critical').length, color: colors.critical },
    { name: 'High', value: events.filter((e) => e.severity === 'high').length, color: colors.warning },
    { name: 'Medium', value: events.filter((e) => e.severity === 'medium').length, color: colors.info },
    { name: 'Low/Info', value: events.filter((e) => e.severity === 'low' || e.severity === 'info').length, color: colors.text.muted },
  ];

  const trendData = volumeTrend.map((v) => ({ label: v.label, Events: v.value }));
  const trendSeries = [{ key: 'Events', name: 'Events', color: colors.primary }];

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, md: 6 }}>
        <GlassCard sx={{ p: 2 }}>
          <ModuleHeader title="Event Volume Trend" subtitle="7-day activity volume" />
          <MultiLineChart data={trendData} series={trendSeries} height={200} />
        </GlassCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <GlassCard sx={{ p: 2 }}>
          <ModuleHeader title="Severity Distribution" />
          <DonutChart chartId="activity.critical-events" data={severityData} height={200} />
        </GlassCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <GlassCard sx={{ p: 2 }}>
          <ModuleHeader title="Top Event Types" />
          <HorizontalBarChart chartId="activity.events-by-type" data={eventsByType} height={200} barColor={colors.primary} />
        </GlassCard>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <GlassCard sx={{ p: 2 }}>
          <ModuleHeader title="Category Breakdown" subtitle={`${kpis.eventVolume} total events`} />
          <HorizontalBarChart chartId="activity.events-by-source" data={eventsBySource} height={200} barColor={colors.secondary} />
        </GlassCard>
      </Grid>
    </Grid>
  );
}
