/** Tab 2 — Contributors: applications / projects / platforms / services with contribution bars, sorted descending. */
import { Box, Typography } from '@mui/material';
import { colors } from '../../theme/colors';

function barColor(score) {
  if (score >= 70) return colors.critical;
  if (score >= 50) return colors.warning;
  if (score >= 30) return colors.info;
  return colors.success;
}

export function KPIContributorsPanel({ model }) {
  if (!model) return null;
  const entities = [...(model.contributingEntities || [])].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  if (entities.length === 0) {
    return (
      <Typography variant="caption" sx={{ color: colors.text.secondary, fontSize: '0.75rem' }}>
        No contributing entities resolved for this metric.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {entities.map((e) => (
        <Box
          key={e.name}
          sx={{
            p: 1,
            borderRadius: 1,
            bgcolor: colors.bg.glass,
            border: `1px solid ${colors.border.subtle}`,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
              {e.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              {e.type && (
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.text.muted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {e.type}
                </Typography>
              )}
              {typeof e.score === 'number' && (
                <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '0.78rem', color: barColor(e.score) }}>
                  {e.score}
                </Typography>
              )}
            </Box>
          </Box>
          {typeof e.score === 'number' && (
            <Box sx={{ mt: 0.6, height: 6, borderRadius: 3, bgcolor: colors.bg.primary, overflow: 'hidden' }}>
              <Box sx={{ width: `${Math.min(100, Math.max(0, e.score))}%`, height: '100%', bgcolor: barColor(e.score), borderRadius: 3 }} />
            </Box>
          )}
          {(typeof e.weight === 'number' || typeof e.contribution === 'number') && (
            <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
              {typeof e.weight === 'number' && (
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.text.muted }}>
                  Weight <strong style={{ color: colors.text.secondary }}>{e.weight}%</strong>
                </Typography>
              )}
              {typeof e.contribution === 'number' && (
                <Typography variant="caption" sx={{ fontSize: '0.62rem', color: colors.text.muted }}>
                  Contribution{' '}
                  <strong style={{ color: e.direction === 'negative' ? colors.critical : colors.success }}>
                    {e.contribution}%
                  </strong>
                </Typography>
              )}
            </Box>
          )}
          {e.note && (
            <Typography variant="caption" sx={{ display: 'block', mt: 0.4, fontSize: '0.65rem', color: colors.text.muted }}>
              {e.note}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
