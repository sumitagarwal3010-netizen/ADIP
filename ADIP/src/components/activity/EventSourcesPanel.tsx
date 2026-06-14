import { Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useEventBus } from '../../context/EventContext';
import { colors } from '../../theme/colors';

const STATUS_COLOR = { active: colors.success, idle: colors.text.muted, degraded: colors.warning };

export function EventSourcesPanel() {
  const { sources } = useEventBus();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Event Sources" subtitle="Registered platform publishers" />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Source', 'Category', 'Events', 'Last Event', 'Status'].map((h) => (
                <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, fontSize: '0.65rem' }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sources.map((s) => (
              <TableRow key={s.source} hover>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem', fontWeight: 600 }}>{s.source}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{s.category}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{s.eventCount}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{s.lastEventAt ? new Date(s.lastEventAt).toLocaleString() : '—'}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle }}>
                  <Chip label={s.status} size="small" sx={{ height: 18, fontSize: '0.55rem', color: STATUS_COLOR[s.status] }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GlassCard>
  );
}
