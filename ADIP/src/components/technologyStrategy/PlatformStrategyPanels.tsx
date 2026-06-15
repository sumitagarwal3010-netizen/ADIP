import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useTechnologyStrategy } from '../../context/TechnologyStrategyContext';
import { colors } from '../../theme/colors';

export function StrategicPlatformsPanel() {
  const { platformAdoptionChart, topPlatforms, kpis } = useTechnologyStrategy();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Strategic Platforms" subtitle={`50 platforms · adoption ${kpis.strategicPlatformAdoption}%`} />
        <HorizontalBarChart chartId="technology-strategy.strategic-platform-adoption" data={platformAdoptionChart} height={220} barColor={colors.primary} />
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

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Cloud Strategy" subtitle={`Cloud adoption ${kpis.cloudAdoption}% · multi-cloud posture`} />
        <HorizontalBarChart chartId="technology-strategy.cloud-adoption" data={cloudByProvider} height={160} barColor={colors.info} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Cloud Platform Catalog" subtitle="50 cloud platforms" />
        {topClouds.map((c) => (
          <Box key={c.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.name} <span style={{ color: colors.text.muted }}>({c.provider})</span></Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {c.serviceType} · Adoption: {c.adoptionRate}% · ₹{Math.round(c.monthlySpend / 1000)}K/mo · {c.approved ? 'Approved' : 'Not approved'}
            </Typography>
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
        <HorizontalBarChart chartId="technology-strategy.ai-platform-adoption" data={aiByCategory} height={180} barColor={colors.secondary} />
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
        <HorizontalBarChart chartId="technology-strategy.vendor-concentration" data={vendorChart} height={200} barColor={colors.warning} />
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
