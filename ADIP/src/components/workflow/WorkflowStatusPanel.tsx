import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Typography,
} from '@mui/material';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ApprovalIcon from '@mui/icons-material/Approval';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useWorkflow } from '../../context/WorkflowContext';
import { allowedActions, WORKFLOW_STAGE_LABEL } from '../../data/workflowOrchestrationEngine';
import { WorkflowLifecycleChain } from './WorkflowLifecycleChain';
import { GlassCard } from '../common/GlassCard';
import { colors } from '../../theme/colors';

const APPROVAL_COLOR: Record<string, string> = {
  'Not Started': colors.text.muted,
  'In Progress': colors.primary,
  'Pending Review': colors.secondary,
  'Pending Approval': colors.warning,
  Approved: colors.success,
  Rejected: colors.warning,
  Blocked: colors.warning,
};

const TRACE_COLOR: Record<string, string> = {
  linked: colors.success,
  partial: colors.warning,
  gap: colors.warning,
};

interface WorkflowStatusPanelProps {
  workflowId?: string;
  showActions?: boolean;
}

export function WorkflowStatusPanel({ workflowId, showActions = true }: WorkflowStatusPanelProps) {
  const {
    getWorkflow,
    selectedWorkflowId,
    submitForReview,
    submitForApproval,
    moveToNextStage,
  } = useWorkflow();

  const id = workflowId ?? selectedWorkflowId;
  const workflow = id ? getWorkflow(id) : undefined;
  if (!workflow) return null;

  const actions = allowedActions(workflow);

  return (
    <GlassCard sx={{ p: 2, mt: 1.5 }} glow="blue" hover={false}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{workflow.title}</Typography>
          <Typography variant="caption" color="text.secondary">{workflow.id} · {workflow.domain}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip label={WORKFLOW_STAGE_LABEL[workflow.currentStage]} size="small" sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, bgcolor: `${colors.primary}22`, color: colors.primary }} />
          <Chip label={workflow.approvalState} size="small" sx={{ height: 22, fontSize: '0.62rem', bgcolor: `${APPROVAL_COLOR[workflow.approvalState]}18`, color: APPROVAL_COLOR[workflow.approvalState] }} />
          {workflow.slaBreached && (
            <Chip label="SLA Breach" size="small" color="error" sx={{ height: 22, fontSize: '0.62rem' }} />
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Completion</Typography>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>{workflow.completionPct}%</Typography>
        </Box>
        <LinearProgress variant="determinate" value={workflow.completionPct} sx={{ height: 6, borderRadius: 1 }} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5, mb: 1.5 }}>
        <Field label="Owner" value={workflow.owner} />
        <Field label="Reviewer" value={workflow.reviewer ?? '—'} />
        <Field label="Due Date" value={workflow.dueDate} />
        <Field label="Traceability" value={workflow.traceabilityStatus} chipColor={TRACE_COLOR[workflow.traceabilityStatus]} />
      </Box>

      {workflow.pendingActions.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: colors.text.muted, letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
            PENDING ACTIONS
          </Typography>
          {workflow.pendingActions.map((a) => (
            <Typography key={a} variant="caption" sx={{ display: 'block', fontSize: '0.72rem', py: 0.2 }}>• {a}</Typography>
          ))}
        </Box>
      )}

      <Box sx={{ mb: showActions ? 1.5 : 0 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: colors.text.muted, letterSpacing: '0.05em', display: 'block', mb: 0.75 }}>
          LIFECYCLE CHAIN
        </Typography>
        <WorkflowLifecycleChain chain={workflow.traceabilityChain} compact />
      </Box>

      {showActions && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {actions.includes('submit_for_review') && (
            <Button size="small" variant="outlined" startIcon={<RateReviewIcon />} onClick={() => submitForReview(workflow.id)} sx={{ textTransform: 'none', fontSize: '0.72rem' }}>
              Submit For Review
            </Button>
          )}
          {actions.includes('submit_for_approval') && (
            <Button size="small" variant="outlined" startIcon={<ApprovalIcon />} onClick={() => submitForApproval(workflow.id)} sx={{ textTransform: 'none', fontSize: '0.72rem' }}>
              Submit For Approval
            </Button>
          )}
          {actions.includes('move_to_next_stage') && (
            <Button size="small" variant="contained" startIcon={<ArrowForwardIcon />} onClick={() => moveToNextStage(workflow.id)} sx={{ textTransform: 'none', fontSize: '0.72rem' }}>
              Move To Next Stage
            </Button>
          )}
        </Box>
      )}
    </GlassCard>
  );
}

function Field({ label, value, chipColor }: { label: string; value: string; chipColor?: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block' }}>{label}</Typography>
      {chipColor ? (
        <Chip label={value} size="small" sx={{ height: 20, fontSize: '0.62rem', mt: 0.25, bgcolor: `${chipColor}18`, color: chipColor }} />
      ) : (
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>{value}</Typography>
      )}
    </Box>
  );
}
