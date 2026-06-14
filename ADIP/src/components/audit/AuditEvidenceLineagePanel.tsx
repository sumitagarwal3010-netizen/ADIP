import { Box, Chip, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { KpiCard } from '../common/KpiCard';
import { colors } from '../../theme/colors';
import { buildEvidenceLineage, computeAuditKpis, getMissingEvidenceStages } from '../../data/auditCenterEngine';
import { WORKFLOW_STAGE_LABEL } from '../../data/unifiedLifecycleEngine';

interface AuditEvidenceLineagePanelProps {
  workflowId?: string;
}

export function AuditEvidenceLineagePanel({ workflowId }: AuditEvidenceLineagePanelProps) {
  const lineage = buildEvidenceLineage(workflowId);
  const missing = getMissingEvidenceStages(workflowId);
  const kpis = computeAuditKpis();
  const coveredStages = lineage.filter((l) => l.coverage !== 'missing').length;

  return (
    <Box>
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Evidence Coverage" value={kpis.evidenceCoverage} suffix="%" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Stages Covered" value={`${coveredStages}/7`} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Missing Evidence" value={missing.length} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Total Evidence" value={lineage.reduce((s, l) => s + l.evidenceIds.length, 0)} compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader
          title="Evidence Lineage"
          subtitle={workflowId ? `Workflow ${workflowId} — Requirement → Production evidence chain` : 'Enterprise SDLC evidence chain'}
        />
        {lineage.map((entry, i) => (
          <Box
            key={entry.stage}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
              py: 1.25,
              borderBottom: i < lineage.length - 1 ? `1px solid ${colors.border.subtle}` : undefined,
            }}
          >
            <Box sx={{ minWidth: 100 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: colors.primary }}>
                {WORKFLOW_STAGE_LABEL[entry.stage]}
              </Typography>
              {entry.nodeId && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.62rem' }}>
                  {entry.nodeId}
                </Typography>
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.5 }}>
                {entry.evidenceIds.length > 0 ? (
                  entry.evidenceIds.slice(0, 5).map((id) => (
                    <Chip key={id} label={id} size="small" sx={{ height: 20, fontSize: '0.58rem' }} />
                  ))
                ) : (
                  <Typography variant="caption" color="error" sx={{ fontSize: '0.72rem' }}>No evidence linked</Typography>
                )}
                {entry.evidenceIds.length > 5 && (
                  <Chip label={`+${entry.evidenceIds.length - 5} more`} size="small" sx={{ height: 20, fontSize: '0.58rem' }} />
                )}
              </Box>
            </Box>
            <Chip
              label={entry.coverage}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.62rem',
                bgcolor: entry.coverage === 'complete' ? `${colors.success}18` : entry.coverage === 'partial' ? `${colors.warning}18` : `${colors.critical}18`,
                color: entry.coverage === 'complete' ? colors.success : entry.coverage === 'partial' ? colors.warning : colors.critical,
              }}
            />
          </Box>
        ))}
      </GlassCard>

      {missing.length > 0 && (
        <GlassCard sx={{ p: 2, mt: 1.5 }} glow="purple">
          <ModuleHeader title="Missing Evidence" subtitle="Stages without linked audit evidence" />
          {missing.map((stage) => (
            <Typography key={stage} variant="caption" sx={{ display: 'block', py: 0.3, fontSize: '0.75rem' }}>
              • {WORKFLOW_STAGE_LABEL[stage]} — evidence required for audit readiness
            </Typography>
          ))}
        </GlassCard>
      )}
    </Box>
  );
}
