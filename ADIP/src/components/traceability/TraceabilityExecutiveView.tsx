import { useMemo } from 'react';
import { Box, Grid, LinearProgress, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { SeverityChip } from '../common/SeverityChip';
import { colors } from '../../theme/colors';
import { computeCoverage } from '../../data/traceabilityEngine';
import type { TraceNode } from '../../data/traceabilityModel';

interface ExecViewProps {
  onSelectNode?: (id: string) => void;
}

export function TraceabilityExecutiveView({ onSelectNode }: ExecViewProps) {
  const summary = useMemo(() => computeCoverage(), []);

  const stageBars = summary.stageCoverage
    .map((s) => ({ name: s.label, value: Math.round(s.linkedPct * 100) }))
    .slice(0, 10);

  const readinessRows = [
    { label: 'End-to-End Traceability Coverage', value: summary.overallCoverage },
    { label: 'Requirement Matrix Coverage', value: summary.rtmCoverage },
    { label: 'Audit Readiness', value: summary.auditReadiness },
    { label: 'Compliance Readiness', value: summary.complianceReadiness },
  ];

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Traceability Coverage" value={summary.overallCoverage} suffix="%" trend={3} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Audit Readiness" value={summary.auditReadiness} suffix="%" trend={2} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Compliance Readiness" value={summary.complianceReadiness} suffix="%" trend={1} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Missing Links" value={summary.missingLinks.length} suffix="" trend={-2} compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2, height: '100%' }} glow="green">
            <ModuleHeader title="Readiness Scorecard" subtitle="Executive traceability posture" />
            {readinessRows.map((r) => (
              <Box key={r.label} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.74rem' }}>{r.label}</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.74rem', color: r.value >= 85 ? colors.success : r.value >= 70 ? colors.warning : colors.critical }}>
                    {r.value}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={r.value}
                  sx={{
                    height: 6,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': { bgcolor: r.value >= 85 ? colors.success : r.value >= 70 ? colors.warning : colors.critical },
                  }}
                />
              </Box>
            ))}
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2, height: '100%' }}>
            <ModuleHeader title="Stage Linkage Coverage" subtitle="% of artifacts linked per lifecycle stage" />
            <HorizontalBarChart data={stageBars} height={260} barColor={colors.primary} chartId="traceability.stage-coverage" />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }} glow="purple">
        <ModuleHeader title="Missing Traceability Links" subtitle="Broken lineage that blocks audit and compliance readiness" />
        {summary.missingLinks.length === 0 ? (
          <Typography variant="caption" color="text.secondary">All lineage links are complete.</Typography>
        ) : (
          <>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, py: 0.5, borderBottom: `1px solid ${colors.border.subtle}`, mb: 0.5 }}>
              {['Artifact', 'Type', 'Missing Link', 'Severity'].map((c) => (
                <Typography key={c} variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: colors.text.muted, minWidth: c === 'Artifact' ? 220 : c === 'Severity' ? 80 : 140, ml: c === 'Severity' ? 'auto' : undefined }}>
                  {c}
                </Typography>
              ))}
            </Box>
            {summary.missingLinks.map((m) => (
              <Box
                key={`${m.fromId}-${m.expected}`}
                role={onSelectNode ? 'button' : undefined}
                tabIndex={onSelectNode ? 0 : undefined}
                onClick={onSelectNode ? () => onSelectNode(m.fromId) : undefined}
                onKeyDown={onSelectNode ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectNode(m.fromId); } } : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 0.85,
                  borderBottom: `1px solid ${colors.border.subtle}`,
                  flexWrap: 'wrap',
                  cursor: onSelectNode ? 'pointer' : 'default',
                  '&:hover': onSelectNode ? { bgcolor: colors.bg.glass } : {},
                }}
              >
                <Box sx={{ minWidth: 220, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <WarningAmberIcon sx={{ fontSize: 15, color: m.severity === 'critical' ? colors.critical : colors.warning }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.6rem', color: colors.text.muted, display: 'block' }}>{m.fromId}</Typography>
                    <Typography variant="caption" sx={{ fontSize: '0.72rem' }}>{m.fromName}</Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>{m.fromType}</Typography>
                <Typography variant="caption" sx={{ minWidth: 140, color: colors.warning, fontWeight: 600 }}>→ No {m.expected}</Typography>
                <Box sx={{ ml: 'auto', minWidth: 80 }}>
                  <SeverityChip severity={m.severity} />
                </Box>
              </Box>
            ))}
          </>
        )}
      </GlassCard>
    </Box>
  );
}

export type { TraceNode };
