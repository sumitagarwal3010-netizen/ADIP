import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/colors';
import {
  TRACE_TYPE_LABEL,
  TRACE_TYPE_SHORT,
  type TraceNode,
} from '../../data/traceabilityModel';
import { traceStatusColor, traceTypeColor } from './traceVisuals';

interface TraceNodeChipProps {
  node: TraceNode;
  onClick?: (node: TraceNode) => void;
  active?: boolean;
  compact?: boolean;
}

export function TraceNodeChip({ node, onClick, active, compact }: TraceNodeChipProps) {
  const accent = traceTypeColor[node.type];
  const statusColor = traceStatusColor(node.status);
  const clickable = !!onClick;

  return (
    <Box
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick ? () => onClick(node) : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(node);
              }
            }
          : undefined
      }
      sx={{
        p: compact ? 0.75 : 1,
        borderRadius: 1.5,
        minWidth: compact ? 140 : 170,
        bgcolor: active ? `${accent}1f` : colors.bg.glass,
        border: `1px solid ${active ? accent : colors.border.subtle}`,
        borderLeft: `3px solid ${accent}`,
        cursor: clickable ? 'pointer' : 'default',
        transition: 'border-color 0.15s, background 0.15s',
        '&:hover': clickable ? { borderColor: accent, bgcolor: `${accent}14` } : {},
        '&:focus-visible': { outline: `2px solid ${accent}`, outlineOffset: 1 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
        <Box
          sx={{
            px: 0.5,
            py: 0.1,
            borderRadius: 0.75,
            bgcolor: `${accent}26`,
            color: accent,
            fontSize: '0.55rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          {TRACE_TYPE_SHORT[node.type]}
        </Box>
        <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.62rem', color: colors.text.muted }}>
          {node.id}
        </Typography>
        <Box
          sx={{
            ml: 'auto',
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: statusColor,
            boxShadow: `0 0 6px ${statusColor}`,
          }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          fontWeight: 600,
          fontSize: compact ? '0.68rem' : '0.72rem',
          lineHeight: 1.3,
          color: colors.text.primary,
        }}
      >
        {node.name}
      </Typography>
      {!compact && (
        <Typography variant="caption" sx={{ fontSize: '0.6rem', color: colors.text.muted }}>
          {TRACE_TYPE_LABEL[node.type]} · {node.status}
        </Typography>
      )}
    </Box>
  );
}
