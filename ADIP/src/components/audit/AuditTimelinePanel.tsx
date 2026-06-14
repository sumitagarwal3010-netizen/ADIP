import { useMemo, useState } from 'react';
import {
  Box, Chip, FormControl, InputLabel, MenuItem, Select, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';
import { filterTimeline } from '../../data/auditCenterEngine';
import type { AuditTimelineCategory } from '../../types/auditCenter';

const CATEGORIES: AuditTimelineCategory[] = [
  'Authentication', 'RBAC', 'Approval', 'Workflow', 'Lifecycle', 'Governance', 'AI Governance', 'Artifact',
];

const CAT_COLOR: Record<string, string> = {
  Authentication: colors.info,
  RBAC: colors.secondary,
  Approval: colors.primary,
  Workflow: colors.success,
  Lifecycle: '#9c27b0',
  Governance: colors.warning,
  'AI Governance': '#e91e63',
  Artifact: colors.text.muted,
};

export function AuditTimelinePanel() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const events = useMemo(() => filterTimeline({ search, category }), [search, category]);

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Unified Audit Timeline" subtitle="Authentication, RBAC, approvals, workflows, governance, AI, and artifacts" />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
        <TextField size="small" placeholder="Search timeline…" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 200 }} />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Category</InputLabel>
          <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
            <MenuItem value="">All Categories</MenuItem>
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>
      <TableContainer sx={{ maxHeight: 520 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {['Timestamp', 'Category', 'Actor', 'Action', 'Detail', 'Links'].map((h) => (
                <TableCell key={h} sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600, bgcolor: colors.bg.tertiary }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((e) => (
              <TableRow key={e.id}>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
                  {new Date(e.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle }}>
                  <Chip label={e.category} size="small" sx={{ height: 20, fontSize: '0.58rem', bgcolor: `${CAT_COLOR[e.category]}22`, color: CAT_COLOR[e.category] }} />
                </TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem' }}>{e.actor}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.72rem', fontWeight: 600 }}>{e.action}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, fontSize: '0.7rem', maxWidth: 280 }}>{e.detail}</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle }}>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {e.linkedWorkflow && <Chip label={e.linkedWorkflow} size="small" sx={{ height: 18, fontSize: '0.55rem' }} />}
                    {e.linkedArtifact && <Chip label={e.linkedArtifact} size="small" sx={{ height: 18, fontSize: '0.55rem' }} />}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {events.length} events aggregated across enterprise audit domains
      </Typography>
    </GlassCard>
  );
}
