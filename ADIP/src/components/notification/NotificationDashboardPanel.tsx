import { Box, Grid, Typography } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { AIInsightBox } from '../common/AIInsightBox';
import { DonutChart } from '../charts/DonutChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { MultiLineChart } from '../charts/MultiLineChart';
import { DrilldownTableRow } from '../common/DrilldownTableRow';
import { SeverityChip } from '../common/SeverityChip';
import { colors } from '../../theme/colors';
import { useNotifications } from '../../context/NotificationContext';
import { NOTIFICATION_EXEC_SUMMARY } from '../../data/notificationCenterMock';
import { severityChartData } from '../../data/notificationCenterEngine';

export function NotificationDashboardPanel() {
  const { kpis, notifications } = useNotifications();
  const critical = notifications.filter((n) => n.severity === 'critical' && n.status !== 'Resolved' && n.status !== 'Dismissed').slice(0, 5);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Open Alerts" value={kpis.openAlerts} chartId="notification-center.open-alerts" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Critical Alerts" value={kpis.criticalAlerts} chartId="notification-center.critical-alerts" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Escalated" value={kpis.escalatedAlerts} chartId="notification-center.escalation-trend" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="SLA Breaches" value={kpis.slaBreaches} chartId="notification-center.sla-breaches" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Resolved" value={kpis.resolvedAlerts} chartId="notification-center.resolved-alerts" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Alerts by Severity" />
            <DonutChart chartId="notification-center.alerts-by-severity" data={severityChartData(notifications)} centerLabel="Open" height={160} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Alerts by Source" />
            <HorizontalBarChart chartId="notification-center.alerts-by-source" data={kpis.bySource} height={160} barColor={colors.primary} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Escalation Trend" />
            <MultiLineChart
              data={kpis.escalationTrend.map((e) => ({ month: e.month, escalations: e.count }))}
              series={[{ key: 'escalations', color: colors.critical, name: 'Escalations' }]}
              height={160}
            />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Critical Alerts" subtitle="Requires immediate attention" />
        {critical.map((n) => (
          <DrilldownTableRow
            key={n.id}
            chartId="notification-center.critical-alerts"
            segment={n.severity}
            label={n.id}
            value={n.severity}
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}
          >
            <Box sx={{ flex: 1, mr: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block' }}>{n.title}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>{n.source} · {n.escalationLevel} · {n.owner}</Typography>
            </Box>
            <SeverityChip severity={n.severity === 'critical' ? 'Critical' : n.severity === 'high' ? 'High' : 'Medium'} />
          </DrilldownTableRow>
        ))}
      </GlassCard>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Executive Notification Summary" insight={NOTIFICATION_EXEC_SUMMARY} />
      </Box>
    </Box>
  );
}
