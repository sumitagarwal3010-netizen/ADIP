import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import BlockIcon from '@mui/icons-material/Block';
import { WORKFLOW_STAGE_LABEL } from '../../data/workflowOrchestrationEngine';
import type { WorkflowTraceabilityLink } from '../../types/workflowOrchestration';
import { colors } from '../../theme/colors';

const STATUS_ICON = {
  complete: <CheckCircleIcon sx={{ fontSize: 14, color: colors.success }} />,
  in_progress: <HourglassEmptyIcon sx={{ fontSize: 14, color: colors.primary }} />,
  pending: <RadioButtonUncheckedIcon sx={{ fontSize: 14, color: colors.text.muted }} />,
  blocked: <BlockIcon sx={{ fontSize: 14, color: colors.warning }} />,
};

interface WorkflowLifecycleChainProps {
  chain: WorkflowTraceabilityLink[];
  compact?: boolean;
  showApproval?: boolean;
}

export function WorkflowLifecycleChain({ chain, compact, showApproval }: WorkflowLifecycleChainProps) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: compact ? 0.5 : 1, alignItems: 'center' }}>
      {chain.map((link, i) => (
        <Box key={link.stage} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 0.25,
              px: compact ? 0.75 : 1,
              py: 0.4,
              borderRadius: 1,
              bgcolor: link.status === 'in_progress' ? `${colors.primary}18` : colors.bg.glass,
              border: `1px solid ${link.status === 'in_progress' ? colors.primary : colors.border.subtle}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {STATUS_ICON[link.status]}
              <Typography variant="caption" sx={{ fontSize: compact ? '0.58rem' : '0.65rem', fontWeight: link.status === 'in_progress' ? 700 : 500 }}>
                {WORKFLOW_STAGE_LABEL[link.stage]}
              </Typography>
            </Box>
            {showApproval && link.approvalStatus && (
              <Typography variant="caption" sx={{ fontSize: '0.55rem', color: colors.text.muted, pl: 2.2 }}>
                {link.approvalStatus}
              </Typography>
            )}
          </Box>
          {i < chain.length - 1 && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>→</Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
