import { Box, Grid, Typography } from '@mui/material';
import { KpiCard } from '../components/common/KpiCard';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { SeverityChip } from '../components/common/SeverityChip';
import { colors } from '../theme/colors';
import { useFilteredSimulation } from '../hooks/useFilteredSimulation';
import { computeAiGovernanceKpis } from '../data/aiUseCaseRegistryMock';
import { HubArtifactGenerator } from '../components/workflow/HubArtifactGenerator';

function statusColor(status: string): string {
  if (status === 'Approved') return colors.success;
  if (status === 'Pilot') return colors.info;
  if (status === 'Review') return colors.warning;
  return colors.text.muted;
}

export function AIGovernanceHub() {
  const { aiGovernance } = useFilteredSimulation();
  const kpis = computeAiGovernanceKpis(aiGovernance.useCases);

  return (
    <Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Total AI Use Cases" value={kpis.total} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Approved Models" value={kpis.approved} suffix="" trend={4} compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="High Risk Use Cases" value={kpis.highRisk} suffix="" compact /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><KpiCard label="Pending Review" value={kpis.pendingReview} suffix="" trend={-1} compact /></Grid>
      </Grid>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="AI Use Case Registry" subtitle={`${aiGovernance.useCases.length} registered use cases`} />
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            gap: 2,
            py: 0.5,
            borderBottom: `1px solid ${colors.border.subtle}`,
            mb: 0.5,
          }}
        >
          {['ID', 'Use Case', 'Domain', 'Model Type', 'Risk', 'Status'].map((col) => (
            <Typography
              key={col}
              variant="caption"
              color="text.secondary"
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                minWidth: col === 'ID' ? 72 : col === 'Use Case' ? undefined : col === 'Domain' ? 100 : col === 'Model Type' ? 80 : 72,
                flex: col === 'Use Case' ? 1 : undefined,
                ml: col === 'Status' ? 'auto' : undefined,
              }}
            >
              {col}
            </Typography>
          ))}
        </Box>
        {aiGovernance.useCases.map((uc) => (
          <DrilldownTableRow
            key={uc.id}
            chartId="ai-governance.use-case-registry"
            segment={uc.id}
            label={uc.name}
            value={uc.id}
            sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}`, alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 72 }}>{uc.id}</Typography>
            <Typography variant="caption" sx={{ flex: 1, minWidth: 160 }}>{uc.name}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{uc.domain}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 80 }}>{uc.modelType}</Typography>
            <SeverityChip severity={uc.riskTier} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: statusColor(uc.status), minWidth: 72, textAlign: 'right', ml: 'auto' }}>
              {uc.status}
            </Typography>
          </DrilldownTableRow>
        ))}
      </GlassCard>

      <HubArtifactGenerator hubKey="ai-use-case" />
    </Box>
  );
}
