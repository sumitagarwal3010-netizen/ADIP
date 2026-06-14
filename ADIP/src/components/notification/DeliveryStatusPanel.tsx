import { Box, Chip, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';
import { useNotifications } from '../../context/NotificationContext';

const STATUS_COLOR: Record<string, string> = {
  Pending: colors.warning,
  Delivered: colors.success,
  Read: colors.info,
  Failed: colors.critical,
  Suppressed: colors.text.muted,
};

export function DeliveryStatusPanel() {
  const { notifications, kpis } = useNotifications();
  const deliveries = notifications.flatMap((n) =>
    n.deliveries.map((d) => ({ ...d, notificationId: n.id, title: n.title })),
  );

  const byChannel = ['In-App', 'Email (mock)', 'SMS (mock)', 'Teams (mock)', 'Slack (mock)'].map((ch) => {
    const chDeliveries = deliveries.filter((d) => d.channel === ch);
    const ok = chDeliveries.filter((d) => d.status === 'Delivered' || d.status === 'Read').length;
    return { channel: ch, total: chDeliveries.length, rate: chDeliveries.length ? Math.round((ok / chDeliveries.length) * 100) : 0 };
  });

  return (
    <Box>
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Delivery Rate" value={kpis.deliveryRate} suffix="%" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Total Deliveries" value={deliveries.length} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Failed" value={deliveries.filter((d) => d.status === 'Failed').length} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Read" value={deliveries.filter((d) => d.status === 'Read').length} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Mock Channel Health" subtitle="Simulated delivery — no external integrations" />
            {byChannel.map((c) => (
              <Box key={c.channel} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
                <Chip label={c.channel} size="small" sx={{ height: 22, fontSize: '0.62rem' }} />
                <Box sx={{ textAlign: 'right' }}>
                  <Box component="span" sx={{ fontSize: '0.75rem', fontWeight: 700 }}>{c.rate}%</Box>
                  <Box component="span" sx={{ fontSize: '0.62rem', color: colors.text.muted, ml: 0.5 }}>({c.total})</Box>
                </Box>
              </Box>
            ))}
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Delivery Log" subtitle="Per-notification mock channel delivery status" />
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {['Notification', 'Channel', 'Status', 'Delivered', 'Read'].map((h) => (
                      <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, bgcolor: colors.bg.tertiary }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveries.slice(0, 80).map((d, i) => (
                    <TableRow key={`${d.notificationId}-${d.channel}-${i}`}>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{d.notificationId}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.65rem' }}>{d.channel}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle }}><Chip label={d.status} size="small" sx={{ height: 20, fontSize: '0.58rem', color: STATUS_COLOR[d.status] }} /></TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{d.deliveredAt ? new Date(d.deliveredAt).toLocaleString() : '—'}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{d.readAt ? new Date(d.readAt).toLocaleString() : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
