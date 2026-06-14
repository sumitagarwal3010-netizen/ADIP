import { useMemo, useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { TraceNodeChip } from './TraceNodeChip';
import { colors } from '../../theme/colors';
import { TRACE_THREADS, type TraceNode } from '../../data/traceabilityModel';
import { lineageForThread, computeCoverage } from '../../data/traceabilityEngine';

interface TraceabilityDashboardProps {
  onSelectNode?: (node: TraceNode) => void;
}

export function TraceabilityDashboard({ onSelectNode }: TraceabilityDashboardProps) {
  const [threadId, setThreadId] = useState(TRACE_THREADS[0].id);
  const thread = TRACE_THREADS.find((t) => t.id === threadId) ?? TRACE_THREADS[0];
  const stages = useMemo(() => lineageForThread(thread.rootId), [thread.rootId]);
  const coverage = useMemo(() => computeCoverage(), []);

  const totalNodes = stages.reduce((acc, s) => acc + s.nodes.length, 0);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="End-to-End Coverage" value={coverage.overallCoverage} suffix="%" trend={3} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Threads Fully Traced" value={`${coverage.threadsFullyTraced}/${coverage.totalThreads}`} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Audit Readiness" value={coverage.auditReadiness} suffix="%" trend={2} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Broken / Missing Links" value={coverage.missingLinks.length} suffix="" trend={-1} compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }} glow="blue">
        <ModuleHeader title="End-to-End SDLC Lineage" subtitle="Requirement → Design → Development → Testing → Release → Production → Risk → Evidence → Compliance" />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {TRACE_THREADS.map((t) => {
            const active = t.id === threadId;
            return (
              <Box
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => setThreadId(t.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setThreadId(t.id); } }}
                sx={{
                  px: 1.5,
                  py: 0.6,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: active ? 700 : 500,
                  color: active ? colors.text.primary : colors.text.secondary,
                  bgcolor: active ? `${colors.primary}1f` : colors.bg.glass,
                  border: `1px solid ${active ? colors.primary : colors.border.subtle}`,
                  '&:focus-visible': { outline: `2px solid ${colors.primary}`, outlineOffset: 1 },
                }}
              >
                {t.label}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'stretch', gap: 0.5, minWidth: 'min-content' }}>
            {stages.map((stage, i) => (
              <Box key={stage.type} sx={{ display: 'flex', alignItems: 'stretch' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 150 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.6rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: colors.text.muted,
                      mb: 0.75,
                      textAlign: 'center',
                    }}
                  >
                    {stage.label}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                    {stage.nodes.map((n) => (
                      <TraceNodeChip key={n.id} node={n} compact onClick={onSelectNode} />
                    ))}
                  </Box>
                </Box>
                {i < stages.length - 1 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', px: 0.25 }}>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: colors.border.glow }} />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          {thread.label}: {totalNodes} linked artifacts across {stages.length} lifecycle stages. Click any artifact to run impact analysis.
        </Typography>
      </GlassCard>
    </Box>
  );
}
