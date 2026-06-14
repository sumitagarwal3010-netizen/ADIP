import { Box, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { SeverityChip } from '../common/SeverityChip';
import { colors } from '../../theme/colors';
import { useNotifications } from '../../context/NotificationContext';

export function EscalationQueuePanel() {
  const { escalationQueue, kpis, escalate, acknowledge } = useNotifications();

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
        <Box sx={{ flex: '1 1 180px' }}><KpiCard label="Escalated Alerts" value={kpis.escalatedAlerts} chartId="notification-center.escalation-trend" compact /></Box>
        <Box sx={{ flex: '1 1 180px' }}><KpiCard label="Executive Level" value={escalationQueue.filter((n) => n.escalationLevel === 'Executive Escalation').length} compact /></Box>
        <Box sx={{ flex: '1 1 180px' }}><KpiCard label="SLA Breaches" value={kpis.slaBreaches} chartId="notification-center.sla-breaches" compact /></Box>
      </Box>

      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Escalation Queue" subtitle="Level 2+ and active escalations requiring action" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['ID', 'Title', 'Trigger', 'Level', 'Severity', 'Owner', 'Workflow', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {escalationQueue.map((n) => (
                <TableRow key={n.id}>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{n.id}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem', maxWidth: 200 }}>{n.title.slice(0, 50)}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.65rem' }}>{n.escalationTrigger ?? '—'}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle }}><Chip label={n.escalationLevel} size="small" color={n.escalationLevel === 'Executive Escalation' ? 'error' : 'warning'} sx={{ height: 20, fontSize: '0.58rem' }} /></TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle }}><SeverityChip severity={n.severity === 'critical' ? 'Critical' : 'High'} /></TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{n.owner}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.65rem' }}>{n.linkedWorkflow ?? '—'}</TableCell>
                  <TableCell sx={{ borderColor: colors.border.subtle }}>
                    <Typography variant="caption" sx={{ cursor: 'pointer', color: colors.primary, mr: 1 }} onClick={() => escalate(n.id)}>Escalate</Typography>
                    <Typography variant="caption" sx={{ cursor: 'pointer', color: colors.success }} onClick={() => acknowledge(n.id)}>Ack</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>
    </Box>
  );
}
