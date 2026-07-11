import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { EnterpriseBarChart } from '../charts/EnterpriseBarChart';
import { TimelineRoadmapChart } from '../charts/TimelineRoadmapChart';
import { StackedProgressChart } from '../charts/StackedProgressChart';
import { useTechnologyStrategy } from '../../context/TechnologyStrategyContext';
import { colors } from '../../theme/colors';
import { generateStandardsTelemetry } from '../../data/enterpriseTelemetry';

export function TechnologyStandardsPanel() {
  const { standardsAdoption, standards, kpis } = useTechnologyStrategy();
  const withMeta = generateStandardsTelemetry().map((s) => ({
    name: s.name,
    value: s.value,
    target: 80,
    trend: s.trend,
    trendDelta: s.trendDelta,
    trendLabel: s.trendLabel,
  }));
  const chartData = withMeta.length ? withMeta : standardsAdoption;

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Technology Standards" subtitle={`${standards.length} standards · adoption ${kpis.standardsAdoption}%`} />
        <EnterpriseBarChart
          chartId="technology-strategy.standards-adoption"
          data={chartData}
          height={280}
          barColor={colors.primary}
          defaultTarget={80}
          showTarget
          showTrend
          showLabels
          highlightOutliers
          dynamicScale
        />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Standards Catalog" />
        {standards.slice(0, 18).map((s) => (
          <Box key={s.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{s.id} — {s.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {s.category} · Adoption: {s.adoptionRate}% · Compliance: {s.complianceRate}% · {s.mandatory ? 'Mandatory' : 'Recommended'}
            </Typography>
            <Box sx={{ mt: 0.4, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Box sx={{ flex: 1, height: 4, borderRadius: 1, bgcolor: 'rgba(148,163,184,0.15)', overflow: 'hidden' }}>
                <Box sx={{ width: `${s.adoptionRate}%`, height: '100%', bgcolor: colors.primary, opacity: 0.85 }} />
              </Box>
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted, minWidth: 32 }}>{s.adoptionRate}%</Typography>
            </Box>
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
        <EnterpriseBarChart
          chartId="technology-strategy.technology-debt"
          data={lifecycleDist}
          height={240}
          barColor={colors.warning}
          suffix=""
          showTarget={false}
          showTrend={false}
          dynamicScale
          highlightOutliers
        />
      </GlassCard>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Investment Stance Distribution" subtitle="invest · maintain · tolerate · eliminate" />
        <EnterpriseBarChart
          chartId="technology-strategy.investment-efficiency"
          data={stanceDist}
          height={180}
          barColor={colors.secondary}
          suffix=""
          showTarget={false}
          showTrend={false}
          dynamicScale
          highlightOutliers
        />
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
        <TimelineRoadmapChart
          chartId="technology-strategy.modernization-progress"
          data={roadmap.map((r) => ({ name: r.year, value: r.modernizationProgress }))}
          height={200}
          barColor={colors.success}
          target={80}
        />
      </GlassCard>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Modernization Waves" subtitle="Initiatives by wave" />
        <StackedProgressChart
          chartId="technology-strategy.modernization-progress"
          data={modByWave}
          height={220}
          barColor={colors.info}
          target={80}
        />
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
