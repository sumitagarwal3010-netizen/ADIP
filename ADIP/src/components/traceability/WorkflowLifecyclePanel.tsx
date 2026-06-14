import { useMemo } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useWorkflow } from '../../context/WorkflowContext';
import { WorkflowLifecycleChain } from '../workflow/WorkflowLifecycleChain';
import { WorkflowStatusPanel } from '../workflow/WorkflowStatusPanel';
import { GlassCard } from '../common/GlassCard';
import { ModuleHeader } from '../common/ModuleHeader';
import { WORKFLOW_STAGE_LABEL } from '../../data/workflowOrchestrationEngine';
import { colors } from '../../theme/colors';

export function WorkflowLifecyclePanel() {
  const { workflows, selectedWorkflowId, setSelectedWorkflowId } = useWorkflow();
  const active = useMemo(
    () => workflows.find((w) => w.id === selectedWorkflowId) ?? workflows[0],
    [workflows, selectedWorkflowId],
  );

  return (
    <Box>
      <GlassCard sx={{ p: 2, mb: 1.5 }}>
        <ModuleHeader
          title="Cross-Hub Lifecycle Orchestration"
          subtitle="Requirement → Architecture → Development → Testing → Release → Approval → Production"
        />
        <FormControl size="small" sx={{ minWidth: 280, mt: 1 }}>
          <InputLabel>Workflow</InputLabel>
          <Select
            value={active?.id ?? ''}
            label="Workflow"
            onChange={(e) => setSelectedWorkflowId(e.target.value)}
            sx={{ fontSize: '0.8rem' }}
          >
            {workflows.map((w) => (
              <MenuItem key={w.id} value={w.id} sx={{ fontSize: '0.8rem' }}>
                {w.title} — {WORKFLOW_STAGE_LABEL[w.currentStage]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </GlassCard>

      {active && (
        <>
          <GlassCard sx={{ p: 2, mb: 1.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: colors.text.muted, letterSpacing: '0.05em', display: 'block', mb: 1 }}>
              END-TO-END LIFECYCLE
            </Typography>
            <WorkflowLifecycleChain chain={active.traceabilityChain} />
          </GlassCard>
          <WorkflowStatusPanel workflowId={active.id} showActions={false} />
        </>
      )}

      <GlassCard sx={{ p: 2, mt: 1.5 }}>
        <ModuleHeader title="All Workflows" subtitle="Cross-hub orchestration registry" />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Workflow</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Stage</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Approval</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Completion</TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.65rem' }}>Traceability</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workflows.map((w) => (
                <TableRow
                  key={w.id}
                  hover
                  selected={w.id === active?.id}
                  onClick={() => setSelectedWorkflowId(w.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ fontSize: '0.72rem', fontWeight: 600 }}>{w.title}</TableCell>
                  <TableCell sx={{ fontSize: '0.72rem' }}>{WORKFLOW_STAGE_LABEL[w.currentStage]}</TableCell>
                  <TableCell>
                    <Chip label={w.lifecycleStatus} size="small" sx={{ height: 20, fontSize: '0.58rem' }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.72rem' }}>{w.completionPct}%</TableCell>
                  <TableCell sx={{ fontSize: '0.72rem' }}>{w.traceabilityStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </GlassCard>
    </Box>
  );
}
