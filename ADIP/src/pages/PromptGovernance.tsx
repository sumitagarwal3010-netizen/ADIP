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
import { colors } from '../theme/colors';

const promptGovernanceKpis = [
  { label: 'Approved Prompts', value: 38, suffix: '', trend: 6.1 },
  { label: 'Prompts Under Review', value: 7, suffix: '', trend: -2.5 },
  { label: 'Prompt Violations', value: 3, suffix: '', trend: -25 },
  { label: 'Compliance Score', value: 93, trend: 1.8 },
];

const promptRows = [
  {
    prompt: 'Summarize account statement anomalies and suggest next best actions without exposing full PAN details.',
    application: 'Net Banking',
    owner: 'Retail Digital Team',
    status: 'Approved',
  },
  {
    prompt: 'Generate customer-friendly explanation for failed beneficiary addition and include secure retry guidance.',
    application: 'Net Banking',
    owner: 'Customer Experience AI',
    status: 'Approved',
  },
  {
    prompt: 'Draft contextual app notification for unusual login pattern, avoiding sensitive location disclosure.',
    application: 'Mobile Banking',
    owner: 'Mobile Platform AI',
    status: 'In Review',
  },
  {
    prompt: 'Create concise savings goal nudges using transaction trends while excluding merchant-level identifiers.',
    application: 'Mobile Banking',
    owner: 'Engagement Analytics',
    status: 'Approved',
  },
  {
    prompt: 'Classify UPI transaction support tickets and recommend escalation priority with policy-safe responses.',
    application: 'Payments',
    owner: 'Payments Operations',
    status: 'Approved',
  },
  {
    prompt: 'Explain card chargeback timelines to customers using PCI-safe language and no internal rule references.',
    application: 'Payments',
    owner: 'Card Servicing AI',
    status: 'In Review',
  },
  {
    prompt: 'Summarize high-risk transaction clusters for analyst triage without exposing full account numbers.',
    application: 'Fraud Monitoring',
    owner: 'Fraud Risk Analytics',
    status: 'Approved',
  },
  {
    prompt: 'Generate SAR review checklist from alert metadata and highlight missing evidence fields.',
    application: 'Fraud Monitoring',
    owner: 'AML Intelligence Unit',
    status: 'Flagged',
  },
];

function getStatusStyle(status: string) {
  if (status === 'Approved') return { color: colors.success, bg: `${colors.success}22` };
  if (status === 'In Review') return { color: colors.info, bg: `${colors.info}22` };
  return { color: colors.critical, bg: `${colors.critical}22` };
}

export function PromptGovernance() {
  return (
    <Box>
      <Grid container spacing={1.5}>
        {promptGovernanceKpis.map((kpi, index) => (
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

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Prompt Governance Register" subtitle="Net Banking · Mobile Banking · Payments · Fraud Monitoring" />
        <TableContainer>
          <Table size="small" aria-label="prompt governance table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Prompt</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Application</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {promptRows.map((row) => {
                const statusStyle = getStatusStyle(row.status);
                return (
                  <TableRow key={row.prompt} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ color: colors.text.primary, fontWeight: 600 }}>
                        {row.prompt}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.application}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.owner}</TableCell>
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
