import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useTransformationPmo } from '../../context/TransformationPmoContext';
import { colors } from '../../theme/colors';

export function CrossProgramDependenciesPanel() {
  const { riskyDeps, dependencies, kpis } = useTransformationPmo();
  const blocked = dependencies.filter((d) => d.status === 'blocked').length;

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Cross-Program Dependencies" subtitle={`Dependency risk ${kpis.dependencyRisk}% · 100 dependencies · ${blocked} blocked`} />
      {riskyDeps.map((d) => (
        <Box key={d.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.id} — {d.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            Type: {d.type} · {d.status} · Risk: {d.riskLevel}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function TransformationRisksPanel() {
  const { topRisks, kpis } = useTransformationPmo();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Transformation Risks" subtitle={`Dependency risk ${kpis.dependencyRisk}% · 50 risks tracked`} />
      {topRisks.map((r) => (
        <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {r.progName} · {r.category} · Severity: {r.severity} · Likelihood: {r.likelihood}% · {r.mitigationStatus}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function BusinessUnitPerformancePanel() {
  const { buChart, businessUnits, kpis } = useTransformationPmo();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Business Unit Performance" subtitle={`Avg BU performance ${kpis.businessUnitPerformance}% · 5 business units`} />
        <HorizontalBarChart chartId="transformation-pmo.business-unit-performance" data={buChart} height={180} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Business Unit Scorecard" />
        {businessUnits.map((b) => (
          <Box key={b.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{b.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {b.programCount} programs · Health: {b.transformationHealth}% · Benefits: {b.benefitRealization}% · Milestones: {b.milestoneCompletion}% · Budget util: {b.budgetUtilization}%
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
