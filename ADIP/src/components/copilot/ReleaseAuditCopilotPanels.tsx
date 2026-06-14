import { Box, Chip, Grid, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { GaugeChart } from '../charts/GaugeChart';
import { useCopilot } from '../../context/CopilotContext';
import { colors } from '../../theme/colors';

const GO_COLOR = { Go: colors.success, 'No-Go': colors.critical, 'Conditional Go': colors.warning };

export function ReleaseCopilotPanel() {
  const { releaseReadiness } = useCopilot();
  const r = releaseReadiness;

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Release Copilot" subtitle={r.projectName} />
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
          <GaugeChart value={r.releaseReadinessScore} label="Readiness" size={160} />
          <Chip label={r.recommendation} sx={{ mt: 1, color: GO_COLOR[r.recommendation], fontWeight: 700 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          {[
            ['Release Readiness', r.releaseReadinessScore],
            ['Production Risk', r.productionRiskScore],
            ['Rollback Readiness', r.rollbackReadinessScore],
            ['Defect Risk', r.defectRiskScore],
            ['Audit Risk', r.auditRiskScore],
            ['Operational Risk', r.operationalRiskScore],
          ].map(([label, value]) => (
            <Box key={label as string} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: `1px solid ${colors.border.subtle}` }}>
              <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>{label}</Typography>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem' }}>{value}%</Typography>
            </Box>
          ))}
          <Typography variant="caption" sx={{ display: 'block', mt: 1.5, fontSize: '0.65rem', color: colors.text.secondary }}>
            {r.rationale}
          </Typography>
        </Grid>
      </Grid>
    </GlassCard>
  );
}

export function AuditCopilotPanel() {
  const { auditInsights } = useCopilot();
  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Audit Copilot" subtitle="Potential findings & compliance gaps" />
      {auditInsights.map((a, i) => (
        <Box key={i} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.68rem' }}>{a.finding}</Typography>
          <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.warning }}>{a.gap} — Impact: {a.complianceImpact}</Typography>
          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.62rem', color: colors.primary }}>→ {a.recommendation}</Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
