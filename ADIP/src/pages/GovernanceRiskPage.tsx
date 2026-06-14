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
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';

const kpis = [
  { label: 'Enterprise Risks', value: 31, suffix: '', trend: -3.1 },
  { label: 'High Risk Items', value: 8, suffix: '', trend: -11.1 },
  { label: 'Mitigation Plans Due', value: 5, suffix: '', trend: -16.7 },
  { label: 'Residual Risk Score', value: 64, trend: -2.4 },
];

const rows = [
  { risk: 'UPI outage concentration in peak window', domain: 'Payments', owner: 'SRE Banking', severity: 'High' },
  { risk: 'Delayed patching on internet-facing middleware', domain: 'Infrastructure', owner: 'Platform Security', severity: 'Critical' },
  { risk: 'Fraud model false-positive surge', domain: 'Fraud Monitoring', owner: 'Fraud Analytics', severity: 'Medium' },
  { risk: 'Batch reconciliation delay for loan postings', domain: 'Core Lending', owner: 'Loan Operations Tech', severity: 'Medium' },
];

function severityStyle(severity: string) {
  if (severity === 'Critical') return { c: colors.critical, b: `${colors.critical}22` };
  if (severity === 'High') return { c: colors.warning, b: `${colors.warning}22` };
  return { c: colors.info, b: `${colors.info}22` };
}

export function GovernanceRiskPage() {
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
        <ModuleHeader title="Operational Risk Heat Register" subtitle="Context: technology and service continuity risk" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Risk</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Domain</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Severity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const s = severityStyle(row.severity);
                return (
                  <TableRow key={row.risk} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.primary }}>{row.risk}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.domain}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.owner}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ px: 1, py: 0.25, borderRadius: 1, color: s.c, bgcolor: s.b, fontWeight: 700 }}>{row.severity}</Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>

      <HubArtifactGenerator hubKey="risk" />
    </Box>
  );
}
