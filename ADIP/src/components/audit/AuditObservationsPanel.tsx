import { useMemo, useState } from 'react';
import {
  Box, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';
import { computeAuditKpis, filterObservations } from '../../data/auditCenterEngine';
import { AUDIT_DOMAINS } from '../../data/auditCenterEngine';

const STATUSES = ['Open', 'In Progress', 'Management Response', 'Closed'];

export function AuditObservationsPanel() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [domain, setDomain] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const kpis = computeAuditKpis();
  const rows = useMemo(() => filterObservations({ search, status, domain }), [search, status, domain]);
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Open Observations" value={kpis.openObservations} compact /></Grid>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Total Observations" value={25} compact /></Grid>
        <Grid size={{ xs: 6, md: 4 }}><KpiCard label="Closed" value={rows.filter((r) => r.closureStatus === 'Closed').length} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Audit Observations Register" subtitle="Management responses and closure tracking" />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              <TextField size="small" placeholder="Search observations…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 180 }} />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Closure Status</InputLabel>
                <Select label="Closure Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Domain</InputLabel>
                <Select label="Domain" value={domain} onChange={(e) => setDomain(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {AUDIT_DOMAINS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['ID', 'Observation', 'Domain', 'Target Date', 'Status'].map((h) => (
                      <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} hover selected={selected?.id === r.id} onClick={() => setSelectedId(r.id)} sx={{ cursor: 'pointer' }}>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.75rem' }}>{r.id}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem', maxWidth: 280 }}>{r.observation.slice(0, 80)}…</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{r.domain}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{r.targetDate}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle }}><Chip label={r.closureStatus} size="small" sx={{ height: 20, fontSize: '0.62rem' }} /></TableCell>
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
              <ModuleHeader title="Observation Detail" subtitle={selected.id} />
              <Detail label="Observation" value={selected.observation} />
              <Detail label="Recommendation" value={selected.recommendation} />
              <Detail label="Management Response" value={selected.managementResponse ?? 'Awaiting response'} />
              <Detail label="Linked Finding" value={selected.linkedFinding ?? '—'} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.text.muted, display: 'block', mt: 1 }}>LINKED EVIDENCE</Typography>
              {selected.linkedEvidence.map((e) => (
                <Chip key={e} label={e} size="small" sx={{ mr: 0.5, mb: 0.5, height: 20, fontSize: '0.6rem' }} />
              ))}
            </GlassCard>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontSize: '0.78rem' }}>{value}</Typography>
    </Box>
  );
}
