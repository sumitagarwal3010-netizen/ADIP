import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { EnterpriseBarChart } from '../charts/EnterpriseBarChart';
import { useTechnologyStrategy } from '../../context/TechnologyStrategyContext';
import { colors } from '../../theme/colors';
import { generateCloudTelemetry } from '../../data/enterpriseTelemetry';

export function StrategicPlatformsPanel() {
  const { platformAdoptionChart, topPlatforms, kpis } = useTechnologyStrategy();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Strategic Platforms" subtitle={`50 platforms · adoption ${kpis.strategicPlatformAdoption}%`} />
        <EnterpriseBarChart
          chartId="technology-strategy.strategic-platform-adoption"
          data={platformAdoptionChart}
          height={280}
          barColor={colors.primary}
          defaultTarget={80}
          dynamicScale
          highlightOutliers
        />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Platform Adoption Register" />
        {topPlatforms.map((p) => (
          <Box key={p.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{p.id} — {p.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {p.domain} · {p.lifecycle} · Adoption: {p.adoptionRate}%/{p.targetAdoption}% · {p.applicationsOnboarded} apps · ₹{Math.round(p.annualInvestment / 1_000_000)}M
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function CloudStrategyPanel() {
  const { cloudByProvider, topClouds, kpis } = useTechnologyStrategy();
  const cloudMeta = generateCloudTelemetry();
  const chartData = (cloudByProvider.length ? cloudByProvider : cloudMeta).map((c) => {
    const meta = cloudMeta.find((m) => m.name === c.name);
    return {
      name: c.name,
      value: c.value,
      target: 80,
      trend: meta?.trend,
      trendDelta: meta?.trendDelta,
      trendLabel: meta?.trendLabel,
    };
  });

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Cloud Strategy" subtitle={`Cloud adoption ${kpis.cloudAdoption}% · multi-cloud posture`} />
        <EnterpriseBarChart
          chartId="technology-strategy.cloud-adoption"
          data={chartData}
          height={220}
          barColor={colors.info}
          defaultTarget={80}
          showTarget
          showTrend
          showLabels
          highlightOutliers
          dynamicScale
        />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Cloud Platform Catalog" subtitle="50 cloud platforms" />
        {topClouds.map((c) => (
          <Box key={c.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.name} <span style={{ color: colors.text.muted }}>({c.provider})</span></Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {c.serviceType} · Adoption: {c.adoptionRate}% · ₹{Math.round(c.monthlySpend / 1000)}K/mo · {c.approved ? 'Approved' : 'Not approved'}
            </Typography>
            <Box sx={{ mt: 0.4, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Box sx={{ flex: 1, height: 5, borderRadius: 1, bgcolor: 'rgba(148,163,184,0.15)', overflow: 'hidden' }}>
                <Box sx={{ width: `${c.adoptionRate}%`, height: '100%', bgcolor: colors.info, opacity: 0.9 }} />
              </Box>
              <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted, minWidth: 32 }}>{c.adoptionRate}%</Typography>
            </Box>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function AiPlatformStrategyPanel() {
  const { aiByCategory, topAis, kpis } = useTechnologyStrategy();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="AI Platform Strategy" subtitle={`AI platform adoption ${kpis.aiPlatformAdoption}% · governed AI stack`} />
        <EnterpriseBarChart
          chartId="technology-strategy.ai-platform-adoption"
          data={aiByCategory}
          height={200}
          barColor={colors.secondary}
          suffix=""
          showTarget={false}
          showTrend={false}
          dynamicScale
          highlightOutliers
        />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="AI Platform Catalog" subtitle="50 AI platforms · LLM · ML-Ops · vector-DB · agents · governance" />
        {topAis.map((a) => (
          <Box key={a.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{a.name} <span style={{ color: colors.text.muted }}>({a.category})</span></Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Adoption: {a.adoptionRate}% · Maturity: {a.maturity}% · {a.useCases} use cases · {a.approved ? 'Approved' : 'Evaluating'}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function VendorLandscapePanel() {
  const { vendorChart, vendorRisks, kpis } = useTechnologyStrategy();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Vendor Landscape" subtitle={`Vendor concentration ${kpis.vendorConcentration}% (top 3) · contract value ₹M`} />
        <EnterpriseBarChart
          chartId="technology-strategy.vendor-concentration"
          data={vendorChart}
          height={240}
          barColor={colors.warning}
          suffix=""
          showTarget={false}
          showTrend={false}
          dynamicScale
          highlightOutliers
        />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Vendor Risk & Lock-in" subtitle="100 vendor products" />
        {vendorRisks.map((v) => (
          <Box key={v.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{v.vendor} — {v.product}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {v.category} · ₹{Math.round(v.contractValue / 1_000_000)}M · Renewal: {v.renewalYear} · Lock-in: {v.lockInRisk}% · Risk: {v.riskLevel} · {v.alternativesAvailable} alternatives
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
