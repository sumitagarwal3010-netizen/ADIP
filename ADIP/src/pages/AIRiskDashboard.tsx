import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { MultiLineChart } from '../components/charts/MultiLineChart';
import { DonutChart } from '../components/charts/DonutChart';
import { colors } from '../theme/colors';

const aiRiskKpis = [
  { label: 'Open Risks', value: 19, suffix: '', trend: -5.0 },
  { label: 'Critical Risks', value: 4, suffix: '', trend: -20.0 },
  { label: 'Mitigated Risks', value: 42, suffix: '', trend: 12.3 },
  { label: 'Average Risk Score', value: 68, trend: -3.4 },
];

const riskTrendData = [
  { month: 'Jan', open: 28, mitigated: 18, avgScore: 76 },
  { month: 'Feb', open: 27, mitigated: 20, avgScore: 75 },
  { month: 'Mar', open: 25, mitigated: 24, avgScore: 73 },
  { month: 'Apr', open: 23, mitigated: 30, avgScore: 71 },
  { month: 'May', open: 21, mitigated: 36, avgScore: 69 },
  { month: 'Jun', open: 19, mitigated: 42, avgScore: 68 },
];

const riskTypeDistribution = [
  { name: 'Bias', value: 5, color: colors.warning },
  { name: 'Hallucination', value: 4, color: colors.info },
  { name: 'Data Leakage', value: 4, color: colors.critical },
  { name: 'Prompt Injection', value: 3, color: colors.secondary },
  { name: 'Model Drift', value: 3, color: colors.success },
];

const riskRows = [
  { risk: 'Bias in SME credit recommendation outputs', useCase: 'Retail Credit Copilot', severity: 'High', status: 'In Progress' },
  { risk: 'Hallucinated policy clauses in customer advisory responses', useCase: 'Regulatory Assistant', severity: 'Medium', status: 'Open' },
  { risk: 'Potential data leakage in debug prompt traces', useCase: 'Fraud Investigator Assistant', severity: 'Critical', status: 'In Progress' },
  { risk: 'Prompt injection attempt via uploaded merchant document', useCase: 'Trade Finance Document QA', severity: 'High', status: 'Open' },
  { risk: 'Model drift in card fraud scoring threshold', useCase: 'Real-time Card Fraud Detection', severity: 'Medium', status: 'Mitigated' },
];

function getSeverityStyle(severity: string) {
  if (severity === 'Critical') return { color: colors.critical, bg: `${colors.critical}22` };
  if (severity === 'High') return { color: colors.warning, bg: `${colors.warning}22` };
  return { color: colors.info, bg: `${colors.info}22` };
}

function getStatusStyle(status: string) {
  if (status === 'Mitigated') return { color: colors.success, bg: `${colors.success}22` };
  if (status === 'In Progress') return { color: colors.info, bg: `${colors.info}22` };
  return { color: colors.warning, bg: `${colors.warning}22` };
}

export function AIRiskDashboard() {
  return (
    <Box>
      <Grid container spacing={1.5}>
        {aiRiskKpis.map((kpi, index) => (
          <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
            <KpiCard
              label={kpi.label}
              value={kpi.value}
              suffix={kpi.suffix}
              trend={kpi.trend}
              delay={index * 0.05}
              compact
            />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <GlassCard sx={{ p: 2 }}>
            <ModuleHeader title="AI Risk Trend" subtitle="Open Risks · Mitigated Risks · Average Risk Score" />
            <MultiLineChart
              data={riskTrendData}
              series={[
                { key: 'open', color: colors.critical, name: 'Open Risks' },
                { key: 'mitigated', color: colors.success, name: 'Mitigated Risks' },
                { key: 'avgScore', color: colors.primary, name: 'Average Risk Score' },
              ]}
              height={240}
            />
          </GlassCard>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <GlassCard sx={{ p: 2, height: '100%' }}>
            <ModuleHeader title="Risk Type Distribution" subtitle="Current open AI risk categories" />
            <DonutChart
              chartId="ai-risk.type-distribution"
              data={riskTypeDistribution}
              centerLabel="Open Risks"
              centerValue={19}
              height={220}
            />
          </GlassCard>
        </Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="AI Risk Register" subtitle="Top open and recently mitigated risks across use cases" />
        <TableContainer>
          <Table size="small" aria-label="ai risk table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Risk</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Use Case</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {riskRows.map((row) => {
                const severityStyle = getSeverityStyle(row.severity);
                const statusStyle = getStatusStyle(row.status);
                return (
                  <TableRow key={row.risk} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ color: colors.text.primary, fontWeight: 600 }}>
                        {row.risk}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>
                      {row.useCase}
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography
                        variant="caption"
                        sx={{ px: 1, py: 0.25, borderRadius: 1, color: severityStyle.color, bgcolor: severityStyle.bg, fontWeight: 700 }}
                      >
                        {row.severity}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography
                        variant="caption"
                        sx={{ px: 1, py: 0.25, borderRadius: 1, color: statusStyle.color, bgcolor: statusStyle.bg, fontWeight: 700 }}
                      >
                        {row.status}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>
    </Box>
  );
}
