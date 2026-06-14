import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
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

export function EventHistoryPanel() {
  const { filterEvents } = useEventBus();
  const [search, setSearch] = useState('');

  const events = useMemo(() => filterEvents({ search }), [filterEvents, search]);

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Event History" subtitle={`${events.length} events in bus`} />
      <Box sx={{ mb: 1.5 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search event type, message, source, entity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ '& .MuiInputBase-input': { fontSize: '0.75rem' } }}
        />
      </Box>
      <TableContainer sx={{ maxHeight: 420 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {['ID', 'Type', 'Source', 'Severity', 'Actor', 'Entity', 'Message', 'Time'].map((h) => (
                <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, fontSize: '0.62rem', bgcolor: colors.bg.card }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {events.slice(0, 80).map((e) => (
              <TableRow key={e.id} hover>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.58rem', fontFamily: 'monospace' }}>{e.id}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{e.type}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{e.source}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle }}>
                  <Chip label={e.severity} size="small" sx={{ height: 16, fontSize: '0.5rem', color: SEVERITY_COLOR[e.severity] }} />
                </TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{e.actor}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.58rem' }}>{e.entityType}:{e.entityId}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem', maxWidth: 180 }}>{e.message}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.58rem' }}>{new Date(e.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {events.length === 0 && (
        <Typography variant="caption" color="text.secondary">No events match your search.</Typography>
      )}
    </GlassCard>
  );
}
