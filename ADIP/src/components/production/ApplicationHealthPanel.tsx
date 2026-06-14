import { Box, Chip, Grid, MenuItem, Select, Typography } from '@mui/material';
import { KpiCard } from '../common/KpiCard';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { useProductionIntelligence } from '../../context/ProductionIntelligenceContext';
import { colors } from '../../theme/colors';

const COMPLIANCE_COLOR = { compliant: colors.success, 'at-risk': colors.warning, 'non-compliant': colors.critical };

export function ApplicationHealthPanel() {
  const {
    applications, selectedApplicationId, setSelectedApplicationId, selectedApplication, applicationIncidents,
  } = useProductionIntelligence();

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="Application Health" subtitle={`${applications.length} production applications monitored`} />
        <Select size="small" value={selectedApplicationId} onChange={(e) => setSelectedApplicationId(e.target.value)} sx={{ fontSize: '0.72rem', minWidth: 280, mb: 1.5 }}>
          {applications.map((a) => (
            <MenuItem key={a.id} value={a.id} sx={{ fontSize: '0.72rem' }}>{a.id} — {a.name}</MenuItem>
          ))}
        </Select>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Availability" value={selectedApplication.availability} suffix="%" compact /></Grid>
          <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Reliability" value={selectedApplication.reliability} suffix="%" compact /></Grid>
          <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Performance" value={selectedApplication.performance} suffix="%" compact /></Grid>
          <Grid size={{ xs: 6, md: 2.4 }}><KpiCard label="Risk Score" value={selectedApplication.riskScore} suffix="%" chartId="prod-intel.app-risk" compact /></Grid>
          <Grid size={{ xs: 6, md: 2.4 }}>
            <GlassCard sx={{ p: 1, textAlign: 'center' }} hover={false}>
              <Typography variant="caption" color="text.secondary">Compliance</Typography>
              <Chip label={selectedApplication.complianceStatus} size="small" sx={{ mt: 0.5, bgcolor: `${COMPLIANCE_COLOR[selectedApplication.complianceStatus]}33` }} />
            </GlassCard>
          </Grid>
        </Grid>
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 4 }}><KpiCard label="Incidents" value={selectedApplication.incidentCount} compact /></Grid>
          <Grid size={{ xs: 4 }}><KpiCard label="Defects" value={selectedApplication.defectCount} compact /></Grid>
          <Grid size={{ xs: 4 }}><KpiCard label="Audit Findings" value={selectedApplication.auditFindings} compact /></Grid>
        </Grid>
      </GlassCard>

      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader title="All Applications" subtitle="Availability · reliability · risk overview" />
        {applications.slice(0, 20).map((a) => (
          <Box key={a.id} sx={{ py: 0.5, borderBottom: `1px solid ${colors.border.subtle}`, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 120 }}>{a.name}</Typography>
            <Typography variant="caption" color="text.secondary">{a.domain}</Typography>
            <Typography variant="caption">{a.availability.toFixed(1)}% avail</Typography>
            <Typography variant="caption" color={a.riskScore > 60 ? 'error' : 'text.secondary'}>Risk {a.riskScore}%</Typography>
            <Chip label={a.complianceStatus} size="small" sx={{ fontSize: '0.58rem', height: 18 }} />
          </Box>
        ))}
      </GlassCard>

      <GlassCard sx={{ p: 2 }}>
        <ModuleHeader title={`Incidents — ${selectedApplication.name}`} />
        {applicationIncidents.slice(0, 8).map((inc) => (
          <Typography key={inc.id} variant="caption" sx={{ display: 'block', py: 0.4 }}>
            {inc.id}: {inc.title} ({inc.severity})
          </Typography>
        ))}
      </GlassCard>
    </Box>
  );
}
