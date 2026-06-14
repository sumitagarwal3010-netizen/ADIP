import { useMemo, useState } from 'react';
import { Box, Grid, TextField, Typography } from '@mui/material';
import NorthEastIcon from '@mui/icons-material/NorthEast';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { TraceNodeChip } from './TraceNodeChip';
import { colors } from '../../theme/colors';
import { TRACE_TYPE_LABEL, type TraceNode } from '../../data/traceabilityModel';
import { analyzeImpact, searchNodes } from '../../data/traceabilityEngine';
import { traceTypeColor } from './traceVisuals';

interface ImpactAnalysisProps {
  selectedId?: string;
  onSelectNode?: (node: TraceNode) => void;
}

function AffectedGroup({
  title,
  nodes,
  accent,
  onSelectNode,
}: {
  title: string;
  nodes: TraceNode[];
  accent: string;
  onSelectNode?: (n: TraceNode) => void;
}) {
  return (
    <GlassCard sx={{ p: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: colors.text.secondary }}>
          {title}
        </Typography>
        <Box sx={{ px: 0.75, py: 0.1, borderRadius: 0.75, bgcolor: `${accent}22`, color: accent, fontSize: '0.65rem', fontWeight: 800 }}>
          {nodes.length}
        </Box>
      </Box>
      {nodes.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>None</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {nodes.map((n) => (
            <TraceNodeChip key={n.id} node={n} compact onClick={onSelectNode} />
          ))}
        </Box>
      )}
    </GlassCard>
  );
}

export function ImpactAnalysis({ selectedId, onSelectNode }: ImpactAnalysisProps) {
  const [query, setQuery] = useState('');
  const [internalId, setInternalId] = useState<string | undefined>(undefined);
  const activeId = internalId ?? selectedId;

  const results = useMemo(() => searchNodes(query).slice(0, 40), [query]);
  const impact = useMemo(() => (activeId ? analyzeImpact(activeId) : null), [activeId]);

  const pick = (n: TraceNode) => {
    setInternalId(n.id);
    onSelectNode?.(n);
  };

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 1.5 }}>
            <ModuleHeader title="Select Artifact" subtitle="Search any artifact to trace impact" />
            <TextField
              size="small"
              fullWidth
              placeholder="Search by ID, name, or type..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{ mb: 1, '& .MuiOutlinedInput-root': { fontSize: '0.78rem', bgcolor: colors.bg.glass, '& fieldset': { borderColor: colors.border.subtle } } }}
            />
            <Box sx={{ maxHeight: 460, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {results.map((n) => (
                <TraceNodeChip key={n.id} node={n} compact active={n.id === activeId} onClick={pick} />
              ))}
            </Box>
          </GlassCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {!impact ? (
            <GlassCard sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                Select an artifact on the left to see its upstream dependencies, downstream impact, and affected releases, models, and controls.
              </Typography>
            </GlassCard>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <GlassCard sx={{ p: 1.5 }} glow="blue">
                <ModuleHeader title="Selected Artifact" subtitle={`${TRACE_TYPE_LABEL[impact.node.type]} · ${impact.node.owner} · ${impact.node.domain}`} />
                <TraceNodeChip node={impact.node} active />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.72rem', lineHeight: 1.5 }}>
                  {impact.node.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.info }}>
                    <NorthEastIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.25 }} />
                    {impact.upstream.length} upstream dependencies
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: colors.warning }}>
                    <SouthEastIcon sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.25 }} />
                    {impact.downstream.length} downstream impacted
                  </Typography>
                </Box>
              </GlassCard>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <AffectedGroup title="Upstream Dependencies" nodes={impact.upstream} accent={colors.info} onSelectNode={pick} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <AffectedGroup title="Downstream Impact" nodes={impact.downstream} accent={colors.warning} onSelectNode={pick} />
                </Grid>
              </Grid>

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <AffectedGroup title="Affected Releases" nodes={impact.affectedReleases} accent={traceTypeColor.release} onSelectNode={pick} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <AffectedGroup title="Affected Models" nodes={impact.affectedModels} accent={traceTypeColor.model} onSelectNode={pick} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <AffectedGroup title="Affected Controls" nodes={impact.affectedControls} accent={traceTypeColor.control} onSelectNode={pick} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <AffectedGroup title="Affected Compliance" nodes={impact.affectedCompliance} accent={traceTypeColor.compliance} onSelectNode={pick} />
                </Grid>
              </Grid>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
