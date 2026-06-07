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

const complianceKpis = [
  { label: 'Controls Passed', value: 186, suffix: '', trend: 3.2 },
  { label: 'Open Exceptions', value: 11, suffix: '', trend: -8.3 },
  { label: 'Evidence Coverage', value: 94, trend: 1.6 },
  { label: 'Compliance Score', value: 91, trend: 2.4 },
];

const complianceControls = [
  {
    control: 'UPI Transaction Limit Monitoring',
    regulation: 'RBI Master Direction - Digital Payments',
    status: 'Compliant',
    owner: 'Payments Controls Team',
  },
  {
    control: 'Privileged Access Review (Quarterly)',
    regulation: 'ISO27001 A.9 Access Control',
    status: 'Needs Attention',
    owner: 'IAM Operations',
  },
  {
    control: 'Cardholder Data Encryption at Rest',
    regulation: 'PCI-DSS 4.0 Req 3',
    status: 'Compliant',
    owner: 'Card Platform Engineering',
  },
  {
    control: 'Vulnerability Remediation SLA',
    regulation: 'PCI-DSS 4.0 Req 6',
    status: 'Partially Compliant',
    owner: 'Application Security',
  },
  {
    control: 'BCP / DR Drill Evidence',
    regulation: 'RBI Cyber Security Framework',
    status: 'Compliant',
    owner: 'Resilience Office',
  },
  {
    control: 'Security Logging & Monitoring',
    regulation: 'ISO27001 A.12 Operations Security',
    status: 'Compliant',
    owner: 'SOC Team',
  },
];

function getStatusStyle(status: string) {
  if (status === 'Compliant') {
    return { color: colors.success, bg: `${colors.success}22` };
  }
  if (status === 'Partially Compliant') {
    return { color: colors.warning, bg: `${colors.warning}22` };
  }
  return { color: colors.critical, bg: `${colors.critical}22` };
}

export function ComplianceReports() {
  return (
    <Box>
      <Grid container spacing={1.5}>
        {complianceKpis.map((kpi, index) => (
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
        <ModuleHeader title="Compliance Controls Register" subtitle="RBI · ISO27001 · PCI-DSS" />
        <TableContainer>
          <Table size="small" aria-label="compliance controls table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Control</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Regulation</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Owner</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complianceControls.map((row) => {
                const statusStyle = getStatusStyle(row.status);
                return (
                  <TableRow key={row.control} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ color: colors.text.primary, fontWeight: 600 }}>
                        {row.control}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.regulation}</TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          color: statusStyle.color,
                          bgcolor: statusStyle.bg,
                          fontWeight: 700,
                        }}
                      >
                        {row.status}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.owner}</TableCell>
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
