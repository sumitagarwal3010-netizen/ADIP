import { useMemo, useState } from 'react';
import {
  Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { SeverityChip } from '../common/SeverityChip';
import { colors } from '../../theme/colors';
import { useNotifications } from '../../context/NotificationContext';
import { NOTIFICATION_SOURCES, NOTIFICATION_TYPES_LIST } from '../../data/notificationCenterEngine';

const STATUSES = ['Open', 'Acknowledged', 'Escalated', 'Resolved', 'Dismissed', 'Suppressed'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

export function NotificationInboxPanel() {
  const { filterInbox, acknowledge, resolve, dismiss, escalate, markRead, getHistory } = useNotifications();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => filterInbox({ search, type, severity, source, status }), [filterInbox, search, type, severity, source, status]);
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];
  const history = selected ? getHistory(selected.id) : [];

  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, md: 8 }}>
        <GlassCard sx={{ p: 2 }}>
          <ModuleHeader title="Notification Inbox" subtitle={`${rows.length} notifications`} />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
            <TextField size="small" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 160 }} />
            <FormControl size="small" sx={{ minWidth: 120 }}><InputLabel>Type</InputLabel><Select label="Type" value={type} onChange={(e) => setType(e.target.value)}><MenuItem value="">All</MenuItem>{NOTIFICATION_TYPES_LIST.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}</Select></FormControl>
            <FormControl size="small" sx={{ minWidth: 110 }}><InputLabel>Severity</InputLabel><Select label="Severity" value={severity} onChange={(e) => setSeverity(e.target.value)}><MenuItem value="">All</MenuItem>{SEVERITIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}><InputLabel>Source</InputLabel><Select label="Source" value={source} onChange={(e) => setSource(e.target.value)}><MenuItem value="">All</MenuItem>{NOTIFICATION_SOURCES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}><InputLabel>Status</InputLabel><Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><MenuItem value="">All</MenuItem>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select></FormControl>
          </Box>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {['ID', 'Title', 'Type', 'Severity', 'Source', 'Status', 'Level'].map((h) => (
                    <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, bgcolor: colors.bg.tertiary }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id} hover selected={selected?.id === r.id} onClick={() => { setSelectedId(r.id); markRead(r.id); }} sx={{ cursor: 'pointer', opacity: r.read ? 0.85 : 1 }}>
                    <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem', fontWeight: r.read ? 400 : 700 }}>{r.id}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem', maxWidth: 180 }}>{r.title.slice(0, 45)}…</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.65rem' }}>{r.type}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}><SeverityChip severity={r.severity === 'critical' ? 'Critical' : r.severity === 'high' ? 'High' : r.severity === 'medium' ? 'Medium' : 'Low'} /></TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.65rem' }}>{r.source}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}><Chip label={r.status} size="small" sx={{ height: 20, fontSize: '0.58rem' }} /></TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.62rem' }}>{r.escalationLevel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </GlassCard>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        {selected && (
          <GlassCard sx={{ p: 2 }} glow="blue">
            <ModuleHeader title="Notification Detail" subtitle={selected.id} />
            <Meta label="Title" value={selected.title} />
            <Meta label="Message" value={selected.message} />
            <Meta label="Owner" value={selected.owner} />
            <Meta label="Created" value={new Date(selected.createdAt).toLocaleString()} />
            <Meta label="Trigger" value={selected.escalationTrigger ?? '—'} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {selected.linkedWorkflow && <Chip label={selected.linkedWorkflow} size="small" sx={{ height: 20, fontSize: '0.58rem' }} />}
              {selected.linkedFinding && <Chip label={selected.linkedFinding} size="small" sx={{ height: 20, fontSize: '0.58rem' }} />}
              {selected.linkedEvidence && <Chip label={selected.linkedEvidence} size="small" sx={{ height: 20, fontSize: '0.58rem' }} />}
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
              <Button size="small" startIcon={<CheckIcon />} onClick={() => acknowledge(selected.id)} sx={{ fontSize: '0.65rem' }}>Acknowledge</Button>
              <Button size="small" startIcon={<TrendingUpIcon />} onClick={() => escalate(selected.id)} sx={{ fontSize: '0.65rem' }}>Escalate</Button>
              <Button size="small" onClick={() => resolve(selected.id)} sx={{ fontSize: '0.65rem' }}>Resolve</Button>
              <Button size="small" startIcon={<CloseIcon />} onClick={() => dismiss(selected.id)} sx={{ fontSize: '0.65rem' }}>Dismiss</Button>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: colors.text.muted }}>RECENT HISTORY</Typography>
            {history.slice(0, 4).map((h) => (
              <Typography key={h.id} variant="caption" sx={{ display: 'block', fontSize: '0.65rem', py: 0.2 }}>
                {h.action} — {h.detail}
              </Typography>
            ))}
          </GlassCard>
        )}
      </Grid>
    </Grid>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 0.75 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontSize: '0.76rem' }}>{value}</Typography>
    </Box>
  );
}
