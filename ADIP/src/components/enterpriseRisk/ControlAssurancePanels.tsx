import { Box, Typography } from '@mui/material';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useEnterpriseRisk } from '../../context/EnterpriseRiskContext';
import { colors } from '../../theme/colors';

export function AuditFindingsRiskPanel() {
  const { findingsSrc, openFindings, kpis } = useEnterpriseRisk();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Audit Findings Risk" subtitle={`Audit risk score ${kpis.auditRiskScore}% · 200 findings by source`} />
        <HorizontalBarChart chartId="enterprise-risk.audit-risk-score" data={findingsSrc} height={160} barColor={colors.warning} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Open Audit Findings" />
        {openFindings.map((f) => (
          <Box key={f.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{f.id} — {f.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Risk: {f.riskTitle.slice(0, 32)} · {f.source} · Severity: {f.severity} · {f.status} · Due: {f.dueDate} · Owner: {f.owner}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function ControlEffectivenessPanel() {
  const { controlDist, weakControls, kpis } = useEnterpriseRisk();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Control Effectiveness" subtitle={`Control effectiveness ${kpis.controlEffectiveness}% · 300 controls`} />
        <HorizontalBarChart chartId="enterprise-risk.control-effectiveness" data={controlDist} height={180} barColor={colors.success} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Ineffective / Untested Controls" />
        {weakControls.map((c) => (
          <Box key={c.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{c.id} — {c.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {c.category} · {c.type} · {c.effectiveness} · {c.automated ? 'Automated' : 'Manual'} · Coverage: {c.coverage}% · Last tested: {c.lastTested}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function RiskAppetitePanel() {
  const { appetite, riskAppetite, kpis } = useEnterpriseRisk();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Risk Appetite & Tolerance" subtitle={`${kpis.riskAppetiteBreaches} categories breached · exposure vs appetite`} />
        <HorizontalBarChart chartId="enterprise-risk.risk-appetite-breaches" data={appetite} height={200} barColor={colors.critical} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Appetite by Risk Category" />
        {riskAppetite.map((a) => (
          <Box key={a.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{a.category}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              Exposure: {a.currentExposure} · Appetite: {a.appetiteThreshold} · Tolerance: {a.tolerance} · Status: {a.status}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}

export function IntegratedAssurancePanel() {
  const { assuranceLines, assuranceList, kpis } = useEnterpriseRisk();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Integrated Assurance" subtitle={`Assurance coverage ${kpis.assuranceCoverage}% · three lines of defense · 100 reviews`} />
        <HorizontalBarChart chartId="enterprise-risk.assurance-coverage" data={assuranceLines} height={160} barColor={colors.primary} />
      </GlassCard>
      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title="Assurance Reviews" />
        {assuranceList.map((a) => (
          <Box key={a.id} sx={{ py: 0.6, borderBottom: `1px solid ${colors.border.subtle}` }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>{a.id} — {a.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {a.type} · {a.category} · {a.status} · Coverage: {a.coverage}% · Scheduled: {a.scheduledFor}
            </Typography>
          </Box>
        ))}
      </GlassCard>
    </Box>
  );
}
