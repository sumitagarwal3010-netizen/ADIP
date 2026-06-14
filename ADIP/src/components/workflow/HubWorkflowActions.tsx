import { useMemo } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useWorkflow } from '../../context/WorkflowContext';
import { WorkflowStatusPanel } from './WorkflowStatusPanel';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import type { WorkflowLifecycleStage } from '../../types/workflowOrchestration';
import { WORKFLOW_STAGE_LABEL } from '../../data/workflowOrchestrationEngine';
import { colors } from '../../theme/colors';

interface HubWorkflowActionsProps {
  hubStage: WorkflowLifecycleStage;
}

export function HubWorkflowActions({ hubStage }: HubWorkflowActionsProps) {
  const { getWorkflowsForHub, selectedWorkflowId, setSelectedWorkflowId } = useWorkflow();
  const hubWorkflows = useMemo(() => getWorkflowsForHub(hubStage), [getWorkflowsForHub, hubStage]);

  const activeId = useMemo(() => {
    if (selectedWorkflowId && hubWorkflows.some((w) => w.id === selectedWorkflowId)) return selectedWorkflowId;
    return hubWorkflows[0]?.id ?? null;
  }, [hubWorkflows, selectedWorkflowId]);

  if (hubWorkflows.length === 0) {
    return (
      <GlassCard sx={{ p: 2, mt: 1.5 }} hover={false}>
        <ModuleHeader title="Workflow Status" subtitle={`No active workflows at ${WORKFLOW_STAGE_LABEL[hubStage]} stage`} />
        <Typography variant="caption" color="text.secondary">
          Workflows advance through the lifecycle from other hubs or the Orchestration Dashboard.
        </Typography>
      </GlassCard>
    );
  }

  return (
    <Box>
      <GlassCard sx={{ p: 1.5, mt: 1.5 }} hover={false}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <ModuleHeader title="Workflow Status" subtitle={`${hubWorkflows.length} workflow(s) at ${WORKFLOW_STAGE_LABEL[hubStage]}`} />
          {hubWorkflows.length > 1 && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel sx={{ fontSize: '0.75rem' }}>Workflow</InputLabel>
              <Select
                value={activeId ?? ''}
                label="Workflow"
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                sx={{ fontSize: '0.78rem' }}
              >
                {hubWorkflows.map((w) => (
                  <MenuItem key={w.id} value={w.id} sx={{ fontSize: '0.78rem' }}>{w.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem' }}>
          View Workflow Status · Submit For Review · Submit For Approval · Move To Next Stage
        </Typography>
      </GlassCard>
      {activeId && <WorkflowStatusPanel workflowId={activeId} />}
    </Box>
  );
}

interface WorkflowStatusLinkProps {
  hubStage: WorkflowLifecycleStage;
}

export function WorkflowStatusLink({ hubStage }: WorkflowStatusLinkProps) {
  const { getWorkflowsForHub } = useWorkflow();
  const count = getWorkflowsForHub(hubStage).length;
  if (count === 0) return null;
  return (
    <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 600, fontSize: '0.65rem' }}>
      {count} active workflow{count > 1 ? 's' : ''} at this stage
    </Typography>
  );
}
