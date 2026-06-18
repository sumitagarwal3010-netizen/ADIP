/** Tab 5 — Recommendations: prioritized actions with expected benefit and estimated impact. */
import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/colors';

const PRIORITY_COLOR = {
  high: colors.critical,
  medium: colors.warning,
  low: colors.info,
};

function priorityColor(priority) {
  return PRIORITY_COLOR[String(priority || '').toLowerCase()] || colors.text.muted;
}

export function KPIRecommendationPanel({ model }) {
  if (!model) return null;
  const recs = model.recommendations || [];

  if (recs.length === 0) {
    return (
      <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.75rem' }}>
        No recommendations available for this metric.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {recs.map((r, i) => (
        <Box
          key={i}
          sx={{
            p: 1.25,
            borderRadius: 1,
            bgcolor: colors.bg.glass,
            border: `1px solid ${colors.border.subtle}`,
            borderLeft: `3px solid ${priorityColor(r.priority)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
            <Box
              sx={{
                px: 0.75,
                py: 0.1,
                borderRadius: 0.75,
                bgcolor: `${priorityColor(r.priority)}22`,
                color: priorityColor(r.priority),
                fontSize: '0.6rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              {r.priority}
            </Box>
          </Box>
          <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600, color: colors.text.primary }}>
            {r.title}
          </Typography>
          {r.expectedBenefit && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.4, fontSize: '0.68rem', color: colors.success }}>
              Expected benefit: {r.expectedBenefit}
            </Typography>
          )}
          {r.estimatedImpact && (
            <Typography variant="caption" sx={{ display: 'block', fontSize: '0.66rem', color: colors.text.muted }}>
              Estimated impact: {r.estimatedImpact}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
