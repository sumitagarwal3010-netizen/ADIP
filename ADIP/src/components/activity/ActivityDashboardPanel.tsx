import { Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { DonutChart } from '../charts/DonutChart';
import { GaugeChart } from '../charts/GaugeChart';
import { useEventBus } from '../../context/EventContext';
import { colors } from '../../theme/colors';

export function ActivityDashboardPanel() {
  const { kpis, eventsByType, eventsBySource } = useEventBus();

  const typeChart = eventsByType.map((d, i) => ({
    ...d,
    color: [colors.primary, colors.secondary, colors.info, colors.success, colors.warning][i % 5],
  }));

  return (
    <>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Event Volume" value={kpis.eventVolume} chartId="activity.volume" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Critical Events" value={kpis.criticalEvents} chartId="activity.critical-events" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="High Risk" value={kpis.highRiskEvents} compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Event Sources" value={kpis.uniqueSources} chartId="activity.events-by-source" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Platform Health" value={kpis.platformEventHealth} suffix="%" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Workflow Activity" value={kpis.workflowActivity} chartId="activity.workflow-events" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Approval Activity" value={kpis.approvalActivity} compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Audit Activity" value={kpis.auditActivity} chartId="activity.audit-events" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Notification Events" value={kpis.notificationEvents} chartId="activity.notification-events" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="24h Volume" value={kpis.eventVolume24h} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, textAlign: 'center' }}>
            <ModuleHeader title="Event Health" />
            <GaugeChart chartId="activity.volume" value={kpis.platformEventHealth} label="Health" size={160} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Events by Type" />
            <DonutChart chartId="activity.events-by-type" data={typeChart} height={160} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Events by Source" />
            <HorizontalBarChart chartId="activity.events-by-source" data={eventsBySource} height={160} barColor={colors.primary} />
          </GlassCard>
        </Grid>
      </Grid>
    </>
  );
}
