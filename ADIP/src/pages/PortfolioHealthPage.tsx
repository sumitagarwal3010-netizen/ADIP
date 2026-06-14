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
import { colors } from '../theme/colors';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';

const kpis = [
  { label: 'Portfolio Health Score', value: 88, trend: 2.3 },
  { label: 'Projects On Track', value: 9, suffix: '', trend: 12.5 },
  { label: 'Projects At Risk', value: 3, suffix: '', trend: -14.3 },
  { label: 'Critical Escalations', value: 1, suffix: '', trend: -50.0 },
];

const portfolioTrend = [
  { month: 'Jul', health: 79, onTrack: 6, atRisk: 6 },
  { month: 'Aug', health: 80, onTrack: 6, atRisk: 5 },
  { month: 'Sep', health: 81, onTrack: 7, atRisk: 5 },
  { month: 'Oct', health: 82, onTrack: 7, atRisk: 4 },
  { month: 'Nov', health: 83, onTrack: 8, atRisk: 4 },
  { month: 'Dec', health: 84, onTrack: 8, atRisk: 4 },
  { month: 'Jan', health: 85, onTrack: 8, atRisk: 4 },
  { month: 'Feb', health: 86, onTrack: 9, atRisk: 3 },
  { month: 'Mar', health: 86, onTrack: 9, atRisk: 3 },
  { month: 'Apr', health: 87, onTrack: 9, atRisk: 3 },
  { month: 'May', health: 87, onTrack: 9, atRisk: 3 },
  { month: 'Jun', health: 88, onTrack: 9, atRisk: 3 },
];

const portfolioPrograms = [
  { project: 'Core Banking Modernization', healthScore: 91, risk: 'Low', owner: 'Anurag Sharma', status: 'On Track' },
  { project: 'UPI 3.0 Scale Readiness', healthScore: 89, risk: 'Low', owner: 'Ritika Menon', status: 'On Track' },
  { project: 'Loan Origination Digitization', healthScore: 86, risk: 'Medium', owner: 'Siddharth Rao', status: 'On Track' },
  { project: 'Enterprise Fraud Detection Revamp', healthScore: 83, risk: 'Medium', owner: 'Neha Iyer', status: 'Watchlist' },
  { project: 'Trade Finance Workflow Automation', healthScore: 82, risk: 'Medium', owner: 'Karthik Nair', status: 'Watchlist' },
  { project: 'Card Switch Resilience Program', healthScore: 76, risk: 'High', owner: 'Mehul Desai', status: 'At Risk' },
];

function riskStyle(risk: string) {
  if (risk === 'High') return { c: colors.critical, b: `${colors.critical}22` };
  if (risk === 'Medium') return { c: colors.warning, b: `${colors.warning}22` };
  return { c: colors.success, b: `${colors.success}22` };
}

function statusStyle(status: string) {
  if (status === 'At Risk') return { c: colors.critical, b: `${colors.critical}22` };
  if (status === 'Watchlist') return { c: colors.warning, b: `${colors.warning}22` };
  return { c: colors.success, b: `${colors.success}22` };
}

export function PortfolioHealthPage() {
  return (
    <Box>
      <Grid container spacing={1.5}>
        {kpis.map((kpi, i) => (
          <Grid key={kpi.label} size={{ xs: 6, md: 3 }}>
            <KpiCard label={kpi.label} value={kpi.value} suffix={kpi.suffix} trend={kpi.trend} compact delay={i * 0.05} />
          </Grid>
        ))}
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Portfolio Health Trend (12 Months)" subtitle="Banking transformation portfolio trajectory" />
        <MultiLineChart
          data={portfolioTrend}
          series={[
            { key: 'health', color: colors.primary, name: 'Health Score' },
            { key: 'onTrack', color: colors.success, name: 'Projects On Track' },
            { key: 'atRisk', color: colors.critical, name: 'Projects At Risk' },
          ]}
          height={240}
        />
      </GlassCard>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Transformation Program Register" subtitle="Retail, payments, lending and platform modernization" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Project</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Health Score</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Risk</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolioPrograms.map((row) => {
                const rs = riskStyle(row.risk);
                const ss = statusStyle(row.status);
                return (
                  <TableRow key={row.project} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.primary }}>{row.project}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.healthScore}%</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 1, color: rs.c, bgcolor: rs.b, fontWeight: 700 }}>{row.risk}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.owner}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 1, color: ss.c, bgcolor: ss.b, fontWeight: 700 }}>{row.status}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      <HubArtifactGenerator hubKey="capacity" />
    </Box>
  );
}
