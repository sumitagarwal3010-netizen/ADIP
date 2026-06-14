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

const auditKpis = [
  { label: 'Open Findings', value: 23, suffix: '', trend: -4.2 },
  { label: 'High Severity Findings', value: 6, suffix: '', trend: -14.3 },
  { label: 'Repeat Findings', value: 4, suffix: '', trend: -20 },
  { label: 'Observations Closed', value: 57, suffix: '', trend: 9.6 },
];

const auditObservations = [
  {
    observation: 'Privileged user recertification overdue for Core Banking',
    severity: 'High',
    owner: 'IAM Governance',
    status: 'In Progress',
  },
  {
    observation: 'Incomplete maker-checker evidence for payment reversals',
    severity: 'Medium',
    owner: 'Payments Operations',
    status: 'Open',
  },
  {
    observation: 'Quarterly VA/PT closure tracker missing for 2 critical assets',
    severity: 'High',
    owner: 'Application Security',
    status: 'In Progress',
  },
  {
    observation: 'Exception approval trail for batch override not standardized',
    severity: 'Medium',
    owner: 'Batch Control Office',
    status: 'Open',
  },
  {
    observation: 'Firewall rule review sign-off delayed for DR network segment',
    severity: 'Low',
    owner: 'Infrastructure Security',
    status: 'Closed',
  },
  {
    observation: 'Log retention evidence for card switch archived and verified',
    severity: 'Low',
    owner: 'SOC Team',
    status: 'Closed',
  },
];

function getSeverityStyle(severity: string) {
  if (severity === 'High') {
    return { color: colors.critical, bg: `${colors.critical}22` };
  }
  if (severity === 'Medium') {
    return { color: colors.warning, bg: `${colors.warning}22` };
  }
  return { color: colors.success, bg: `${colors.success}22` };
}

function getStatusStyle(status: string) {
  if (status === 'Closed') {
    return { color: colors.success, bg: `${colors.success}22` };
  }
  if (status === 'In Progress') {
    return { color: colors.info, bg: `${colors.info}22` };
  }
  return { color: colors.warning, bg: `${colors.warning}22` };
}

export function AuditReports() {
  return (
    <Box>
      <Grid container spacing={1.5}>
        {auditKpis.map((kpi, index) => (
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
        <ModuleHeader title="Audit Observations Register" subtitle="Internal Audit · ITGC · Risk Control Reviews" />
        <TableContainer>
          <Table size="small" aria-label="audit observations table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Observation</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Severity</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {auditObservations.map((row) => {
                const severityStyle = getSeverityStyle(row.severity);
                const statusStyle = getStatusStyle(row.status);
                return (
                  <TableRow key={row.observation} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ color: colors.text.primary, fontWeight: 600 }}>
                        {row.observation}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography
                        variant="caption"
                        sx={{ px: 1, py: 0.25, borderRadius: 1, color: severityStyle.color, bgcolor: severityStyle.bg, fontWeight: 700 }}
                      >
                        {row.severity}
                      </Typography>
                    </TableCell>
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

      <HubArtifactGenerator hubKey="audit" />
    </Box>
  );
}
