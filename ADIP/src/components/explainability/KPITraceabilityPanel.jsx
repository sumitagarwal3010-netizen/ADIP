/** Tab 3 — Traceability: data lineage from raw sources to the executive KPI. */
import { Box, Typography } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { colors } from '../../theme/colors';

export function KPITraceabilityPanel({ model }) {
  if (!model) return null;
  const lineage = model.traceability || [];

  if (lineage.length === 0) {
    return (
      <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.75rem' }}>
        No lineage available for this metric.
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.72rem', display: 'block', mb: 1.5 }}>
        Derived from the following lineage. Each stage feeds the next, ending in the executive KPI.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {lineage.map((node, i) => (
          <Box key={`${node.stage}-${i}`}>
            <Box
              role="button"
              tabIndex={0}
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: i === lineage.length - 1 ? `${colors.primary}14` : colors.bg.glass,
                border: `1px solid ${i === lineage.length - 1 ? colors.border.glow : colors.border.subtle}`,
                cursor: 'pointer',
                transition: 'border-color 150ms, background 150ms',
                '&:hover': { borderColor: colors.border.glow, bgcolor: colors.bg.cardHover },
                '&:focus-visible': { outline: `2px solid ${colors.primary}`, outlineOffset: 2 },
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 700, color: colors.text.primary }}>
                {node.stage}
              </Typography>
              {node.description && (
                <Typography variant="caption" sx={{ fontSize: '0.66rem', color: colors.text.muted, display: 'block', mt: 0.25 }}>
                  {node.description}
                </Typography>
              )}
            </Box>
            {i < lineage.length - 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.25 }}>
                <ArrowDownwardIcon sx={{ fontSize: 16, color: colors.secondary }} />
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
