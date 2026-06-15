import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useApplicationPortfolio } from '../../context/ApplicationPortfolioContext';
import { colors } from '../../theme/colors';

export function ApplicationRisksPanel() {
  const { risks, kpis } = useApplicationPortfolio();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Application Risk Center" subtitle={`Risk exposure: ${kpis.riskExposure}/100 · 200 technology risks`} />
      {risks.map((r) => (
        <Box key={r.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.appName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {r.title} · {r.category} · {r.severity} · {r.status}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function DependencyMappingPanel() {
  const { dependencies } = useApplicationPortfolio();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Dependency Mapping" subtitle="100 application integrations" />
      {dependencies.map((d) => (
        <Box key={d.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{d.sourceName}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            → {d.targetName} · {d.type} · {d.criticality}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function LifecyclePlanningPanel() {
  const { lifecycleDist, lifecycleHistory } = useApplicationPortfolio();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Lifecycle Status" />
        <HorizontalBarChart chartId="application-portfolio.modernization-readiness" data={lifecycleDist} height={180} barColor={colors.info} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="5-Year Lifecycle History" />
        {lifecycleHistory.map((h) => (
          <Box key={h.year} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{h.year}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {h.applicationCount} apps · Health {h.avgHealth}% · Debt {h.technicalDebt} · Cloud {h.cloudReadiness}% ·
              Savings ₹{(h.rationalizationSavings / 1_000_000).toFixed(1)}M
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ApplicationRationalizationPanel() {
  const { rationalization, kpis } = useApplicationPortfolio();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Application Rationalization" subtitle={`Savings opportunity: ₹${(kpis.rationalizationSavings / 1_000_000).toFixed(1)}M`} />
      {rationalization.map((a) => (
        <Box key={a.id} sx={{ py: 0.75, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{a.name}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {a.lifecycleStage} · Health {a.productionHealth}% · Cost ₹{(a.annualCost / 1_000_000).toFixed(2)}M ·
            Debt {a.technicalDebtScore} · Recommendation: {a.productionHealth < 55 ? 'Retire' : 'Consolidate'}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}
