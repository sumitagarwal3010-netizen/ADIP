import { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { DrilldownTableRow } from '../components/common/DrilldownTableRow';
import { GlassCard } from '../components/common/GlassCard';
import { ModuleHeader } from '../components/common/ModuleHeader';
import { SeverityChip } from '../components/common/SeverityChip';
import { useFilteredSimulation } from '../hooks/useFilteredSimulation';
import { RequirementIntakeWorkflow } from '../components/requirements/RequirementIntakeWorkflow';
import { AIWorkspacePanel } from '../components/workflow/AIWorkspacePanel';
import { HubWorkflowActions } from '../components/workflow/HubWorkflowActions';
import { SdlcBackendStrip } from '../components/common/SdlcBackendStrip';
import { useSdlcHubSummary } from '../sdk/hooks/useSdlcHubSummary';
import { colors } from '../theme/colors';

export function RequirementsHub() {
  const { requirements } = useFilteredSimulation();
  const [showGovernanceWorkflow, setShowGovernanceWorkflow] = useState(false);
  const backend = useSdlcHubSummary('requirements', {
    score: requirements.qualityScore,
    readiness: requirements.qualityScore >= 80 ? 'Ready' : 'On Track',
    totalItems: requirements.analysed,
  });

  return (
    <Box>
      <AIWorkspacePanel module="requirements" number={1} />
      {showGovernanceWorkflow && (
        <SdlcBackendStrip
          hubLabel="Requirements"
          loading={backend.loading}
          error={backend.error}
          source={backend.source}
          summary={backend.data}
          onRetry={backend.retry}
        />
      )}
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
        {requirements.analysisQueue} items in analysis queue
      </Typography>

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="Top Three Delivery Risks" />
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2, py: 0.5, borderBottom: `1px solid ${colors.border.subtle}`, mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}>ID</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}>Name</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase' }}>Area</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 72, ml: 'auto', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', textAlign: 'right' }}>Risk</Typography>
        </Box>
        {requirements.topRiskRequirements.slice(0, 3).map((req) => (
          <DrilldownTableRow
            key={req.id}
            chartId="requirements.top-risk"
            segment={req.id}
            label={req.title}
            value={req.id}
            sx={{ display: 'flex', gap: 2, py: 1, borderBottom: `1px solid ${colors.border.subtle}` }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 100 }}>{req.id}</Typography>
            <Typography variant="caption" sx={{ flex: 1 }}>{req.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140 }}>{req.impact}</Typography>
            <Box sx={{ ml: 'auto' }}>
              <SeverityChip severity={req.risk} />
            </Box>
          </DrilldownTableRow>
        ))}
        <Button
          size="small"
          variant="outlined"
          onClick={() => setShowGovernanceWorkflow((prev) => !prev)}
          sx={{ mt: 1.25, fontSize: '0.72rem' }}
        >
          {showGovernanceWorkflow ? 'Hide Governance Workflow' : 'View Governance Workflow'}
        </Button>
      </GlassCard>

      {showGovernanceWorkflow && <HubWorkflowActions hubStage="requirements" />}
      <RequirementIntakeWorkflow />
    </Box>
  );
}
