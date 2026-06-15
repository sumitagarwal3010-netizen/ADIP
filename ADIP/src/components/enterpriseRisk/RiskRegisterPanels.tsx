import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useEnterpriseRisk } from '../../context/EnterpriseRiskContext';
import { colors } from '../../theme/colors';

export function EnterpriseRiskRegisterPanel() {
  const { byBusinessUnit, topRisks, kpis } = useEnterpriseRisk();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Enterprise Risk Register" subtitle={`500 risks · exposure ${kpis.enterpriseRiskExposure}/100 · residual ${kpis.residualRisk}/100`} />
        <HorizontalBarChart chartId="enterprise-risk.enterprise-risk-exposure" data={byBusinessUnit} height={180} barColor={colors.info} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Top Residual Risks" />
        {topRisks.map((r) => (
          <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {r.category} · {r.businessUnit} · Inherent: {r.inherentScore} · Residual: {r.residualScore} · {r.severity} · {r.status} · Appetite: {r.appetiteStatus} · Owner: {r.owner}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function OperationalRiskPanel() {
  const { byCategory, byBusinessUnit, topRisks } = useEnterpriseRisk();
  const opRisks = topRisks.filter((r) => r.category === 'operational' || r.category === 'third-party' || r.category === 'financial');

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Operational Risk" subtitle="Operational, third-party, and financial risk concentration" />
        <HorizontalBarChart chartId="enterprise-risk.enterprise-risk-exposure" data={byBusinessUnit} height={180} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Operational Risk Register" subtitle={`${byCategory.find((c) => c.name === 'operational')?.value ?? 0} operational risks`} />
        {opRisks.map((r) => (
          <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {r.category} · {r.businessUnit} · Residual: {r.residualScore} · {r.severity} · {r.status}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function TechnologyRiskPanel() {
  const { techByCategory, topTechRisks } = useEnterpriseRisk();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Technology Risk" subtitle="200 technology risks" />
        <HorizontalBarChart chartId="enterprise-risk.residual-risk" data={techByCategory} height={180} barColor={colors.warning} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Technology Risk Register" />
        {topTechRisks.map((r) => (
          <Box key={r.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.id} — {r.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {r.applicationArea} · {r.category} · Residual: {r.residualScore} · {r.severity} · {r.status}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
