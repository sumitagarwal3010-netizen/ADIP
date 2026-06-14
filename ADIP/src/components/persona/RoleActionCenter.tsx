import { useMemo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PolicyIcon from '@mui/icons-material/Policy';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { TraceNodeChip } from '../traceability/TraceNodeChip';
import { colors } from '../../theme/colors';
import { nodesForAction } from '../../data/traceabilityEngine';
import { TRACE_TYPE_LABEL, type TraceNode, type TraceNodeType } from '../../data/traceabilityModel';
import type { PersonaConfig } from '../../config/personaConfig';

interface RoleActionCenterProps {
  persona: PersonaConfig;
  onSelectNode?: (node: TraceNode) => void;
}

interface ActionBucket {
  key: string;
  title: string;
  icon: typeof AssignmentTurnedInIcon;
  accent: string;
  /** Predicate over an actionable node to assign it to this bucket. */
  match: (n: TraceNode) => boolean;
}

const APPROVAL_STATUSES = new Set(['Pending Review', 'In Progress', 'At Risk']);

function buildBuckets(types: Set<TraceNodeType>): ActionBucket[] {
  const has = (t: TraceNodeType) => types.has(t);
  const buckets: ActionBucket[] = [];

  // Pending approvals — any in-scope artifact awaiting review/decision.
  buckets.push({
    key: 'approvals',
    title: 'Pending Approvals',
    icon: AssignmentTurnedInIcon,
    accent: colors.warning,
    match: (n) =>
      APPROVAL_STATUSES.has(n.status) &&
      (['release', 'architecture', 'api', 'testCase', 'model', 'prompt', 'evidence', 'control'] as TraceNodeType[]).some((t) => types.has(t) && n.type === t),
  });

  if (has('risk')) {
    buckets.push({
      key: 'risks',
      title: 'Open Risks',
      icon: WarningAmberIcon,
      accent: colors.critical,
      match: (n) => n.type === 'risk',
    });
  }
  if (has('incident') || has('production')) {
    buckets.push({
      key: 'incidents',
      title: 'Open Incidents',
      icon: ReportProblemIcon,
      accent: colors.critical,
      match: (n) => n.type === 'incident',
    });
  }
  if (has('evidence')) {
    buckets.push({
      key: 'audit',
      title: 'Audit Actions',
      icon: FactCheckIcon,
      accent: colors.info,
      match: (n) => n.type === 'evidence',
    });
  }
  if (has('compliance')) {
    buckets.push({
      key: 'compliance',
      title: 'Compliance Actions',
      icon: PolicyIcon,
      accent: colors.secondary,
      match: (n) => n.type === 'compliance',
    });
  }
  return buckets;
}

export function RoleActionCenter({ persona, onSelectNode }: RoleActionCenterProps) {
  const { items, buckets } = useMemo(() => {
    const typeSet = new Set(persona.actionScope.types);
    const open = nodesForAction({
      types: persona.actionScope.types,
      domain: persona.actionScope.domain,
      openOnly: true,
    });
    const defs = buildBuckets(typeSet);
    const grouped = defs
      .map((b) => {
        // Assign each open node to the FIRST matching bucket so it isn't double-counted.
        return { def: b, nodes: [] as TraceNode[] };
      });
    for (const node of open) {
      const target = grouped.find((g) => g.def.match(node));
      if (target) target.nodes.push(node);
    }
    return { items: open, buckets: grouped.filter((g) => g.nodes.length > 0) };
  }, [persona]);

  const totalActions = items.length;

  return (
    <GlassCard sx={{ p: 2, mt: 1.5 }} glow="purple">
      <ModuleHeader
        title="Action Center"
        subtitle={`${totalActions} open item${totalActions === 1 ? '' : 's'} requiring ${persona.label} attention${persona.actionScope.domain ? ` · ${persona.actionScope.domain}` : ''}`}
      />
      {buckets.length === 0 ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', py: 2, textAlign: 'center' }}>
          No open actions in this persona's scope. All in-scope items are approved, passed, or resolved.
        </Typography>
      ) : (
        <Grid container spacing={1.5}>
          {buckets.map(({ def, nodes }) => {
            const Icon = def.icon;
            return (
              <Grid key={def.key} size={{ xs: 12, sm: 6, md: 4 }}>
                <Box
                  sx={{
                    p: 1.25,
                    height: '100%',
                    borderRadius: 1.5,
                    bgcolor: colors.bg.glass,
                    border: `1px solid ${colors.border.subtle}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                    <Icon sx={{ fontSize: 16, color: def.accent }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', flex: 1 }}>
                      {def.title}
                    </Typography>
                    <Box sx={{ px: 0.75, py: 0.1, borderRadius: 0.75, bgcolor: `${def.accent}22`, color: def.accent, fontSize: '0.65rem', fontWeight: 800 }}>
                      {nodes.length}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {nodes.map((n) => (
                      <TraceNodeChip key={n.id} node={n} compact onClick={onSelectNode} />
                    ))}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25, fontSize: '0.68rem' }}>
        Sourced from the enterprise traceability graph ({persona.actionScope.types.map((t) => TRACE_TYPE_LABEL[t]).join(' · ')}). Click any item to open it in Impact Analysis.
      </Typography>
    </GlassCard>
  );
}
