import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useEnterpriseRisk } from '../../context/EnterpriseRiskContext';
import { colors } from '../../theme/colors';

export function CyberRiskPanel() {
  const { cyberByThreat, topCyber, kpis } = useEnterpriseRisk();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Cyber & Security Risk" subtitle={`Cyber risk score ${kpis.cyberRiskScore}/100 · 150 cyber risks`} />
        <HorizontalBarChart chartId="enterprise-risk.cyber-risk-score" data={cyberByThreat} height={180} barColor={colors.critical} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Cyber Risk Register" />
        {topCyber.map((r) => (
          <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {r.threatType} · {r.assetArea} · Exposure: {r.exposureScore} · {r.severity} · {r.status}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function AiRiskPanel() {
  const { aiByCategory, topAi, kpis } = useEnterpriseRisk();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="AI Risk" subtitle={`AI risk score ${kpis.aiRiskScore}/100 · 100 AI risks · responsible-AI governance`} />
        <HorizontalBarChart chartId="enterprise-risk.ai-risk-score" data={aiByCategory} height={180} barColor={colors.secondary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="AI Risk Register" subtitle="Bias · explainability · drift · privacy · hallucination" />
        {topAi.map((r) => (
          <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {r.category} · {r.modelArea} · Residual: {r.residualScore} · {r.severity} · {r.status}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function RegulatoryRiskPanel() {
  const { regByRegulator, topRegulatory, kpis } = useEnterpriseRisk();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Regulatory & Compliance Risk" subtitle={`Regulatory exposure ₹${kpis.regulatoryExposure}M · 150 regulatory risks (₹M by regulator)`} />
        <HorizontalBarChart chartId="enterprise-risk.regulatory-exposure" data={regByRegulator} height={180} barColor={colors.warning} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Regulatory Risk Register" />
        {topRegulatory.map((r) => (
          <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {r.regulation} · {r.regulator} · Exposure: ₹{Math.round(r.exposureValue / 1_000_000)}M · {r.severity} · Due: {r.dueDate} · {r.status}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
