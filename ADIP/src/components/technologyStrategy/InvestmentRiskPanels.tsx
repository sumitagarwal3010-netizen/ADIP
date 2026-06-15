import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useTechnologyStrategy } from '../../context/TechnologyStrategyContext';
import { colors } from '../../theme/colors';

export function TechnologyInvestmentsPanel() {
  const { investByStance, topInvest, kpis } = useTechnologyStrategy();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Technology Investments" subtitle={`Investment efficiency ${kpis.investmentEfficiency}% · spend by stance (₹M)`} />
        <HorizontalBarChart chartId="technology-strategy.investment-efficiency" data={investByStance} height={160} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Investment Register" />
        {topInvest.map((i) => (
          <Box key={i.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{i.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {i.category} · Stance: {i.stance} · ₹{Math.round(i.annualSpend / 1_000_000)}M/yr · Efficiency: {i.efficiencyScore}% · Strategic fit: {i.strategicFit}%
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function TechnologyRisksPanel() {
  const { techRisks, kpis } = useTechnologyStrategy();

  return (
    <GlassCard sx={{ p: 2 }}>
      <ModuleHeader title="Technology Risks" subtitle={`Technology risk: ${kpis.technologyRisk}% · 150 risks tracked`} />
      {techRisks.map((r) => (
        <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
            {r.techName} · {r.category} · Severity: {r.severity} · Likelihood: {r.likelihood}% · {r.mitigationStatus}
          </Typography>
        </Box>
      ))}
    </GlassCard>
  );
}

export function ModernizationWavesPanel() {
  const { modByWave, modInitiatives, kpis } = useTechnologyStrategy();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Modernization Waves" subtitle={`Modernization progress ${kpis.modernizationProgress}% · 100 initiatives across 3 waves`} />
        <HorizontalBarChart chartId="technology-strategy.modernization-progress" data={modByWave} height={140} barColor={colors.success} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Modernization Initiatives" />
        {modInitiatives.map((m) => (
          <Box key={m.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Wave {m.wave} — {m.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {m.fromTechnology} → {m.toTechnology} · {m.status} · {m.applicationsImpacted} apps · Invest ₹{Math.round(m.investment / 1_000_000)}M · Benefit ₹{Math.round(m.expectedBenefit / 1_000_000)}M · {m.targetYear}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
