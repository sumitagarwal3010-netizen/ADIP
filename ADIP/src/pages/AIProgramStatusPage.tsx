import {
  Box,
  Grid,
  LinearProgress,
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

const kpis = [
  { label: 'Active AI Programs', value: 12, suffix: '', trend: 9.1 },
  { label: 'Programs On Track', value: 8, suffix: '', trend: 14.3 },
  { label: 'Programs Delayed', value: 3, suffix: '', trend: -25.0 },
  { label: 'AI Adoption %', value: 74, trend: 6.5 },
];

const progressTrendData = [
  { month: 'Jan', planned: 48, actual: 44 },
  { month: 'Feb', planned: 52, actual: 47 },
  { month: 'Mar', planned: 56, actual: 52 },
  { month: 'Apr', planned: 60, actual: 57 },
  { month: 'May', planned: 64, actual: 61 },
  { month: 'Jun', planned: 68, actual: 65 },
  { month: 'Jul', planned: 71, actual: 69 },
  { month: 'Aug', planned: 74, actual: 72 },
  { month: 'Sep', planned: 77, actual: 74 },
  { month: 'Oct', planned: 80, actual: 76 },
  { month: 'Nov', planned: 82, actual: 79 },
  { month: 'Dec', planned: 85, actual: 82 },
];

const programs = [
  { program: 'Retail Lending AI Underwriter', businessUnit: 'Retail Assets', sponsor: 'Head of Retail Lending', progress: 81, status: 'On Track' },
  { program: 'UPI Fraud Early Warning', businessUnit: 'Payments', sponsor: 'Chief Risk Officer', progress: 76, status: 'On Track' },
  { program: 'Card Dispute Resolution Copilot', businessUnit: 'Cards', sponsor: 'Head of Cards Ops', progress: 68, status: 'Watchlist' },
  { program: 'Corporate Cashflow Forecasting AI', businessUnit: 'Corporate Banking', sponsor: 'Head of Transaction Banking', progress: 63, status: 'On Track' },
  { program: 'AML Alert Prioritization Engine', businessUnit: 'Compliance', sponsor: 'Chief Compliance Officer', progress: 72, status: 'On Track' },
  { program: 'Branch Service Assistant', businessUnit: 'Branch Banking', sponsor: 'Head of Branch Network', progress: 59, status: 'Delayed' },
  { program: 'Collections Next Best Action AI', businessUnit: 'Collections', sponsor: 'Head of Recoveries', progress: 66, status: 'On Track' },
  { program: 'Treasury Liquidity Signal Model', businessUnit: 'Treasury', sponsor: 'Treasurer', progress: 54, status: 'Delayed' },
];

function statusStyle(status: string) {
  if (status === 'On Track') return { c: colors.success, b: `${colors.success}22` };
  if (status === 'Watchlist') return { c: colors.warning, b: `${colors.warning}22` };
  return { c: colors.critical, b: `${colors.critical}22` };
}

export function AIProgramStatusPage() {
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
        <ModuleHeader title="AI Program Progress" subtitle="Planned vs actual progress across active AI initiatives" />
        <MultiLineChart
          data={progressTrendData}
          series={[
            { key: 'planned', color: colors.primary, name: 'Planned Progress' },
            { key: 'actual', color: colors.success, name: 'Actual Progress' },
          ]}
          height={240}
        />
      </GlassCard>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="AI Initiative Portfolio" subtitle="Enterprise banking AI transformation programs" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Program</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Business Unit</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Sponsor</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Progress</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programs.map((row) => {
                const s = statusStyle(row.status);
                return (
                  <TableRow key={row.program} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ color: colors.text.primary, fontWeight: 600 }}>{row.program}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.businessUnit}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.sponsor}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, minWidth: 160 }}>
                      <LinearProgress
                        variant="determinate"
                        value={row.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.08)',
                          '& .MuiLinearProgress-bar': { bgcolor: colors.primary },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: colors.text.secondary }}>{row.progress}%</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 1, color: s.c, bgcolor: s.b, fontWeight: 700 }}>{row.status}</Typography>
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
