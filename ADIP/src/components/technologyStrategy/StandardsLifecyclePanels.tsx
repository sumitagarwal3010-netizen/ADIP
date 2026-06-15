import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useTechnologyStrategy } from '../../context/TechnologyStrategyContext';
import { colors } from '../../theme/colors';

export function TechnologyStandardsPanel() {
  const { standardsAdoption, standards, kpis } = useTechnologyStrategy();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Technology Standards" subtitle={`${standards.length} standards · adoption ${kpis.standardsAdoption}%`} />
        <HorizontalBarChart chartId="technology-strategy.standards-adoption" data={standardsAdoption} height={200} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Standards Catalog" />
        {standards.slice(0, 18).map((s) => (
          <Box key={s.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{s.id} — {s.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {s.category} · Adoption: {s.adoptionRate}% · Compliance: {s.complianceRate}% · {s.mandatory ? 'Mandatory' : 'Recommended'}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function TechnologyLifecyclePanel() {
  const { lifecycleDist, stanceDist, retirements, kpis } = useTechnologyStrategy();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Technology Lifecycle" subtitle={`Technology debt: ${kpis.technologyDebt}% · emerging → approved → preferred → strategic → legacy → deprecated → EOS → retired`} />
        <HorizontalBarChart chartId="technology-strategy.technology-debt" data={lifecycleDist} height={200} barColor={colors.warning} />
      </GlassCard>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Investment Stance Distribution" subtitle="invest · maintain · tolerate · eliminate" />
        <HorizontalBarChart chartId="technology-strategy.investment-efficiency" data={stanceDist} height={160} barColor={colors.secondary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Retirement Candidates" />
        {retirements.map((t) => (
          <Box key={t.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{t.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {t.category} · {t.lifecycle} · Stance: {t.stance} · {t.applicationCount} apps · Vendor: {t.vendor}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function TechnologyRoadmapsPanel() {
  const { roadmap, modByWave, modInitiatives, kpis } = useTechnologyStrategy();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Technology Roadmap" subtitle={`Modernization progress ${kpis.modernizationProgress}% · 5-year plan`} />
        <HorizontalBarChart
          chartId="technology-strategy.modernization-progress"
          data={roadmap.map((r) => ({ name: r.year, value: r.modernizationProgress }))}
          height={180}
          barColor={colors.success}
        />
      </GlassCard>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Modernization Waves" subtitle="Initiatives by wave" />
        <HorizontalBarChart chartId="technology-strategy.modernization-progress" data={modByWave} height={140} barColor={colors.info} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Roadmap Initiatives" />
        {modInitiatives.slice(0, 12).map((m) => (
          <Box key={m.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Wave {m.wave} — {m.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {m.fromTechnology} → {m.toTechnology} · {m.status} · {m.applicationsImpacted} apps · ₹{Math.round(m.investment / 1_000_000)}M · {m.targetYear}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
