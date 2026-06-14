import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useEventBus } from '../../context/EventContext';
import { colors } from '../../theme/colors';
import type { EventSeverity } from '../../types/events';

const SEVERITY_COLOR: Record<EventSeverity, string> = {
  info: colors.text.muted,
  low: colors.info,
  medium: colors.warning,
  high: colors.warning,
  critical: colors.critical,
};

const MODULES = ['all', 'Workflow', 'Approval', 'Audit', 'Evidence', 'Notification', 'Authentication', 'RBAC', 'Governance', 'AI Governance', 'Artifacts'];

export function ActivityStreamPanel() {
  const { filterActivities } = useEventBus();
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('all');
  const [severity, setSeverity] = useState<EventSeverity | 'all'>('all');

  const records = useMemo(() => {
    const base = filterActivities({ search, severity });
    if (module === 'all') return base;
    return base.filter((r) => r.module === module);
  }, [filterActivities, search, severity, module]);

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Activity Stream" subtitle={`${records.length} records`} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
        <TextField
          size="small"
          placeholder="Search actor, action, entity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220, '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
        />
        <Select size="small" value={module} onChange={(e) => setModule(e.target.value)} sx={{ fontSize: '0.72rem', minWidth: 130 }}>
          {MODULES.map((m) => <MenuItem key={m} value={m} sx={{ fontSize: '0.72rem' }}>{m}</MenuItem>)}
        </Select>
        <Select size="small" value={severity} onChange={(e) => setSeverity(e.target.value as EventSeverity | 'all')} sx={{ fontSize: '0.72rem', minWidth: 110 }}>
          {(['all', 'info', 'low', 'medium', 'high', 'critical'] as const).map((s) => (
            <MenuItem key={s} value={s} sx={{ fontSize: '0.72rem' }}>{s}</MenuItem>
          ))}
        </Select>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Timestamp', 'Actor', 'Action', 'Module', 'Severity', 'Entity'].map((h) => (
                <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, fontSize: '0.65rem' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {records.slice(0, 50).map((r) => (
              <TableRow key={r.id} hover>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{new Date(r.timestamp).toLocaleString()}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{r.actor}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem', fontWeight: 600 }}>{r.action}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{r.module}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle }}>
                  <Chip label={r.severity} size="small" sx={{ height: 18, fontSize: '0.55rem', color: SEVERITY_COLOR[r.severity] }} />
                </TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.65rem' }}>{r.entityType}: {r.entityId}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {records.length === 0 && (
        <Typography variant="caption" color="text.secondary">No activity records match your filters.</Typography>
      )}
    </GlassCard>
  );
}
