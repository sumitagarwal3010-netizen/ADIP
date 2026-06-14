import { useMemo, useState } from 'react';
import { Box, Chip, FormControl, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';
import { useNotifications } from '../../context/NotificationContext';

const ACTIONS = ['Created', 'Acknowledged', 'Escalated', 'Resolved', 'Dismissed', 'Suppressed', 'Delivered', 'Read'];

const ACTION_COLOR: Record<string, string> = {
  Created: colors.info,
  Acknowledged: colors.success,
  Escalated: colors.critical,
  Resolved: colors.success,
  Dismissed: colors.text.muted,
  Suppressed: colors.warning,
  Delivered: colors.primary,
  Read: colors.secondary,
};

export function AlertHistoryPanel() {
  const { history } = useNotifications();
  const [search, setSearch] = useState('');
  const [action, setAction] = useState('');

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return history.filter((h) => {
      if (action && h.action !== action) return false;
      if (!q) return true;
      return h.notificationId.toLowerCase().includes(q) || h.detail.toLowerCase().includes(q) || h.actor.toLowerCase().includes(q);
    });
  }, [history, search, action]);

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Alert History" subtitle={`${rows.length} lifecycle events — creation through resolution`} />
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
        <TextField size="small" placeholder="Search history…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 200 }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Action</InputLabel>
          <Select label="Action" value={action} onChange={(e) => setAction(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {ACTIONS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {['Timestamp', 'Notification', 'Action', 'Actor', 'Detail', 'Escalation'].map((h) => (
                <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, bgcolor: colors.bg.tertiary }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((h) => (
              <TableRow key={h.id}>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                  {new Date(h.timestamp).toLocaleString()}
                </TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{h.notificationId}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle }}>
                  <Chip label={h.action} size="small" sx={{ height: 20, fontSize: '0.58rem', color: ACTION_COLOR[h.action] }} />
                </TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{h.actor}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.7rem', maxWidth: 280 }}>{h.detail}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>
                  {h.fromLevel && h.toLevel ? `${h.fromLevel} → ${h.toLevel}` : h.toLevel ?? '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GlassCard>
  );
}
