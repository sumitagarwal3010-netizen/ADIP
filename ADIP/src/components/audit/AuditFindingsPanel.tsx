import { useMemo, useState } from 'react';
import {
  Box, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { SeverityChip } from '../common/SeverityChip';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { DonutChart } from '../charts/DonutChart';
import { colors } from '../../theme/colors';
import { filterFindings, findingsSeverityChartData } from '../../data/auditCenterEngine';
import { AUDIT_DOMAINS } from '../../data/auditCenterEngine';
import { useAbac } from '../../context/AbacContext';

const STATUSES = ['Open', 'In Progress', 'Mitigated', 'Risk Accepted', 'Closed'];
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

export function AuditFindingsPanel() {
  const { scopedAuditKpis, scopedFindings } = useAbac();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('');
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const kpis = scopedAuditKpis;
  const rows = useMemo(() => filterFindings({ search, severity, domain, status }, scopedFindings), [search, severity, domain, status, scopedFindings]);
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Open" value={kpis.openFindings} chartId="audit-center.open-findings" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Critical" value={kpis.criticalFindings} chartId="audit-center.findings-by-severity" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Overdue" value={kpis.overdueFindings} chartId="audit-center.overdue-findings" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Closed" value={kpis.closedFindings} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Severity Analysis" />
            <DonutChart chartId="audit-center.findings-by-severity" data={findingsSeverityChartData()} centerLabel="Total" height={150} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Aging Analysis" />
            <HorizontalBarChart
              chartId="audit-center.findings-aging"
              data={kpis.findingsAging.map((a) => ({ name: a.bucket, value: a.count }))}
              height={150}
              barColor={colors.critical}
            />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Audit Findings Register" subtitle={`${rows.length} findings`} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              <TextField size="small" placeholder="Search findings…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 180 }} />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Severity</InputLabel>
                <Select label="Severity" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {SEVERITIES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Domain</InputLabel>
                <Select label="Domain" value={domain} onChange={(e) => setDomain(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {AUDIT_DOMAINS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 130 }}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['ID', 'Severity', 'Domain', 'Control Area', 'Status', 'Due'].map((h) => (
                      <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow
                      key={r.id}
                      hover
                      selected={selected?.id === r.id}
                      onClick={() => setSelectedId(r.id)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.75rem' }}>{r.id}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle }}><SeverityChip severity={r.severity} /></TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.75rem' }}>{r.domain}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{r.controlArea}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle }}><Chip label={r.status} size="small" sx={{ height: 20, fontSize: '0.62rem' }} /></TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{r.dueDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          {selected && (
            <GlassCard sx={{ p: 2 }} glow="purple">
              <ModuleHeader title="Finding Detail" subtitle={selected.id} />
              <Typography variant="body2" sx={{ mb: 1, fontSize: '0.8rem' }}>{selected.description}</Typography>
              <DetailRow label="Owner" value={selected.owner} />
              <DetailRow label="Workflow" value={selected.linkedWorkflow ?? '—'} />
              <DetailRow label="Resolution" value={selected.resolution ?? 'Pending'} />
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>{label}</Typography>
      <Typography variant="caption" sx={{ display: 'block', fontWeight: 600, fontSize: '0.75rem' }}>{value}</Typography>
    </Box>
  );
}
