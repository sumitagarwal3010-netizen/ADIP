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
  { label: 'Evidence Artifacts', value: 246, suffix: '', trend: 8.1 },
  { label: 'Missing Evidence', value: 13, suffix: '', trend: -18.8 },
  { label: 'Auto-Collected', value: 171, suffix: '', trend: 9.7 },
  { label: 'Evidence Freshness', value: 89, trend: 2.0 },
];

const rows = [
  { evidence: 'Q1 Privileged Access Review Pack', source: 'IAM Tooling', owner: 'Access Control Office', status: 'Ready' },
  { evidence: 'DR Drill Execution Logs', source: 'Resilience Platform', owner: 'BCP Team', status: 'Pending Validation' },
  { evidence: 'PCI Key Rotation Proof Bundle', source: 'KMS Audit Trail', owner: 'Card Security Ops', status: 'Ready' },
  { evidence: 'Fraud Rule Tuning Approval Minutes', source: 'GRC Repository', owner: 'Fraud Governance', status: 'Gap Identified' },
];

function statusStyle(status: string) {
  if (status === 'Ready') return { c: colors.success, b: `${colors.success}22` };
  if (status === 'Pending Validation') return { c: colors.info, b: `${colors.info}22` };
  return { c: colors.warning, b: `${colors.warning}22` };
}

export function GovernanceEvidencePage() {
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
        <ModuleHeader title="Evidence Collection Tracker" subtitle="Context: readiness for internal and regulatory audits" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Evidence</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Source</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Owner</TableCell>
                <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.muted, fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const s = statusStyle(row.status);
                return (
                  <TableRow key={row.evidence} hover sx={{ '&:hover td': { bgcolor: colors.bg.glass } }}>
                    <TableCell sx={{ borderColor: colors.border.subtle }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: colors.text.primary }}>{row.evidence}</Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.border.subtle, color: colors.text.secondary }}>{row.source}</TableCell>
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

      <HubArtifactGenerator hubKey="evidence" />
    </Box>
  );
}
