import { Box, Grid } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { MultiLineChart } from '../charts/MultiLineChart';
import { HorizontalBarChart } from '../charts/HorizontalBarChart';
import { useEnterpriseRisk } from '../../context/EnterpriseRiskContext';
import { colors } from '../../theme/colors';

export function ExecutiveRiskDashboardPanel() {
  const { kpis, history, byCategory, bySeverity } = useEnterpriseRisk();

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Risk Exposure" value={kpis.enterpriseRiskExposure} suffix="/100" chartId="enterprise-risk.enterprise-risk-exposure" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Residual Risk" value={kpis.residualRisk} suffix="/100" chartId="enterprise-risk.residual-risk" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Control Effectiveness" value={kpis.controlEffectiveness} suffix="%" chartId="enterprise-risk.control-effectiveness" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Open Critical Risks" value={kpis.openCriticalRisks} chartId="enterprise-risk.open-critical-risks" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Appetite Breaches" value={kpis.riskAppetiteBreaches} chartId="enterprise-risk.risk-appetite-breaches" compact /></Grid>
      </Grid>
      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Regulatory Exposure" value={`₹${kpis.regulatoryExposure}M`} chartId="enterprise-risk.regulatory-exposure" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Cyber Risk Score" value={kpis.cyberRiskScore} suffix="/100" chartId="enterprise-risk.cyber-risk-score" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="AI Risk Score" value={kpis.aiRiskScore} suffix="/100" chartId="enterprise-risk.ai-risk-score" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Audit Risk Score" value={kpis.auditRiskScore} suffix="%" chartId="enterprise-risk.audit-risk-score" compact /></Grid>
        <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Assurance Coverage" value={kpis.assuranceCoverage} suffix="%" chartId="enterprise-risk.assurance-coverage" compact /></Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="5-Year Risk History" subtitle="Exposure · residual · control · assurance · cyber · AI" />
            <MultiLineChart
              data={history.map((h) => ({ month: h.year, ...h })) as Record<string, string | number>[]}
              series={[
                { key: 'enterpriseRiskExposure', name: 'Exposure', color: colors.critical },
                { key: 'controlEffectiveness', name: 'Control %', color: colors.success },
                { key: 'assuranceCoverage', name: 'Assurance %', color: colors.primary },
              ]}
              height={220}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Risks by Category" subtitle="500 enterprise risks" />
            <HorizontalBarChart chartId="enterprise-risk.enterprise-risk-exposure" data={byCategory} height={220} barColor={colors.warning} />
          </GlassCard>
        </Grid>
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="Risk Severity Distribution" />
            <HorizontalBarChart chartId="enterprise-risk.open-critical-risks" data={bySeverity} height={180} barColor={colors.critical} />
          </GlassCard>
        </Grid>
      </Grid>
    </Box>
  );
}
