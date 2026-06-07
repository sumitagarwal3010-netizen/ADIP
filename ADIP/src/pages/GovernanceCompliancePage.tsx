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

const kpis = [
  { label: 'Regulations Covered', value: 14, suffix: '', trend: 3.1 },
  { label: 'Open Compliance Gaps', value: 9, suffix: '', trend: -10.0 },
  { label: 'Controls Tested (QTD)', value: 128, suffix: '', trend: 6.4 },
  { label: 'Regulatory Readiness', value: 92, trend: 1.8 },
];

const rows = [
  { regulation: 'RBI Cyber Security Framework', control: 'Privileged Access Quarterly Review', owner: 'IAM Governance', status: 'Compliant' },
  { regulation: 'PCI-DSS 4.0', control: 'Cardholder Data Encryption Rotation', owner: 'Card Security Ops', status: 'In Progress' },
  { regulation: 'ISO27001 A.12', control: 'SOC Log Correlation Coverage', owner: 'Security Operations', status: 'Compliant' },
  { regulation: 'RBI IT Governance Circular', control: 'DR Drill Evidence Sign-off', owner: 'Resilience Office', status: 'Action Required' },
];

function statusStyle(status: string) {
  if (status === 'Compliant') return { c: colors.success, b: `${colors.success}22` };
  if (status === 'In Progress') return { c: colors.info, b: `${colors.info}22` };
  return { c: colors.warning, b: `${colors.warning}22` };
}

export function GovernanceCompliancePage() {
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
        <ModuleHeader title="Regulatory Compliance Control Register" subtitle="Context: RBI / PCI-DSS / ISO27001 tracking" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Regulation</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Control</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const s = statusStyle(row.status);
                return (
                  <TableRow key={row.control} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>{row.regulation}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.primary }}>{row.control}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.owner}</TableCell>
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
