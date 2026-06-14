import { Box, Chip, Grid, MenuItem, Select, Typography } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { GaugeChart } from '../charts/GaugeChart';
import { useCopilot } from '../../context/CopilotContext';
import { colors } from '../../theme/colors';

const PRIORITY_COLOR = { critical: colors.critical, high: colors.warning, medium: colors.info, low: colors.text.muted };

export function CopilotWorkspacePanel() {
  const {
    projects, selectedProjectId, setSelectedProjectId, selectedProject,
    projectRecommendations, projectRisks, projectImprovements,
  } = useCopilot();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Copilot Workspace" subtitle="Project → Insights → Recommendations → Risks → Actions" />
        <Select size="small" value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} sx={{ fontSize: '0.72rem', minWidth: 280, mb: 1.5 }}>
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id} sx={{ fontSize: '0.72rem' }}>{p.id} — {p.name}</MenuItem>
          ))}
        </Select>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Health" value={selectedProject.healthScore} suffix="%" compact /></Grid>
          <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Delivery Risk" value={selectedProject.deliveryRisk} suffix="%" compact /></Grid>
          <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Testing Risk" value={selectedProject.testingRisk} suffix="%" compact /></Grid>
          <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Audit Risk" value={selectedProject.auditRisk} suffix="%" compact /></Grid>
          <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Release Risk" value={selectedProject.releaseRisk} suffix="%" compact /></Grid>
        </Grid>
      </GlassCard>

      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, textAlign: 'center' }}>
            <ModuleHeader title="Project Health" />
            <GaugeChart value={selectedProject.healthScore} label="Health" size={160} />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontSize: '0.65rem' }}>
              {selectedProject.executiveSummary}
            </Typography>
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Insights & Recommendations" />
            {projectRecommendations.slice(0, 6).map((r) => (
              <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                  <Chip label={r.domain} size="small" sx={{ height: 16, fontSize: '0.5rem' }} />
                  <Chip label={r.priority} size="small" sx={{ height: 16, fontSize: '0.5rem', color: PRIORITY_COLOR[r.priority] }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', fontSize: '0.68rem' }}>{r.title}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.62rem' }}>{r.suggestedAction}</Typography>
              </Box>
            ))}
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Risk Observations" />
            {projectRisks.slice(0, 5).map((r) => (
              <Typography key={r.id} variant="caption" sx={{ display: 'block', py: 0.35, fontSize: '0.65rem' }}>
                <strong>{r.module}:</strong> {r.observation}
              </Typography>
            ))}
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Suggested Actions" />
            {projectImprovements.slice(0, 5).map((a) => (
              <Typography key={a.id} variant="caption" sx={{ display: 'block', py: 0.35, fontSize: '0.65rem' }}>
                {a.title} — +{a.predictedQualityGain}% quality · -{a.predictedRiskReduction}% risk
              </Typography>
            ))}
            <Typography variant="caption" sx={{ display: 'block', mt: 1, fontWeight: 600, color: colors.primary, fontSize: '0.65rem' }}>
              Delivery: {selectedProject.deliveryRecommendation}
            </Typography>
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
