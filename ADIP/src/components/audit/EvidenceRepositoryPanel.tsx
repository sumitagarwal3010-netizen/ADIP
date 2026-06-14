import { useMemo, useState } from 'react';
import {
  Box, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';
import { filterEvidence } from '../../data/auditCenterEngine';
import { AUDIT_DOMAINS, AUDIT_EVIDENCE_TYPES } from '../../data/auditCenterEngine';
import { useAbac } from '../../context/AbacContext';

const STATUSES = ['Draft', 'Pending Review', 'Approved', 'Rejected', 'Expired'];

export function EvidenceRepositoryPanel() {
  const { scopedAuditKpis, scopedEvidence } = useAbac();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const kpis = scopedAuditKpis;
  const rows = useMemo(() => filterEvidence({ search, type, domain, status }, scopedEvidence), [search, type, domain, status, scopedEvidence]);
  const selected = rows.find((r) => r.id === selectedId) ?? rows.find((r) => r.id === (selectedId ?? '')) ?? rows[0];

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Total Evidence" value={kpis.totalEvidence} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Coverage" value={kpis.evidenceCoverage} suffix="%" chartId="audit-center.evidence-coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Approved" value={rows.filter((r) => r.status === 'Approved').length} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Pending Review" value={rows.filter((r) => r.status === 'Pending Review').length} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Evidence Repository" subtitle={`${rows.length} of ${kpis.totalEvidence} records`} />
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
              <TextField size="small" placeholder="Search evidence…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 180 }} />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {AUDIT_EVIDENCE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
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
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {['ID', 'Type', 'Title', 'Domain', 'Status', 'Upload'].map((h) => (
                      <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, bgcolor: colors.bg.tertiary }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id} hover selected={selected?.id === r.id} onClick={() => setSelectedId(r.id)} sx={{ cursor: 'pointer' }}>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{r.id}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.65rem' }}>{r.evidenceType.replace(' Evidence', '')}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem', maxWidth: 200 }}>{r.title.slice(0, 50)}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{r.domain}</TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle }}><Chip label={r.status} size="small" sx={{ height: 20, fontSize: '0.6rem' }} /></TableCell>
                      <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem' }}>{r.uploadDate}</TableCell>
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
              <ModuleHeader title="Evidence Detail" subtitle={selected.id} />
              <Meta label="Type" value={selected.evidenceType} />
              <Meta label="Title" value={selected.title} />
              <Meta label="Description" value={selected.description} />
              <Meta label="Lifecycle Stage" value={selected.lifecycleStage} />
              <Meta label="Owner / Reviewer" value={`${selected.owner} → ${selected.reviewer}`} />
              <Meta label="Review Date" value={selected.reviewDate ?? 'Not reviewed'} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: colors.text.muted, display: 'block', mt: 1 }}>CROSS-LINKS</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {selected.linkedWorkflow && <Chip label={`WF: ${selected.linkedWorkflow}`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />}
                {selected.linkedArtifact && <Chip label={`ART: ${selected.linkedArtifact}`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />}
                {selected.linkedFinding && <Chip label={`FND: ${selected.linkedFinding}`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />}
                {selected.linkedObservation && <Chip label={`OBS: ${selected.linkedObservation}`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />}
                {selected.linkedTraceNode && <Chip label={`NODE: ${selected.linkedTraceNode}`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />}
              </Box>
            </GlassCard>
          )}
        </Grid>
      </Grid>
    </Box>
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
