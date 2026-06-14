import { Box, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { colors } from '../../theme/colors';
import type { ApprovalTraceabilityLink } from '../../data/approvalWorkflowEngine';

interface ApprovalTraceabilityChainProps {
  chain: ApprovalTraceabilityLink[];
  compact?: boolean;
}

export function ApprovalTraceabilityChain({ chain, compact }: ApprovalTraceabilityChainProps) {
  if (chain.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        No traceability chain linked.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: compact ? 0.5 : 1 }}>
      {chain.map((link, i) => (
        <Box key={link.nodeId} sx={{ display: 'flex', alignItems: 'center', gap: compact ? 0.5 : 1 }}>
          <Box
            sx={{
              px: compact ? 0.75 : 1,
              py: compact ? 0.25 : 0.5,
              borderRadius: 1,
              bgcolor: link.stage === 'Approval' ? `${colors.primary}22` : colors.bg.glass,
              border: `1px solid ${link.stage === 'Approval' ? colors.primary : colors.border.subtle}`,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, fontSize: compact ? '0.62rem' : '0.68rem', display: 'block' }}>
              {link.stage}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
              {link.nodeId}
            </Typography>
          </Box>
          {i < chain.length - 1 && (
            <ArrowForwardIcon sx={{ fontSize: compact ? 12 : 14, color: colors.text.muted }} />
          )}
        </Box>
      ))}
    </Box>
  );
}
