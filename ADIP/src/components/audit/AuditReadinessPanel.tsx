import { Box, Chip, Grid, LinearProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { AIInsightBox } from '../common/AIInsightBox';
import { GaugeChart } from '../charts/GaugeChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { colors } from '../../theme/colors';
import { buildEvidenceLineage, computeAuditKpis, getMissingEvidenceStages } from '../../data/auditCenterEngine';
import { AUDIT_EXEC_SUMMARY } from '../../data/auditCenterMock';
import { WORKFLOW_STAGE_LABEL } from '../../data/unifiedLifecycleEngine';

const COVERAGE_ICON = {
  complete: CheckCircleIcon,
  partial: WarningAmberIcon,
  missing: ErrorIcon,
};

const COVERAGE_COLOR = {
  complete: colors.success,
  partial: colors.warning,
  missing: colors.critical,
};

export function AuditReadinessPanel() {
  const kpis = computeAuditKpis();
  const lineage = buildEvidenceLineage();
  const missing = getMissingEvidenceStages();

  const readinessFactors = [
    { label: 'Evidence Coverage', score: kpis.evidenceCoverage, weight: 30 },
    { label: 'Control Coverage', score: kpis.controlCoverage, weight: 25 },
    { label: 'Finding Closure Rate', score: Math.round((kpis.closedFindings / 40) * 100), weight: 20 },
    { label: 'Observation Closure', score: Math.round(((25 - kpis.openObservations) / 25) * 100), weight: 15 },
    { label: 'Lifecycle Evidence', score: Math.round(((7 - missing.length) / 7) * 100), weight: 10 },
  ];

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Audit Readiness" value={kpis.auditReadinessScore} suffix="%" chartId="audit-center.audit-readiness" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Evidence Coverage" value={kpis.evidenceCoverage} suffix="%" chartId="audit-center.evidence-coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Control Coverage" value={kpis.controlCoverage} suffix="%" chartId="audit-center.control-coverage" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Missing Stages" value={missing.length} suffix="" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, textAlign: 'center' }}>
            <ModuleHeader title="Overall Readiness" />
            <GaugeChart chartId="audit-center.audit-readiness" value={kpis.auditReadinessScore} label="Ready" size={200} />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Readiness Factors" subtitle="Weighted contribution to audit readiness score" />
            {readinessFactors.map((f) => (
              <Box key={f.label} sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.25 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>{f.label} ({f.weight}%)</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{f.score}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={f.score} sx={{ height: 6, borderRadius: 1 }} />
              </Box>
            ))}
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Evidence by Lifecycle Stage" />
            <HorizontalBarChart
              chartId="audit-center.evidence-coverage"
              data={lineage.map((l) => ({ name: l.label, value: l.evidenceIds.length }))}
              height={180}
              barColor={colors.primary}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Stage Coverage Status" />
            {lineage.map((l) => {
              const Icon = COVERAGE_ICON[l.coverage];
              return (
                <Box key={l.stage} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
                  <Icon sx={{ fontSize: 18, color: COVERAGE_COLOR[l.coverage] }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{WORKFLOW_STAGE_LABEL[l.stage]}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                      {l.evidenceIds.length} evidence · {l.coverage}
                    </Typography>
                  </Box>
                  <Chip label={l.coverage} size="small" sx={{ height: 20, fontSize: '0.58rem', bgcolor: `${COVERAGE_COLOR[l.coverage]}18`, color: COVERAGE_COLOR[l.coverage] }} />
                </Box>
              );
            })}
          </GlassCard>
        </Grid>
      </Grid>

      <Box sx={{ mt: 1.5 }}>
        <AIInsightBox title="Audit Readiness — Recommended Actions" insight={AUDIT_EXEC_SUMMARY} />
      </Box>
    </Box>
  );
}
