import { Box, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
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

  // Phase 2 — AI Single Source of Truth (June 2026):
  // The AI Risk Register lives in AI Governance. This tab now presents a
  // summarized enterprise rollup so risk executives can see exposure without
  // the detail being authored or maintained in two places.

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader
          title="AI Risk — Enterprise Rollup"
          subtitle={`AI risk score ${kpis.aiRiskScore}/100 · summarized from AI Governance · authored once`}
        />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block', mb: 1.5, lineHeight: 1.6 }}>
          Source of truth: <strong>AI Governance &middot; Risk Registry</strong>. This rollup summarizes residual exposure
          by category for the enterprise risk view. Open the registry for risk-by-risk detail, mitigation owners,
          and control evidence.
        </Typography>
        <HorizontalBarChart chartId="enterprise-risk.ai-risk-score" data={aiByCategory} height={180} barColor={colors.secondary} />
      </GlassCard>

      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Top AI Risks (snapshot)" subtitle="Top exposure entries · full register in AI Governance" />
        {topAi.slice(0, 5).map((r) => (
          <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {r.category} · {r.modelArea} · Residual: {r.residualScore} · {r.severity} · {r.status}
            </Typography>
          </Box>
        ))}
        <Box sx={{ mt: 1.5, pt: 1, borderTop: `1px solid ${colors.border.subtle}` }}>
          <Link
            to="/ai-governance-center/risks"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none',
              color: colors.primary,
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            Open AI Risk Registry in AI Governance
            <OpenInNewIcon sx={{ fontSize: 13 }} />
          </Link>
        </Box>
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
