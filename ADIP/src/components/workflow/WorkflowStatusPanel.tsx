import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Tooltip,
  Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditNoteIcon from '@mui/icons-material/EditNote';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useWorkflow } from '../../context/WorkflowContext';
import { lifecycleActionsFor, WORKFLOW_STAGE_LABEL } from '../../data/unifiedLifecycleEngine';
import { WorkflowLifecycleChain } from './WorkflowLifecycleChain';
import { GlassCard } from '../common/GlassCard';
import { colors } from '../../theme/colors';
import type { UnifiedLifecycleAction } from '../../types/workflowOrchestration';

const STATUS_COLOR: Record<string, string> = {
  Draft: colors.text.muted,
  Submitted: colors.info,
  Assigned: colors.secondary,
  'Under Review': colors.primary,
  Approved: colors.success,
  Rejected: colors.warning,
  'Changes Requested': colors.warning,
  Escalated: colors.critical,
  Released: colors.success,
  Production: colors.success,
};

const TRACE_COLOR: Record<string, string> = {
  linked: colors.success,
  partial: colors.warning,
  gap: colors.warning,
};

const ACTION_ICONS: Partial<Record<UnifiedLifecycleAction, typeof SendIcon>> = {
  Submit: SendIcon,
  'Assign Reviewer': PersonAddIcon,
  Approve: CheckCircleIcon,
  Reject: CancelIcon,
  'Request Changes': EditNoteIcon,
  Escalate: TrendingUpIcon,
  'Advance Stage': ArrowForwardIcon,
  Release: RocketLaunchIcon,
};

interface WorkflowStatusPanelProps {
  workflowId?: string;
  showActions?: boolean;
}

export function WorkflowStatusPanel({ workflowId, showActions = true }: WorkflowStatusPanelProps) {
  const {
    getWorkflow,
    selectedWorkflowId,
    applyLifecycleAction,
    canPerformLifecycleAction,
  } = useWorkflow();

  const id = workflowId ?? selectedWorkflowId;
  const workflow = id ? getWorkflow(id) : undefined;
  if (!workflow) return null;

  const actions = lifecycleActionsFor(workflow);

  return (
    <GlassCard sx={{ p: 2, mt: 1.5 }} glow="blue" hover={false}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{workflow.title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {workflow.id} · {workflow.approvalTask.approvalId} · {workflow.domain}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip label={WORKFLOW_STAGE_LABEL[workflow.currentStage]} size="small" sx={{ height: 22, fontSize: '0.62rem', fontWeight: 700, bgcolor: `${colors.primary}22`, color: colors.primary }} />
          <Chip label={workflow.lifecycleStatus} size="small" sx={{ height: 22, fontSize: '0.62rem', bgcolor: `${STATUS_COLOR[workflow.lifecycleStatus]}18`, color: STATUS_COLOR[workflow.lifecycleStatus] }} />
          <Chip label={`Risk: ${workflow.deliveryRisk}`} size="small" sx={{ height: 22, fontSize: '0.58rem' }} />
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
          LIFECYCLE & APPROVAL LINEAGE
        </Typography>
        <WorkflowLifecycleChain chain={workflow.traceabilityChain} compact showApproval />
      </Box>

      {showActions && (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {actions.map((action) => {
            const Icon = ACTION_ICONS[action] ?? SendIcon;
            const allowed = canPerformLifecycleAction(action);
            return (
              <Tooltip key={action} title={allowed ? action : `RBAC: ${action} not permitted for your role`}>
                <span>
                  <Button
                    size="small"
                    variant={action === 'Approve' || action === 'Release' ? 'contained' : 'outlined'}
                    startIcon={<Icon sx={{ fontSize: 14 }} />}
                    disabled={!allowed}
                    onClick={() => applyLifecycleAction(workflow.id, action)}
                    sx={{ textTransform: 'none', fontSize: '0.72rem' }}
                  >
                    {action === 'Submit' ? 'Submit For Review' : action === 'Advance Stage' ? 'Move To Next Stage' : action}
                  </Button>
                </span>
              </Tooltip>
            );
          })}
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
