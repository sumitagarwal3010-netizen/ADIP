import { useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { colors } from '../../theme/colors';
import { buildRtm, type RtmRow } from '../../data/traceabilityEngine';
import type { TraceNode } from '../../data/traceabilityModel';
import { traceStatusColor } from './traceVisuals';

const COLUMNS: { key: keyof Omit<RtmRow, 'coverage' | 'missing'>; label: string }[] = [
  { key: 'businessRequirement', label: 'Business Req' },
  { key: 'functionalRequirement', label: 'Functional Req' },
  { key: 'userStory', label: 'User Story' },
  { key: 'architecture', label: 'Architecture' },
  { key: 'api', label: 'API' },
  { key: 'testCase', label: 'Test Case' },
  { key: 'release', label: 'Release' },
  { key: 'evidence', label: 'Evidence' },
];

function Cell({ node, onClick }: { node?: TraceNode; onClick?: (n: TraceNode) => void }) {
  if (!node) {
    return (
      <Box sx={{ minWidth: 130, flex: 1, p: 0.75 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.75,
            borderRadius: 1,
            border: `1px dashed ${colors.critical}66`,
            bgcolor: `${colors.critical}10`,
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 13, color: colors.critical }} />
          <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.critical, fontWeight: 700 }}>
            MISSING
          </Typography>
        </Box>
      </Box>
    );
  }
  const statusColor = traceStatusColor(node.status);
  return (
    <Box sx={{ minWidth: 130, flex: 1, p: 0.75 }}>
      <Box
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick ? () => onClick(node) : undefined}
        onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(node); } } : undefined}
        sx={{
          px: 1,
          py: 0.5,
          borderRadius: 1,
          border: `1px solid ${colors.border.subtle}`,
          bgcolor: colors.bg.glass,
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? { borderColor: colors.primary } : {},
          '&:focus-visible': { outline: `2px solid ${colors.primary}`, outlineOffset: 1 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem', color: colors.text.muted }}>{node.id}</Typography>
          <Box sx={{ ml: 'auto', width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor }} />
        </Box>
        <Typography variant="caption" sx={{ display: 'block', fontSize: '0.66rem', fontWeight: 600, lineHeight: 1.25 }}>
          {node.name}
        </Typography>
      </Box>
    </Box>
  );
}

interface RtmProps {
  onSelectNode?: (node: TraceNode) => void;
}

export function RequirementTraceabilityMatrix({ onSelectNode }: RtmProps) {
  const rows = useMemo(() => buildRtm(), []);
  const avgCoverage = Math.round((rows.reduce((a, r) => a + r.coverage, 0) / Math.max(1, rows.length)) * 100);
  const fullyTraced = rows.filter((r) => r.coverage === 1).length;
  const totalMissing = rows.reduce((a, r) => a + r.missing.length, 0);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="RTM Coverage" value={avgCoverage} suffix="%" trend={2} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Requirements Traced" value={rows.length} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Fully Traced" value={`${fullyTraced}/${rows.length}`} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Missing Links" value={totalMissing} suffix="" trend={-2} compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Requirement Traceability Matrix" subtitle="Business Requirement → Functional → User Story → Architecture → API → Test Case → Release → Evidence" />
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 1100 }}>
            <Box sx={{ display: 'flex', borderBottom: `1px solid ${colors.border.subtle}`, pb: 0.5, mb: 0.5 }}>
              {COLUMNS.map((c) => (
                <Typography
                  key={c.key}
                  variant="caption"
                  sx={{ minWidth: 130, flex: 1, px: 0.75, fontWeight: 700, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.03em', color: colors.text.muted }}
                >
                  {c.label}
                </Typography>
              ))}
              <Typography variant="caption" sx={{ minWidth: 90, px: 0.75, fontWeight: 700, fontSize: '0.62rem', textTransform: 'uppercase', color: colors.text.muted, textAlign: 'right' }}>
                Coverage
              </Typography>
            </Box>
            {rows.map((row) => {
              const pct = Math.round(row.coverage * 100);
              const pctColor = pct === 100 ? colors.success : pct >= 75 ? colors.warning : colors.critical;
              return (
                <Box
                  key={row.businessRequirement.id}
                  sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${colors.border.subtle}`, py: 0.5 }}
                >
                  {COLUMNS.map((c) => (
                    <Cell key={c.key} node={row[c.key] as TraceNode | undefined} onClick={onSelectNode} />
                  ))}
                  <Box sx={{ minWidth: 90, px: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    {pct === 100 && <CheckCircleIcon sx={{ fontSize: 14, color: colors.success }} />}
                    <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.72rem', color: pctColor }}>
                      {pct}%
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </GlassCard>
    </Box>
  );
}
