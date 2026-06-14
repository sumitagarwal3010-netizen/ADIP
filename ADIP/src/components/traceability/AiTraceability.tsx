import { useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { TraceNodeChip } from './TraceNodeChip';
import { colors } from '../../theme/colors';
import { buildAiChains, type AiChainRow } from '../../data/traceabilityEngine';
import { TRACE_TYPE_LABEL, type TraceNode, type TraceNodeType } from '../../data/traceabilityModel';

const STEPS: { key: keyof Omit<AiChainRow, 'useCase'>; type: TraceNodeType }[] = [
  { key: 'prompt', type: 'prompt' },
  { key: 'model', type: 'model' },
  { key: 'risk', type: 'risk' },
  { key: 'control', type: 'control' },
  { key: 'incident', type: 'incident' },
  { key: 'evidence', type: 'evidence' },
  { key: 'compliance', type: 'compliance' },
];

interface AiTraceabilityProps {
  onSelectNode?: (node: TraceNode) => void;
}

export function AiTraceability({ onSelectNode }: AiTraceabilityProps) {
  const chains = useMemo(() => buildAiChains(), []);

  const withControl = chains.filter((c) => c.control).length;
  const withEvidence = chains.filter((c) => c.evidence).length;
  const withIncident = chains.filter((c) => c.incident).length;

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="AI Use Cases Traced" value={chains.length} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Linked to Controls" value={`${withControl}/${chains.length}`} suffix="" trend={2} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="With Evidence" value={`${withEvidence}/${chains.length}`} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="With Incidents" value={withIncident} suffix="" trend={-1} compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }} glow="purple">
        <ModuleHeader title="AI Lifecycle Traceability" subtitle="Use Case → Prompt → Model → Risk → Control → Incident → Evidence → Compliance" />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {chains.map((chain) => (
            <Box
              key={chain.useCase.id}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                border: `1px solid ${colors.border.subtle}`,
                bgcolor: colors.bg.glass,
              }}
            >
              <Box sx={{ overflowX: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 'min-content' }}>
                  <TraceNodeChip node={chain.useCase} compact onClick={onSelectNode} />
                  {STEPS.map((step) => {
                    const node = chain[step.key] as TraceNode | undefined;
                    return (
                      <Box key={step.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ChevronRightIcon sx={{ fontSize: 15, color: colors.border.glow }} />
                        {node ? (
                          <TraceNodeChip node={node} compact onClick={onSelectNode} />
                        ) : (
                          <Box
                            sx={{
                              minWidth: 110,
                              px: 1,
                              py: 0.75,
                              borderRadius: 1,
                              border: `1px dashed ${colors.text.muted}55`,
                              textAlign: 'center',
                            }}
                          >
                            <Typography variant="caption" sx={{ fontSize: '0.58rem', color: colors.text.muted, fontWeight: 700 }}>
                              No {TRACE_TYPE_LABEL[step.type]}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </GlassCard>
    </Box>
  );
}
